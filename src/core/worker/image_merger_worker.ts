// //@ts-nocheck
// var doMerge = function (canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBlobs, options, data, onMerged) {
//     var colCount = finalWidth / imageWidth;
//     var rowCount = finalHeihgt / imageHeight;
//     var ctx = canvas.getContext('2d');
//     var promiseArray = [];
//     for (var i = 0; i < imageBlobs.length; i++)promiseArray.push(createImageBitmap(imageBlobs[i], options[i] || {}));
//     Promise.all(promiseArray).then(function (images) {
//         var imageIndex = 0;
//         for (var i = 0; i < rowCount; i++) {
//             for (var j = 0; j < colCount; j++) {
//                 var image = images[imageIndex];
//                 var dx = j * imageWidth;
//                 var dy = i * imageHeight;
//                 ctx.drawImage(image, 0, 0, imageWidth, imageHeight, dx, dy, imageWidth, imageHeight);
//                 imageIndex++;
//             }
//         }
//         var resImage = canvas.transferToImageBitmap();
//         onMerged(resImage, data);
//     });
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
//     var options = params.options || [];
//     doMerge(canvas, finalWidth, finalHeihgt, imageWidth, imageHeight, imageBlobs, options, event.data, onMerged);
// };

// function onMerged (image, data) {
//     var transferObjs = [image];
//     postMessage({
//         id: data.id,
//         error: null,
//         result: [image]
//     }, transferObjs);
// }

export const ImageMergerWorkerScriptStr = 'Ly9AdHMtbm9jaGVjawp2YXIgZG9NZXJnZSA9IGZ1bmN0aW9uIChjYW52YXMsIGZpbmFsV2lkdGgsIGZpbmFsSGVpaGd0LCBpbWFnZVdpZHRoLCBpbWFnZUhlaWdodCwgaW1hZ2VCbG9icywgb3B0aW9ucywgZGF0YSwgb25NZXJnZWQpIHsKICAgIHZhciBjb2xDb3VudCA9IGZpbmFsV2lkdGggLyBpbWFnZVdpZHRoOwogICAgdmFyIHJvd0NvdW50ID0gZmluYWxIZWloZ3QgLyBpbWFnZUhlaWdodDsKICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTsKICAgIHZhciBwcm9taXNlQXJyYXkgPSBbXTsKICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VCbG9icy5sZW5ndGg7IGkrKylwcm9taXNlQXJyYXkucHVzaChjcmVhdGVJbWFnZUJpdG1hcChpbWFnZUJsb2JzW2ldLCBvcHRpb25zW2ldIHx8IHt9KSk7CiAgICBQcm9taXNlLmFsbChwcm9taXNlQXJyYXkpLnRoZW4oZnVuY3Rpb24gKGltYWdlcykgewogICAgICAgIHZhciBpbWFnZUluZGV4ID0gMDsKICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd0NvdW50OyBpKyspIHsKICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb2xDb3VudDsgaisrKSB7CiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBpbWFnZXNbaW1hZ2VJbmRleF07CiAgICAgICAgICAgICAgICB2YXIgZHggPSBqICogaW1hZ2VXaWR0aDsKICAgICAgICAgICAgICAgIHZhciBkeSA9IGkgKiBpbWFnZUhlaWdodDsKICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIGltYWdlV2lkdGgsIGltYWdlSGVpZ2h0LCBkeCwgZHksIGltYWdlV2lkdGgsIGltYWdlSGVpZ2h0KTsKICAgICAgICAgICAgICAgIGltYWdlSW5kZXgrKzsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICB2YXIgcmVzSW1hZ2UgPSBjYW52YXMudHJhbnNmZXJUb0ltYWdlQml0bWFwKCk7CiAgICAgICAgb25NZXJnZWQocmVzSW1hZ2UsIGRhdGEpOwogICAgfSk7Cn0KCgppZiAodHlwZW9mIHNlbGYgPT09ICJ1bmRlZmluZWQiKSB7CiAgICBzZWxmID0ge307Cn0KCnZhciBwb3N0TWVzc2FnZSA9IHNlbGYud2Via2l0UG9zdE1lc3NhZ2UgfHwgc2VsZi5wb3N0TWVzc2FnZTsKCnNlbGYub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2ZW50KSB7CiAgICB2YXIgcGFyYW1zID0gZXZlbnQuZGF0YS5wYXJhbXM7CiAgICB2YXIgY2FudmFzID0gcGFyYW1zLmNhbnZhczsKICAgIHZhciBmaW5hbFdpZHRoID0gcGFyYW1zLndpZHRoOwogICAgdmFyIGZpbmFsSGVpaGd0ID0gcGFyYW1zLmhlaWdodDsKICAgIHZhciBpbWFnZVdpZHRoID0gcGFyYW1zLmltYWdlV2lkdGg7CiAgICB2YXIgaW1hZ2VIZWlnaHQgPSBwYXJhbXMuaW1hZ2VIZWlnaHQ7CiAgICB2YXIgaW1hZ2VCbG9icyA9IHBhcmFtcy5ibG9iczsKICAgIHZhciBvcHRpb25zID0gcGFyYW1zLm9wdGlvbnMgfHwgW107CiAgICBkb01lcmdlKGNhbnZhcywgZmluYWxXaWR0aCwgZmluYWxIZWloZ3QsIGltYWdlV2lkdGgsIGltYWdlSGVpZ2h0LCBpbWFnZUJsb2JzLCBvcHRpb25zLCBldmVudC5kYXRhLCBvbk1lcmdlZCk7Cn07CgpmdW5jdGlvbiBvbk1lcmdlZCAoaW1hZ2UsIGRhdGEpIHsKICAgIHZhciB0cmFuc2Zlck9ianMgPSBbaW1hZ2VdOwogICAgcG9zdE1lc3NhZ2UoewogICAgICAgIGlkOiBkYXRhLmlkLAogICAgICAgIGVycm9yOiBudWxsLAogICAgICAgIHJlc3VsdDogW2ltYWdlXQogICAgfSwgdHJhbnNmZXJPYmpzKTsKfQ==';