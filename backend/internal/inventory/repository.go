package inventory

import (
	"database/sql"
	"errors"
)

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

// Create a new product
func (r *Repository) CreateProduct(p *Product) (int, error) {
	sqlStatement := `
	INSERT INTO products (seller_id, name, description, price, stock_quantity, image_url)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id`
	
	var id int
	// logic to handle empty image url if needed, but DB handles default empty string
	err := r.DB.QueryRow(sqlStatement, p.SellerID, p.Name, p.Description, p.Price, p.Stock, p.ImageURL).Scan(&id)
	return id, err
}

// Get all products (FIXED: No placeholders)
func (r *Repository) GetAllProducts() ([]Product, error) {
	// We select all fields including image_url
	rows, err := r.DB.Query("SELECT id, seller_id, name, description, price, stock_quantity, image_url FROM products")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		// We must scan into the ImageURL field too
		if err := rows.Scan(&p.ID, &p.SellerID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.ImageURL); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}

// Get a single product by ID (Used for ownership checks)
func (r *Repository) GetProductByID(id int) (*Product, error) {
	p := &Product{}
	query := `SELECT id, seller_id, name, description, price, stock_quantity, image_url FROM products WHERE id=$1`
	err := r.DB.QueryRow(query, id).Scan(&p.ID, &p.SellerID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.ImageURL)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("product not found")
		}
		return nil, err
	}
	return p, nil
}

// Update a product
func (r *Repository) UpdateProduct(p *Product) error {
	query := `
	UPDATE products 
	SET name=$1, description=$2, price=$3, stock_quantity=$4, image_url=$5
	WHERE id=$6`
	
	_, err := r.DB.Exec(query, p.Name, p.Description, p.Price, p.Stock, p.ImageURL, p.ID)
	return err
}

// Delete a product
func (r *Repository) DeleteProduct(id int) error {
	_, err := r.DB.Exec("DELETE FROM products WHERE id=$1", id)
	return err
}