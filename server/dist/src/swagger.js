"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    info: {
        title: "API Documentation",
        version: "1.0.0",
    },
};
const options = {
    swaggerDefinition,
    apis: ["./src/controllers/*.ts"], // Rutas de los archivos donde están definidas las rutas de tu API
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
