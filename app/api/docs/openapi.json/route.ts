import { NextResponse } from 'next/server';

const openApiSpec = {
  "openapi": "3.0.3",
  "info": {
    "title": "Shoplytics API",
    "description": "Powerful e-commerce analytics and insights platform for Shopify stores. Get comprehensive data on sales, customers, products, and performance metrics.",
    "version": "2.0.0",
    "contact": {
      "name": "Shoplytics Support",
      "email": "api@shoplytics.com",
      "url": "https://shoplytics.com/support"
    },
    "license": {
      "name": "MIT",
      "url": "https://opensource.org/licenses/MIT"
    },
    "x-logo": {
      "url": "/api/logo.png",
      "altText": "Shoplytics API"
    }
  },
  "servers": [
    {
      "url": "https://api.shoplytics.com/v2",
      "description": "Production server"
    },
    {
      "url": "https://staging-api.shoplytics.com/v2",
      "description": "Staging server"
    },
    {
      "url": "http://localhost:3000/api",
      "description": "Local development server"
    }
  ],
  "security": [
    {
      "ApiKeyAuth": []
    },
    {
      "BearerAuth": []
    }
  ],
  "paths": {
    "/health": {
      "get": {
        "tags": ["System"],
        "summary": "Health check endpoint",
        "description": "Returns the current health status of the API and its dependencies",
        "operationId": "getHealthStatus",
        "responses": {
          "200": {
            "description": "System is healthy",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HealthResponse"
                },
                "examples": {
                  "healthy": {
                    "summary": "Healthy system",
                    "value": {
                      "status": "healthy",
                      "timestamp": "2024-01-15T10:30:00Z",
                      "uptime": 86400,
                      "version": "2.0.0",
                      "environment": "production",
                      "checks": {
                        "api": {
                          "status": "pass",
                          "responseTime": 45,
                          "message": "API is responsive"
                        },
                        "database": {
                          "status": "pass",
                          "responseTime": 12,
                          "message": "Database connection successful"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "503": {
            "description": "System is unhealthy",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HealthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/analytics/revenue": {
      "get": {
        "tags": ["Analytics"],
        "summary": "Get revenue analytics",
        "description": "Retrieve detailed revenue analytics for your Shopify store, including total revenue, growth rates, and trends over time.",
        "operationId": "getRevenueAnalytics",
        "parameters": [
          {
            "name": "startDate",
            "in": "query",
            "required": true,
            "description": "Start date for analytics period (ISO 8601 format)",
            "schema": {
              "type": "string",
              "format": "date",
              "example": "2024-01-01"
            }
          },
          {
            "name": "endDate",
            "in": "query",
            "required": true,
            "description": "End date for analytics period (ISO 8601 format)",
            "schema": {
              "type": "string",
              "format": "date",
              "example": "2024-01-31"
            }
          },
          {
            "name": "groupBy",
            "in": "query",
            "description": "Group results by time period",
            "schema": {
              "type": "string",
              "enum": ["hour", "day", "week", "month"],
              "default": "day"
            }
          },
          {
            "name": "currency",
            "in": "query",
            "description": "Currency code for revenue values",
            "schema": {
              "type": "string",
              "example": "USD",
              "default": "USD"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Revenue analytics data",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RevenueAnalytics"
                },
                "examples": {
                  "monthly_revenue": {
                    "summary": "Monthly revenue data",
                    "value": {
                      "period": {
                        "startDate": "2024-01-01",
                        "endDate": "2024-01-31",
                        "groupBy": "day"
                      },
                      "totalRevenue": 125430.50,
                      "previousPeriodRevenue": 98750.25,
                      "growthRate": 27.02,
                      "currency": "USD",
                      "data": [
                        {
                          "date": "2024-01-01",
                          "revenue": 4250.75,
                          "orders": 28,
                          "averageOrderValue": 151.81
                        },
                        {
                          "date": "2024-01-02",
                          "revenue": 3890.25,
                          "orders": 31,
                          "averageOrderValue": 125.49
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "429": {
            "$ref": "#/components/responses/RateLimited"
          }
        }
      }
    },
    "/analytics/customers": {
      "get": {
        "tags": ["Analytics"],
        "summary": "Get customer analytics",
        "description": "Retrieve comprehensive customer analytics including acquisition, retention, lifetime value, and segmentation data.",
        "operationId": "getCustomerAnalytics",
        "parameters": [
          {
            "name": "startDate",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "endDate",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "segment",
            "in": "query",
            "description": "Customer segment filter",
            "schema": {
              "type": "string",
              "enum": ["new", "returning", "vip", "at_risk"]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Customer analytics data",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CustomerAnalytics"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          }
        }
      }
    },
    "/analytics/products": {
      "get": {
        "tags": ["Analytics"],
        "summary": "Get product performance analytics",
        "description": "Analyze product performance with detailed metrics on sales, views, conversion rates, and inventory data.",
        "operationId": "getProductAnalytics",
        "parameters": [
          {
            "name": "startDate",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "endDate",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "sortBy",
            "in": "query",
            "description": "Sort products by metric",
            "schema": {
              "type": "string",
              "enum": ["revenue", "units_sold", "views", "conversion_rate"],
              "default": "revenue"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "Number of products to return",
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100,
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Product analytics data",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProductAnalytics"
                }
              }
            }
          }
        }
      }
    },
    "/webhooks/shopify": {
      "post": {
        "tags": ["Webhooks"],
        "summary": "Shopify webhook endpoint",
        "description": "Receives webhook notifications from Shopify for real-time data synchronization",
        "operationId": "handleShopifyWebhook",
        "parameters": [
          {
            "name": "X-Shopify-Topic",
            "in": "header",
            "required": true,
            "description": "The webhook topic",
            "schema": {
              "type": "string",
              "example": "orders/create"
            }
          },
          {
            "name": "X-Shopify-Hmac-Sha256",
            "in": "header",
            "required": true,
            "description": "HMAC-SHA256 signature for webhook verification",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "X-Shopify-Shop-Domain",
            "in": "header",
            "required": true,
            "description": "The shop domain",
            "schema": {
              "type": "string",
              "example": "example-shop.myshopify.com"
            }
          }
        ],
        "requestBody": {
          "description": "Webhook payload from Shopify",
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "description": "Shopify webhook payload (varies by topic)"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Webhook processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "topic": {
                      "type": "string",
                      "example": "orders/create"
                    },
                    "processed": {
                      "type": "boolean",
                      "example": true
                    },
                    "timestamp": {
                      "type": "string",
                      "format": "date-time"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "description": "Invalid webhook signature",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Error"
                }
              }
            }
          }
        }
      },
      "get": {
        "tags": ["Webhooks"],
        "summary": "Get webhook status",
        "description": "Check the health status of the webhook endpoint",
        "operationId": "getWebhookStatus",
        "responses": {
          "200": {
            "description": "Webhook endpoint status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "string",
                      "example": "healthy"
                    },
                    "endpoint": {
                      "type": "string",
                      "example": "shopify-webhooks"
                    },
                    "supportedTopics": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "example": ["orders/create", "orders/updated", "products/create"]
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key",
        "description": "API key for authentication. Get your API key from the Shoplytics dashboard."
      },
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT token for user authentication"
      }
    },
    "schemas": {
      "HealthResponse": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": ["healthy", "degraded", "unhealthy"],
            "description": "Overall system health status"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time",
            "description": "Timestamp of the health check"
          },
          "uptime": {
            "type": "number",
            "description": "System uptime in seconds"
          },
          "version": {
            "type": "string",
            "description": "API version"
          },
          "environment": {
            "type": "string",
            "description": "Environment name"
          },
          "checks": {
            "type": "object",
            "description": "Individual service health checks",
            "additionalProperties": {
              "$ref": "#/components/schemas/HealthCheck"
            }
          }
        },
        "required": ["status", "timestamp", "uptime", "version"]
      },
      "HealthCheck": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": ["pass", "fail", "warn"]
          },
          "responseTime": {
            "type": "number",
            "description": "Response time in milliseconds"
          },
          "message": {
            "type": "string",
            "description": "Health check message"
          }
        }
      },
      "RevenueAnalytics": {
        "type": "object",
        "properties": {
          "period": {
            "$ref": "#/components/schemas/AnalyticsPeriod"
          },
          "totalRevenue": {
            "type": "number",
            "format": "decimal",
            "description": "Total revenue for the period"
          },
          "previousPeriodRevenue": {
            "type": "number",
            "format": "decimal",
            "description": "Revenue for the previous period"
          },
          "growthRate": {
            "type": "number",
            "format": "decimal",
            "description": "Growth rate percentage"
          },
          "currency": {
            "type": "string",
            "description": "Currency code"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/RevenueDataPoint"
            }
          }
        }
      },
      "RevenueDataPoint": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "format": "date",
            "description": "Date of the data point"
          },
          "revenue": {
            "type": "number",
            "format": "decimal",
            "description": "Revenue amount"
          },
          "orders": {
            "type": "integer",
            "description": "Number of orders"
          },
          "averageOrderValue": {
            "type": "number",
            "format": "decimal",
            "description": "Average order value"
          }
        }
      },
      "CustomerAnalytics": {
        "type": "object",
        "properties": {
          "period": {
            "$ref": "#/components/schemas/AnalyticsPeriod"
          },
          "totalCustomers": {
            "type": "integer",
            "description": "Total number of customers"
          },
          "newCustomers": {
            "type": "integer",
            "description": "Number of new customers"
          },
          "returningCustomers": {
            "type": "integer",
            "description": "Number of returning customers"
          },
          "customerLifetimeValue": {
            "type": "number",
            "format": "decimal",
            "description": "Average customer lifetime value"
          },
          "retentionRate": {
            "type": "number",
            "format": "decimal",
            "description": "Customer retention rate percentage"
          },
          "segments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CustomerSegment"
            }
          }
        }
      },
      "CustomerSegment": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Segment name"
          },
          "customerCount": {
            "type": "integer",
            "description": "Number of customers in segment"
          },
          "percentage": {
            "type": "number",
            "format": "decimal",
            "description": "Percentage of total customers"
          },
          "averageOrderValue": {
            "type": "number",
            "format": "decimal",
            "description": "Average order value for segment"
          }
        }
      },
      "ProductAnalytics": {
        "type": "object",
        "properties": {
          "period": {
            "$ref": "#/components/schemas/AnalyticsPeriod"
          },
          "totalProducts": {
            "type": "integer",
            "description": "Total number of products"
          },
          "products": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProductPerformance"
            }
          }
        }
      },
      "ProductPerformance": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Product ID"
          },
          "title": {
            "type": "string",
            "description": "Product title"
          },
          "revenue": {
            "type": "number",
            "format": "decimal",
            "description": "Revenue generated by product"
          },
          "unitsSold": {
            "type": "integer",
            "description": "Number of units sold"
          },
          "views": {
            "type": "integer",
            "description": "Number of product page views"
          },
          "conversionRate": {
            "type": "number",
            "format": "decimal",
            "description": "Conversion rate percentage"
          }
        }
      },
      "AnalyticsPeriod": {
        "type": "object",
        "properties": {
          "startDate": {
            "type": "string",
            "format": "date",
            "description": "Start date of the period"
          },
          "endDate": {
            "type": "string",
            "format": "date",
            "description": "End date of the period"
          },
          "groupBy": {
            "type": "string",
            "enum": ["hour", "day", "week", "month"],
            "description": "Grouping period"
          }
        }
      },
      "Error": {
        "type": "object",
        "properties": {
          "error": {
            "type": "string",
            "description": "Error message"
          },
          "code": {
            "type": "string",
            "description": "Error code"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          },
          "details": {
            "type": "object",
            "description": "Additional error details"
          }
        },
        "required": ["error"]
      }
    },
    "responses": {
      "BadRequest": {
        "description": "Invalid request parameters",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Error"
            },
            "examples": {
              "invalid_date": {
                "summary": "Invalid date format",
                "value": {
                  "error": "Invalid date format",
                  "code": "INVALID_DATE",
                  "timestamp": "2024-01-15T10:30:00Z",
                  "details": {
                    "field": "startDate",
                    "expected": "YYYY-MM-DD"
                  }
                }
              }
            }
          }
        }
      },
      "Unauthorized": {
        "description": "Authentication required",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Error"
            },
            "examples": {
              "missing_api_key": {
                "summary": "Missing API key",
                "value": {
                  "error": "API key required",
                  "code": "MISSING_AUTH",
                  "timestamp": "2024-01-15T10:30:00Z"
                }
              },
              "invalid_api_key": {
                "summary": "Invalid API key",
                "value": {
                  "error": "Invalid API key",
                  "code": "INVALID_AUTH",
                  "timestamp": "2024-01-15T10:30:00Z"
                }
              }
            }
          }
        }
      },
      "RateLimited": {
        "description": "Rate limit exceeded",
        "headers": {
          "X-RateLimit-Limit": {
            "description": "Rate limit ceiling for this endpoint",
            "schema": {
              "type": "integer"
            }
          },
          "X-RateLimit-Remaining": {
            "description": "Number of requests left for the time window",
            "schema": {
              "type": "integer"
            }
          },
          "X-RateLimit-Reset": {
            "description": "Time when the rate limit window resets (Unix timestamp)",
            "schema": {
              "type": "integer"
            }
          }
        },
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Error"
            }
          }
        }
      }
    }
  },
  "tags": [
    {
      "name": "System",
      "description": "System health and status endpoints"
    },
    {
      "name": "Analytics",
      "description": "Analytics and reporting endpoints for revenue, customers, and products"
    },
    {
      "name": "Webhooks",
      "description": "Webhook endpoints for real-time data synchronization"
    }
  ]
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    }
  });
}
