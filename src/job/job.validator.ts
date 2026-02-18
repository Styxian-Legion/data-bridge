import { z } from "zod";

export const JobSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    connector_ids: z.array(z.string().trim().min(1, "Connector ID is required")).min(1, "At least one connector ID is required"),
    mapping_id: z.string().trim().min(1, "Mapping ID is required"),
});