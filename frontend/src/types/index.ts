// src/types/index.ts

// This matches the User struct in Go
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
}

// This matches the AuthResponse in Go
export interface AuthResponse {
  token: string;
  user: User;
}

// This matches the Product struct in Go
export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}