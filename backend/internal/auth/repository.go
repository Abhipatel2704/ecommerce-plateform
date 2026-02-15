package auth

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

func (r *Repository) CreateUser(u *User) error {
	query := `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`
	return r.DB.QueryRow(query, u.Name, u.Email, u.Password, u.Role).Scan(&u.ID)
}

func (r *Repository) GetUserByEmail(email string) (*User, error) {
	u := &User{}
	query := `SELECT id, name, email, password_hash, role FROM users WHERE email = $1`
	err := r.DB.QueryRow(query, email).Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role) // Scanning hash into Password field
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return u, nil
}