import { z } from "zod";

export const serviceSchema = z.object({
    name: z.string().min(1, "Service name is required"),
    url: z.url("Must be a valid URL"),
    icon: z.url("Icon must be valid URL").optional(),
    description: z.string().optional(),
    category: z.string().default("Uncategorized"),
});

export const configSchema = z.array(serviceSchema);

export type Service = z.infer<typeof serviceSchema>;
