// mapping.validator.ts
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MappingSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    connectorIds: z.preprocess((val) => {
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            } catch {
                return val.split(",").map(Number);
            }
        }
        return val;
    }, z.array(z.number().int().positive())
        .min(1, "At least one Connector ID is required")
    ),
    tableName: z.string().trim().min(1, "Table name is required"),
    source: z.any()
        .refine((file) => !!file, "File is required")
        .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
        .refine(
            (file) => ACCEPTED_TYPES.includes(file.mimetype), // Multer pakai 'mimetype', bukan 'type'
            "Only .xls or .xlsx files are accepted."
        ),
});