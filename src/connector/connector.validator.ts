import { z } from "zod";

export const ConnectorSchema = z.object({
    dialect: z.enum(["mysql", "postgresql", "mongodb"], {
        message: "Dialect must be one of: mysql, postgresql, mongodb",
    }),
    host: z.string()
        .trim()
        .min(1, "Host is required")
        .refine((val) =>
            /^(localhost|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|(\d{1,3}\.){3}\d{1,3})$/.test(val),
            { message: "Invalid host format (must be domain, IP, or localhost)" }
        ),
    port: z.coerce.number()
        .int()
        .min(1)
        .max(65535, "Port must be between 1 and 65535"),
    database: z
        .string()
        .trim()
        .min(1, "Database name cannot be empty"),
    username: z
        .string()
        .trim()
        .min(1, "Username is required"),
    password: z
        .string()
        .min(1, "Password is required"),
});