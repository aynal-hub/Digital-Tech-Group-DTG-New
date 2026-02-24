import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  admins, services, packages, projects, blogPosts, testimonials,
  teamMembers, contactMessages, sampleRequests, siteSettings,
  paymentPlatforms, paymentVideos,
  type Admin, type InsertAdmin,
  type Service, type InsertService,
  type Package, type InsertPackage,
  type Project, type InsertProject,
  type BlogPost, type InsertBlogPost,
  type Testimonial, type InsertTestimonial,
  type TeamMember, type InsertTeamMember,
  type ContactMessage, type InsertContactMessage,
  type SampleRequest, type InsertSampleRequest,
  type SiteSetting, type InsertSiteSetting,
  type PaymentPlatform, type InsertPaymentPlatform,
  type PaymentVideo, type InsertPaymentVideo,
} from "@shared/schema";

export interface IStorage {
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminById(id: number): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: number, data: Partial<InsertAdmin>): Promise<Admin | undefined>;

  getServices(): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(data: InsertService): Promise<Service>;
  updateService(id: number, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  getPackages(): Promise<Package[]>;
  getPackageById(id: number): Promise<Package | undefined>;
  createPackage(data: InsertPackage): Promise<Package>;
  updatePackage(id: number, data: Partial<InsertPackage>): Promise<Package | undefined>;
  deletePackage(id: number): Promise<void>;

  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(data: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;

  getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(data: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<void>;

  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(data: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, data: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<void>;

  getTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(data: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<void>;

  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, data: Partial<ContactMessage>): Promise<void>;
  deleteContactMessage(id: number): Promise<void>;

  getSampleRequests(): Promise<SampleRequest[]>;
  createSampleRequest(data: InsertSampleRequest): Promise<SampleRequest>;
  updateSampleRequest(id: number, data: Partial<SampleRequest>): Promise<void>;
  deleteSampleRequest(id: number): Promise<void>;

  getSettings(): Promise<SiteSetting[]>;
  getSetting(key: string): Promise<string | undefined>;
  upsertSettings(settings: Record<string, string>): Promise<void>;

  getPaymentPlatforms(): Promise<PaymentPlatform[]>;
  createPaymentPlatform(data: InsertPaymentPlatform): Promise<PaymentPlatform>;
  updatePaymentPlatform(id: number, data: Partial<InsertPaymentPlatform>): Promise<PaymentPlatform | undefined>;
  deletePaymentPlatform(id: number): Promise<void>;

  getPaymentVideos(): Promise<PaymentVideo[]>;
  createPaymentVideo(data: InsertPaymentVideo): Promise<PaymentVideo>;
  updatePaymentVideo(id: number, data: Partial<InsertPaymentVideo>): Promise<PaymentVideo | undefined>;
  deletePaymentVideo(id: number): Promise<void>;

  getDashboardStats(): Promise<{
    totalServices: number;
    totalProjects: number;
    totalMessages: number;
    unreadMessages: number;
    totalSampleRequests: number;
    pendingSampleRequests: number;
    totalBlogPosts: number;
    totalTestimonials: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByEmail(email: string) {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }
  async getAdminById(id: number) {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }
  async createAdmin(data: InsertAdmin) {
    const [admin] = await db.insert(admins).values(data).returning();
    return admin;
  }
  async updateAdmin(id: number, data: Partial<InsertAdmin>) {
    const [admin] = await db.update(admins).set(data).where(eq(admins.id, id)).returning();
    return admin;
  }

  async getServices() { return db.select().from(services).orderBy(asc(services.orderIndex)); }
  async getServiceBySlug(slug: string) { const [s] = await db.select().from(services).where(eq(services.slug, slug)); return s; }
  async getServiceById(id: number) { const [s] = await db.select().from(services).where(eq(services.id, id)); return s; }
  async createService(data: InsertService) { const [s] = await db.insert(services).values(data).returning(); return s; }
  async updateService(id: number, data: Partial<InsertService>) { const [s] = await db.update(services).set(data).where(eq(services.id, id)).returning(); return s; }
  async deleteService(id: number) { await db.delete(services).where(eq(services.id, id)); }

  async getPackages() { return db.select().from(packages).orderBy(asc(packages.orderIndex)); }
  async getPackageById(id: number) { const [p] = await db.select().from(packages).where(eq(packages.id, id)); return p; }
  async createPackage(data: InsertPackage) { const [p] = await db.insert(packages).values(data).returning(); return p; }
  async updatePackage(id: number, data: Partial<InsertPackage>) { const [p] = await db.update(packages).set(data).where(eq(packages.id, id)).returning(); return p; }
  async deletePackage(id: number) { await db.delete(packages).where(eq(packages.id, id)); }

  async getProjects() { return db.select().from(projects).orderBy(desc(projects.id)); }
  async getProjectBySlug(slug: string) { const [p] = await db.select().from(projects).where(eq(projects.slug, slug)); return p; }
  async getProjectById(id: number) { const [p] = await db.select().from(projects).where(eq(projects.id, id)); return p; }
  async createProject(data: InsertProject) { const [p] = await db.insert(projects).values(data).returning(); return p; }
  async updateProject(id: number, data: Partial<InsertProject>) { const [p] = await db.update(projects).set(data).where(eq(projects.id, id)).returning(); return p; }
  async deleteProject(id: number) { await db.delete(projects).where(eq(projects.id, id)); }

  async getBlogPosts(publishedOnly = false) {
    if (publishedOnly) {
      return db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.id));
    }
    return db.select().from(blogPosts).orderBy(desc(blogPosts.id));
  }
  async getBlogPostBySlug(slug: string) { const [p] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)); return p; }
  async getBlogPostById(id: number) { const [p] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)); return p; }
  async createBlogPost(data: InsertBlogPost) { const [p] = await db.insert(blogPosts).values(data).returning(); return p; }
  async updateBlogPost(id: number, data: Partial<InsertBlogPost>) { const [p] = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning(); return p; }
  async deleteBlogPost(id: number) { await db.delete(blogPosts).where(eq(blogPosts.id, id)); }

  async getTestimonials() { return db.select().from(testimonials).orderBy(asc(testimonials.orderIndex)); }
  async createTestimonial(data: InsertTestimonial) { const [t] = await db.insert(testimonials).values(data).returning(); return t; }
  async updateTestimonial(id: number, data: Partial<InsertTestimonial>) { const [t] = await db.update(testimonials).set(data).where(eq(testimonials.id, id)).returning(); return t; }
  async deleteTestimonial(id: number) { await db.delete(testimonials).where(eq(testimonials.id, id)); }

  async getTeamMembers() { return db.select().from(teamMembers).orderBy(asc(teamMembers.orderIndex)); }
  async createTeamMember(data: InsertTeamMember) { const [m] = await db.insert(teamMembers).values(data).returning(); return m; }
  async updateTeamMember(id: number, data: Partial<InsertTeamMember>) { const [m] = await db.update(teamMembers).set(data).where(eq(teamMembers.id, id)).returning(); return m; }
  async deleteTeamMember(id: number) { await db.delete(teamMembers).where(eq(teamMembers.id, id)); }

  async getContactMessages() { return db.select().from(contactMessages).orderBy(desc(contactMessages.id)); }
  async createContactMessage(data: InsertContactMessage) { const [m] = await db.insert(contactMessages).values(data).returning(); return m; }
  async updateContactMessage(id: number, data: Partial<ContactMessage>) { await db.update(contactMessages).set(data).where(eq(contactMessages.id, id)); }
  async deleteContactMessage(id: number) { await db.delete(contactMessages).where(eq(contactMessages.id, id)); }

  async getSampleRequests() { return db.select().from(sampleRequests).orderBy(desc(sampleRequests.id)); }
  async createSampleRequest(data: InsertSampleRequest) { const [r] = await db.insert(sampleRequests).values(data).returning(); return r; }
  async updateSampleRequest(id: number, data: Partial<SampleRequest>) { await db.update(sampleRequests).set(data).where(eq(sampleRequests.id, id)); }
  async deleteSampleRequest(id: number) { await db.delete(sampleRequests).where(eq(sampleRequests.id, id)); }

  async getSettings() { return db.select().from(siteSettings); }
  async getSetting(key: string) { const [s] = await db.select().from(siteSettings).where(eq(siteSettings.key, key)); return s?.value; }
  async upsertSettings(settings: Record<string, string>) {
    for (const [key, value] of Object.entries(settings)) {
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
      if (existing.length) {
        await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({ key, value });
      }
    }
  }

  async getPaymentPlatforms() { return db.select().from(paymentPlatforms).orderBy(asc(paymentPlatforms.orderIndex)); }
  async createPaymentPlatform(data: InsertPaymentPlatform) { const [p] = await db.insert(paymentPlatforms).values(data).returning(); return p; }
  async updatePaymentPlatform(id: number, data: Partial<InsertPaymentPlatform>) { const [p] = await db.update(paymentPlatforms).set(data).where(eq(paymentPlatforms.id, id)).returning(); return p; }
  async deletePaymentPlatform(id: number) { await db.delete(paymentPlatforms).where(eq(paymentPlatforms.id, id)); }

  async getPaymentVideos() { return db.select().from(paymentVideos).orderBy(asc(paymentVideos.orderIndex)); }
  async createPaymentVideo(data: InsertPaymentVideo) { const [v] = await db.insert(paymentVideos).values(data).returning(); return v; }
  async updatePaymentVideo(id: number, data: Partial<InsertPaymentVideo>) { const [v] = await db.update(paymentVideos).set(data).where(eq(paymentVideos.id, id)).returning(); return v; }
  async deletePaymentVideo(id: number) { await db.delete(paymentVideos).where(eq(paymentVideos.id, id)); }

  async getDashboardStats() {
    const [svcCount] = await db.select({ count: sql<number>`count(*)::int` }).from(services);
    const [prjCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projects);
    const [msgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(contactMessages);
    const [unreadCount] = await db.select({ count: sql<number>`count(*)::int` }).from(contactMessages).where(eq(contactMessages.isRead, false));
    const [srCount] = await db.select({ count: sql<number>`count(*)::int` }).from(sampleRequests);
    const [pendingSr] = await db.select({ count: sql<number>`count(*)::int` }).from(sampleRequests).where(eq(sampleRequests.status, "pending"));
    const [blogCount] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPosts);
    const [testCount] = await db.select({ count: sql<number>`count(*)::int` }).from(testimonials);
    return {
      totalServices: svcCount.count,
      totalProjects: prjCount.count,
      totalMessages: msgCount.count,
      unreadMessages: unreadCount.count,
      totalSampleRequests: srCount.count,
      pendingSampleRequests: pendingSr.count,
      totalBlogPosts: blogCount.count,
      totalTestimonials: testCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
