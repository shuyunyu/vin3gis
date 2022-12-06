// //@ts-nocheck
// var doMerge = function (canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBlobs, imageBitMaps, options, data, onMerged) {
//     if (imageBlobs) {
//         var promiseArray = [];
//         for (var i = 0; i < imageBlobs.length; i++)promiseArray.push(createImageBitmap(imageBlobs[i], options[i] || {}));
//         Promise.all(promiseArray).then(function (images) {
//             mergerImages(canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, images, data, onMerged);
//         });
//     } else {
//         mergerImages(canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBitMaps, data, onMerged);
//     }
// }

// var mergerImages = function (canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, images, data, onMerged) {
//     var colCount = finalWidth / imageWidth;
//     var rowCount = finalHeihgt / imageHeight;
//     var ctx = canvas.getContext('2d');
//     var imageIndex = 0;
//     for (var i = 0; i < rowCount; i++) {
//         for (var j = 0; j < colCount; j++) {
//             var image = images[imageIndex];
//             var dx = j * imageWidth;
//             var dy = i * imageHeight;
//             ctx.drawImage(image, 0, 0, imageWidth, imageHeight, dx, dy, imageWidth, imageHeight);
//             imageIndex++;
//         }
//     }
//     var resImage = canvas.transferToImageBitmap();
//     onMerged(resImage, data);
// }

// if (typeof self === "undefined") {
//     self = {};
// }

// var postMessage = self.webkitPostMessage || self.postMessage;

// self.onmessage = function (event) {
//     var params = event.data.params;
//     var canvas = params.canvas;
//     var finalWidth = params.width;
//     var finalHeihgt = params.height;
//     var imageWidth = params.imageWidth;
//     var imageHeight = params.imageHeight;
//     var imageBlobs = params.blobs;
//     var imageBitMaps = params.imageBitMaps;
//     var options = params.options || [];
//     doMerge(canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBlobs, imageBitMaps, options, event.data, onMerged);
// };

// function onMerged (image, data) {
//     var transferObjs = [image];
//     postMessage({
//         id: data.id,
//         error: null,
//         result: [image]
//     }, transferObjs);
// }

