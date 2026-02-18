// mapping.validator.ts
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MappingSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    table_name: z.string().trim().min(1, "Table name is required"),
    source_file: z.object({
        filename: z.string(),
        mimetype: z.string(),
        size: z.number(),
        path: z.string(),
    })
        .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
        .refine(
            (file) => ACCEPTED_TYPES.includes(file.mimetype),
            "Only .xls or .xlsx files are accepted."
        )
});