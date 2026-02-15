package inventory

// Product represents a sellable item in the store
type Product struct {
	ID          int     `json:"id"`
	SellerID    int     `json:"seller_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	ImageURL    string  `json:"image_url"` // New Field
}