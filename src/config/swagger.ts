import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Chat App API",
    version: "1.0.0",
    description: "Real-time chat application backend API documentation",
    contact: {
      name: "API Support",
      email: "support@chatapp.com",
    },
  },
  servers: [
    {
      url: "http://localhost:8090/api/v1",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: 'Enter JWT token (without "Bearer " prefix)',
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Error message",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2025-01-21T12:30:00.000Z",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "68cffd6f97444fb58acac6e5" },
          username: { type: "string", example: "johndoe" },
          email: { type: "string", example: "john@example.com" },
          name: { type: "string", example: "John Doe" },
          avatar: { type: "string", example: "https://example.com/avatar.jpg" },
          bio: { type: "string", example: "Hello, I'm John!" },
          isOnline: { type: "boolean", example: true },
          isActive: { type: "boolean", example: true },
          lastSeen: {
            type: "string",
            format: "date-time",
            example: "2025-09-21T13:28:15.063Z",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-09-21T13:28:15.082Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-09-21T13:29:53.104Z",
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/**/*.ts"], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
