var postMessage = globalThis.webkitPostMessage || globalThis.postMessage;
var onCreated = function (image, event, err) {
    if (err) {
        postMessage({
            id: event.data.id,
            error: "create grid image failed.",
            result: null
        }, null);
    }
    else {
        postMessage({
            id: event.data.id,
            error: null,
            result: image
            //@ts-ignore
        }, [image]);
    }
};
var createGridImage = function (event) {
    return new Promise(function (resolve, reject) {
        var ctx = event.data.params.canvas.getContext("2d");
        ctx.font = event.data.params.font;
        ctx.strokeStyle = event.data.params.border.color;
        ctx.fillStyle = event.data.params.fontColor;
        var scale = event.data.params.tileWidth / 256;
        var offet = 30 * scale;
        var startX = 118 * scale;
        var maxWidth = 200 * scale;
        var left = 50 * scale;
        ctx.fillText("X: " + event.data.params.x, left, startX, maxWidth);
        ctx.fillText("Y: " + event.data.params.y, left, startX + offet, maxWidth);
        ctx.fillText("Z: " + event.data.params.z, left, startX + offet * 2, maxWidth);
        ctx.lineWidth = event.data.params.border.width;
        ctx.strokeRect(0, 0, event.data.params.tileWidth, event.data.params.tileHeight);
        const imageData = ctx.getImageData(0, 0, event.data.params.tileWidth, event.data.params.tileHeight);
        createImageBitmap(imageData, event.data.params.options || {}).then(image => {
            resolve(image);
        }).catch(reject);
    });
};
globalThis.onmessage = function (event) {
    createGridImage(event).then(function (res) {
        onCreated(res, event, null);
    })["catch"](function (err) {
        onCreated(null, event, err);
    });
};
