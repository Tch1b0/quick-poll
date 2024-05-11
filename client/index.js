import { isDebugServerAvailable } from "./lib/connection.js";
import { $ } from "./lib/dom.js";
import { IS_DEBUG } from "./lib/environment.js";

const sessionIDInput = $("sessionID");
const hostButton = $("hostButton");
const joinButton = $("joinButton");

hostButton.addEventListener("click", () => {
    // const val = sessionIDInput.value;
    // if (!val) {
    //     console.error("No session ID provided");
    //     return;
    // }
    window.location.href = `./host`;
});

joinButton.addEventListener("click", () => {
    const val = sessionIDInput.value;
    if (!val) {
        console.error("No session ID provided");
        return;
    }
    window.location.href = `./participate#id=${val}`;
});

// run in asynchronous thread
(async () => {
    // check if in debug env and if server is available
    if (!IS_DEBUG || (await isDebugServerAvailable())) return;

    // server not available and in debug env
    const confirmed = window.confirm(
        "Lokales Backend ist offline. Auf qp.johannespour.de wechseln?"
    );
    if (confirmed) {
        window.location.href = "https://qp.johannespour.de";
    }
})();
