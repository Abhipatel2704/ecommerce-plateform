package auth

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Middleware to protect routes
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Get Token from Header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			log.Println("❌ Auth Middleware: Missing Authorization Header")
			http.Error(w, "Authorization header missing", http.StatusUnauthorized)
			return
		}

		// 2. Format check: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Println("❌ Auth Middleware: Invalid Header Format. Received:", authHeader)
			http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}
		tokenString := parts[1]

		// 3. Parse & Validate Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtKey, nil // Must match the key in service.go
		})

		if err != nil || !token.Valid {
			log.Printf("❌ Auth Middleware: Token Invalid. Error: %v\n", err)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// 4. Extract Claims (User ID & Role)
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// SAFELY extract user_id
			// JWT numbers are often float64, so we cast safely
			userIDFloat, ok := claims["user_id"].(float64)
			if !ok {
				log.Println("❌ Auth Middleware: user_id claim missing or not a number")
				http.Error(w, "Invalid token claims", http.StatusUnauthorized)
				return
			}

			role, ok := claims["role"].(string)
			if !ok {
				role = "customer" // Default fallback
			}

			// Add to context
			ctx := context.WithValue(r.Context(), "user_id", int(userIDFloat))
			ctx = context.WithValue(ctx, "role", role)
			
			// Log success (Optional, helpful for debugging)
			log.Printf("✅ Auth Success: User ID %d (%s)\n", int(userIDFloat), role)

			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		}
	})
}