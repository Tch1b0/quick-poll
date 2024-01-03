export const IS_DEBUG = (() => {
    const origin = window.location.hostname;
    const locals = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];

    return locals.includes(origin);
})();
