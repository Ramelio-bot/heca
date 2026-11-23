import AntiGravityHero from "@/components/AntiGravityHero";
import ProductCatalog from "@/components/ProductCatalog";
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

const BABY_COMFORT_PILLARS = [
  {
    badge: "STANDAR OEKO-TEX® 100",
    title: "100% Katun Organik Murni",
    desc: "Bebas formaldehida, pemutih klorin, dan pewarna sintetis keras. Teruji aman untuk kulit bayi baru lahir yang paling sensitif.",
    bg: "bg-[#E9F0EB]",
    textColor: "text-[#3D6B52]",
  },
  {
    badge: "DESAIN ANTI-GATAL",
    title: "Label di Luar & Jahitan Rata",
    desc: "Untuk ukuran Newborn & Baby (50–80 cm), label perawatan dijahit di sisi luar pakaian agar tidak menggesek leher dan punggung bayi.",
    bg: "bg-[#EBF3F7]",
    textColor: "text-[#3B6E8C]",
  },
  {
    badge: "TEKNOLOGI AIR-MESH",
    title: "Sejuk & Menyerap Keringat",
    desc: "Serat katun bernapas yang melepaskan panas dan kelembapan 2x lebih cepat, mencegah biang keringat di iklim tropis.",
    bg: "bg-[#FDF6E4]",
    textColor: "text-[#8C6527]",
  },
  {
    badge: "PRAKTIS UNTUK IBU",
    title: "Kancing Snap & Pengait Pinggang",
    desc: "Kancing plastik hipoalergenik berwarna kontras agar tidak salah pasang, serta kancing pengait piyama agar baju tidur tidak tersingkap.",
    bg: "bg-[#FDEEE9]",
    textColor: "text-[#B8432E]",
  },
];

export default async function Home() {
  const settings = await getSiteSettings();
  const homeContent = settings.home_content || DEFAULT_SITE_SETTINGS.home_content!;

  return (
    <main className="flex min-h-screen flex-col items-center w-full bg-[#FAF7F2]">
      {/* Sticky Header + Hero + Age Stage Cards */}
      <AntiGravityHero />

      {/* Main Baby Product Catalog */}
      <ProductCatalog />

      {/* Uniqlo Baby Inspired: 4 Pillars of Baby Skin Safety & Comfort */}
      <section className="w-full bg-white border-y border-[#2C2523]/10 py-14 md:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
            <span className="inline-block bg-[#E05A47]/10 text-[#E05A47] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
              BABY GEMOY HECA QUALITY PROMISE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2C2523] mb-3">
              {homeContent.hero_title || "Kenyamanan Sejak Hari Pertama Bersama Baby Gemoy HECA"}
            </h2>
            <p className="text-xs sm:text-sm text-[#2C2523]/70 leading-relaxed">
              {homeContent.hero_subtitle ||
                "Setiap helai pakaian Baby Gemoy HECA dirancang bersama dokter anak dan para ibu untuk memastikan kenyamanan maksimal di setiap gerakan si kecil."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {BABY_COMFORT_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 bg-[#FAF7F2] border border-[#2C2523]/8 flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${pillar.bg} ${pillar.textColor}`}
                  >
                    {pillar.badge}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#2C2523] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#2C2523]/75 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#2C2523]/10 flex items-center justify-between text-[11px] font-medium text-[#2C2523]/60">
                  <span>Standar Keamanan Bayi</span>
                  <span>0{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
