"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const alertJob_1 = require("./jobs/alertJob");
(0, alertJob_1.registerAlertJob)();
app_1.app.listen(env_1.env.PORT, () => {
    console.log(`MediTrack Pro API listening on http://localhost:${env_1.env.PORT}`);
});
