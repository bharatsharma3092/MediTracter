"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
async function sendNotification(_userId, _title, _body) {
    return { delivered: false, reason: 'Push provider is not configured in local demo mode.' };
}
