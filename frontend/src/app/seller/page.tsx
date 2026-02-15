"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/productService";
import { authService } from "@/services/authService";
import { Product } from "@/types";

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success'|'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white font-medium transform transition-all duration-500 ease-in-out animate-slide-up z-50 flex items-center gap-2
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      <span>{type === 'success' ? '✅' : '⚠️'}</span>
      {message}
    </div>
  );
};

export default function SellerDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success'|'error' } | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: ""
  });

  // Auth & Load
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== "seller") {
      router.push("/login"); 
      return;
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({ msg, type });
  };

  // --- HANDLERS ---
  const openForm = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        image_url: product.image_url
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", stock: "", image_url: "" });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setTimeout(() => {
        setEditingId(null);
        setFormData({ name: "", description: "", price: "", stock: "", image_url: "" });
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url
    };

    try {
      if (editingId) {
        await productService.updateProduct(editingId, payload);
        showToast("Product updated successfully!", "success");
      } else {
        await productService.createProduct(payload);
        showToast("Product created successfully!", "success");
      }
      closeForm();
      loadProducts();
    } catch (err) {
      showToast("Operation failed. Please try again.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
        await productService.deleteProduct(id);
        showToast("Product deleted.", "success");
        setDeleteConfirmId(null);
        loadProducts();
    } catch (err) {
        showToast("Could not delete product.", "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* HEADER SECTION (Fixed: Logout button removed) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Seller Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                  Manage your inventory and track stock.
                </p>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => openForm()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Product
                </button>
            </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.length === 0 ? (
                 <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-xl font-medium text-white">Your inventory is empty.</p>
                    <p className="text-sm mt-2">Click "Add Product" to get started.</p>
                 </div>
            ) : (
                products.map((p) => (
                    <div key={p.id} className="group bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 overflow-hidden flex flex-col">
                        
                        {/* Image Area */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {p.image_url ? (
                                <img 
                                  src={p.image_url} 
                                  alt={p.name} 
                                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                            
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold border border-white/10 shadow-lg">
                                ${p.price.toLocaleString()}
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="mb-4">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize truncate mb-1" title={p.name}>
                                {p.name}
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 h-10 leading-relaxed">
                                {p.description}
                              </p>
                            </div>
                            
                            <div className="mt-auto flex items-center justify-between text-sm mb-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-400">Stock Status</span>
                                <span className={`font-medium px-2 py-0.5 rounded ${p.stock < 5 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                                  {p.stock} units
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {deleteConfirmId === p.id ? (
                                    <>
                                        <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition animate-pulse">
                                            Confirm
                                        </button>
                                        <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => openForm(p)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent dark:border-gray-700 hover:border-blue-500 hover:text-blue-500 py-2.5 rounded-lg text-sm font-medium transition-all">
                                            Edit
                                        </button>
                                        <button onClick={() => setDeleteConfirmId(p.id)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-400 border border-transparent dark:border-gray-700 hover:border-red-500 hover:text-red-500 py-2.5 rounded-lg text-sm font-medium transition-all">
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* SLIDE OVER FORM */}
        <div 
            className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 backdrop-blur-sm
            ${isFormOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
            onClick={closeForm}
        ></div>

        <div className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-[#121212] z-50 shadow-2xl transform transition-transform duration-300 ease-out border-l dark:border-gray-800
            ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            
            <div className="h-full flex flex-col">
                <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#121212]">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {editingId ? "Edit Product" : "New Product"}
                    </h2>
                    <button onClick={closeForm} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition text-gray-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                        <input 
                            type="text" required
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea 
                            rows={4}
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                            <input 
                                type="number" step="0.01" required
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stock</label>
                            <input 
                                type="number" required
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                        <input 
                            type="text" placeholder="https://..."
                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                            value={formData.image_url}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        />
                         {formData.image_url && (
                            <div className="mt-4 h-40 w-full rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-[#121212] flex gap-3">
                    <button onClick={closeForm} className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition transform active:scale-95">
                        {editingId ? "Save Changes" : "Create Product"}
                    </button>
                </div>
            </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}