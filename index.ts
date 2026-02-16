// dependencies
import express from "express";

// config
import { APP_CONFIG } from "./config";

// middleware
import uploadExcel from "./middlewares/upload_file_excel.middleware";
import ErrorMiddleware from "./middlewares/error.middleware";

// controllers
import ConnectorController from "./src/connector/connector.controller";
import MappingController from "./src/mapping/mapping.controller";

// bootstrap the application
async function bootstrap() {

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post("/connectors", ConnectorController.createConnector);
    app.get("/connectors", ConnectorController.getConnectors);
    app.get("/connectors/:id", ConnectorController.getConnectorById);
    app.patch("/connectors/:id", ConnectorController.updateConnector);
    app.delete("/connectors/:id", ConnectorController.deleteConnector);

    app.post("/mappings", uploadExcel.single("source"), MappingController.createMapping);

    app.use(ErrorMiddleware);

    app.listen(APP_CONFIG.PORT, () => {
        console.log(`🚀 ${APP_CONFIG.NAME} is running at http://${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
    });
}

// start the application
bootstrap().catch(err => {
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
});