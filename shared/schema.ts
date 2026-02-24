import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("ADMIN"),
  avatarUrl: text("avatar_url"),
  isSuperAdmin: boolean("is_super_admin").default(false),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  imageUrl: text("image_url"),
  price: text("price"),
  category: text("category"),
  features: text("features").array(),
  completedOrders: integer("completed_orders").default(0),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serviceId: integer("service_id"),
  price: text("price").notNull(),
  description: text("description"),
  features: text("features").array(),
  deliveryTime: text("delivery_time"),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  imageUrl: text("image_url"),
  category: text("category"),
  clientName: text("client_name"),
  completionDate: text("completion_date"),
  projectUrl: text("project_url"),
  technologies: text("technologies").array(),
  isActive: boolean("is_active").default(true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  category: text("category"),
  author: text("author"),
  isPublished: boolean("is_published").default(false),
  publishedAt: text("published_at"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  company: text("company"),
  review: text("review").notNull(),
  rating: integer("rating").default(5),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isFounder: boolean("is_founder").default(false),
  socialLinks: text("social_links"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: text("created_at").default(sql`now()`),
});

export const sampleRequests = pgTable("sample_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  serviceId: integer("service_id"),
  requirements: text("requirements").notNull(),
  status: text("status").default("pending"),
  createdAt: text("created_at").default(sql`now()`),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const paymentPlatforms = pgTable("payment_platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  steps: text("steps").array(),
  colorClass: text("color_class").default("blue"),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
});

export const paymentVideos = pgTable("payment_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  platformId: integer("platform_id"),
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertPackageSchema = createInsertSchema(packages).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export const insertSampleRequestSchema = createInsertSchema(sampleRequests).omit({ id: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true });
export const insertPaymentPlatformSchema = createInsertSchema(paymentPlatforms).omit({ id: true });
export const insertPaymentVideoSchema = createInsertSchema(paymentVideos).omit({ id: true });

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type SampleRequest = typeof sampleRequests.$inferSelect;
export type InsertSampleRequest = z.infer<typeof insertSampleRequestSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type PaymentPlatform = typeof paymentPlatforms.$inferSelect;
export type InsertPaymentPlatform = z.infer<typeof insertPaymentPlatformSchema>;
export type PaymentVideo = typeof paymentVideos.$inferSelect;
export type InsertPaymentVideo = z.infer<typeof insertPaymentVideoSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginSchema>;
