import fs from "fs/promises";
import type { Request, Response, NextFunction } from "express";
import Validation from "../../utils/validation";
import { MappingSchema } from "./mapping.validator";
import MappingService from "./mapping.service";
import ResponseSuccess from "../../utils/response-success";

export default class MappingController {

    static async createMapping(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = {
                ...req.body,
                source: req.file,
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

}