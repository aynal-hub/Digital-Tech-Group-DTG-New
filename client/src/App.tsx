import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { PublicNavbar } from "@/components/public-navbar";
import { Footer } from "@/components/footer";
import { AdminLayout } from "@/components/admin-layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import Portfolio from "@/pages/portfolio";
import ProjectDetail from "@/pages/project-detail";
import Blog from "@/pages/blog";
import BlogDetail from "@/pages/blog-detail";
import Team from "@/pages/team";
import Testimonials from "@/pages/testimonials";
import Contact from "@/pages/contact";
import Packages from "@/pages/packages";
import FreeSample from "@/pages/free-sample";
import PaymentGuidelines from "@/pages/payment-guidelines";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminServices from "@/pages/admin/services";
import AdminPackages from "@/pages/admin/packages";
import AdminPortfolio from "@/pages/admin/portfolio";
import AdminBlog from "@/pages/admin/blog";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminTeam from "@/pages/admin/team";
import AdminMessages from "@/pages/admin/messages";
import AdminSampleRequests from "@/pages/admin/sample-requests";
import AdminPaymentPlatforms from "@/pages/admin/payment-platforms";
import AdminPaymentVideos from "@/pages/admin/payment-videos";
import AdminSettings from "@/pages/admin/settings";
import AdminProfile from "@/pages/admin/profile";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <PublicLayout><Home /></PublicLayout>}</Route>
      <Route path="/about">{() => <PublicLayout><About /></PublicLayout>}</Route>
      <Route path="/services">{() => <PublicLayout><Services /></PublicLayout>}</Route>
      <Route path="/services/:slug">{(params) => <PublicLayout><ServiceDetail /></PublicLayout>}</Route>
      <Route path="/portfolio">{() => <PublicLayout><Portfolio /></PublicLayout>}</Route>
      <Route path="/portfolio/:slug">{(params) => <PublicLayout><ProjectDetail /></PublicLayout>}</Route>
      <Route path="/blog">{() => <PublicLayout><Blog /></PublicLayout>}</Route>
      <Route path="/blog/:slug">{(params) => <PublicLayout><BlogDetail /></PublicLayout>}</Route>
      <Route path="/team">{() => <PublicLayout><Team /></PublicLayout>}</Route>
      <Route path="/testimonials">{() => <PublicLayout><Testimonials /></PublicLayout>}</Route>
      <Route path="/contact">{() => <PublicLayout><Contact /></PublicLayout>}</Route>
      <Route path="/packages">{() => <PublicLayout><Packages /></PublicLayout>}</Route>
      <Route path="/free-sample">{() => <PublicLayout><FreeSample /></PublicLayout>}</Route>
      <Route path="/payment-guidelines">{() => <PublicLayout><PaymentGuidelines /></PublicLayout>}</Route>

      <Route path="/admin/login">{() => <AdminLogin />}</Route>
      <Route path="/admin">{() => <AdminLayout><AdminDashboard /></AdminLayout>}</Route>
      <Route path="/admin/services">{() => <AdminLayout><AdminServices /></AdminLayout>}</Route>
      <Route path="/admin/packages">{() => <AdminLayout><AdminPackages /></AdminLayout>}</Route>
      <Route path="/admin/portfolio">{() => <AdminLayout><AdminPortfolio /></AdminLayout>}</Route>
      <Route path="/admin/blog">{() => <AdminLayout><AdminBlog /></AdminLayout>}</Route>
      <Route path="/admin/testimonials">{() => <AdminLayout><AdminTestimonials /></AdminLayout>}</Route>
      <Route path="/admin/team">{() => <AdminLayout><AdminTeam /></AdminLayout>}</Route>
      <Route path="/admin/messages">{() => <AdminLayout><AdminMessages /></AdminLayout>}</Route>
      <Route path="/admin/sample-requests">{() => <AdminLayout><AdminSampleRequests /></AdminLayout>}</Route>
      <Route path="/admin/payment-platforms">{() => <AdminLayout><AdminPaymentPlatforms /></AdminLayout>}</Route>
      <Route path="/admin/payment-videos">{() => <AdminLayout><AdminPaymentVideos /></AdminLayout>}</Route>
      <Route path="/admin/settings">{() => <AdminLayout><AdminSettings /></AdminLayout>}</Route>
      <Route path="/admin/profile">{() => <AdminLayout><AdminProfile /></AdminLayout>}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
