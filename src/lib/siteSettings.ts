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
    enabled: true,
    text: "BABY GEMOY HECA — 100% Katun Organik Lembut & Bersertifikat Oeko-Tex® Aman Untuk Kulit Sensitif Bayi (Usia 0–4 Tahun)",
    bg_color: "#2C2523",
    text_color: "#FAF7F2",
    link: "#catalog",
  },
  site_meta: {
    title: "Baby Gemoy HECA | Pakaian & Perlengkapan Bayi Katun Organik (0–4 Tahun)",
    description: "Baby Gemoy HECA menghadirkan koleksi pakaian bayi newborn & toddler (50cm - 110cm) berbahan 100% katun organik lembut, breathable Air-Mesh, label di luar anti-gatal, dan aman untuk kulit sensitif si kecil.",
    keywords: "Baby Gemoy HECA, HECA Baby, Pakaian Bayi, Baju Bayi Newborn, Bodysuit Bayi, Piyama Anak, Legging Bayi, Katun Organik Bayi",
    og_image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80",
  },
  home_content: {
    hero_title: "Kenyamanan Sejak Hari Pertama Bersama Baby Gemoy HECA",
    hero_subtitle: "Dirancang khusus mengikuti tumbuh kembang si kecil dari Newborn (50 cm) hingga Batita (110 cm) dengan jahitan rata dan label di luar.",
    archive_title: "Koleksi Esensial Baby Gemoy HECA",
    archive_subtitle: "Newborn (0–12 Bulan) & Toddler (1–4 Tahun)",
    newsletter_title: "Bergabung dengan Komunitas Ibu & Baby Gemoy HECA",
    newsletter_text: "Dapatkan panduan ukuran tumbuh kembang bayi, tips perawatan kain katun organik, dan penawaran spesial koleksi terbaru Baby Gemoy HECA.",
  },
  coming_soon: {
    title: "Segera Hadir di Baby Gemoy HECA",
    text: "Kami sedang menyiapkan koleksi pakaian dan perlengkapan lembut terbaru untuk si kecil. Nantikan segera.",
  },
  footer: {
    tagline: "BABY GEMOY HECA",
    copyright: "© 2026 BABY GEMOY HECA. HAK CIPTA DILINDUNGI.",
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
