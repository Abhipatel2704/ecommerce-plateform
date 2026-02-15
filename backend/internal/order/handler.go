package order

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{Service: service}
}

func (h *Handler) PlaceOrder(w http.ResponseWriter, r *http.Request) {
	// Get User ID from Context (Auth Middleware)
	userID := r.Context().Value("user_id").(int)

	var req OrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := h.Service.CreateOrder(userID, req); err != nil {
		// If stock is low, this error will be sent to frontend
		http.Error(w, err.Error(), http.StatusBadRequest) 
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Order placed successfully"})
}