"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProduct, ProductSize, Product, HeroSlide } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    reorderProduct,
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    reorderHeroSlide,
    storeLinks,
    updateStoreLinks,
  } = useProduct();
  const [isAuth, setIsAuth] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [draggedProductId, setDraggedProductId] = useState<number | null>(null);
  const { currency, setCurrency, formatPrice, fxRate, updateFxRate } = useCart();

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          alert("Sesi login admin telah berakhir. Silakan login kembali.");
          router.push("/admin/login");
          return null;
        }
        throw new Error(data.error || "Gagal mengunggah file.");
      }
      return data.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Error uploading file: " + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const FileUploader = ({ onUpload, accept = "image/*", label = "Upload File" }: { onUpload: (url: string) => void, accept?: string, label?: string }) => {
    const [uploadingSelf, setUploadingSelf] = useState(false);
    return (
      <div className="relative mt-2">
        <input 
          type="file" 
          accept={accept}
          disabled={isUploading || uploadingSelf}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              setUploadingSelf(true);
              const url = await handleFileUpload(file);
              setUploadingSelf(false);
              if (url) onUpload(url);
              e.target.value = "";
            }
          }}
        />
        <div className={`w-full py-2.5 border border-dashed border-heca-primary/30 text-center text-[10px] uppercase tracking-widest ${uploadingSelf ? 'opacity-50 animate-pulse bg-heca-primary/5 font-semibold' : 'hover:bg-heca-primary/5'} transition-colors`}>
          {uploadingSelf ? "Uploading..." : label}
        </div>
      </div>
    );
  };
  // Form States
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("WOMAN");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [subCategory, setSubCategory] = useState("DRESSES");
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [price, setPrice] = useState("");
  const [productImages, setProductImages] = useState<string[]>(["", "", "", "", ""]);
  const image = productImages[0] || "";
  const hoverImage = productImages[1] || "";

  const updateProductImage = (index: number, val: string) => {
    setProductImages(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const removeProductImage = (index: number) => {
    setProductImages(prev => {
      if (prev.length <= 5) {
        const next = [...prev];
        next[index] = "";
        return next;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const addProductImageSlot = () => {
    setProductImages(prev => [...prev, ""]);
  };
  const [videoUrl, setVideoUrl] = useState("");
  const [sizeGuideUrl, setSizeGuideUrl] = useState("");
  const [sizes, setSizes] = useState<ProductSize[]>(["M"]);
  const [isNew, setIsNew] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [tokopediaUrl, setTokopediaUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [etsyUrl, setEtsyUrl] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [alibabaUrl, setAlibabaUrl] = useState("");

  // Store Links Form States
  const [globalShopee, setGlobalShopee] = useState("");
  const [globalTokopedia, setGlobalTokopedia] = useState("");
  const [globalTiktok, setGlobalTiktok] = useState("");
  const [globalEtsy, setGlobalEtsy] = useState("");
  const [globalAmazon, setGlobalAmazon] = useState("");
  const [globalAlibaba, setGlobalAlibaba] = useState("");
  const [globalInstagram, setGlobalInstagram] = useState("");
  const [globalPinterest, setGlobalPinterest] = useState("");
  const [globalSpotify, setGlobalSpotify] = useState("");
  const [globalClientService, setGlobalClientService] = useState("");

  // Slide Form States
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [draggedSlideId, setDraggedSlideId] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<"image" | "video">("image");
  const [slideUrl, setSlideUrl] = useState("");

  // Website Settings Form States
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState("New Season — The Archive Is Being Refreshed");
  const [announcementBgColor, setAnnouncementBgColor] = useState("#111111");
  const [announcementTextColor, setAnnouncementTextColor] = useState("#EBE6DF");
  const [announcementLink, setAnnouncementLink] = useState("");

  const [seoTitle, setSeoTitle] = useState("HECA | High-Fashion & Minimalist Editorial");
  const [seoDescription, setSeoDescription] = useState("HECA is a modern luxury fashion brand inspired by minimalist editorial style.");
  const [seoKeywords, setSeoKeywords] = useState("HECA, Luxury Fashion, Minimalist, Editorial, Designer Clothes");
  const [seoOgImage, setSeoOgImage] = useState("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80");

  const [homeHeroTitle, setHomeHeroTitle] = useState("THE NEW");
  const [homeHeroSubtitle, setHomeHeroSubtitle] = useState("Scroll Down");
  const [homeArchiveTitle, setHomeArchiveTitle] = useState("The Archive");
  const [homeArchiveSubtitle, setHomeArchiveSubtitle] = useState("Collection In Curation");
  const [homeNewsletterTitle, setHomeNewsletterTitle] = useState("Join The Archive");
  const [homeNewsletterText, setHomeNewsletterText] = useState("Subscribe to receive updates on new arrivals, special offers and other discount information.");

  const [comingSoonTitle, setComingSoonTitle] = useState("Coming Soon");
  const [comingSoonText, setComingSoonText] = useState("We are currently curating this experience. Please check back later for updates.");

  const [footerTagline, setFooterTagline] = useState("HECA");
  const [footerCopyright, setFooterCopyright] = useState("© 2026 HECA. ALL RIGHTS RESERVED.");

  const [isSavingSiteSettings, setIsSavingSiteSettings] = useState(false);

  // Settings & Toast
  const [toastMessage, setToastMessage] = useState("");
  const [rateInput, setRateInput] = useState("");
  const [shippingInput, setShippingInput] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    async function loadSiteSettings() {
      try {
        const res = await fetch("/api/site-settings");
        if (!res.ok) return;
        const rows = await res.json();
        const map: Record<string, any> = {};
        (rows || []).forEach((r: any) => { map[r.key] = r.value; });

        if (map.announcement) {
          setAnnouncementEnabled(Boolean(map.announcement.enabled));
          setAnnouncementText(map.announcement.text || "");
          setAnnouncementBgColor(map.announcement.bg_color || "#111111");
          setAnnouncementTextColor(map.announcement.text_color || "#EBE6DF");
          setAnnouncementLink(map.announcement.link || "");
        }
        if (map.site_meta) {
          setSeoTitle(map.site_meta.title || "");
          setSeoDescription(map.site_meta.description || "");
          setSeoKeywords(map.site_meta.keywords || "");
          setSeoOgImage(map.site_meta.og_image || "");
        }
        if (map.home_content) {
          setHomeHeroTitle(map.home_content.hero_title || "");
          setHomeHeroSubtitle(map.home_content.hero_subtitle || "");
          setHomeArchiveTitle(map.home_content.archive_title || "");
          setHomeArchiveSubtitle(map.home_content.archive_subtitle || "");
          setHomeNewsletterTitle(map.home_content.newsletter_title || "");
          setHomeNewsletterText(map.home_content.newsletter_text || "");
        }
        if (map.coming_soon) {
          setComingSoonTitle(map.coming_soon.title || "");
          setComingSoonText(map.coming_soon.text || "");
        }
        if (map.footer) {
          setFooterTagline(map.footer.tagline || "");
          setFooterCopyright(map.footer.copyright || "");
        }
      } catch (err) {
        console.error("Failed to fetch site settings in admin:", err);
      }
    }
    loadSiteSettings();
  }, []);

  const saveSiteSettingKey = async (key: string, value: any) => {
    setIsSavingSiteSettings(true);
    try {
      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save");
      }
      showToast(`Saved ${key.replace("_", " ")}`);
    } catch (err: any) {
      alert("Error saving setting: " + err.message);
    } finally {
      setIsSavingSiteSettings(false);
    }
  };

  const saveAllSiteSettings = async () => {
    setIsSavingSiteSettings(true);
    try {
      const payload = {
        announcement: {
          enabled: announcementEnabled,
          text: announcementText,
          bg_color: announcementBgColor,
          text_color: announcementTextColor,
          link: announcementLink.trim() || null,
        },
        site_meta: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
          og_image: seoOgImage,
        },
        home_content: {
          hero_title: homeHeroTitle,
          hero_subtitle: homeHeroSubtitle,
          archive_title: homeArchiveTitle,
          archive_subtitle: homeArchiveSubtitle,
          newsletter_title: homeNewsletterTitle,
          newsletter_text: homeNewsletterText,
        },
        coming_soon: {
          title: comingSoonTitle,
          text: comingSoonText,
        },
        footer: {
          tagline: footerTagline,
          copyright: footerCopyright,
        },
      };

      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save website settings");
      }
      showToast("All website settings saved successfully");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingSiteSettings(false);
    }
  };

  useEffect(() => {
    if (fxRate) setRateInput(fxRate.toString());
    async function loadShipping() {
      try {
        const { data } = await supabase
          .from("heca_settings")
          .select("value")
          .eq("key", "shipping_usd")
          .single();
        if (data && data.value) setShippingInput(Number(data.value).toString());
      } catch (err) {
        console.error("Error loading shipping_usd:", err);
      }
    }
    loadShipping();
  }, [fxRate]);

  const handleRateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateInput) {
      await updateFxRate(Number(rateInput));
    }
    if (shippingInput) {
      try {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "shipping_usd", value: Number(shippingInput) }),
        });
      } catch (err) {
        console.error("Failed to update shipping_usd:", err);
      }
    }
    showToast("Settings updated successfully");
  };

  useEffect(() => {
    fetch("/api/admin/session")
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) {
          router.replace("/admin/login");
          return;
        }
        if (d.token) {
          try {
            supabase.auth.setSession({ access_token: d.token, refresh_token: "" });
          } catch {}
        }
        setIsAuth(true);
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setLoadingAuth(false));
  }, [router]);

  useEffect(() => {
    setGlobalShopee(storeLinks.shopee);
    setGlobalTokopedia(storeLinks.tokopedia);
    setGlobalTiktok(storeLinks.tiktok);
    setGlobalEtsy(storeLinks.etsy || "");
    setGlobalAmazon(storeLinks.amazon || "");
    setGlobalAlibaba(storeLinks.alibaba || "");
    setGlobalInstagram(storeLinks.instagram);
    setGlobalPinterest(storeLinks.pinterest);
    setGlobalSpotify(storeLinks.spotify);
    setGlobalClientService(storeLinks.clientService);
  }, [storeLinks]);

  if (loadingAuth || !isAuth) {
    return (
      <div className="min-h-screen bg-heca-bg flex items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-mono animate-pulse">
          Authenticating Session...
        </div>
      </div>
    );
  }

  const handleSizeToggle = (size: ProductSize) => {
    setSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };



  const isValidHttpUrl = (str: string) => {
    try {
      const u = new URL(str);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = productImages.map(img => img.trim()).filter(Boolean);
    const primaryImg = validImages[0] || "";

    if (!name || !price || !primaryImg || sizes.length === 0) {
      return alert("Please fill all required fields (Name, Price, at least one Image, and at least one Size)");
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return alert("Price must be a valid number greater than 0");
    }

    const numDiscount = Number(discountPercent);
    if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 100) {
      return alert("Discount percent must be a number between 0 and 100");
    }

    const validSizes: ProductSize[] = ["S", "M", "L", "XL"];
    const invalidSizes = sizes.filter(s => !validSizes.includes(s));
    if (invalidSizes.length > 0) {
      return alert("Sizes must only include standard options: S, M, L, XL");
    }

    for (let i = 0; i < validImages.length; i++) {
      if (!isValidHttpUrl(validImages[i])) {
        return alert(`Image ${i + 1} URL must start with http:// or https://`);
      }
    }

    if (shopeeUrl && !isValidHttpUrl(shopeeUrl)) {
      return alert("Shopee URL must start with http:// or https://");
    }
    if (tokopediaUrl && !isValidHttpUrl(tokopediaUrl)) {
      return alert("Tokopedia URL must start with http:// or https://");
    }
    if (tiktokUrl && !isValidHttpUrl(tiktokUrl)) {
      return alert("TikTok Shop URL must start with http:// or https://");
    }
    if (etsyUrl && !isValidHttpUrl(etsyUrl)) {
      return alert("Etsy URL must start with http:// or https://");
    }
    if (amazonUrl && !isValidHttpUrl(amazonUrl)) {
      return alert("Amazon URL must start with http:// or https://");
    }
    if (alibabaUrl && !isValidHttpUrl(alibabaUrl)) {
      return alert("Alibaba URL must start with http:// or https://");
    }

    setIsSaving(true);
    try {
      if (editingProductId !== null) {
        await updateProduct(editingProductId, {
          name,
          price: Math.round(Number(price)),
          displayPrice: `$${Math.round(Number(price))}`,
          image: primaryImg,
          hoverImage: validImages[1] || "",
          gallery: validImages,
          category,
          subCategory,
          sizes,
          isNew,
          discountPercent,
          description,
          material,
          careInstructions,
          shopeeUrl,
          tokopediaUrl,
          tiktokUrl,
          etsyUrl,
          amazonUrl,
          alibabaUrl,
          videoUrl,
          sizeGuideUrl,
        });
        showToast("Product updated successfully");
      } else {
        await addProduct({
          name,
          price: Math.round(Number(price)),
          displayPrice: `$${Math.round(Number(price))}`,
          image: primaryImg,
          hoverImage: validImages[1] || "",
          gallery: validImages,
          category,
          subCategory,
          sizes,
          isNew,
          discountPercent,
          description,
          material,
          careInstructions,
          shopeeUrl,
          tokopediaUrl,
          tiktokUrl,
          etsyUrl,
          amazonUrl,
          alibabaUrl,
          videoUrl,
          sizeGuideUrl,
        });
        showToast("Product added successfully");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save product to Supabase. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setName("");
    setPrice("");
    setProductImages(["", "", "", "", ""]);
    setVideoUrl("");
    setSizeGuideUrl("");
    setSizes(["M"]);
    setCategory("WOMAN");
    setSubCategory("DRESSES");
    setIsNew(false);
    setDiscountPercent(0);
    setDescription("");
    setMaterial("");
    setCareInstructions("");
    setShopeeUrl("");
    setTokopediaUrl("");
    setTiktokUrl("");
    setEtsyUrl("");
    setAmazonUrl("");
    setAlibabaUrl("");
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    const loadedImages: string[] = (product.gallery && product.gallery.length > 0)
      ? [...product.gallery]
      : [product.image, product.hoverImage].filter(Boolean) as string[];
    while (loadedImages.length < 5) {
      loadedImages.push("");
    }
    setProductImages(loadedImages);
    setVideoUrl(product.videoUrl || "");
    setSizeGuideUrl(product.sizeGuideUrl || "");
    setCategory(product.category);
    setSubCategory(product.subCategory);
    setSizes(product.sizes);
    setIsNew(product.isNew || false);
    setDiscountPercent(product.discountPercent || 0);
    setDescription(product.description || "");
    setMaterial(product.material || "");
    setCareInstructions(product.careInstructions || "");
    setShopeeUrl(product.shopeeUrl || "");
    setTokopediaUrl(product.tokopediaUrl || "");
    setTiktokUrl(product.tiktokUrl || "");
    setEtsyUrl(product.etsyUrl || "");
    setAmazonUrl(product.amazonUrl || "");
    setAlibabaUrl(product.alibabaUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideUrl) return alert("Please provide a media URL");
    
    if (editingSlideId) {
      updateHeroSlide(editingSlideId, { type: slideType, url: slideUrl });
      setEditingSlideId(null);
      showToast("Hero slide updated");
    } else {
      addHeroSlide({ type: slideType, url: slideUrl });
      showToast("Hero slide added");
    }
    setSlideUrl("");
  };

  const handleEditSlideClick = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideType(slide.type);
    setSlideUrl(slide.url);
  };

  const resetSlideForm = () => {
    setEditingSlideId(null);
    setSlideType("image");
    setSlideUrl("");
  };

  const handleStoreLinksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreLinks({
      shopee: globalShopee,
      tokopedia: globalTokopedia,
      tiktok: globalTiktok,
      etsy: globalEtsy,
      amazon: globalAmazon,
      alibaba: globalAlibaba,
      instagram: globalInstagram,
      pinterest: globalPinterest,
      spotify: globalSpotify,
      clientService: globalClientService,
    });
    showToast("Global links updated successfully");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen w-full bg-heca-bg text-heca-primary font-sans p-6 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-heca-primary/20 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif tracking-widest uppercase">HECA</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-2">Admin Dashboard / Store & Catalog Management</p>
        </div>
        <div className="flex gap-6 text-[10px] uppercase tracking-widest">
          <Link href="/" className="hover:opacity-60 transition-opacity">View Store</Link>
          <button onClick={handleLogout} className="hover:opacity-60 transition-opacity">Log Out</button>
        </div>
      </div>

      {/* Quick Navigation Anchor Bar */}
      <div className="flex gap-3 pb-6 mb-12 border-b border-heca-primary/10 overflow-x-auto text-[10px] uppercase tracking-widest">
        <a href="#products-section" className="px-4 py-2 border border-heca-primary/30 hover:border-heca-primary hover:bg-heca-primary/5 transition-colors whitespace-nowrap">
          Products ({products.length})
        </a>
        <a href="#banner-section" className="px-4 py-2 border border-heca-primary/30 hover:border-heca-primary hover:bg-heca-primary/5 transition-colors whitespace-nowrap">
          Hero Banner / Slides ({heroSlides.length})
        </a>
        <a href="#store-links-section" className="px-4 py-2 border border-heca-primary/30 hover:border-heca-primary hover:bg-heca-primary/5 transition-colors whitespace-nowrap">
          Store & Marketplace Links
        </a>
        <a href="#website-settings-section" className="px-4 py-2 border border-heca-primary/30 hover:border-heca-primary hover:bg-heca-primary/5 transition-colors whitespace-nowrap">
          Website Settings & CMS
        </a>
        <a href="#fx-settings-section" className="px-4 py-2 border border-heca-primary/30 hover:border-heca-primary hover:bg-heca-primary/5 transition-colors whitespace-nowrap">
          Currency & Shipping
        </a>
      </div>

      <div id="products-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 scroll-mt-8">
        
        {/* ADD / EDIT PRODUCT FORM (col-span-4) */}
        <div className="lg:col-span-4 bg-white p-8 border border-heca-primary/10 h-fit">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-sm font-serif uppercase tracking-widest">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </h2>
            {editingProductId && (
              <button type="button" onClick={resetForm} className="text-[10px] uppercase tracking-widest border-b border-heca-primary/30 hover:border-heca-primary transition-colors">
                Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="e.g. Silk Blend Scarf" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest relative">
                <label className="opacity-60">Category</label>
                {isAddingCategory ? (
                  <input 
                    type="text"
                    autoFocus
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs uppercase"
                    placeholder="PRESS ENTER TO SAVE..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (e.currentTarget.value.trim()) {
                          setCategory(e.currentTarget.value.trim().toUpperCase());
                        }
                        setIsAddingCategory(false);
                      } else if (e.key === 'Escape') {
                        setIsAddingCategory(false);
                      }
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value.trim()) {
                        setCategory(e.currentTarget.value.trim().toUpperCase());
                      }
                      setIsAddingCategory(false);
                    }}
                  />
                ) : (
                  <select 
                    value={category} 
                    onChange={e => {
                      if (e.target.value === "ADD_NEW") {
                        setIsAddingCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }} 
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs uppercase" 
                  >
                    <option value="" disabled>Select Category</option>
                    {Array.from(new Set([...products.map(p => p.category), category])).filter(Boolean).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="ADD_NEW" className="font-bold">+ ADD NEW CATEGORY...</option>
                  </select>
                )}
              </div>
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest relative">
                <label className="opacity-60">Sub-Category</label>
                {isAddingSubCategory ? (
                  <input 
                    type="text"
                    autoFocus
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs uppercase"
                    placeholder="PRESS ENTER TO SAVE..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (e.currentTarget.value.trim()) {
                          setSubCategory(e.currentTarget.value.trim().toUpperCase());
                        }
                        setIsAddingSubCategory(false);
                      } else if (e.key === 'Escape') {
                        setIsAddingSubCategory(false);
                      }
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value.trim()) {
                        setSubCategory(e.currentTarget.value.trim().toUpperCase());
                      }
                      setIsAddingSubCategory(false);
                    }}
                  />
                ) : (
                  <select 
                    value={subCategory} 
                    onChange={e => {
                      if (e.target.value === "ADD_NEW") {
                        setIsAddingSubCategory(true);
                      } else {
                        setSubCategory(e.target.value);
                      }
                    }} 
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs uppercase" 
                  >
                    <option value="" disabled>Select Sub-Category</option>
                    {Array.from(new Set([...products.filter(p => p.category === category).map(p => p.subCategory), subCategory])).filter(Boolean).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="ADD_NEW" className="font-bold">+ ADD NEW SUB-CATEGORY...</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60 flex justify-between">
                <span>Price ({currency})</span>
                <div className="flex gap-2 text-[9px]">
                  <button type="button" onClick={() => setCurrency("USD")} className={currency === "USD" ? "font-bold text-heca-primary" : "opacity-50 hover:opacity-100"}>USD</button>
                  <span className="opacity-30">|</span>
                  <button type="button" onClick={() => setCurrency("IDR")} className={currency === "IDR" ? "font-bold text-heca-primary" : "opacity-50 hover:opacity-100"}>IDR</button>
                </div>
              </label>
              <input 
                type="number" 
                value={price ? (currency === 'USD' ? price : Math.round(Number(price) * (fxRate || 15500))).toString() : ""} 
                onChange={e => {
                  const val = e.target.value;
                  if (!val) setPrice("");
                  else setPrice(currency === 'USD' ? val : (Number(val) / (fxRate || 15500)).toString());
                }} 
                className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" 
                placeholder={currency === 'USD' ? "e.g. 290" : `e.g. ${290 * (fxRate || 15500)}`} 
              />
            </div>

            {/* Multi-Image Product Gallery */}
            <div className="flex flex-col space-y-4 pt-2 border-t border-heca-primary/10">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                <span className="font-semibold text-heca-primary">Product Images ({productImages.filter(Boolean).length} uploaded)</span>
                <span className="opacity-50 text-[9px]">Base 5 Slots</span>
              </div>
              <p className="text-[10px] opacity-60 leading-relaxed -mt-2">
                Gambar 1 adalah cover utama produk. Gambar 2 adalah tampilan saat hover. Anda dapat menambah slot gambar tanpa batas.
              </p>

              <div className="space-y-4">
                {productImages.map((imgUrl, idx) => (
                  <div key={idx} className="p-3 bg-heca-primary/[0.02] border border-heca-primary/15 space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-mono">
                      <span className="opacity-70 font-sans">
                        {idx === 0 
                          ? "Gambar 1 (Cover Utama) *" 
                          : idx === 1 
                          ? "Gambar 2 (Hover / Tampilan Kedua)" 
                          : `Gambar ${idx + 1}`}
                      </span>
                      {idx >= 5 ? (
                        <button 
                          type="button" 
                          onClick={() => removeProductImage(idx)}
                          className="text-[#D6001C] hover:underline text-[9px] uppercase tracking-wider"
                        >
                          Hapus Slot
                        </button>
                      ) : (
                        imgUrl && (
                          <button 
                            type="button" 
                            onClick={() => removeProductImage(idx)}
                            className="text-[#D6001C] hover:underline text-[9px] uppercase tracking-wider"
                          >
                            Kosongkan
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex gap-3 items-center">
                      {imgUrl ? (
                        <div className="w-12 h-16 shrink-0 border border-heca-primary/20 bg-black/5 overflow-hidden relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt={`Slot ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-16 shrink-0 border border-dashed border-heca-primary/20 bg-heca-primary/[0.02] flex items-center justify-center text-[9px] opacity-40 font-mono">
                          {idx + 1}
                        </div>
                      )}

                      <div className="flex-1 flex flex-col space-y-1">
                        <input 
                          type="text" 
                          value={imgUrl} 
                          onChange={e => updateProductImage(idx, e.target.value)} 
                          className="w-full border-b border-heca-primary/30 py-1.5 outline-none focus:border-heca-primary bg-transparent text-xs" 
                          placeholder={idx === 0 ? "https://... (Cover Utama)" : "https://..."} 
                        />
                        <FileUploader 
                          onUpload={(url) => updateProductImage(idx, url)} 
                          label={imgUrl ? "Ganti Gambar" : `Unggah Gambar ${idx + 1}`} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addProductImageSlot}
                className="w-full py-2.5 border border-dashed border-heca-primary/40 hover:border-heca-primary hover:bg-heca-primary/5 text-center text-[10px] uppercase tracking-widest font-semibold transition-all mt-2"
              >
                + Tambahkan Gambar
              </button>
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest pt-2">
              <label className="opacity-60">Product Catwalk Video URL (Optional MP4) <span className="lowercase opacity-50 ml-2">*Recommended: &lt; 10MB .mp4 for optimal mobile performance</span></label>
              <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://example.com/video.mp4" />
              <FileUploader onUpload={setVideoUrl} accept="video/mp4,video/webm" label="Or Upload Video" />
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Custom Size Guide Image URL (Optional)</label>
              <input type="text" value={sizeGuideUrl} onChange={e => setSizeGuideUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://example.com/sizeguide.jpg" />
              <FileUploader onUpload={setSizeGuideUrl} label="Or Upload Size Guide" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex items-center space-x-2 text-[10px] uppercase tracking-widest pt-6">
                <input type="checkbox" id="isNew" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="w-4 h-4 accent-heca-primary" />
                <label htmlFor="isNew" className="cursor-pointer">Mark as New Arrival</label>
              </div>
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Discount Percentage (%)</label>
                <input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(parseInt(e.target.value) || 0)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="0" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Shopee URL</label>
                <input type="text" value={shopeeUrl} onChange={e => setShopeeUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://shopee.co.id/..." />
              </div>
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Tokopedia URL</label>
                <input type="text" value={tokopediaUrl} onChange={e => setTokopediaUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://tokopedia.com/..." />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">TikTok Shop URL</label>
                <input type="text" value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://tiktok.com/..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Etsy URL</label>
                <input
                  type="text"
                  value={etsyUrl}
                  onChange={e => setEtsyUrl(e.target.value)}
                  className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                  placeholder="https://www.etsy.com/shop/..."
                />
              </div>
              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Amazon URL</label>
                <input
                  type="text"
                  value={amazonUrl}
                  onChange={e => setAmazonUrl(e.target.value)}
                  className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                  placeholder="https://www.amazon.com/stores/..."
                />
              </div>
              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Alibaba URL</label>
                <input
                  type="text"
                  value={alibabaUrl}
                  onChange={e => setAlibabaUrl(e.target.value)}
                  className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                  placeholder="https://....en.alibaba.com"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Product Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs min-h-[60px]" placeholder="Detailed product description..." />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Material / Composition</label>
                <input type="text" value={material} onChange={e => setMaterial(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="e.g. 100% Silk" />
              </div>
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Care Instructions</label>
                <input type="text" value={careInstructions} onChange={e => setCareInstructions(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="e.g. Dry clean only" />
              </div>
            </div>

            <div className="flex flex-col space-y-3 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Available Sizes</label>
              <div className="flex gap-3">
                {(["S", "M", "L", "XL"] as ProductSize[]).map(size => (
                  <button 
                    key={size} type="button" 
                    onClick={() => handleSizeToggle(size)}
                    className={`border px-4 py-2 transition-colors ${sizes.includes(size) ? "bg-heca-primary text-white border-heca-primary" : "border-heca-primary/30 hover:border-heca-primary"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-heca-primary text-heca-bg py-4 text-xs uppercase tracking-[0.2em] hover:bg-heca-primary/90 mt-4 disabled:opacity-50">
              {isSaving ? "Saving..." : (editingProductId ? "Update Product" : "Publish Product")}
            </button>
          </form>
        </div>

        {/* PRODUCT LISTING (col-span-8) */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-6 border-b border-heca-primary/30 pb-4">
            <h2 className="text-sm font-serif uppercase tracking-widest">Archive Catalog ({products.length})</h2>
            <div className="flex items-center gap-4">
              {selectedProducts.length > 0 && (
                <button 
                  onClick={() => {
                    bulkDeleteProducts(selectedProducts);
                    setSelectedProducts([]);
                  }}
                  className="text-[10px] uppercase tracking-widest text-[#D6001C] hover:underline"
                >
                  Delete Selected ({selectedProducts.length})
                </button>
              )}
              {products.length > 0 && (
                <button 
                  onClick={() => {
                    if(confirm("Are you sure you want to delete ALL products? This action cannot be undone.")) {
                      bulkDeleteProducts(products.map(p => p.id));
                      setSelectedProducts([]);
                    }
                  }}
                  className="text-[10px] uppercase tracking-widest text-[#D6001C] hover:underline font-bold"
                >
                  Delete All Data
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map(product => (
              <div 
                key={product.id} 
                className={`flex flex-col group relative cursor-move transition-transform ${draggedProductId === product.id ? "opacity-50 scale-95" : "opacity-100"}`}
                draggable
                onDragStart={(e) => {
                  setDraggedProductId(product.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedProductId !== null && draggedProductId !== product.id) {
                    reorderProduct(draggedProductId, product.id);
                  }
                  setDraggedProductId(null);
                }}
                onDragEnd={() => setDraggedProductId(null)}
              >
                <div className="absolute top-2 left-2 z-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer accent-heca-primary" 
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(prev => [...prev, product.id]);
                      } else {
                        setSelectedProducts(prev => prev.filter(id => id !== product.id));
                      }
                    }}
                  />
                </div>
                <div className="relative w-full aspect-[2/3] bg-[#e0d9d0] mb-3 overflow-hidden">
                  <Image src={product.image} alt={product.name} fill className="object-cover pointer-events-none" sizes="200px" />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="bg-white text-black px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gray-200 w-24"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="bg-[#D6001C] text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-red-700 w-24"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex flex-col text-[10px] font-sans tracking-wider uppercase">
                  <span className="font-medium truncate flex items-center gap-2">
                    {product.name}
                    {product.isNew && <span className="bg-heca-primary text-heca-bg px-1 py-0.5 text-[8px]">NEW</span>}
                    {product.discountPercent ? <span className="bg-[#D6001C] text-white px-1 py-0.5 text-[8px]">SALE -{product.discountPercent}%</span> : null}
                  </span>
                  <span className="opacity-60 font-serif my-1">{formatPrice(product.price)}</span>
                  <span className="text-[8px] opacity-40 mb-3">{product.category} / {product.subCategory}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="store-links-section" className="border-t border-heca-primary/20 pt-12 mb-12 scroll-mt-8">
        <h2 className="text-sm font-serif uppercase tracking-widest mb-6">OFFICIAL STORE GENERAL LINKS</h2>
        <form onSubmit={handleStoreLinksSubmit} className="bg-white p-8 border border-heca-primary/10 flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Official Shopee Store Link</label>
              <input type="text" value={globalShopee} onChange={e => setGlobalShopee(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://shopee.co.id/..." />
            </div>
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Official Tokopedia Store Link</label>
              <input type="text" value={globalTokopedia} onChange={e => setGlobalTokopedia(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://tokopedia.com/..." />
            </div>
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Official TikTok Shop Link</label>
              <input type="text" value={globalTiktok} onChange={e => setGlobalTiktok(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://tiktok.com/..." />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Official Etsy Store Link</label>
              <input type="text" value={globalEtsy} onChange={e => setGlobalEtsy(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://www.etsy.com/shop/..." />
            </div>
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Official Amazon Store Link</label>
              <input type="text" value={globalAmazon} onChange={e => setGlobalAmazon(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://www.amazon.com/stores/..." />
            </div>
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Official Alibaba Store Link</label>
              <input type="text" value={globalAlibaba} onChange={e => setGlobalAlibaba(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://....en.alibaba.com" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Instagram Link</label>
              <input type="text" value={globalInstagram} onChange={e => setGlobalInstagram(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://instagram.com/..." />
            </div>
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Pinterest Link</label>
              <input type="text" value={globalPinterest} onChange={e => setGlobalPinterest(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://pinterest.com/..." />
            </div>
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Spotify Link</label>
              <input type="text" value={globalSpotify} onChange={e => setGlobalSpotify(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://spotify.com/..." />
            </div>
            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Client Service Link (WhatsApp/Email)</label>
              <input type="text" value={globalClientService} onChange={e => setGlobalClientService(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://wa.me/... or mailto:..." />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="submit" className="w-full md:w-auto px-12 bg-heca-primary text-heca-bg py-3 text-xs uppercase tracking-[0.2em] hover:bg-heca-primary/90">
              Save Store Links
            </button>
          </div>
        </form>
      </div>

      <div id="banner-section" className="border-t border-heca-primary/20 pt-12 mb-12 scroll-mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ADD SLIDE FORM */}
          <div className="lg:col-span-4 bg-white p-8 border border-heca-primary/10 h-fit">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-sm font-serif uppercase tracking-widest">
                {editingSlideId ? "Edit Hero Slide" : "Add Hero Slide"}
              </h2>
              {editingSlideId && (
                <button type="button" onClick={resetSlideForm} className="text-[10px] uppercase tracking-widest border-b border-heca-primary/30 hover:border-heca-primary transition-colors">
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSlideSubmit} className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Media Type</label>
                <select value={slideType} onChange={e => setSlideType(e.target.value as "image" | "video")} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Media URL (.mp4 or image)</label>
                <input type="text" value={slideUrl} onChange={e => setSlideUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://..." />
                <FileUploader onUpload={setSlideUrl} accept="image/*,video/mp4,video/webm" label="Or Upload Media" />
              </div>

              <button type="submit" className="w-full bg-heca-primary text-heca-bg py-4 text-xs uppercase tracking-[0.2em] hover:bg-heca-primary/90 mt-4">
                {editingSlideId ? "Update Slide" : "Add Slide"}
              </button>
            </form>
          </div>

          {/* SLIDE LISTING */}
          <div className="lg:col-span-8">
            <h2 className="text-sm font-serif uppercase tracking-widest mb-6">Active Slides ({heroSlides.length})</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {heroSlides.map((slide, index) => (
                <div 
                  key={slide.id} 
                  className={`flex flex-col group relative w-full aspect-[4/5] bg-[#e0d9d0] mb-3 overflow-hidden cursor-move transition-transform ${draggedSlideId === slide.id ? "opacity-50 scale-95" : "opacity-100"}`}
                  draggable
                  onDragStart={(e) => {
                    setDraggedSlideId(slide.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedSlideId !== null && draggedSlideId !== slide.id) {
                      reorderHeroSlide(draggedSlideId, slide.id);
                    }
                    setDraggedSlideId(null);
                  }}
                  onDragEnd={() => setDraggedSlideId(null)}
                >
                  {slide.type === "video" ? (
                    <video src={slide.url} autoPlay loop muted playsInline className="object-cover w-full h-full pointer-events-none" />
                  ) : (
                    <Image src={slide.url} alt={`Slide ${index + 1}`} fill className="object-cover pointer-events-none" sizes="200px" />
                  )}
                  
                  {/* Hover Delete Action */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <span className="text-white text-[10px] uppercase tracking-widest font-bold mb-2">Slide {index + 1}</span>
                    <button 
                      onClick={() => handleEditSlideClick(slide)}
                      className="bg-white text-black px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gray-200 w-24"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteHeroSlide(slide.id)}
                      className="bg-[#D6001C] text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-red-700 w-24"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="website-settings-section" className="border-t border-heca-primary/20 pt-12 mb-12 scroll-mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-sm font-serif uppercase tracking-widest">WEBSITE SETTINGS & CMS CONTENT</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1">
              Manage live announcement banner, SEO meta tags, homepage titles, and editorial texts.
            </p>
          </div>
          <button
            type="button"
            onClick={saveAllSiteSettings}
            disabled={isSavingSiteSettings}
            className="w-full md:w-auto px-8 bg-heca-primary text-heca-bg py-3 text-xs uppercase tracking-[0.2em] hover:bg-heca-primary/90 transition-colors disabled:opacity-50"
          >
            {isSavingSiteSettings ? "Saving All..." : "Save All Website Settings"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SECTION A: ANNOUNCEMENT BANNER */}
          <div className="bg-white p-8 border border-heca-primary/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-serif uppercase tracking-widest">A. Announcement Banner</h3>
                <span className={`text-[9px] uppercase tracking-widest px-2 py-1 ${announcementEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {announcementEnabled ? "Live / Active" : "Disabled"}
                </span>
              </div>

              <div className="flex flex-col space-y-5">
                <label className="flex items-center space-x-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="w-4 h-4 accent-heca-primary cursor-pointer"
                  />
                  <span className="text-xs uppercase tracking-widest font-medium">Enable Announcement Banner</span>
                </label>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Banner Announcement Text</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="New Season — The Archive Is Being Refreshed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                    <label className="opacity-60">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={announcementBgColor}
                        onChange={(e) => setAnnouncementBgColor(e.target.value)}
                        className="w-8 h-8 rounded border border-heca-primary/20 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={announcementBgColor}
                        onChange={(e) => setAnnouncementBgColor(e.target.value)}
                        className="flex-1 border-b border-heca-primary/30 py-1 outline-none focus:border-heca-primary bg-transparent text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                    <label className="opacity-60">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={announcementTextColor}
                        onChange={(e) => setAnnouncementTextColor(e.target.value)}
                        className="w-8 h-8 rounded border border-heca-primary/20 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={announcementTextColor}
                        onChange={(e) => setAnnouncementTextColor(e.target.value)}
                        className="flex-1 border-b border-heca-primary/30 py-1 outline-none focus:border-heca-primary bg-transparent text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Destination Link (Optional)</label>
                  <input
                    type="text"
                    value={announcementLink}
                    onChange={(e) => setAnnouncementLink(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="https://... or #catalog"
                  />
                </div>

                {/* Live Preview */}
                <div className="pt-2">
                  <label className="text-[9px] uppercase tracking-widest opacity-60 block mb-2">Live Banner Preview</label>
                  <div
                    className="w-full text-center text-[10px] uppercase tracking-[0.2em] py-2 px-4 transition-colors"
                    style={{ backgroundColor: announcementBgColor, color: announcementTextColor }}
                  >
                    {announcementLink ? (
                      <span className="underline underline-offset-2">{announcementText || "Banner Text Sample"}</span>
                    ) : (
                      announcementText || "Banner Text Sample"
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-heca-primary/10">
              <button
                type="button"
                onClick={() =>
                  saveSiteSettingKey("announcement", {
                    enabled: announcementEnabled,
                    text: announcementText,
                    bg_color: announcementBgColor,
                    text_color: announcementTextColor,
                    link: announcementLink.trim() || null,
                  })
                }
                disabled={isSavingSiteSettings}
                className="px-6 py-2 bg-heca-primary text-heca-bg text-[10px] uppercase tracking-widest hover:bg-heca-primary/90 transition-colors"
              >
                Save Announcement
              </button>
            </div>
          </div>

          {/* SECTION B: SEO & SITE META */}
          <div className="bg-white p-8 border border-heca-primary/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-serif uppercase tracking-widest">B. SEO / Site Meta</h3>
              </div>

              <div className="flex flex-col space-y-5">
                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="HECA | High-Fashion & Minimalist Editorial"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Meta Description</label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs resize-none"
                    placeholder="HECA is a modern luxury fashion brand..."
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="HECA, Luxury Fashion, Minimalist, Editorial"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Open Graph Image URL</label>
                  <input
                    type="text"
                    value={seoOgImage}
                    onChange={(e) => setSeoOgImage(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <FileUploader onUpload={setSeoOgImage} accept="image/*" label="Or Upload OG Image" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-heca-primary/10">
              <button
                type="button"
                onClick={() =>
                  saveSiteSettingKey("site_meta", {
                    title: seoTitle,
                    description: seoDescription,
                    keywords: seoKeywords,
                    og_image: seoOgImage,
                  })
                }
                disabled={isSavingSiteSettings}
                className="px-6 py-2 bg-heca-primary text-heca-bg text-[10px] uppercase tracking-widest hover:bg-heca-primary/90 transition-colors"
              >
                Save SEO Meta
              </button>
            </div>
          </div>

          {/* SECTION C: HOME CONTENT */}
          <div className="bg-white p-8 border border-heca-primary/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-serif uppercase tracking-widest">C. Home Editorial Content</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Hero Title</label>
                  <input
                    type="text"
                    value={homeHeroTitle}
                    onChange={(e) => setHomeHeroTitle(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="THE NEW"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Hero Subtitle</label>
                  <input
                    type="text"
                    value={homeHeroSubtitle}
                    onChange={(e) => setHomeHeroSubtitle(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="Scroll Down"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Archive Section Title</label>
                  <input
                    type="text"
                    value={homeArchiveTitle}
                    onChange={(e) => setHomeArchiveTitle(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="The Archive"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                  <label className="opacity-60">Archive Section Subtitle</label>
                  <input
                    type="text"
                    value={homeArchiveSubtitle}
                    onChange={(e) => setHomeArchiveSubtitle(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="Collection In Curation"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest sm:col-span-2">
                  <label className="opacity-60">Newsletter Title</label>
                  <input
                    type="text"
                    value={homeNewsletterTitle}
                    onChange={(e) => setHomeNewsletterTitle(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                    placeholder="Join The Archive"
                  />
                </div>

                <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest sm:col-span-2">
                  <label className="opacity-60">Newsletter Subtext</label>
                  <textarea
                    rows={2}
                    value={homeNewsletterText}
                    onChange={(e) => setHomeNewsletterText(e.target.value)}
                    className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs resize-none"
                    placeholder="Subscribe to receive updates on new arrivals..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-heca-primary/10">
              <button
                type="button"
                onClick={() =>
                  saveSiteSettingKey("home_content", {
                    hero_title: homeHeroTitle,
                    hero_subtitle: homeHeroSubtitle,
                    archive_title: homeArchiveTitle,
                    archive_subtitle: homeArchiveSubtitle,
                    newsletter_title: homeNewsletterTitle,
                    newsletter_text: homeNewsletterText,
                  })
                }
                disabled={isSavingSiteSettings}
                className="px-6 py-2 bg-heca-primary text-heca-bg text-[10px] uppercase tracking-widest hover:bg-heca-primary/90 transition-colors"
              >
                Save Home Content
              </button>
            </div>
          </div>

          {/* SECTION D & E: COMING SOON + FOOTER */}
          <div className="flex flex-col space-y-8">
            {/* D. Coming Soon */}
            <div className="bg-white p-8 border border-heca-primary/10 flex flex-col justify-between flex-1">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-serif uppercase tracking-widest">D. Coming Soon Page</h3>
                </div>

                <div className="flex flex-col space-y-5">
                  <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                    <label className="opacity-60">Title</label>
                    <input
                      type="text"
                      value={comingSoonTitle}
                      onChange={(e) => setComingSoonTitle(e.target.value)}
                      className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                      placeholder="Coming Soon"
                    />
                  </div>

                  <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                    <label className="opacity-60">Description Text</label>
                    <textarea
                      rows={2}
                      value={comingSoonText}
                      onChange={(e) => setComingSoonText(e.target.value)}
                      className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs resize-none"
                      placeholder="We are currently curating this experience..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-heca-primary/10">
                <button
                  type="button"
                  onClick={() =>
                    saveSiteSettingKey("coming_soon", {
                      title: comingSoonTitle,
                      text: comingSoonText,
                    })
                  }
                  disabled={isSavingSiteSettings}
                  className="px-6 py-2 bg-heca-primary text-heca-bg text-[10px] uppercase tracking-widest hover:bg-heca-primary/90 transition-colors"
                >
                  Save Coming Soon
                </button>
              </div>
            </div>

            {/* E. Footer */}
            <div className="bg-white p-8 border border-heca-primary/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-serif uppercase tracking-widest">E. Footer</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                    <label className="opacity-60">Footer Big Tagline</label>
                    <input
                      type="text"
                      value={footerTagline}
                      onChange={(e) => setFooterTagline(e.target.value)}
                      className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                      placeholder="HECA"
                    />
                  </div>

                  <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                    <label className="opacity-60">Copyright Notice</label>
                    <input
                      type="text"
                      value={footerCopyright}
                      onChange={(e) => setFooterCopyright(e.target.value)}
                      className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs"
                      placeholder="© 2026 HECA. ALL RIGHTS RESERVED."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-heca-primary/10">
                <button
                  type="button"
                  onClick={() =>
                    saveSiteSettingKey("footer", {
                      tagline: footerTagline,
                      copyright: footerCopyright,
                    })
                  }
                  disabled={isSavingSiteSettings}
                  className="px-6 py-2 bg-heca-primary text-heca-bg text-[10px] uppercase tracking-widest hover:bg-heca-primary/90 transition-colors"
                >
                  Save Footer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="fx-settings-section" className="border-t border-heca-primary/20 pt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-24 scroll-mt-8">
        
        {/* FX Rate & Shipping Settings */}
        <form onSubmit={handleRateSave} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Exchange Rate (1 USD = IDR)</label>
            <input 
              type="number"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              placeholder="e.g. 15500"
              className="bg-transparent border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary transition-colors text-sm tracking-widest placeholder:text-heca-primary/30 w-36"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Shipping (USD)</label>
            <input 
              type="number"
              value={shippingInput}
              onChange={(e) => setShippingInput(e.target.value)}
              placeholder="e.g. 15"
              className="bg-transparent border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary transition-colors text-sm tracking-widest placeholder:text-heca-primary/30 w-24"
            />
          </div>
          <button type="submit" className="bg-heca-primary text-heca-bg px-6 py-2.5 text-[10px] uppercase tracking-widest hover:bg-heca-primary/90 transition-colors">
            Save Settings
          </button>
        </form>

        {/* Admin Account Status */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Admin Account</label>
            <div className="py-2 text-xs tracking-widest font-mono text-heca-primary font-bold">
              admin@heca.com
            </div>
          </div>
          <Link
            href="/admin/login"
            className="border border-heca-primary/30 px-6 py-2.5 text-[10px] uppercase tracking-widest hover:border-heca-primary transition-colors text-center"
          >
            Switch Account
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-heca-primary text-heca-bg px-8 py-3 text-xs uppercase tracking-widest transition-all duration-300 z-50 ${
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
}
