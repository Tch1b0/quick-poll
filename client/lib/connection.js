const URL = `ws://${window.location.hostname}:8080`;

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
