"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { User } from "@/types";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();

  // 1. Run Hooks FIRST (Always at the top)
  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  // 2. Logic to check if we should hide navbar
  const hideNavbarRoutes = ["/login", "/register"];
  
  // 3. Return Null LAST (After all hooks have run)
  if (hideNavbarRoutes.includes(pathname)) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Go<span className="text-gray-900 dark:text-white">Store</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition">
              Shop
            </Link>
            
            <Link href="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600">
                🛒 Cart
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {cartCount}
                    </span>
                )}
            </Link>

            {user ? (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Hi, <b>{user.name}</b>
                </span>
                
                {user.role === 'seller' && (
                   <Link href="/seller" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
                     Dashboard
                   </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 shadow-md transition hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 dark:text-gray-300 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}