import { Link } from "wouter";
import { Zap, Mail, Phone, MapPin } from "lucide-react";
import { SiLinkedin, SiFacebook, SiInstagram, SiYoutube, SiTelegram, SiWhatsapp } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";

export function Footer() {
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  const getSetting = (key: string) => settings?.[key] || "";

  const socialLinks = [
    { icon: SiFacebook, url: getSetting("social_facebook"), label: "Facebook" },
    { icon: SiInstagram, url: getSetting("social_instagram"), label: "Instagram" },
    { icon: SiLinkedin, url: getSetting("social_linkedin"), label: "LinkedIn" },
    { icon: SiYoutube, url: getSetting("social_youtube"), label: "YouTube" },
    { icon: SiWhatsapp, url: getSetting("social_whatsapp"), label: "WhatsApp" },
    { icon: SiTelegram, url: getSetting("social_telegram"), label: "Telegram" },
  ].filter((l) => l.url);

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const serviceLinks = [
    { label: "Packages", href: "/packages" },
    { label: "Free Sample", href: "/free-sample" },
    { label: "Payment Guidelines", href: "/payment-guidelines" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Team", href: "/team" },
  ];

  return (
    <footer className="bg-foreground text-background" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                {getSetting("site_name") || "Digital Tech Group"}
              </span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              {getSetting("site_description") || "Professional Recruitment, Sourcing & Digital Marketing Agency delivering world-class solutions."}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-md bg-background/10 flex items-center justify-center transition-colors"
                    data-testid={`link-social-${link.label.toLowerCase()}`}
                  >
                    <link.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-60">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm opacity-70 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-60">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm opacity-70 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-60">Contact</h3>
            <ul className="space-y-3">
              {getSetting("contact_email") && (
                <li className="flex items-center gap-2 text-sm opacity-70">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{getSetting("contact_email")}</span>
                </li>
              )}
              {getSetting("contact_phone") && (
                <li className="flex items-center gap-2 text-sm opacity-70">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{getSetting("contact_phone")}</span>
                </li>
              )}
              {getSetting("contact_address") && (
                <li className="flex items-start gap-2 text-sm opacity-70">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{getSetting("contact_address")}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-50">
            &copy; {new Date().getFullYear()} {getSetting("site_name") || "Digital Tech Group"}. All rights reserved.
          </p>
          {getSetting("founder_name") && (
            <p className="text-sm opacity-50">Founded by {getSetting("founder_name")}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
