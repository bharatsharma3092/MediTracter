"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const zod_1 = require("zod");
const memoryStore_1 = require("../services/memoryStore");
const responseHelper_1 = require("../utils/responseHelper");
const settingsSchema = zod_1.z.object({
    coverMonths: zod_1.z.coerce.number().min(1).optional(),
    consumptionWindow: zod_1.z.coerce.number().refine((value) => [30, 60, 90].includes(value)).optional(),
    leadTimeDays: zod_1.z.coerce.number().min(0).optional(),
    bufferDays: zod_1.z.coerce.number().min(0).optional(),
    pushEnabled: zod_1.z.boolean().optional(),
    emailEnabled: zod_1.z.boolean().optional()
});
exports.userController = {
    getMe(req, res) {
        return (0, responseHelper_1.success)(res, { user: req.user, settings: memoryStore_1.settings });
    },
    updateSettings(req, res) {
        Object.assign(memoryStore_1.settings, settingsSchema.parse(req.body));
        return (0, responseHelper_1.success)(res, memoryStore_1.settings, 'Settings updated');
    },
    subscribePush(_req, res) {
        return (0, responseHelper_1.success)(res, { subscribed: false, mode: 'local-demo' });
    }
};
