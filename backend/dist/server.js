"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const alertJob_1 = require("./jobs/alertJob");
const medicineDatasetService_1 = require("./services/medicineDatasetService");
(0, alertJob_1.registerAlertJob)();
// Pre-initialize / pre-download the Indian medicines dataset in the background
(0, medicineDatasetService_1.initialize)().catch((err) => {
    console.error('[server] Failed to pre-initialize medicine dataset:', err.message);
});
app_1.app.listen(env_1.env.PORT, () => {
    console.log(`MediTrack Pro API listening on http://localhost:${env_1.env.PORT}`);
});
