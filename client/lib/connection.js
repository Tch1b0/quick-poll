const URL = "ws://127.0.0.1:8080";

/**
 *
 * @param {string} url
 * @param {"host" | "client"} type
 * @param {string} id
 * @returns
 */
export function newWSConnection(url = URL, type, id) {
    return new WebSocket(`${url}/${type}/${id}`);
}
