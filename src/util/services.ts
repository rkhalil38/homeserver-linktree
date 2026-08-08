import { configSchema, type Service } from "../config/schema";

export async function fetchServices(url: string, fallback: JSON[]): Promise<Service[]> {
    let services;
    try {
        const response = await fetch(url);
        services = await response.json();
        console.log(`[ LOG ] Fetched services from ${url}`);
    } catch (e) {
        console.warn(`[ WARN ] Failed to fetch services, falling back: ${e}`);
    }

    let parsedServices;
    if (services) {
        try {
            parsedServices = configSchema.parse(services);
        } catch (e) {
            console.warn(`[ WARN ] Failed to parse fetched services.`);
        }
    }

    return parsedServices ?? configSchema.parse(fallback);
}
