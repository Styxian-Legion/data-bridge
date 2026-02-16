import type { Request, Response, NextFunction } from "express";
import Validation from "../../utils/validation";
import { ConnectorSchema } from "./connector.validator";
import ConnectorService from "./connector.service";
import ResponseSuccess from "../../utils/response-success";

export default class ConnectorController {

    static async createConnector(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(ConnectorSchema, req.body);
            const response = await ConnectorService.createConnector(data);
            return new ResponseSuccess({
                status: 201,
                code: "CONNECTOR_CREATED",
                message: "connector created successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async getConnectors(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await ConnectorService.getConnectors();
            return new ResponseSuccess({
                status: 200,
                code: "CONNECTORS_FETCHED",
                message: "connectors fetched successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async getConnectorById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = (req.params as any);
            const response = await ConnectorService.getConnectorById(id);
            return new ResponseSuccess({
                status: 200,
                code: "CONNECTOR_FETCHED",
                message: "connector fetched successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async updateConnector(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = (req.params as any);
            const { data } = await Validation(ConnectorSchema, req.body);
            const response = await ConnectorService.updateConnector(id, data);
            return new ResponseSuccess({
                status: 200,
                code: "CONNECTOR_UPDATED",
                message: "connector updated successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async deleteConnector(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = (req.params as any);
            const response = await ConnectorService.deleteConnector(id);
            return new ResponseSuccess({
                status: 200,
                code: "CONNECTOR_DELETED",
                message: "connector deleted successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}