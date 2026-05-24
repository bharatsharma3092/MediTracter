"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const responseHelper_1 = require("../utils/responseHelper");
function notFound(_req, res) {
    return (0, responseHelper_1.failure)(res, 'Route not found', 404);
}
function errorHandler(error, _req, res, _next) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return (0, responseHelper_1.failure)(res, message, 500);
}
