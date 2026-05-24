"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemController = void 0;
const zod_1 = require("zod");
const fs_1 = require("fs");
const responseHelper_1 = require("../utils/responseHelper");
const alertService_1 = require("../services/alertService");
const reorderService_1 = require("../services/reorderService");
const memoryStore_1 = require("../services/memoryStore");
const itemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    itemType: zod_1.z.enum(['MEDICINE', 'EQUIPMENT']),
    category: zod_1.z.string().min(1),
    unit: zod_1.z.string().min(1),
    currentQty: zod_1.z.coerce.number().min(0),
    minQty: zod_1.z.coerce.number().min(0),
    expiryDate: zod_1.z.string().nullable().optional(),
    dosageSchedule: zod_1.z.string().nullable().optional(),
    prescriptionReq: zod_1.z.boolean().optional(),
    storageCondition: zod_1.z.string().nullable().optional(),
    assignedTo: zod_1.z.string().nullable().optional(),
    notes: zod_1.z.string().nullable().optional(),
    reorderQty: zod_1.z.coerce.number().nullable().optional()
});
exports.itemController = {
    list(req, res) {
        const query = req.query;
        const items = (0, memoryStore_1.getItems)(req.user.id);
        const result = items
            .filter((item) => (query.type ? item.itemType === String(query.type).toUpperCase() : true))
            .filter((item) => (query.search ? item.name.toLowerCase().includes(String(query.search).toLowerCase()) : true));
        return (0, responseHelper_1.success)(res, result);
    },
    create(req, res) {
        const input = itemSchema.parse(req.body);
        const now = new Date().toISOString();
        const item = {
            id: (0, memoryStore_1.id)('item'),
            userId: req.user.id,
            name: input.name,
            itemType: input.itemType,
            category: input.category,
            unit: input.unit,
            currentQty: input.currentQty,
            minQty: input.minQty,
            reorderQty: input.reorderQty ?? null,
            expiryDate: input.expiryDate ?? null,
            dosageSchedule: input.dosageSchedule ?? null,
            prescriptionReq: input.prescriptionReq ?? false,
            storageCondition: input.storageCondition ?? null,
            assignedTo: input.assignedTo ?? null,
            notes: input.notes ?? null,
            createdAt: now,
            updatedAt: now
        };
        (0, memoryStore_1.getItems)(req.user.id).push(item);
        (0, alertService_1.evaluateItem)(item);
        return (0, responseHelper_1.success)(res, item, 'Item created', 201);
    },
    getOne(req, res) {
        const item = (0, memoryStore_1.getItems)(req.user.id).find((entry) => entry.id === req.params.id);
        if (!item)
            return (0, responseHelper_1.failure)(res, 'Item not found', 404);
        return (0, responseHelper_1.success)(res, { ...item, stockLogs: (0, memoryStore_1.getLogs)(req.user.id).filter((log) => log.itemId === item.id) });
    },
    update(req, res) {
        const items = (0, memoryStore_1.getItems)(req.user.id);
        const index = items.findIndex((entry) => entry.id === req.params.id);
        if (index < 0)
            return (0, responseHelper_1.failure)(res, 'Item not found', 404);
        const input = itemSchema.partial().parse(req.body);
        items[index] = { ...items[index], ...input, updatedAt: new Date().toISOString() };
        (0, alertService_1.evaluateItem)(items[index]);
        return (0, responseHelper_1.success)(res, items[index], 'Item updated');
    },
    remove(req, res) {
        const items = (0, memoryStore_1.getItems)(req.user.id);
        const index = items.findIndex((entry) => entry.id === req.params.id);
        if (index < 0)
            return (0, responseHelper_1.failure)(res, 'Item not found', 404);
        items.splice(index, 1);
        const logs = (0, memoryStore_1.getLogs)(req.user.id);
        for (let i = logs.length - 1; i >= 0; i -= 1) {
            if (logs[i].itemId === req.params.id)
                logs.splice(i, 1);
        }
        return (0, responseHelper_1.success)(res, { id: req.params.id }, 'Item deleted');
    },
    reorderCalc(req, res) {
        const item = (0, memoryStore_1.getItems)(req.user.id).find((entry) => entry.id === req.params.id);
        if (!item)
            return (0, responseHelper_1.failure)(res, 'Item not found', 404);
        return (0, responseHelper_1.success)(res, (0, reorderService_1.calculateReorder)(item, (0, memoryStore_1.getLogs)(req.user.id).filter((log) => log.itemId === item.id), memoryStore_1.settings));
    },
    async importLocal(req, res) {
        try {
            const { filePath } = req.body;
            if (!filePath) {
                return (0, responseHelper_1.failure)(res, 'filePath parameter is required', 400);
            }
            let fileContent;
            try {
                fileContent = await fs_1.promises.readFile(filePath, 'utf-8');
            }
            catch (err) {
                return (0, responseHelper_1.failure)(res, `Failed to read file at ${filePath}. Make sure the path is correct.`, 404);
            }
            let data;
            try {
                data = JSON.parse(fileContent);
            }
            catch (err) {
                return (0, responseHelper_1.failure)(res, 'File is not a valid JSON document', 400);
            }
            if (!data || typeof data !== 'object') {
                return (0, responseHelper_1.failure)(res, 'Invalid backup data format', 400);
            }
            const medicines = data.medicines ?? [];
            const users = data.users ?? [];
            return (0, responseHelper_1.success)(res, { medicines, users, monthDuration: data.monthDuration, version: data.version }, 'Backup file read successfully');
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : 'Error importing local backup';
            return (0, responseHelper_1.failure)(res, msg, 500);
        }
    }
};
