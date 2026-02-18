import XLSX from "xlsx";
import fs from "fs/promises";
import path from "path";
import { redis } from "../../db/redis";

import MappingRepository from "./mapping.repository";
import ResponseError from "../../utils/response-error";

export default class MappingService {

    static async getMappings() {
        return await MappingRepository.getMappings();
    }

    static async getMappingById(id: number | string) {
        const mapping = await MappingRepository.getMappingById(id);
        if (!mapping) {
            throw new ResponseError({
                status: 404,
                code: "MAPPING_NOT_FOUND",
                message: `Mapping with id ${id} not found.`,
            });
        }

        return mapping;
    }

    static async deleteMapping(id: number | string) {
        const mapping = await MappingRepository.getMappingById(id);

        if (!mapping) {
            throw new ResponseError({
                status: 404,
                code: "MAPPING_NOT_FOUND",
                message: `Mapping with id ${id} not found.`,
            });
        }

        await redis.del(mapping.redis_key);

        if (mapping.source_file) {
            const filePath = path.join(
                process.cwd(),
                "uploads",
                "excels",
                mapping.source_file
            );

            await fs.unlink(filePath).catch((err) => {
                console.error("Failed to delete file:", err.message);
            });
        }

        await MappingRepository.deleteMapping(id);
        return true;
    }

    static async createMapping(data: { name: string, table_name: string, source_file: { filename: string, path: string } }) {
        try {
            const workbook = XLSX.readFile(data.source_file.path);

            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new ResponseError({
                    status: 400,
                    code: "NO_SHEETS",
                    message: "Excel file contains no sheets.",
                });
            }

            const firstSheetName = workbook.SheetNames[0];
            if (typeof firstSheetName !== 'string') {
                throw new ResponseError({
                    status: 400,
                    code: "INVALID_SHEET_NAME",
                    message: "First sheet name is not a valid string.",
                });
            }

            const sheet = workbook.Sheets[firstSheetName];

            if (!sheet) {
                throw new ResponseError({
                    status: 400,
                    code: "INVALID_SHEET",
                    message: "Sheet is invalid.",
                });
            }

            const jsonData = XLSX.utils.sheet_to_json(sheet, {
                defval: null,
                raw: false
            });

            if (jsonData.length === 0) {
                throw new ResponseError({
                    status: 400,
                    code: "DATA_EMPTY",
                    message: "Sheet is empty, no data found.",
                });
            }

            const redisKey = `mapping:${Date.now()}`;
            await redis.set(redisKey, JSON.stringify(jsonData));

            return await MappingRepository.createMapping({
                name: data.name,
                table_name: data.table_name,
                source_file: data.source_file.filename,
                redis_key: redisKey
            });
        } catch (error: any) {
            if (error instanceof ResponseError) throw error;

            throw new ResponseError({
                status: 500,
                code: "READ_EXCEL_FAILED",
                message: `Failed to process excel: ${error.message}`,
            });
        }
    }
}