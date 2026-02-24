import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { db } from "./db";
import { loginSchema, insertContactMessageSchema, insertSampleRequestSchema, admins, services, packages, projects, blogPosts, testimonials, teamMembers, siteSettings, paymentPlatforms, paymentVideos } from "@shared/schema";

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
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      store: new PgStore({ conString: process.env.DATABASE_URL, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "dtg-secret-key-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.use("/uploads", (await import("express")).default.static(uploadDir));

  app.post("/api/upload", requireAdmin, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // Auto-seed database on startup if empty
  try {
    const existingAdmins = await db.select().from(admins);
    if (existingAdmins.length === 0) {
      console.log("Empty database detected, seeding initial data...");
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await db.insert(admins).values([
        { email: "aynalhossain104@gmail.com", password: hashedPassword, name: "Super Admin", role: "SUPER_ADMIN", isSuperAdmin: true },
        { email: "admin@digitaltechgroup.com", password: hashedPassword, name: "Admin", role: "ADMIN", isSuperAdmin: false },
      ]);

      await db.insert(services).values([
        { title: "Recruitment Services", slug: "recruitment-services", description: "We connect businesses with top-tier talent through our extensive recruitment network. Our expert recruiters understand industry needs and deliver qualified candidates efficiently.", shortDescription: "Find the perfect talent for your organization", category: "Recruitment", features: ["Candidate Screening", "Interview Coordination", "Background Checks", "Onboarding Support"], price: "From $500", completedOrders: 150, orderIndex: 1, isActive: true, metaTitle: "Professional Recruitment Services", metaDescription: "Expert recruitment services to find the best talent for your business." },
        { title: "Digital Marketing", slug: "digital-marketing", description: "Comprehensive digital marketing strategies to boost your online presence. From SEO to social media management, we help your business grow in the digital landscape.", shortDescription: "Grow your business online with data-driven marketing", category: "Marketing", features: ["SEO Optimization", "Social Media Marketing", "Content Marketing", "PPC Advertising", "Email Marketing"], price: "From $300/mo", completedOrders: 200, orderIndex: 2, isActive: true, metaTitle: "Digital Marketing Services", metaDescription: "Data-driven digital marketing solutions for business growth." },
        { title: "Sourcing Solutions", slug: "sourcing-solutions", description: "Professional sourcing services to find the right products and suppliers for your business. We leverage our global network to ensure quality and competitive pricing.", shortDescription: "Global sourcing with quality assurance", category: "Sourcing", features: ["Supplier Verification", "Quality Control", "Price Negotiation", "Logistics Coordination"], price: "From $400", completedOrders: 120, orderIndex: 3, isActive: true, metaTitle: "Sourcing Solutions", metaDescription: "Professional sourcing services with global network coverage." },
        { title: "Web Development", slug: "web-development", description: "Custom web development solutions to establish your digital presence. From responsive websites to complex web applications, we build solutions that drive results.", shortDescription: "Custom websites and web applications", category: "Technology", features: ["Responsive Design", "E-commerce Solutions", "CMS Development", "API Integration", "Performance Optimization"], price: "From $1000", completedOrders: 85, orderIndex: 4, isActive: true, metaTitle: "Web Development Services", metaDescription: "Custom web development solutions for modern businesses." },
        { title: "Graphics Design", slug: "graphics-design", description: "Creative graphic design services that make your brand stand out. Our designers create visually compelling content that communicates your message effectively.", shortDescription: "Creative designs that capture attention", category: "Design", features: ["Logo Design", "Brand Identity", "Social Media Graphics", "Print Materials", "UI/UX Design"], price: "From $200", completedOrders: 300, orderIndex: 5, isActive: true, metaTitle: "Graphics Design Services", metaDescription: "Professional graphic design services for impactful branding." },
        { title: "Data Entry & Admin Support", slug: "data-entry-admin", description: "Reliable data entry and administrative support services to help you focus on what matters most. Accurate, efficient, and confidential handling of your data.", shortDescription: "Efficient data management and admin support", category: "Support", features: ["Data Entry", "Data Processing", "Virtual Assistant", "Document Management"], price: "From $150", completedOrders: 250, orderIndex: 6, isActive: true, metaTitle: "Data Entry & Admin Support", metaDescription: "Professional data entry and administrative support services." },
      ]);

      const svcList = await db.select().from(services);
      await db.insert(packages).values([
        { name: "Starter Package", serviceId: svcList[0].id, price: "$500", description: "Perfect for small businesses starting their recruitment journey", features: ["Up to 5 candidates", "Basic screening", "1 job posting", "Email support"], deliveryTime: "7-14 days", isPopular: false, isActive: true, orderIndex: 1 },
        { name: "Professional Package", serviceId: svcList[0].id, price: "$1,200", description: "Comprehensive recruitment for growing businesses", features: ["Up to 15 candidates", "Advanced screening", "3 job postings", "Interview scheduling", "Priority support"], deliveryTime: "10-21 days", isPopular: true, isActive: true, orderIndex: 2 },
        { name: "Enterprise Package", serviceId: svcList[0].id, price: "$3,000", description: "Full-scale recruitment solutions for large organizations", features: ["Unlimited candidates", "Executive search", "Unlimited postings", "Dedicated recruiter", "24/7 support", "Background checks"], deliveryTime: "14-30 days", isPopular: false, isActive: true, orderIndex: 3 },
        { name: "Social Media Basic", serviceId: svcList[1].id, price: "$300/mo", description: "Essential social media management for brand visibility", features: ["3 platforms", "12 posts/month", "Monthly report", "Community management"], deliveryTime: "Monthly", isPopular: false, isActive: true, orderIndex: 4 },
        { name: "Digital Growth Pro", serviceId: svcList[1].id, price: "$800/mo", description: "Advanced digital marketing for accelerated growth", features: ["5 platforms", "30 posts/month", "SEO optimization", "PPC management", "Weekly reports", "Content strategy"], deliveryTime: "Monthly", isPopular: true, isActive: true, orderIndex: 5 },
        { name: "Design Bundle", serviceId: svcList[4].id, price: "$500", description: "Complete brand identity design package", features: ["Logo design", "Business cards", "Social media kit", "Brand guidelines", "3 revisions"], deliveryTime: "5-10 days", isPopular: false, isActive: true, orderIndex: 6 },
      ]);

      await db.insert(projects).values([
        { title: "E-commerce Platform Recruitment", slug: "ecommerce-recruitment", description: "Successfully recruited 25+ tech professionals for a leading e-commerce platform.", shortDescription: "Recruited 25+ tech professionals", category: "Recruitment", clientName: "TechMart Inc.", completionDate: "2025-01", technologies: ["LinkedIn Recruiting", "Technical Screening", "Culture Fit Assessment"], isActive: true },
        { title: "Social Media Campaign - Fashion Brand", slug: "fashion-brand-campaign", description: "Executed a comprehensive social media campaign for a fashion brand, resulting in 300% increase in engagement.", shortDescription: "300% engagement increase for fashion brand", category: "Digital Marketing", clientName: "StyleHub", completionDate: "2025-02", technologies: ["Instagram Marketing", "Facebook Ads", "Content Creation", "Analytics"], isActive: true },
        { title: "Manufacturing Sourcing - Electronics", slug: "electronics-sourcing", description: "Sourced reliable electronics manufacturers in Southeast Asia, reducing production costs by 40%.", shortDescription: "40% cost reduction in electronics manufacturing", category: "Sourcing", clientName: "ElectroTech Solutions", completionDate: "2024-11", technologies: ["Supplier Verification", "Quality Assurance", "Cost Analysis"], isActive: true },
        { title: "Corporate Website Development", slug: "corporate-website", description: "Built a modern, responsive corporate website with custom CMS, blog, and lead generation features.", shortDescription: "Modern corporate website with 95+ PageSpeed", category: "Web Development", clientName: "GlobalCorp", completionDate: "2024-12", technologies: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"], isActive: true },
        { title: "Brand Identity - Startup", slug: "startup-branding", description: "Complete brand identity design for a tech startup including logo, color palette, typography, and brand guidelines.", shortDescription: "Complete brand identity for tech startup", category: "Design", clientName: "InnovateTech", completionDate: "2025-01", technologies: ["Adobe Illustrator", "Figma", "Brand Strategy"], isActive: true },
      ]);

      await db.insert(blogPosts).values([
        { title: "Top 10 Recruitment Trends in 2025", slug: "recruitment-trends-2025", content: "The recruitment landscape is evolving rapidly. Here are the top 10 trends shaping hiring in 2025:\n\n1. **AI-Powered Screening**\n2. **Remote-First Hiring**\n3. **Skills-Based Hiring**\n4. **Employer Branding**\n5. **Data-Driven Decisions**\n6. **Diversity & Inclusion**\n7. **Candidate Experience**\n8. **Gig Economy Integration**\n9. **Social Recruiting**\n10. **Predictive Analytics**", excerpt: "Discover the latest recruitment trends shaping the industry in 2025.", category: "Recruitment", author: "Admin", isPublished: true, publishedAt: "2025-01-15" },
        { title: "How Digital Marketing Drives Business Growth", slug: "digital-marketing-business-growth", content: "In today's digital-first world, effective marketing strategies are essential for business growth.\n\n## SEO Optimization\nSearch engine optimization helps your business appear in relevant search results.\n\n## Social Media Marketing\nEngaging with your audience on social platforms builds brand awareness.\n\n## Content Marketing\nCreating valuable content establishes your authority in your industry.\n\n## PPC Advertising\nPay-per-click advertising provides immediate visibility and measurable ROI.", excerpt: "Learn how digital marketing strategies can accelerate your business growth.", category: "Marketing", author: "Admin", isPublished: true, publishedAt: "2025-02-01" },
        { title: "Effective Sourcing Strategies for Global Businesses", slug: "global-sourcing-strategies", content: "Global sourcing requires careful planning and execution.\n\n## 1. Supplier Due Diligence\nThoroughly vet potential suppliers.\n\n## 2. Quality Control Systems\nImplement robust quality control measures.\n\n## 3. Communication Protocols\nEstablish clear communication channels.\n\n## 4. Risk Management\nDevelop contingency plans.\n\n## 5. Sustainable Practices\nPrioritize ethical and sustainable business practices.", excerpt: "Master the art of global sourcing with these proven strategies.", category: "Sourcing", author: "Admin", isPublished: true, publishedAt: "2025-02-10" },
      ]);

      await db.insert(testimonials).values([
        { clientName: "Sarah Johnson", company: "TechMart Inc.", review: "Exceeded our expectations in recruiting top tech talent. Their understanding of our industry needs made all the difference.", rating: 5, isActive: true, orderIndex: 1 },
        { clientName: "Michael Chen", company: "StyleHub", review: "The digital marketing campaign was phenomenal. We saw a 300% increase in engagement and our online sales skyrocketed.", rating: 5, isActive: true, orderIndex: 2 },
        { clientName: "Ahmed Rahman", company: "ElectroTech Solutions", review: "Their sourcing expertise helped us find reliable manufacturers and reduce costs significantly.", rating: 5, isActive: true, orderIndex: 3 },
        { clientName: "Emily Davis", company: "GlobalCorp", review: "The website they built for us is exactly what we needed - modern, fast, and easy to manage.", rating: 5, isActive: true, orderIndex: 4 },
        { clientName: "James Wilson", company: "InnovateTech", review: "Our brand identity design exceeded all expectations. They captured our vision perfectly.", rating: 4, isActive: true, orderIndex: 5 },
        { clientName: "Lisa Park", company: "DataFlow Analytics", review: "The data entry services are accurate and efficient. They've been handling our data processing needs seamlessly.", rating: 5, isActive: true, orderIndex: 6 },
      ]);

      await db.insert(teamMembers).values([
        { name: "Founder", designation: "Founder & Managing Director", bio: "Visionary leader with extensive experience in recruitment, sourcing, and digital marketing.", isFounder: true, orderIndex: 1, isActive: true },
        { name: "Fatima Ahmed", designation: "Head of Recruitment", bio: "Seasoned recruitment professional with 8+ years of experience in talent acquisition.", orderIndex: 2, isActive: true },
        { name: "Rajesh Kumar", designation: "Digital Marketing Manager", bio: "Digital marketing expert specializing in SEO, social media strategy, and data-driven campaigns.", orderIndex: 3, isActive: true },
        { name: "Nadia Islam", designation: "Senior Sourcing Specialist", bio: "Expert in global sourcing with strong relationships with suppliers across Asia.", orderIndex: 4, isActive: true },
        { name: "David Thompson", designation: "Lead Web Developer", bio: "Full-stack developer with expertise in modern web technologies.", orderIndex: 5, isActive: true },
        { name: "Aisha Khan", designation: "Creative Director", bio: "Award-winning graphic designer with a keen eye for impactful visual communications.", orderIndex: 6, isActive: true },
      ]);

      await db.insert(paymentPlatforms).values([
        { name: "PayPal", tagline: "Send money internationally with ease", websiteUrl: "https://www.paypal.com", steps: ["Create a PayPal account", "Link your bank account or card", "Send payment to our PayPal email", "Share the transaction receipt"], colorClass: "blue", isActive: true, orderIndex: 1 },
        { name: "Wise (TransferWise)", tagline: "Low-cost international transfers", websiteUrl: "https://wise.com", steps: ["Sign up for a Wise account", "Enter our bank details", "Choose the amount and currency", "Complete the transfer and share receipt"], colorClass: "green", isActive: true, orderIndex: 2 },
        { name: "Western Union", tagline: "Trusted global money transfer", websiteUrl: "https://www.westernunion.com", steps: ["Visit a Western Union location or website", "Fill in recipient details", "Make the payment", "Share the MTCN tracking number"], colorClass: "yellow", isActive: true, orderIndex: 3 },
        { name: "Bank Transfer", tagline: "Direct bank-to-bank transfer", steps: ["Contact us for bank details", "Initiate a wire transfer from your bank", "Include your order reference", "Share the transfer confirmation"], colorClass: "purple", isActive: true, orderIndex: 4 },
      ]);

      await db.insert(paymentVideos).values([
        { title: "How to Send Payment via PayPal", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Step-by-step guide to sending payment through PayPal", platformId: 1, isActive: true, orderIndex: 1 },
        { title: "Using Wise for International Transfers", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", description: "Complete guide to using Wise for cost-effective transfers", platformId: 2, isActive: true, orderIndex: 2 },
      ]);

      await db.insert(siteSettings).values([
        { key: "site_name", value: "Digital Tech Group" },
        { key: "site_tagline", value: "Recruitment, Sourcing & Digital Marketing Agency" },
        { key: "site_description", value: "Professional Recruitment, Sourcing & Digital Marketing Agency delivering world-class solutions for your business growth." },
        { key: "contact_email", value: "info@digitaltechgroup.com" },
        { key: "contact_phone", value: "+1 (555) 123-4567" },
        { key: "contact_address", value: "123 Business Ave, Suite 100, Digital City, DC 10001" },
        { key: "social_facebook", value: "https://facebook.com/digitaltechgroup" },
        { key: "social_linkedin", value: "https://linkedin.com/company/digitaltechgroup" },
        { key: "social_instagram", value: "https://instagram.com/digitaltechgroup" },
        { key: "social_youtube", value: "https://youtube.com/@digitaltechgroup" },
        { key: "founder_name", value: "MD Aynal Hossain" },
        { key: "founder_title", value: "Founder & Managing Director" },
        { key: "meta_title", value: "Digital Tech Group - Recruitment, Sourcing & Digital Marketing" },
        { key: "meta_description", value: "Professional Recruitment, Sourcing & Digital Marketing Agency delivering world-class solutions." },
        { key: "stats_expert_services", value: "50" },
        { key: "stats_projects_done", value: "2000" },
        { key: "stats_happy_clients", value: "500" },
        { key: "stats_orders_done", value: "5000" },
      ]);

      console.log("Database seeded successfully on startup!");
    } else {
      const superAdmin = existingAdmins.find(a => a.email === "aynalhossain104@gmail.com");
      if (!superAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await storage.createAdmin({ email: "aynalhossain104@gmail.com", password: hashedPassword, name: "Super Admin", role: "SUPER_ADMIN", isSuperAdmin: true });
        console.log("Super admin account created");
      }
      const regularAdmin = existingAdmins.find(a => a.email === "admin@digitaltechgroup.com");
      if (!regularAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await storage.createAdmin({ email: "admin@digitaltechgroup.com", password: hashedPassword, name: "Admin", role: "ADMIN", isSuperAdmin: false });
        console.log("Regular admin account created");
      }
    }
  } catch (e) {
    console.error("Error during startup seed:", e);
  }

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
    res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, isSuperAdmin: admin.isSuperAdmin });
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
