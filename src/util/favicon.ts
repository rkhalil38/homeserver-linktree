// utils/faviconFetcher.ts
import { Buffer } from "node:buffer";
import type { Service } from "src/config/schema";

const REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; FaviconFetcher/1.0)",
};

/**
 * Fetches with a timeout to prevent hanging requests.
 */
async function fetchWithTimeout(
    url: string,
    ms: number,
    options: RequestInit = {}
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Finds the href of the first <link> tag whose rel contains "icon",
 * regardless of whether rel or href comes first in the tag.
 */
function findIconHref(html: string): string | null {
    const linkTags = html.match(/<link[^>]*>/gi) || [];
    for (const tag of linkTags) {
        const relMatch = tag.match(/rel=["']([^"']+)["']/i);
        if (!relMatch || !/icon/i.test(relMatch[1])) continue;
        const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
        if (hrefMatch) return hrefMatch[1];
    }
    return null;
}

/**
 * Takes an array of service objects and attempts to fetch and convert
 * their favicons into Base64 Data URIs.
 *
 * @param services Array of objects containing at least `name` and `url`
 * @returns A new array of the same objects, augmented with `iconDataUri`
 */
export async function fetchFaviconsForServices<T extends Service>(
    services: T[]
): Promise<(T & { iconDataUri: string | null })[]> {
    return await Promise.all(
        services.map(async (service) => {
            let iconDataUri: string | null = null;
            try {
                // Fetch the homepage HTML to find the true favicon path
                const htmlRes = await fetchWithTimeout(service.url, 4000, {
                    headers: REQUEST_HEADERS,
                }).catch(() => null);

                // Resolve relative paths against wherever the site actually landed
                // (post-redirect), not the original URL.
                const baseUrl = htmlRes?.url || service.url;
                let iconUrl = new URL("/favicon.ico", baseUrl).href;

                if (htmlRes && htmlRes.ok) {
                    const html = await htmlRes.text();
                    const iconHref = findIconHref(html);
                    if (iconHref) {
                        iconUrl = new URL(iconHref, baseUrl).href;
                    }
                }

                // Download the image and convert to Base64
                const imgRes = await fetchWithTimeout(iconUrl, 4000, {
                    headers: REQUEST_HEADERS,
                });

                if (imgRes.ok) {
                    const arrayBuffer = await imgRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const contentType = imgRes.headers.get("content-type") || "image/x-icon";
                    iconDataUri = `data:${contentType};base64,${buffer.toString("base64")}`;
                }
            } catch (error) {
                console.warn(
                    `[Warn] Could not fetch favicon for ${service.name} at ${service.url}:`,
                    error
                );
            }
            return { ...service, iconDataUri };
        })
    );
}
