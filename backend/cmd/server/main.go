package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	// Import our local packages
	"ecommerce-backend/internal/auth"
	"ecommerce-backend/internal/inventory"
	"ecommerce-backend/internal/order"
	"ecommerce-backend/pkg/database"
)

func main() {
	// 1. Initialize Database
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Could not connect to database:", err)
	}
	defer db.Close()

	// 2. Initialize Repositories, Services, and Handlers (Dependency Injection)
	
	// --- Inventory Domain ---
	inventoryRepo := inventory.NewRepository(db)
	inventoryService := inventory.NewService(inventoryRepo)
	inventoryHandler := inventory.NewHandler(inventoryService)

	// --- Auth Domain ---
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	// --- Order Domain ---
	orderService := order.NewService(db)
	orderHandler := order.NewHandler(orderService)

	// 3. Setup Router
	r := mux.NewRouter()

	// 4. Define Routes

	// Public Routes
	r.HandleFunc("/api/products", inventoryHandler.GetProducts).Methods("GET")
	r.HandleFunc("/api/register", authHandler.Register).Methods("POST")
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Server is healthy"))
	}).Methods("GET")

	// Protected Routes (Middleware Applied)
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(auth.AuthMiddleware)

	// Seller Routes
	protected.HandleFunc("/products", inventoryHandler.CreateProduct).Methods("POST")
	protected.HandleFunc("/products/{id}", inventoryHandler.UpdateProduct).Methods("PUT")
	protected.HandleFunc("/products/{id}", inventoryHandler.DeleteProduct).Methods("DELETE")
	
	// Customer Routes
	protected.HandleFunc("/orders", orderHandler.PlaceOrder).Methods("POST")

	// 5. Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := c.Handler(r)

	// 6. Start Server
	log.Println("🚀 Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}