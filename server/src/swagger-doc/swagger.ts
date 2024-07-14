import { SwaggerOptions } from "swagger-ui-express";

const swaggerOptions: SwaggerOptions = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
  },
  components: {
    schemas: {
      ResponseModel: {
        type: "object",
        properties: {
          code: {
            type: "number",
          },
          msg: {
            type: "string",
          },
          timestamp: {
            type: "number",
          },
        },
      },
      RegistrationUser: {
        type: "object",
        properties: {
          firstName: {
            type: "string",
          },
          lastName: {
            type: "string",
          },
          email: {
            type: "string",
          },
          password: {
            type: "string",
          },
        },
      },
      Account: {
        type: "object",
        properties: {
          _id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          type: {
            type: "string",
          },
          symbol: {
            type: "string",
          },
          user_id: {
            type: "string",
          },
          favorite: {
            type: "boolean",
          },
          created: {
            type: "string",
            format: "date-time",
          },
          amount: {
            type: "number",
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegistrationUser",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Successfully registered",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  schema: {
                    $ref: "#/components/schemas/ResponseModel",
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login to the application",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: {
                    type: "string",
                  },
                  password: {
                    type: "string",
                  },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/auth/user": {
      get: {
        summary: "Get user information",
        tags: ["Authentication"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "User information retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/account": {
      get: {
        summary: "Get user accounts",
        tags: ["Accounts"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Accounts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Account",
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
      post: {
        summary: "Create a new account",
        tags: ["Accounts"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    example: "Test",
                  },
                  symbol: {
                    type: "string",
                    enum: ["ARS", "USD", "EUR"],
                    example: "ARS",
                  },
                  type: {
                    type: "string",
                    enum: [
                      "digital wallet",
                      "savings account",
                      "investment account",
                    ],
                    example: "digital wallet",
                  },
                },
                required: ["name", "symbol", "type"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Account",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "400": {
            description: "Bad request",
          },
        },
      },
    },
    "/account/fav/{id}": {
      patch: {
        summary: "Set account as favorite",
        tags: ["Accounts"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the account to set as favorite",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  favorite: {
                    type: "boolean",
                  },
                },
                required: ["favorite"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Account set as favorite successfully",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Account not found",
          },
        },
      },
    },
    "/account/{id}": {
      get: {
        summary: "Get account by ID",
        tags: ["Accounts"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the account to retrieve",
          },
        ],
        responses: {
          "200": {
            description: "Account retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Account",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Account not found",
          },
        },
      },
    },
    "/account/{id}/balance": {
      get: {
        summary: "Get account balance by ID",
        tags: ["Accounts"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the account to retrieve balance",
          },
          {
            name: "from",
            in: "query",
            required: true,
            schema: {
              type: "string",
              format: "date-time",
            },
            description:
              "Start date-time to filter transactions (ISO 8601 format)",
          },
          {
            name: "to",
            in: "query",
            required: false,
            schema: {
              type: "string",
              format: "date-time",
            },
            description:
              "End date-time to filter transactions (ISO 8601 format)",
          },
        ],
        responses: {
          "200": {
            description: "Account balance retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "number",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Account not found",
          },
        },
      },
    },
    "/account/{id}/transactions": {
      get: {
        summary: "Get paginated transactions by account ID",
        tags: ["Accounts"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the account to retrieve transactions",
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 1,
            },
            description: "Page number for pagination",
          },
          {
            name: "pageSize",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 10,
            },
            description: "Number of items per page",
          },
          {
            name: "description",
            in: "query",
            required: false,
            schema: {
              type: "string",
            },
            description: "Filter by transaction description",
          },
          {
            name: "category",
            in: "query",
            required: false,
            schema: {
              type: "string",
            },
            description: "Filter by transaction category",
          },
          {
            name: "year",
            in: "query",
            required: false,
            schema: {
              type: "integer",
            },
            description: "Filter transactions by year",
          },
          {
            name: "month",
            in: "query",
            required: false,
            schema: {
              type: "integer",
            },
            description: "Filter transactions by month",
          },
        ],
        responses: {
          "200": {
            description: "Transactions retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Transaction",
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Account not found",
          },
          "400": {
            description: "Bad request - Invalid parameters",
          },
        },
      },
    },
    "/account/{id}/categories": {
      get: {
        summary: "Get account amounts by category",
        tags: ["Accounts"],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the account to retrieve category amounts",
          },
          {
            name: "year",
            in: "query",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Year to filter category amounts",
          },
          {
            name: "month",
            in: "query",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Month to filter category amounts",
          },
        ],
        responses: {
          "200": {
            description: "Category amounts retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: {
                      type: "integer",
                    },
                    month: {
                      type: "integer",
                    },
                    groups: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: {
                            type: "string",
                          },
                          amount: {
                            type: "number",
                          },
                          scope: {
                            type: "object",
                            properties: {
                              _id: {
                                type: "string",
                              },
                              icon: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Account not found",
          },
          "400": {
            description: "Bad request - Invalid parameters",
          },
          "500": {
            description: "Internal server error",
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export default swaggerOptions;
