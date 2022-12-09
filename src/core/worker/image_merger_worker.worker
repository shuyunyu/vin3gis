//@ts-nocheck
var doMerge = function (canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBlobs, imageBitMaps, options, data, onMerged) {
    if (imageBlobs) {
        var promiseArray = [];
        for (var i = 0; i < imageBlobs.length; i++)promiseArray.push(createImageBitmap(imageBlobs[i], options[i] || {}));
        Promise.all(promiseArray).then(function (images) {
            mergerImages(canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, images, data, onMerged);
        });
    } else {
        mergerImages(canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBitMaps, data, onMerged);
    }
}

var mergerImages = function (canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, images, data, onMerged) {
    var colCount = finalWidth / imageWidth;
    var rowCount = finalHeihgt / imageHeight;
    var ctx = canvas.getContext('2d');
    var imageIndex = 0;
    for (var i = 0; i < rowCount; i++) {
        for (var j = 0; j < colCount; j++) {
            var image = images[imageIndex];
            var dx = j * imageWidth;
            var dy = i * imageHeight;
            ctx.drawImage(image, 0, 0, imageWidth, imageHeight, dx, dy, imageWidth, imageHeight);
            imageIndex++;
        }
    }
    var resImage = canvas.transferToImageBitmap();
    onMerged(resImage, data);
}

if (typeof self === "undefined") {
    self = {};
}

var postMessage = self.webkitPostMessage || self.postMessage;

self.onmessage = function (event) {
    var params = event.data.params;
    var canvas = params.canvas;
    var finalWidth = params.width;
    var finalHeihgt = params.height;
    var imageWidth = params.imageWidth;
    var imageHeight = params.imageHeight;
    var imageBlobs = params.blobs;
    var imageBitMaps = params.imageBitMaps;
    var options = params.options || [];
    doMerge(canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBlobs, imageBitMaps, options, event.data, onMerged);
};

function onMerged (image, data) {
    var transferObjs = [image];
    postMessage({
        id: data.id,
        error: null,
        result: [image]
    }, transferObjs);
}