export const ImageMergerWorkerScriptStr = 'Ly9AdHMtbm9jaGVjawp2YXIgZG9NZXJnZSA9IGZ1bmN0aW9uIChjYW52YXMsIGZpbmFsV2lkdGgsIGZpbmFsSGVpaGd0LCBpbWFnZVdpZHRoLCBpbWFnZUhlaWdodCwgaW1hZ2VCbG9icywgaW1hZ2VCaXRNYXBzLCBvcHRpb25zLCBkYXRhLCBvbk1lcmdlZCkgewogICAgaWYgKGltYWdlQmxvYnMpIHsKICAgICAgICB2YXIgcHJvbWlzZUFycmF5ID0gW107CiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZUJsb2JzLmxlbmd0aDsgaSsrKXByb21pc2VBcnJheS5wdXNoKGNyZWF0ZUltYWdlQml0bWFwKGltYWdlQmxvYnNbaV0sIG9wdGlvbnNbaV0gfHwge30pKTsKICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlQXJyYXkpLnRoZW4oZnVuY3Rpb24gKGltYWdlcykgewogICAgICAgICAgICBtZXJnZXJJbWFnZXMoY2FudmFzLCBmaW5hbFdpZHRoLCBmaW5hbEhlaWhndCwgaW1hZ2VXaWR0aCwgaW1hZ2VIZWlnaHQsIGltYWdlcywgZGF0YSwgb25NZXJnZWQpOwogICAgICAgIH0pOwogICAgfSBlbHNlIHsKICAgICAgICBtZXJnZXJJbWFnZXMoY2FudmFzLCBmaW5hbFdpZHRoLCBmaW5hbEhlaWhndCwgaW1hZ2VXaWR0aCwgaW1hZ2VIZWlnaHQsIGltYWdlQml0TWFwcywgZGF0YSwgb25NZXJnZWQpOwogICAgfQp9Cgp2YXIgbWVyZ2VySW1hZ2VzID0gZnVuY3Rpb24gKGNhbnZhcywgZmluYWxXaWR0aCwgZmluYWxIZWloZ3QsIGltYWdlV2lkdGgsIGltYWdlSGVpZ2h0LCBpbWFnZXMsIGRhdGEsIG9uTWVyZ2VkKSB7CiAgICB2YXIgY29sQ291bnQgPSBmaW5hbFdpZHRoIC8gaW1hZ2VXaWR0aDsKICAgIHZhciByb3dDb3VudCA9IGZpbmFsSGVpaGd0IC8gaW1hZ2VIZWlnaHQ7CiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7CiAgICB2YXIgaW1hZ2VJbmRleCA9IDA7CiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd0NvdW50OyBpKyspIHsKICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbENvdW50OyBqKyspIHsKICAgICAgICAgICAgdmFyIGltYWdlID0gaW1hZ2VzW2ltYWdlSW5kZXhdOwogICAgICAgICAgICB2YXIgZHggPSBqICogaW1hZ2VXaWR0aDsKICAgICAgICAgICAgdmFyIGR5ID0gaSAqIGltYWdlSGVpZ2h0OwogICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBpbWFnZVdpZHRoLCBpbWFnZUhlaWdodCwgZHgsIGR5LCBpbWFnZVdpZHRoLCBpbWFnZUhlaWdodCk7CiAgICAgICAgICAgIGltYWdlSW5kZXgrKzsKICAgICAgICB9CiAgICB9CiAgICB2YXIgcmVzSW1hZ2UgPSBjYW52YXMudHJhbnNmZXJUb0ltYWdlQml0bWFwKCk7CiAgICBvbk1lcmdlZChyZXNJbWFnZSwgZGF0YSk7Cn0KCmlmICh0eXBlb2Ygc2VsZiA9PT0gInVuZGVmaW5lZCIpIHsKICAgIHNlbGYgPSB7fTsKfQoKdmFyIHBvc3RNZXNzYWdlID0gc2VsZi53ZWJraXRQb3N0TWVzc2FnZSB8fCBzZWxmLnBvc3RNZXNzYWdlOwoKc2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHsKICAgIHZhciBwYXJhbXMgPSBldmVudC5kYXRhLnBhcmFtczsKICAgIHZhciBjYW52YXMgPSBwYXJhbXMuY2FudmFzOwogICAgdmFyIGZpbmFsV2lkdGggPSBwYXJhbXMud2lkdGg7CiAgICB2YXIgZmluYWxIZWloZ3QgPSBwYXJhbXMuaGVpZ2h0OwogICAgdmFyIGltYWdlV2lkdGggPSBwYXJhbXMuaW1hZ2VXaWR0aDsKICAgIHZhciBpbWFnZUhlaWdodCA9IHBhcmFtcy5pbWFnZUhlaWdodDsKICAgIHZhciBpbWFnZUJsb2JzID0gcGFyYW1zLmJsb2JzOwogICAgdmFyIGltYWdlQml0TWFwcyA9IHBhcmFtcy5pbWFnZUJpdE1hcHM7CiAgICB2YXIgb3B0aW9ucyA9IHBhcmFtcy5vcHRpb25zIHx8IFtdOwogICAgZG9NZXJnZShjYW52YXMsIGZpbmFsV2lkdGgsIGZpbmFsSGVpaGd0LCBpbWFnZVdpZHRoLCBpbWFnZUhlaWdodCwgaW1hZ2VCbG9icywgaW1hZ2VCaXRNYXBzLCBvcHRpb25zLCBldmVudC5kYXRhLCBvbk1lcmdlZCk7Cn07CgpmdW5jdGlvbiBvbk1lcmdlZCAoaW1hZ2UsIGRhdGEpIHsKICAgIHZhciB0cmFuc2Zlck9ianMgPSBbaW1hZ2VdOwogICAgcG9zdE1lc3NhZ2UoewogICAgICAgIGlkOiBkYXRhLmlkLAogICAgICAgIGVycm9yOiBudWxsLAogICAgICAgIHJlc3VsdDogW2ltYWdlXQogICAgfSwgdHJhbnNmZXJPYmpzKTsKfQ==';