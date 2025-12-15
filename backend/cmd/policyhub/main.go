package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/wso2/policyhub/internal/config"
	"github.com/wso2/policyhub/internal/db"
	httpPkg "github.com/wso2/policyhub/internal/http"
	"github.com/wso2/policyhub/internal/logging"
	"github.com/wso2/policyhub/internal/policy"
	"github.com/wso2/policyhub/internal/sync"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	logger, err := logging.NewLogger(cfg.Logging.Level, cfg.Logging.Format)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Close()

	logger.Info("Starting Policy Hub Backend",
		zap.String("version", "1.0.0"),
		zap.String("env", cfg.Server.GinMode),
	)

	// Initialize database
	database, err := db.NewDB(&cfg.Database, logger)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer database.Close()

	// Create database schema
	if err := db.CreateSchema(database.Pool, logger.Logger); err != nil {
		logger.Fatal("Failed to create database schema", zap.Error(err))
	}

	// Initialize repository
	policyRepo := policy.NewSQLCRepository(database)

	// Initialize services
	policyService := policy.NewService(policyRepo, logger)
	syncService := sync.NewService(policyService, logger)

	// Setup HTTP router
	router := httpPkg.SetupRouter(cfg, policyService, syncService, logger)

	// Create HTTP server
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("HTTP server starting", zap.String("address", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	logger.Info("Policy Hub Backend is ready to handle requests")

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Graceful shutdown with 5 second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited gracefully")
}
