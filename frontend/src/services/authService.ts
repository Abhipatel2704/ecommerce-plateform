import { AuthResponse, User } from "@/types";

const API_URL = "http://localhost:8080/api";

export const authService = {
  
  // Register (Returns void on success, or throws error)
  async register(name: string, email: string, pass: string, role: string): Promise<void> {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pass, role }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Registration failed");
    }
  },

  // Login (Returns AuthResponse)
  async login(email: string, pass: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });

    if (!res.ok) throw new Error("Invalid credentials");

    const data: AuthResponse = await res.json();
    
    // Save to LocalStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return data;
  },

  // Logout
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Get Current User (Returns User or null)
  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr) as User;
    }
    return null;
  }
};