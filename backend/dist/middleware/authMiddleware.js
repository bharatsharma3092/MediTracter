"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
function userIdFromEmail(email) {
    return 'user_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}
function authMiddleware(req, _res, next) {
    const email = req.header('x-demo-email') ?? 'demo@meditrack.local';
    req.user = {
        id: userIdFromEmail(email),
        email
    };
    next();
}
