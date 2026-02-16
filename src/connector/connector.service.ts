import ConnectorRepository from "./connector.repository";
import ResponseError from "../../utils/response-error";

export default class ConnectorService {

    static async createConnector(data: { dialect: string, host: string, port: number, database: string, username: string, password: string }) {
        const findConnector = await ConnectorRepository.connectorExists(data.host, data.port, data.database, data.username);
        if (findConnector) {
            throw new ResponseError({
                status: 400,
                code: "CONNECTOR_ALREADY_EXISTS",
                message: "A connector with the same host, port, database, and username already exists.",
            });
        }
        return await ConnectorRepository.createConnector(data);
    }

    static async getConnectors() {
        return await ConnectorRepository.getConnectors();
    }

    static async getConnectorById(id: number | string) {
        const connector = await ConnectorRepository.getConnectorById(id);
        if (!connector) {
            throw new ResponseError({
                status: 404,
                code: "CONNECTOR_NOT_FOUND",
                message: `No connector found with id ${id}.`,
            });
        }
        return connector;
    }

    static async updateConnector(id: number | string, data: { dialect: string, host: string, port: number, database: string, username: string, password: string }) {
        const connector = await ConnectorRepository.getConnectorById(id);
        if (!connector) {
            throw new ResponseError({
                status: 404,
                code: "CONNECTOR_NOT_FOUND",
                message: `No connector found with id ${id}.`,
            });
        }
        return await ConnectorRepository.updateConnector(id, data);
    }

    static async deleteConnector(id: number | string) {
        const connector = await ConnectorRepository.getConnectorById(id);
        if (!connector) {
            throw new ResponseError({
                status: 404,
                code: "CONNECTOR_NOT_FOUND",
                message: `No connector found with id ${id}.`,
            });
        }
        return await ConnectorRepository.deleteConnector(id);
    }
}