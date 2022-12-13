//@ts-nocheck
globalThis.onmessage = function (event) {
    var array = event.data.array;
    var postMessage = globalThis.webkitPostMessage || globalThis.postMessage;

    try {
        // transfer the test array back to the caller
        postMessage(
            {
                array: array,
            },
            [array.buffer]
        );
    } catch (e) {
        postMessage({});
    }
};