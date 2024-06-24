const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

require("dotenv").config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admin chat service",
      version: "1.0.0",
      description: "Documentation for Admin chat API endpoints",
    },
    servers: [
      {
        url: process.env.serverUrl, // Update with your server URL
        description: "server URL",
      },
    ],
  },
  apis: ["./route/info.js", "./route/notification.js"], // Replace with the path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs),
};
