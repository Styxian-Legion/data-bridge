import express from "express";

import { APP_CONFIG } from "./config";

async function bootstrap() {

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.listen(APP_CONFIG.PORT, () => {
        console.log(`🚀 ${APP_CONFIG.NAME} is running at http://${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
    });
}

bootstrap().catch(err => {
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
});