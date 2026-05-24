"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
exports.userRoutes = (0, express_1.Router)();
exports.userRoutes.get('/me', userController_1.userController.getMe);
exports.userRoutes.put('/settings', userController_1.userController.updateSettings);
exports.userRoutes.post('/push-subscribe', userController_1.userController.subscribePush);
