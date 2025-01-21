import { IS_DEBUG } from "./environment.js";

var script = document.createElement("script");
script.src =
    "https://js-de.sentry-cdn.com/f4f88cb380b6f4bf19ddc2e2f2059603.min.js";

script.onload = function () {
    Sentry.onLoad(function () {
        Sentry.init({
            debug: IS_DEBUG,
            // additional config (currently none)
        });
        console.log("Sentry script loaded successfully.");
    });
};
script.onerror = function () {
    console.error("Failed to load Sentry script.");
};

document.head.appendChild(script);
