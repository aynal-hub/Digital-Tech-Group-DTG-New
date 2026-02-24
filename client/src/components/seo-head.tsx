import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export function SEOHead({ title, description, ogTitle, ogDescription, ogImage, canonical }: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) setMeta("description", description);
    if (ogTitle || title) setMeta("og:title", ogTitle || title, true);
    if (ogDescription || description) setMeta("og:description", ogDescription || description || "", true);
    if (ogImage) setMeta("og:image", ogImage, true);
    setMeta("og:type", "website", true);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, ogTitle, ogDescription, ogImage, canonical]);

  return null;
}
