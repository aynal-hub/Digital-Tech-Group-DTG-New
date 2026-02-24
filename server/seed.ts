import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  admins, services, packages, projects, blogPosts, testimonials,
  teamMembers, siteSettings, paymentPlatforms, paymentVideos
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const existingAdmins = await db.select().from(admins);
  if (existingAdmins.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(admins).values({
    email: "aynalhossain104@gmail.com",
    password: hashedPassword,
    name: "Super Admin",
    role: "SUPER_ADMIN",
    isSuperAdmin: true,
  });

  await db.insert(services).values([
    { title: "Recruitment Services", slug: "recruitment-services", description: "We connect businesses with top-tier talent through our extensive recruitment network. Our expert recruiters understand industry needs and deliver qualified candidates efficiently.", shortDescription: "Find the perfect talent for your organization", category: "Recruitment", features: ["Candidate Screening", "Interview Coordination", "Background Checks", "Onboarding Support"], price: "From $500", completedOrders: 150, orderIndex: 1, isActive: true, metaTitle: "Professional Recruitment Services | Digital Tech Group", metaDescription: "Expert recruitment services to find the best talent for your business." },
    { title: "Digital Marketing", slug: "digital-marketing", description: "Comprehensive digital marketing strategies to boost your online presence. From SEO to social media management, we help your business grow in the digital landscape.", shortDescription: "Grow your business online with data-driven marketing", category: "Marketing", features: ["SEO Optimization", "Social Media Marketing", "Content Marketing", "PPC Advertising", "Email Marketing"], price: "From $300/mo", completedOrders: 200, orderIndex: 2, isActive: true, metaTitle: "Digital Marketing Services | Digital Tech Group", metaDescription: "Data-driven digital marketing solutions for business growth." },
    { title: "Sourcing Solutions", slug: "sourcing-solutions", description: "Professional sourcing services to find the right products and suppliers for your business. We leverage our global network to ensure quality and competitive pricing.", shortDescription: "Global sourcing with quality assurance", category: "Sourcing", features: ["Supplier Verification", "Quality Control", "Price Negotiation", "Logistics Coordination"], price: "From $400", completedOrders: 120, orderIndex: 3, isActive: true, metaTitle: "Sourcing Solutions | Digital Tech Group", metaDescription: "Professional sourcing services with global network coverage." },
    { title: "Web Development", slug: "web-development", description: "Custom web development solutions to establish your digital presence. From responsive websites to complex web applications, we build solutions that drive results.", shortDescription: "Custom websites and web applications", category: "Technology", features: ["Responsive Design", "E-commerce Solutions", "CMS Development", "API Integration", "Performance Optimization"], price: "From $1000", completedOrders: 85, orderIndex: 4, isActive: true, metaTitle: "Web Development Services | Digital Tech Group", metaDescription: "Custom web development solutions for modern businesses." },
    { title: "Graphics Design", slug: "graphics-design", description: "Creative graphic design services that make your brand stand out. Our designers create visually compelling content that communicates your message effectively.", shortDescription: "Creative designs that capture attention", category: "Design", features: ["Logo Design", "Brand Identity", "Social Media Graphics", "Print Materials", "UI/UX Design"], price: "From $200", completedOrders: 300, orderIndex: 5, isActive: true, metaTitle: "Graphics Design Services | Digital Tech Group", metaDescription: "Professional graphic design services for impactful branding." },
    { title: "Data Entry & Admin Support", slug: "data-entry-admin", description: "Reliable data entry and administrative support services to help you focus on what matters most. Accurate, efficient, and confidential handling of your data.", shortDescription: "Efficient data management and admin support", category: "Support", features: ["Data Entry", "Data Processing", "Virtual Assistant", "Document Management"], price: "From $150", completedOrders: 250, orderIndex: 6, isActive: true, metaTitle: "Data Entry & Admin Support | Digital Tech Group", metaDescription: "Professional data entry and administrative support services." },
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
    { title: "E-commerce Platform Recruitment", slug: "ecommerce-recruitment", description: "Successfully recruited 25+ tech professionals for a leading e-commerce platform. The project involved sourcing developers, designers, and project managers across multiple locations.", shortDescription: "Recruited 25+ tech professionals", category: "Recruitment", clientName: "TechMart Inc.", completionDate: "2025-01", technologies: ["LinkedIn Recruiting", "Technical Screening", "Culture Fit Assessment"], isActive: true },
    { title: "Social Media Campaign - Fashion Brand", slug: "fashion-brand-campaign", description: "Executed a comprehensive social media campaign for a fashion brand, resulting in 300% increase in engagement and 150% increase in online sales within 3 months.", shortDescription: "300% engagement increase for fashion brand", category: "Digital Marketing", clientName: "StyleHub", completionDate: "2025-02", technologies: ["Instagram Marketing", "Facebook Ads", "Content Creation", "Analytics"], isActive: true },
    { title: "Manufacturing Sourcing - Electronics", slug: "electronics-sourcing", description: "Sourced reliable electronics manufacturers in Southeast Asia, reducing production costs by 40% while maintaining quality standards for our client.", shortDescription: "40% cost reduction in electronics manufacturing", category: "Sourcing", clientName: "ElectroTech Solutions", completionDate: "2024-11", technologies: ["Supplier Verification", "Quality Assurance", "Cost Analysis"], isActive: true },
    { title: "Corporate Website Development", slug: "corporate-website", description: "Built a modern, responsive corporate website with custom CMS, blog, and lead generation features. The site achieved 95+ PageSpeed score.", shortDescription: "Modern corporate website with 95+ PageSpeed", category: "Web Development", clientName: "GlobalCorp", completionDate: "2024-12", technologies: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"], isActive: true },
    { title: "Brand Identity - Startup", slug: "startup-branding", description: "Complete brand identity design for a tech startup including logo, color palette, typography, and comprehensive brand guidelines.", shortDescription: "Complete brand identity for tech startup", category: "Design", clientName: "InnovateTech", completionDate: "2025-01", technologies: ["Adobe Illustrator", "Figma", "Brand Strategy"], isActive: true },
  ]);

  await db.insert(blogPosts).values([
    { title: "Top 10 Recruitment Trends in 2025", slug: "recruitment-trends-2025", content: "The recruitment landscape is evolving rapidly. Here are the top 10 trends shaping hiring in 2025:\n\n1. **AI-Powered Screening** - Automated candidate screening is becoming more sophisticated.\n2. **Remote-First Hiring** - Companies are embracing global talent pools.\n3. **Skills-Based Hiring** - Moving beyond traditional qualifications.\n4. **Employer Branding** - Company culture as a recruitment tool.\n5. **Data-Driven Decisions** - Analytics in recruitment strategies.\n6. **Diversity & Inclusion** - Prioritizing inclusive hiring practices.\n7. **Candidate Experience** - Streamlining the application process.\n8. **Gig Economy Integration** - Flexible work arrangements.\n9. **Social Recruiting** - Leveraging social media platforms.\n10. **Predictive Analytics** - Forecasting hiring needs.", excerpt: "Discover the latest recruitment trends shaping the industry in 2025.", category: "Recruitment", author: "Admin", isPublished: true, publishedAt: "2025-01-15" },
    { title: "How Digital Marketing Drives Business Growth", slug: "digital-marketing-business-growth", content: "In today's digital-first world, effective marketing strategies are essential for business growth. Here's how digital marketing can transform your business:\n\n## SEO Optimization\nSearch engine optimization helps your business appear in relevant search results, driving organic traffic to your website.\n\n## Social Media Marketing\nEngaging with your audience on social platforms builds brand awareness and customer loyalty.\n\n## Content Marketing\nCreating valuable content establishes your authority in your industry and attracts potential customers.\n\n## PPC Advertising\nPay-per-click advertising provides immediate visibility and measurable ROI.", excerpt: "Learn how digital marketing strategies can accelerate your business growth.", category: "Marketing", author: "Admin", isPublished: true, publishedAt: "2025-02-01" },
    { title: "Effective Sourcing Strategies for Global Businesses", slug: "global-sourcing-strategies", content: "Global sourcing requires careful planning and execution. Here are proven strategies for successful international sourcing:\n\n## 1. Supplier Due Diligence\nThoroughly vet potential suppliers through background checks, factory audits, and reference verification.\n\n## 2. Quality Control Systems\nImplement robust quality control measures at every stage of the supply chain.\n\n## 3. Communication Protocols\nEstablish clear communication channels and expectations with suppliers.\n\n## 4. Risk Management\nDevelop contingency plans for supply chain disruptions.\n\n## 5. Sustainable Practices\nPrioritize suppliers who follow ethical and sustainable business practices.", excerpt: "Master the art of global sourcing with these proven strategies.", category: "Sourcing", author: "Admin", isPublished: true, publishedAt: "2025-02-10" },
  ]);

  await db.insert(testimonials).values([
    { clientName: "Sarah Johnson", company: "TechMart Inc.", review: "Digital Tech Group exceeded our expectations in recruiting top tech talent. Their understanding of our industry needs and company culture made all the difference.", rating: 5, isActive: true, orderIndex: 1 },
    { clientName: "Michael Chen", company: "StyleHub", review: "The digital marketing campaign they ran for us was phenomenal. We saw a 300% increase in engagement and our online sales skyrocketed. Highly recommended!", rating: 5, isActive: true, orderIndex: 2 },
    { clientName: "Ahmed Rahman", company: "ElectroTech Solutions", review: "Their sourcing expertise helped us find reliable manufacturers and reduce costs significantly. The quality of their work and attention to detail is outstanding.", rating: 5, isActive: true, orderIndex: 3 },
    { clientName: "Emily Davis", company: "GlobalCorp", review: "The website they built for us is exactly what we needed - modern, fast, and easy to manage. The team was professional and delivered on time.", rating: 5, isActive: true, orderIndex: 4 },
    { clientName: "James Wilson", company: "InnovateTech", review: "Our brand identity design exceeded all expectations. They captured our vision perfectly and the final deliverables were top-notch.", rating: 4, isActive: true, orderIndex: 5 },
    { clientName: "Lisa Park", company: "DataFlow Analytics", review: "The data entry services provided by Digital Tech Group are accurate and efficient. They've been handling our data processing needs seamlessly.", rating: 5, isActive: true, orderIndex: 6 },
  ]);

  await db.insert(teamMembers).values([
    { name: "Founder", designation: "Founder & Managing Director", bio: "Visionary leader with extensive experience in recruitment, sourcing, and digital marketing. Founded the company with a mission to deliver world-class business solutions globally.", isFounder: true, orderIndex: 1, isActive: true },
    { name: "Fatima Ahmed", designation: "Head of Recruitment", bio: "Seasoned recruitment professional with 8+ years of experience in talent acquisition across multiple industries.", orderIndex: 2, isActive: true },
    { name: "Rajesh Kumar", designation: "Digital Marketing Manager", bio: "Digital marketing expert specializing in SEO, social media strategy, and data-driven marketing campaigns.", orderIndex: 3, isActive: true },
    { name: "Nadia Islam", designation: "Senior Sourcing Specialist", bio: "Expert in global sourcing with strong relationships with suppliers across Asia and the Middle East.", orderIndex: 4, isActive: true },
    { name: "David Thompson", designation: "Lead Web Developer", bio: "Full-stack developer with expertise in modern web technologies and a passion for building high-performance applications.", orderIndex: 5, isActive: true },
    { name: "Aisha Khan", designation: "Creative Director", bio: "Award-winning graphic designer with a keen eye for creating impactful visual communications and brand identities.", orderIndex: 6, isActive: true },
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
  ]);

  console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => process.exit(0));
