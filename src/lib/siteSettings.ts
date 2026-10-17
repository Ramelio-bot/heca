import { supabase } from "./supabaseClient";

export interface AnnouncementSetting {
  enabled: boolean;
  text: string;
  bg_color: string;
  text_color: string;
  link?: string | null;
}

export interface SiteMetaSetting {
  title: string;
  description: string;
  keywords: string;
  og_image: string;
}

export interface HomeContentSetting {
  hero_title: string;
  hero_subtitle: string;
  archive_title: string;
  archive_subtitle: string;
  newsletter_title: string;
  newsletter_text: string;
}

export interface ComingSoonSetting {
  title: string;
  text: string;
}

export interface FooterSetting {
  tagline: string;
  copyright: string;
}

export interface SiteSettings {
  announcement?: AnnouncementSetting;
  site_meta?: SiteMetaSetting;
  home_content?: HomeContentSetting;
  coming_soon?: ComingSoonSetting;
  footer?: FooterSetting;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement: {
    enabled: false,
    text: "New Season — The Archive Is Being Refreshed",
    bg_color: "#111111",
    text_color: "#EBE6DF",
    link: null,
  },
  site_meta: {
    title: "HECA | High-Fashion & Minimalist Editorial",
    description: "HECA is a modern luxury fashion brand inspired by minimalist editorial style.",
    keywords: "HECA, Luxury Fashion, Minimalist, Editorial, Designer Clothes",
    og_image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
  },
  home_content: {
    hero_title: "THE NEW",
    hero_subtitle: "Scroll Down",
    archive_title: "The Archive",
    archive_subtitle: "Collection In Curation",
    newsletter_title: "Join The Archive",
    newsletter_text: "Subscribe to receive updates on new arrivals, special offers and other discount information.",
  },
  coming_soon: {
    title: "Coming Soon",
    text: "We are currently curating this experience. Please check back later for updates.",
  },
  footer: {
    tagline: "HECA",
    copyright: "© 2026 HECA. ALL RIGHTS RESERVED.",
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from("heca_site_settings").select("*");
    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }
    const out: any = { ...DEFAULT_SITE_SETTINGS };
    data.forEach((row: { key: string; value: any }) => {
      out[row.key] = row.value;
    });
    return out as SiteSettings;
  } catch (err) {
    console.error("Failed to load site settings:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}
