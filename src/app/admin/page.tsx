"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProduct, ProductSize, Product, HeroSlide } from "@/context/ProductContext";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { products, addProduct, updateProduct, deleteProduct, bulkDeleteProducts, reorderProduct, heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlide, storeLinks, updateStoreLinks } = useProduct();
  const [isAuth, setIsAuth] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [draggedProductId, setDraggedProductId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  // Form States
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("WOMAN");
  const [subCategory, setSubCategory] = useState("DRESSES");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [hoverImage, setHoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sizeGuideUrl, setSizeGuideUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>(["M"]);
  const [isNew, setIsNew] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [tokopediaUrl, setTokopediaUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // Store Links Form States
  const [globalShopee, setGlobalShopee] = useState("");
  const [globalTokopedia, setGlobalTokopedia] = useState("");
  const [globalTiktok, setGlobalTiktok] = useState("");
  const [globalInstagram, setGlobalInstagram] = useState("");
  const [globalPinterest, setGlobalPinterest] = useState("");
  const [globalSpotify, setGlobalSpotify] = useState("");
  const [globalClientService, setGlobalClientService] = useState("");

  // Slide Form States
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [draggedSlideId, setDraggedSlideId] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<"image" | "video">("image");
  const [slideUrl, setSlideUrl] = useState("");

  // Settings & Toast
  const [newPasscode, setNewPasscode] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    const authString = sessionStorage.getItem("heca_admin");
    if (!authString) {
      router.push("/admin/login");
      return;
    }

    try {
      const auth = JSON.parse(authString);
      if (Date.now() > auth.expiresAt) {
        sessionStorage.removeItem("heca_admin");
        router.push("/admin/login");
        return;
      }
    } catch {
      sessionStorage.removeItem("heca_admin");
      router.push("/admin/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuth(true);
      setGlobalShopee(storeLinks.shopee);
      setGlobalTokopedia(storeLinks.tokopedia);
      setGlobalTiktok(storeLinks.tiktok);
      setGlobalInstagram(storeLinks.instagram);
      setGlobalPinterest(storeLinks.pinterest);
      setGlobalSpotify(storeLinks.spotify);
      setGlobalClientService(storeLinks.clientService);
  }, [router, storeLinks]);

  if (!isAuth) return <div className="min-h-screen bg-heca-bg"></div>;

  const handleSizeToggle = (size: ProductSize) => {
    setSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image || sizes.length === 0) return alert("Please fill all fields");

    setIsSaving(true);
    try {
      if (editingProductId !== null) {
        await updateProduct(editingProductId, {
          name,
          price: parseInt(price),
          displayPrice: `$${price}`,
          image,
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
          hoverImage,
          videoUrl,
          sizeGuideUrl,
          gallery: gallery.filter(g => g.trim() !== ""),
        });
        showToast("Product updated successfully");
      } else {
        await addProduct({
          name,
          price: parseInt(price),
          displayPrice: `$${price}`,
          image,
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
          hoverImage,
          videoUrl,
          sizeGuideUrl,
          gallery: gallery.filter(g => g.trim() !== ""),
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
    setImage("");
    setHoverImage("");
    setVideoUrl("");
    setSizeGuideUrl("");
    setGallery([]);
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
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setImage(product.image);
    setHoverImage(product.hoverImage || "");
    setVideoUrl(product.videoUrl || "");
    setSizeGuideUrl(product.sizeGuideUrl || "");
    setGallery(product.gallery || []);
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
      instagram: globalInstagram,
      pinterest: globalPinterest,
      spotify: globalSpotify,
      clientService: globalClientService,
    });
    showToast("Global links updated successfully");
  };

  const handlePasscodeChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;
    localStorage.setItem("heca_admin_passcode", newPasscode.trim());
    setNewPasscode("");
    showToast("Passcode updated successfully");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("heca_admin");
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full bg-heca-bg text-heca-primary font-sans p-6 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-heca-primary/20 pb-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif tracking-widest uppercase">HECA</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-2">Admin Dashboard / Product Management</p>
        </div>
        <div className="flex gap-6 text-[10px] uppercase tracking-widest">
          <Link href="/" className="hover:opacity-60 transition-opacity">View Store</Link>
          <button onClick={handleLogout} className="hover:opacity-60 transition-opacity">Log Out</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        
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
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs">
                  <option value="WOMAN">WOMAN</option>
                  <option value="MAN">MAN</option>
                  <option value="KIDS">KIDS</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
                <label className="opacity-60">Sub-Category</label>
                <input type="text" value={subCategory} onChange={e => setSubCategory(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="e.g. DRESSES" />
              </div>
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Price (USD)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="e.g. 290" />
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Image URL</label>
              <input type="text" value={image} onChange={e => setImage(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://images.unsplash.com/..." />
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Hover Image URL (Optional)</label>
              <input type="text" value={hoverImage} onChange={e => setHoverImage(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://images.unsplash.com/..." />
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60 flex justify-between">
                <span>Product Catwalk Video URL (Optional MP4)</span>
                <span className="opacity-50 lowercase normal-case text-[9px]">*Recommended: &lt; 10MB .mp4 for optimal mobile performance</span>
              </label>
              <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://example.com/video.mp4" />
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60">Custom Size Guide Image URL (Optional)</label>
              <input type="text" value={sizeGuideUrl} onChange={e => setSizeGuideUrl(e.target.value)} className="border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" placeholder="https://example.com/sizeguide.jpg" />
            </div>

            <div className="flex flex-col space-y-2 text-[10px] uppercase tracking-widest">
              <label className="opacity-60 flex justify-between items-center">
                <span>Gallery Images (Extra slides for Quick View)</span>
                <button type="button" onClick={() => setGallery([...gallery, ""])} className="text-heca-primary font-bold border-b border-heca-primary">+ Add Picture</button>
              </label>
              {gallery.map((g, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={g} 
                    onChange={e => {
                      const newG = [...gallery];
                      newG[idx] = e.target.value;
                      setGallery(newG);
                    }} 
                    className="flex-1 border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary bg-transparent text-xs" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                  <button type="button" onClick={() => setGallery(gallery.filter((_, i) => i !== idx))} className="text-xs opacity-50 hover:opacity-100">✕</button>
                </div>
              ))}
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
                  <span className="opacity-60 font-serif my-1">{product.displayPrice}</span>
                  <span className="text-[8px] opacity-40 mb-3">{product.category} / {product.subCategory}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-heca-primary/20 pt-12 mb-12">
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

      <div className="border-t border-heca-primary/20 pt-12">
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

      <div className="border-t border-heca-primary/20 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 pb-24">
        
        {/* Change Passcode */}
        <form onSubmit={handlePasscodeChange} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase tracking-widest opacity-60">Admin Passcode</label>
            <input 
              type="password"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="Enter new passcode"
              className="bg-transparent border-b border-heca-primary/30 py-2 outline-none focus:border-heca-primary transition-colors text-sm tracking-widest placeholder:text-heca-primary/30 w-48"
            />
          </div>
          <button type="submit" className="bg-heca-primary text-heca-bg px-6 py-2.5 text-[10px] uppercase tracking-widest hover:bg-heca-primary/90 transition-colors">
            Update
          </button>
        </form>

        {/* Reset button removed for Supabase integration */}
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
