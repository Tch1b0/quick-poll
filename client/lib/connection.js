import { IS_DEBUG } from "./environment.js";

const PROD_API_HOST = "qp-api.johannespour.de";
const DEBUG_API_HOST = `${window.location.hostname}:8080`;

const BASE_URL = `ws://${IS_DEBUG ? DEBUG_API_HOST : PROD_API_HOST}`;

/**
 *
 * @param {string} url
 * @param {"host" | "client"} type
 * @param {string} id
 * @returns
 */
export function newWSConnection(url = BASE_URL, type, id) {
    return new WebSocket(`${url}/${type}/${id}`);
}
