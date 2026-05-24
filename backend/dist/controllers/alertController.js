"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertController = void 0;
const alertService_1 = require("../services/alertService");
const memoryStore_1 = require("../services/memoryStore");
const responseHelper_1 = require("../utils/responseHelper");
exports.alertController = {
    list(req, res) {
        return (0, responseHelper_1.success)(res, (0, alertService_1.evaluateAll)(req.user.id));
    },
    dismiss(req, res) {
        const alert = (0, memoryStore_1.getAlerts)(req.user.id).find((entry) => entry.id === req.params.id);
        if (alert)
            alert.dismissed = true;
        return (0, responseHelper_1.success)(res, (0, alertService_1.listAlerts)(req.user.id));
    },
    dismissAll(req, res) {
        (0, alertService_1.listAlerts)(req.user.id).forEach((alert) => {
            const source = (0, memoryStore_1.getAlerts)(req.user.id).find((entry) => entry.id === alert.id);
            if (source)
                source.dismissed = true;
        });
        return (0, responseHelper_1.success)(res, []);
    },
    runCheck(req, res) {
        return (0, responseHelper_1.success)(res, (0, alertService_1.evaluateAll)(req.user.id));
    }
};
