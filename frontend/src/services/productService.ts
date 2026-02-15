import { Product } from "@/types";

const API_URL = "http://localhost:8080/api";

export const productService = {
  
  async createProduct(product: Omit<Product, "id" | "seller_id">): Promise<Product> {
    // 1. Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("❌ No token found in LocalStorage!");
        throw new Error("You are not logged in.");
    }

    console.log("📤 Sending Token:", token.substring(0, 10) + "..."); // Print first 10 chars for debugging

    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(product),
    });

    if (!res.ok) {
        const errorText = await res.text(); // Get the real error from Go
        console.error("❌ Backend Error:", errorText);
        throw new Error(errorText || "Failed to create product");
    }

    return res.json();
  },

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: number): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
  }
};