package order

type OrderRequest struct {
	Items []OrderItemRequest `json:"items"`
}

type OrderItemRequest struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}

type Order struct {
	ID     int     `json:"id"`
	UserID int     `json:"user_id"`
	Total  float64 `json:"total"`
	Status string  `json:"status"`
}