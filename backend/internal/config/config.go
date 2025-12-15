package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	CORS     CORSConfig
	Logging  LoggingConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Host    string
	Port    int
	GinMode string
}

// DatabaseConfig holds database-related configuration
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
	MaxConns int
	MinConns int
}

// CORSConfig holds CORS-related configuration
type CORSConfig struct {
	AllowOrigins []string
}

// LoggingConfig holds logging-related configuration
func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.Name, d.SSLMode)
}

// LoggingConfig holds logging-related configuration
type LoggingConfig struct {
	Level  string
	Format string // json, console
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Try to load .env file, but don't fail if it doesn't exist
	_ = godotenv.Load()

	cfg := &Config{
		Server: ServerConfig{
			Host:    getEnv("SERVER_HOST", "0.0.0.0"),
			Port:    getEnvAsInt("SERVER_PORT", 8080),
			GinMode: getEnv("GIN_MODE", "release"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "policyhub"),
			Password: getEnv("DB_PASSWORD", "policyhub"),
			Name:     getEnv("DB_NAME", "policyhub"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
			MaxConns: getEnvAsInt("DB_MAX_CONNS", 25),
			MinConns: getEnvAsInt("DB_MIN_CONNS", 5),
		},
		CORS: CORSConfig{
			AllowOrigins: parseAllowOrigins(getEnv("CORS_ALLOWED_ORIGINS", "*")),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "debug"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("configuration validation failed: %w", err)
	}

	return cfg, nil
}

// Validate validates the configuration values
func (c *Config) Validate() error {
	// Validate server configuration
	if c.Server.Port < 1 || c.Server.Port > 65535 {
		return fmt.Errorf("invalid server port: %d (must be between 1 and 65535)", c.Server.Port)
	}

	validGinModes := map[string]bool{"debug": true, "release": true, "test": true}
	if !validGinModes[c.Server.GinMode] {
		return fmt.Errorf("invalid gin mode: %s (must be debug, release, or test)", c.Server.GinMode)
	}

	// Validate database configuration
	if c.Database.Host == "" {
		return fmt.Errorf("database host is required")
	}
	if c.Database.Port < 1 || c.Database.Port > 65535 {
		return fmt.Errorf("invalid database port: %d (must be between 1 and 65535)", c.Database.Port)
	}
	if c.Database.User == "" {
		return fmt.Errorf("database user is required")
	}
	if c.Database.Name == "" {
		return fmt.Errorf("database name is required")
	}
	validSSLModes := map[string]bool{"disable": true, "require": true, "verify-ca": true, "verify-full": true}
	if !validSSLModes[c.Database.SSLMode] {
		return fmt.Errorf("invalid SSL mode: %s", c.Database.SSLMode)
	}
	if c.Database.MaxConns < 1 {
		return fmt.Errorf("invalid max connections: %d (must be at least 1)", c.Database.MaxConns)
	}
	if c.Database.MinConns < 0 {
		return fmt.Errorf("invalid min connections: %d (must be non-negative)", c.Database.MinConns)
	}
	if c.Database.MinConns > c.Database.MaxConns {
		return fmt.Errorf("min connections (%d) cannot be greater than max connections (%d)", c.Database.MinConns, c.Database.MaxConns)
	}

	// Validate logging configuration
	validLogLevels := map[string]bool{"debug": true, "info": true, "warn": true, "error": true}
	if !validLogLevels[c.Logging.Level] {
		return fmt.Errorf("invalid log level: %s (must be debug, info, warn, or error)", c.Logging.Level)
	}

	validLogFormats := map[string]bool{"json": true, "console": true}
	if !validLogFormats[c.Logging.Format] {
		return fmt.Errorf("invalid log format: %s (must be json or console)", c.Logging.Format)
	}

	return nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getEnvAsInt gets an environment variable as an integer or returns a default value
func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}

// parseAllowOrigins parses CORS allowed origins from environment variable
func parseAllowOrigins(originsStr string) []string {
	if originsStr == "" || originsStr == "*" {
		return []string{"*"} // Allow all origins by default
	}

	// Split by comma and trim spaces
	origins := strings.Split(originsStr, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSpace(origin)
	}

	return origins
}
