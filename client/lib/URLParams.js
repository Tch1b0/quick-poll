export default function (url = window.location.href) {
    url = url.replace("?", "#", 1).split("#")[1];
    const map = new Map();

    for (const pair of url.split("&")) {
        const [key, value] = pair.split("=");
        map.set(key, value);
    }

    return map;
}
