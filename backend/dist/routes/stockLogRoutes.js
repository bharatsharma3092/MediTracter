"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockLogRoutes = void 0;
const express_1 = require("express");
const stockLogController_1 = require("../controllers/stockLogController");
exports.stockLogRoutes = (0, express_1.Router)();
exports.stockLogRoutes.get('/:itemId', stockLogController_1.stockLogController.list);
exports.stockLogRoutes.post('/', stockLogController_1.stockLogController.create);
exports.stockLogRoutes.delete('/:id', stockLogController_1.stockLogController.remove);
