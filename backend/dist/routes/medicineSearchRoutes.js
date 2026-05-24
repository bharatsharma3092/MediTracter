"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicineSearchRoutes = void 0;
const express_1 = require("express");
const medicineSearchController_1 = require("../controllers/medicineSearchController");
exports.medicineSearchRoutes = (0, express_1.Router)();
exports.medicineSearchRoutes.get('/search', medicineSearchController_1.medicineSearchController.search);
