import { IS_DEBUG } from "./environment.js";

const PROD_API_HOST = "qp-api.johannespour.de";

const BASE_URL = (() => {
    return IS_DEBUG ? `ws://${window.location.hostname}:8080` : PROD_API_HOST;
})();

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
