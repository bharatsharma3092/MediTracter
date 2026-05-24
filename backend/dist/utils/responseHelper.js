"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.failure = failure;
function success(res, data, message, status = 200) {
    return res.status(status).json({ success: true, data, message });
}
function failure(res, message, status = 400) {
    return res.status(status).json({ success: false, error: message });
}
