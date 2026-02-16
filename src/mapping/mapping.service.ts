import ResponseError from "../../utils/response-error";
import XLSX from "xlsx";
import { redis } from "../../db/redis";

export default class MappingService {

    static async createMapping(data: { name: string, connectorIds: number[], tableName: string, source: { filename: string, path: string } }) {
        try {
            const workbook = XLSX.readFile(data.source.path);

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

            await redis.set(`mapping:${data.name}`, JSON.stringify(jsonData));

            return {
                name: data.name,
                connectorIds: data.connectorIds,
                tableName: data.tableName,
                source: data.source.filename,
                redisKey: `mapping:${data.name}`,
                details: jsonData
            };
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