import { IS_DEBUG } from "./environment.js";

const PROD_API_HOST = "qp-api.johannespour.de";
const DEBUG_API_HOST = `${window.location.hostname}:8080`;

const BASE_URL = IS_DEBUG ? `ws://${DEBUG_API_HOST}` : `wss://${PROD_API_HOST}`;

/**
 *
 * @param {string} url
 * @param {"host" | "client"} type
 * @param {string?} id
 * @returns {WebSocket}
 */
export function newWSConnection(url = BASE_URL, type, id = "") {
    return new WebSocket(`${url}/${type}/${id}`);
}

export async function isDebugServerAvailable() {
    try {
        const resp = await fetch(`http://${DEBUG_API_HOST}`, { method: "GET" });
        return resp.status == 200;
    } catch {
        return false;
    }
}
