"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAlertJob = registerAlertJob;
const node_cron_1 = __importDefault(require("node-cron"));
function registerAlertJob() {
    node_cron_1.default.schedule('0 8 * * *', () => {
        // Alerts are now user-scoped and evaluated on-demand via the API
    });
}
