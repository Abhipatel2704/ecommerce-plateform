package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // Postgres driver
)

func Connect() (*sql.DB, error) {
	// Update these with your actual credentials
	const (
		host     = "localhost"
		port     = 5432
		user     = "postgres"
		password = "ljeng" // CHANGE THIS
		dbname   = "ecommerce_db"
	)

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	log.Println("✅ Connected to the database successfully")
	return db, nil
}