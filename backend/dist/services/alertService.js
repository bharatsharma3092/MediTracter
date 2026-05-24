"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateItem = evaluateItem;
exports.evaluateAll = evaluateAll;
exports.listAlerts = listAlerts;
const memoryStore_1 = require("./memoryStore");
const reorderService_1 = require("./reorderService");
function add(userId, itemId, alertType) {
    const alerts = (0, memoryStore_1.getAlerts)(userId);
    const exists = alerts.some((alert) => alert.itemId === itemId && alert.alertType === alertType && !alert.dismissed);
    if (!exists) {
        alerts.push({ id: (0, memoryStore_1.id)('alert'), itemId, alertType, triggeredAt: new Date().toISOString(), dismissed: false });
    }
}
function evaluateItem(item) {
    const userId = item.userId;
    if (item.currentQty < item.minQty)
        add(userId, item.id, 'LOW_STOCK');
    if (item.expiryDate) {
        const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000);
        if (days >= 0 && days <= 7)
            add(userId, item.id, 'EXPIRY_7');
        else if (days >= 0 && days <= 15)
            add(userId, item.id, 'EXPIRY_15');
        else if (days >= 0 && days <= 30)
            add(userId, item.id, 'EXPIRY_30');
    }
    const calc = (0, reorderService_1.calculateReorder)(item, (0, memoryStore_1.getLogs)(userId).filter((log) => log.itemId === item.id), memoryStore_1.settings);
    if (calc.reorderTrigger)
        add(userId, item.id, 'REORDER_DUE');
}
function evaluateAll(userId) {
    (0, memoryStore_1.getItems)(userId).forEach(evaluateItem);
    return listAlerts(userId);
}
function listAlerts(userId) {
    const userItems = (0, memoryStore_1.getItems)(userId);
    return (0, memoryStore_1.getAlerts)(userId)
        .filter((alert) => !alert.dismissed && userItems.some((item) => item.id === alert.itemId))
        .map((alert) => {
        const item = userItems.find((entry) => entry.id === alert.itemId);
        return {
            ...alert,
            itemName: item?.name ?? 'Unknown item',
            itemType: item?.itemType ?? 'UNKNOWN',
            currentQty: item?.currentQty ?? 0,
            minQty: item?.minQty ?? 0,
            expiryDate: item?.expiryDate ?? null
        };
    });
}
