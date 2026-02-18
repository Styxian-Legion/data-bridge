import fs from "fs/promises";
import type { Request, Response, NextFunction } from "express";
import Validation from "../../utils/validation";
import { MappingSchema } from "./mapping.validator";
import MappingService from "./mapping.service";
import ResponseSuccess from "../../utils/response-success";

export default class MappingController {

    static async getMappings(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await MappingService.getMappings();
            return new ResponseSuccess({
                status: 200,
                code: "MAPPINGS_FETCHED",
                message: "Mappings fetched successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async getMappingById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = (req.params as any);
            const response = await MappingService.getMappingById(id);
            return new ResponseSuccess({
                status: 200,
                code: "MAPPING_FETCHED",
                message: "Mapping fetched successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async createMapping(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = {
                ...req.body,
                source_file: req.file,
            };

            const { data } = await Validation(MappingSchema, payload);
            const response = await MappingService.createMapping(data);

            return new ResponseSuccess({
                status: 201,
                code: "MAPPING_CREATED",
                message: "Mapping created successfully.",
                data: response,
            }).send(res);
        } catch (error) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => { });
            }
            next(error);
        }
    }

    static async deleteMapping(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = (req.params as any);
            await MappingService.deleteMapping(id);
            return new ResponseSuccess({
                status: 200,
                code: "MAPPING_DELETED",
                message: "Mapping deleted successfully.",
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}