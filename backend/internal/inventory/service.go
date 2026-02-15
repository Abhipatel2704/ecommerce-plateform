package inventory

import "errors"

type Service struct {
	Repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{Repo: repo}
}

func (s *Service) AddProduct(p *Product) error {
	// Business Logic: Validation
	if p.Price <= 0 {
		return errors.New("price must be greater than zero")
	}
	if p.Stock < 0 {
		return errors.New("stock cannot be negative")
	}
	
	// If validation passes, call the repository
	id, err := s.Repo.CreateProduct(p)
	if err != nil {
		return err
	}
	p.ID = id
	return nil
}

func (s *Service) ListProducts() ([]Product, error) {
	return s.Repo.GetAllProducts()
}

func (s *Service) UpdateProduct(userID int, p *Product) error {
	// 1. Fetch existing product
	existing, err := s.Repo.GetProductByID(p.ID)
	if err != nil {
		return errors.New("product not found")
	}

	// 2. Check ownership
	if existing.SellerID != userID {
		return errors.New("unauthorized: you do not own this product")
	}

	// 3. Update fields
	return s.Repo.UpdateProduct(p)
}

func (s *Service) DeleteProduct(userID, productID int) error {
	existing, err := s.Repo.GetProductByID(productID)
	if err != nil {
		return errors.New("product not found")
	}

	if existing.SellerID != userID {
		return errors.New("unauthorized")
	}

	return s.Repo.DeleteProduct(productID)
}