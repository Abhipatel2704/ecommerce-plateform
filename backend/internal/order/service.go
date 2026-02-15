package order

import (
	"database/sql"
	"fmt"
)

type Service struct {
	DB *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{DB: db}
}

func (s *Service) CreateOrder(userID int, req OrderRequest) error {
	// 1. Start a Database Transaction
	tx, err := s.DB.Begin()
	if err != nil {
		return err
	}
	// Defer a Rollback in case of panic or error (safety net)
	defer tx.Rollback()

	// 2. Create the Order Entry (Placeholder total for now)
	var orderID int
	// Initialize with 0.0 total
	err = tx.QueryRow(`INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id`, userID, 0.0).Scan(&orderID)
	if err != nil {
		return err
	}

	totalAmount := 0.0

	// 3. Process Each Item
	for _, item := range req.Items {
		// A. Check Stock & Get Price (Locking the row with FOR UPDATE)
		var price float64
		var currentStock int
		
		err := tx.QueryRow(`SELECT price, stock_quantity FROM products WHERE id = $1 FOR UPDATE`, item.ProductID).Scan(&price, &currentStock)
		if err != nil {
			return fmt.Errorf("product %d not found", item.ProductID)
		}

		// B. Validate Stock
		if currentStock < item.Quantity {
			return fmt.Errorf("insufficient stock for product ID %d (Only %d left)", item.ProductID, currentStock)
		}

		// C. Deduct Stock (This is the Magic Step!)
		_, err = tx.Exec(`UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`, item.Quantity, item.ProductID)
		if err != nil {
			return err
		}

		// D. Add to Order Items Table
		_, err = tx.Exec(`INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)`, 
			orderID, item.ProductID, item.Quantity, price)
		if err != nil {
			return err
		}

		totalAmount += price * float64(item.Quantity)
	}

	// 4. Update the Order Total
	_, err = tx.Exec(`UPDATE orders SET total_amount = $1 WHERE id = $2`, totalAmount, orderID)
	if err != nil {
		return err
	}

	// 5. Commit the Transaction (Save everything permanently)
	return tx.Commit()
}