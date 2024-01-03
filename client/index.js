import { $ } from "./lib/dom.js";

const sessionIDInput = $("sessionID");
const hostButton = $("hostButton");
const joinButton = $("joinButton");

hostButton.addEventListener("click", () => {
    window.location.href = `./host#id=${sessionIDInput.value}`;
});

joinButton.addEventListener("click", () => {
    window.location.href = `/client/participate#id=${sessionIDInput.value}`;
});
