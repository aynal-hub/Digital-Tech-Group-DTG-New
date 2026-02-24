import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { loginSchema, insertContactMessageSchema, insertSampleRequestSchema } from "@shared/schema";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const PgStore = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    adminId?: number;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      store: new PgStore({ conString: process.env.DATABASE_URL, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "dtg-secret-key-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  app.use("/uploads", (await import("express")).default.static(uploadDir));

  app.post("/api/upload", requireAdmin, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // ---- AUTH ----
  app.post("/api/admin/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const admin = await storage.getAdminByEmail(parsed.data.email);
      if (!admin) return res.status(401).json({ message: "Invalid credentials" });
      const valid = await bcrypt.compare(parsed.data.password, admin.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });
      req.session.adminId = admin.id;
      res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => { res.json({ ok: true }); });
  });

  app.get("/api/admin/me", async (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ message: "Not logged in" });
    const admin = await storage.getAdminById(req.session.adminId);
    if (!admin) return res.status(401).json({ message: "Not found" });
    res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
  });

  app.patch("/api/admin/profile", requireAdmin, async (req, res) => {
    try {
      const admin = await storage.getAdminById(req.session.adminId!);
      if (!admin) return res.status(404).json({ message: "Admin not found" });
      const { currentPassword, newEmail, newPassword, name } = req.body;
      if (currentPassword) {
        const valid = await bcrypt.compare(currentPassword, admin.password);
        if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
      }
      const updates: any = {};
      if (name) updates.name = name;
      if (newEmail) updates.email = newEmail;
      if (newPassword) {
        if (!currentPassword) return res.status(400).json({ message: "Current password required to change password" });
        updates.password = await bcrypt.hash(newPassword, 10);
      }
      const updated = await storage.updateAdmin(req.session.adminId!, updates);
      res.json({ id: updated!.id, name: updated!.name, email: updated!.email, role: updated!.role });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- PUBLIC ROUTES ----
  app.get("/api/services", async (_req, res) => {
    const data = await storage.getServices();
    res.json(data.filter((s) => s.isActive));
  });
  app.get("/api/services/:slug", async (req, res) => {
    const s = await storage.getServiceBySlug(req.params.slug);
    if (!s) return res.status(404).json({ message: "Not found" });
    res.json(s);
  });

  app.get("/api/packages", async (_req, res) => {
    const data = await storage.getPackages();
    res.json(data.filter((p) => p.isActive));
  });

  app.get("/api/projects", async (_req, res) => {
    const data = await storage.getProjects();
    res.json(data.filter((p) => p.isActive));
  });
  app.get("/api/projects/:slug", async (req, res) => {
    const p = await storage.getProjectBySlug(req.params.slug);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  });

  app.get("/api/blog", async (_req, res) => {
    res.json(await storage.getBlogPosts(true));
  });
  app.get("/api/blog/:slug", async (req, res) => {
    const p = await storage.getBlogPostBySlug(req.params.slug);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  });

  app.get("/api/testimonials", async (_req, res) => {
    const data = await storage.getTestimonials();
    res.json(data.filter((t) => t.isActive));
  });

  app.get("/api/team", async (_req, res) => {
    const data = await storage.getTeamMembers();
    res.json(data.filter((m) => m.isActive));
  });

  app.get("/api/payment-platforms", async (_req, res) => {
    const data = await storage.getPaymentPlatforms();
    res.json(data.filter((p) => p.isActive));
  });

  app.get("/api/payment-videos", async (_req, res) => {
    const data = await storage.getPaymentVideos();
    res.json(data.filter((v) => v.isActive));
  });

  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    const obj: Record<string, string> = {};
    settings.forEach((s) => { obj[s.key] = s.value; });
    res.json(obj);
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactMessageSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      await storage.createContactMessage(parsed.data);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/sample-request", async (req, res) => {
    try {
      const parsed = insertSampleRequestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      await storage.createSampleRequest(parsed.data);
      res.json({ ok: true });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ---- ADMIN CRUD ROUTES ----
  app.get("/api/admin/dashboard", requireAdmin, async (_req, res) => {
    res.json(await storage.getDashboardStats());
  });

  // Admin Services
  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    try { res.json(await storage.createService(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updateService(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteService(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Packages
  app.post("/api/admin/packages", requireAdmin, async (req, res) => {
    try { res.json(await storage.createPackage(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updatePackage(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    try { await storage.deletePackage(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Portfolio
  app.post("/api/admin/portfolio", requireAdmin, async (req, res) => {
    try { res.json(await storage.createProject(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/portfolio/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updateProject(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/portfolio/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteProject(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Blog
  app.get("/api/admin/blog", requireAdmin, async (_req, res) => {
    res.json(await storage.getBlogPosts(false));
  });
  app.post("/api/admin/blog", requireAdmin, async (req, res) => {
    try { res.json(await storage.createBlogPost(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updateBlogPost(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteBlogPost(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Testimonials
  app.post("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try { res.json(await storage.createTestimonial(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updateTestimonial(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteTestimonial(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Team
  app.post("/api/admin/team", requireAdmin, async (req, res) => {
    try { res.json(await storage.createTeamMember(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/team/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updateTeamMember(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/team/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteTeamMember(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Messages
  app.get("/api/admin/messages", requireAdmin, async (_req, res) => {
    res.json(await storage.getContactMessages());
  });
  app.patch("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    try { await storage.updateContactMessage(Number(req.params.id), req.body); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/messages/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteContactMessage(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Sample Requests
  app.get("/api/admin/sample-requests", requireAdmin, async (_req, res) => {
    res.json(await storage.getSampleRequests());
  });
  app.patch("/api/admin/sample-requests/:id", requireAdmin, async (req, res) => {
    try { await storage.updateSampleRequest(Number(req.params.id), req.body); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/sample-requests/:id", requireAdmin, async (req, res) => {
    try { await storage.deleteSampleRequest(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Settings
  app.get("/api/admin/settings", requireAdmin, async (_req, res) => {
    res.json(await storage.getSettings());
  });
  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try { await storage.upsertSettings(req.body.settings); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Payment Platforms
  app.post("/api/admin/payment-platforms", requireAdmin, async (req, res) => {
    try { res.json(await storage.createPaymentPlatform(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/payment-platforms/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updatePaymentPlatform(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/payment-platforms/:id", requireAdmin, async (req, res) => {
    try { await storage.deletePaymentPlatform(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Admin Payment Videos
  app.post("/api/admin/payment-videos", requireAdmin, async (req, res) => {
    try { res.json(await storage.createPaymentVideo(req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.patch("/api/admin/payment-videos/:id", requireAdmin, async (req, res) => {
    try { res.json(await storage.updatePaymentVideo(Number(req.params.id), req.body)); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.delete("/api/admin/payment-videos/:id", requireAdmin, async (req, res) => {
    try { await storage.deletePaymentVideo(Number(req.params.id)); res.json({ ok: true }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  return httpServer;
}
