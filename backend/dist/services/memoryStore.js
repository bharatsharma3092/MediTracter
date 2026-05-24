"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderLists = exports.settings = void 0;
exports.getItems = getItems;
exports.getLogs = getLogs;
exports.getAlerts = getAlerts;
exports.id = id;
exports.signedQty = signedQty;
exports.settings = {
    coverMonths: 1,
    consumptionWindow: 30,
    leadTimeDays: 3,
    bufferDays: 2,
    pushEnabled: true,
    emailEnabled: false
};
// User-scoped in-memory stores
const itemsByUser = new Map();
const logsByUser = new Map();
const alertsByUser = new Map();
function getItems(userId) {
    if (!itemsByUser.has(userId))
        itemsByUser.set(userId, []);
    return itemsByUser.get(userId);
}
function getLogs(userId) {
    if (!logsByUser.has(userId))
        logsByUser.set(userId, []);
    return logsByUser.get(userId);
}
function getAlerts(userId) {
    if (!alertsByUser.has(userId))
        alertsByUser.set(userId, []);
    return alertsByUser.get(userId);
}
exports.reorderLists = [];
function id(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function signedQty(logType, qty) {
    return logType === 'INTAKE' ? Math.abs(qty) : -Math.abs(qty);
}
