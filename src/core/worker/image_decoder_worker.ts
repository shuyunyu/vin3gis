// //@ts-nocheck
// var base64BufferToImageBitMap = function (base64Buffer, mimeType, imageArr, imageIndex, options, onComplete) {
//     var blob = new Blob([base64Buffer], {
//         type: mimeType
//     });
//     createImageBitmap(blob, options || {}).then(img => {
//         imageArr[imageIndex] = img;
//         onComplete(img);
//     });
// }

// var base64BlobToImageBitMap = function (blob, imageArr, imageIndex, options, onComplete) {
//     if (blob) {
//         try {
//             createImageBitmap(blob, options || {}).then(img => {
//                 imageArr[imageIndex] = img;
//                 onComplete(img);
//             });
//         } catch (error) {
//             console.error("create imageBitMap failed");
//             var image = {
//                 width: 0,
//                 height: 0
//             };
//             imageArr[imageIndex] = image;
//             onComplete(image);
//         }

//     } else {
//         var image = {
//             width: 0,
//             height: 0
//         };
//         imageArr[imageIndex] = image;
//         onComplete(image);
//     }

// }

// var base64BufferToImageBitMapMulti = function (base64Buffers, mimeTypes, data, options, onComplete) {
//     let imageArr = [];
//     let down = 0;
//     for (let i = 0; i < base64Buffers.length; i++) {
//         const base64Buffer = base64Buffers[i];
//         base64BufferToImageBitMap(base64Buffer, mimeTypes[i], imageArr, i, options[i], function () {
//             down++;
//             if (down === base64Buffers.length) {
//                 onComplete(imageArr, data);
//             }
//         });
//     }
// }

// var base64BloblToImageBitMapMulti = function (blobs, data, options, onComplete) {
//     let imageArr = [];
//     let down = 0;
//     for (let i = 0; i < blobs.length; i++) {
//         const blob = blobs[i];
//         base64BlobToImageBitMap(blob, imageArr, i, options[i], function () {
//             down++;
//             if (down === blobs.length) {
//                 onComplete(imageArr, data);
//             }
//         });
//     }
// }

// if (typeof self === "undefined") {
//     //eslint-disable-next-line no-implicit-globals, no-global-assign
//     self = {};
// }

// var postMessage = self.webkitPostMessage || self.postMessage;

// self.onmessage = function (event) {
//     var data = event.data;
//     var type = data.params.type;
//     var options = data.params.options || [];
//     if (type == "base64BufferToImageBitMap") {
//         base64BufferToImageBitMapMulti(data.params.base64Buffers, data.params.mimeTypes, data, options, onDecoded);
//         delete data.params.base64Buffers;
//     } else if (type === "base64BlobToImageBitMap") {
//         base64BloblToImageBitMapMulti(data.params.blobs, data, options, onDecoded);
//     }

// };

// function onDecoded (imageArr, data) {
//     let transferObjs = imageArr.filter(img => img.width);
//     postMessage({
//         id: data.id,
//         error: null,
//         result: imageArr
//     }, transferObjs);
// }

export const ImageDecoderWorkerScriptStr = 'Ly9AdHMtbm9jaGVjawp2YXIgYmFzZTY0QnVmZmVyVG9JbWFnZUJpdE1hcCA9IGZ1bmN0aW9uIChiYXNlNjRCdWZmZXIsIG1pbWVUeXBlLCBpbWFnZUFyciwgaW1hZ2VJbmRleCwgb3B0aW9ucywgb25Db21wbGV0ZSkgewogICAgdmFyIGJsb2IgPSBuZXcgQmxvYihbYmFzZTY0QnVmZmVyXSwgewogICAgICAgIHR5cGU6IG1pbWVUeXBlCiAgICB9KTsKICAgIGNyZWF0ZUltYWdlQml0bWFwKGJsb2IsIG9wdGlvbnMgfHwge30pLnRoZW4oaW1nID0+IHsKICAgICAgICBpbWFnZUFycltpbWFnZUluZGV4XSA9IGltZzsKICAgICAgICBvbkNvbXBsZXRlKGltZyk7CiAgICB9KTsKfQoKdmFyIGJhc2U2NEJsb2JUb0ltYWdlQml0TWFwID0gZnVuY3Rpb24gKGJsb2IsIGltYWdlQXJyLCBpbWFnZUluZGV4LCBvcHRpb25zLCBvbkNvbXBsZXRlKSB7CiAgICBpZiAoYmxvYikgewogICAgICAgIHRyeSB7CiAgICAgICAgICAgIGNyZWF0ZUltYWdlQml0bWFwKGJsb2IsIG9wdGlvbnMgfHwge30pLnRoZW4oaW1nID0+IHsKICAgICAgICAgICAgICAgIGltYWdlQXJyW2ltYWdlSW5kZXhdID0gaW1nOwogICAgICAgICAgICAgICAgb25Db21wbGV0ZShpbWcpOwogICAgICAgICAgICB9KTsKICAgICAgICB9IGNhdGNoIChlcnJvcikgewogICAgICAgICAgICBjb25zb2xlLmVycm9yKCJjcmVhdGUgaW1hZ2VCaXRNYXAgZmFpbGVkIik7CiAgICAgICAgICAgIHZhciBpbWFnZSA9IHsKICAgICAgICAgICAgICAgIHdpZHRoOiAwLAogICAgICAgICAgICAgICAgaGVpZ2h0OiAwCiAgICAgICAgICAgIH07CiAgICAgICAgICAgIGltYWdlQXJyW2ltYWdlSW5kZXhdID0gaW1hZ2U7CiAgICAgICAgICAgIG9uQ29tcGxldGUoaW1hZ2UpOwogICAgICAgIH0KCiAgICB9IGVsc2UgewogICAgICAgIHZhciBpbWFnZSA9IHsKICAgICAgICAgICAgd2lkdGg6IDAsCiAgICAgICAgICAgIGhlaWdodDogMAogICAgICAgIH07CiAgICAgICAgaW1hZ2VBcnJbaW1hZ2VJbmRleF0gPSBpbWFnZTsKICAgICAgICBvbkNvbXBsZXRlKGltYWdlKTsKICAgIH0KCn0KCnZhciBiYXNlNjRCdWZmZXJUb0ltYWdlQml0TWFwTXVsdGkgPSBmdW5jdGlvbiAoYmFzZTY0QnVmZmVycywgbWltZVR5cGVzLCBkYXRhLCBvcHRpb25zLCBvbkNvbXBsZXRlKSB7CiAgICBsZXQgaW1hZ2VBcnIgPSBbXTsKICAgIGxldCBkb3duID0gMDsKICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFzZTY0QnVmZmVycy5sZW5ndGg7IGkrKykgewogICAgICAgIGNvbnN0IGJhc2U2NEJ1ZmZlciA9IGJhc2U2NEJ1ZmZlcnNbaV07CiAgICAgICAgYmFzZTY0QnVmZmVyVG9JbWFnZUJpdE1hcChiYXNlNjRCdWZmZXIsIG1pbWVUeXBlc1tpXSwgaW1hZ2VBcnIsIGksIG9wdGlvbnNbaV0sIGZ1bmN0aW9uICgpIHsKICAgICAgICAgICAgZG93bisrOwogICAgICAgICAgICBpZiAoZG93biA9PT0gYmFzZTY0QnVmZmVycy5sZW5ndGgpIHsKICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoaW1hZ2VBcnIsIGRhdGEpOwogICAgICAgICAgICB9CiAgICAgICAgfSk7CiAgICB9Cn0KCnZhciBiYXNlNjRCbG9ibFRvSW1hZ2VCaXRNYXBNdWx0aSA9IGZ1bmN0aW9uIChibG9icywgZGF0YSwgb3B0aW9ucywgb25Db21wbGV0ZSkgewogICAgbGV0IGltYWdlQXJyID0gW107CiAgICBsZXQgZG93biA9IDA7CiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsb2JzLmxlbmd0aDsgaSsrKSB7CiAgICAgICAgY29uc3QgYmxvYiA9IGJsb2JzW2ldOwogICAgICAgIGJhc2U2NEJsb2JUb0ltYWdlQml0TWFwKGJsb2IsIGltYWdlQXJyLCBpLCBvcHRpb25zW2ldLCBmdW5jdGlvbiAoKSB7CiAgICAgICAgICAgIGRvd24rKzsKICAgICAgICAgICAgaWYgKGRvd24gPT09IGJsb2JzLmxlbmd0aCkgewogICAgICAgICAgICAgICAgb25Db21wbGV0ZShpbWFnZUFyciwgZGF0YSk7CiAgICAgICAgICAgIH0KICAgICAgICB9KTsKICAgIH0KfQoKaWYgKHR5cGVvZiBzZWxmID09PSAidW5kZWZpbmVkIikgewogICAgLy9lc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8taW1wbGljaXQtZ2xvYmFscywgbm8tZ2xvYmFsLWFzc2lnbgogICAgc2VsZiA9IHt9Owp9Cgp2YXIgcG9zdE1lc3NhZ2UgPSBzZWxmLndlYmtpdFBvc3RNZXNzYWdlIHx8IHNlbGYucG9zdE1lc3NhZ2U7CgpzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkgewogICAgdmFyIGRhdGEgPSBldmVudC5kYXRhOwogICAgdmFyIHR5cGUgPSBkYXRhLnBhcmFtcy50eXBlOwogICAgdmFyIG9wdGlvbnMgPSBkYXRhLnBhcmFtcy5vcHRpb25zIHx8IFtdOwogICAgaWYgKHR5cGUgPT0gImJhc2U2NEJ1ZmZlclRvSW1hZ2VCaXRNYXAiKSB7CiAgICAgICAgYmFzZTY0QnVmZmVyVG9JbWFnZUJpdE1hcE11bHRpKGRhdGEucGFyYW1zLmJhc2U2NEJ1ZmZlcnMsIGRhdGEucGFyYW1zLm1pbWVUeXBlcywgZGF0YSwgb3B0aW9ucywgb25EZWNvZGVkKTsKICAgICAgICBkZWxldGUgZGF0YS5wYXJhbXMuYmFzZTY0QnVmZmVyczsKICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gImJhc2U2NEJsb2JUb0ltYWdlQml0TWFwIikgewogICAgICAgIGJhc2U2NEJsb2JsVG9JbWFnZUJpdE1hcE11bHRpKGRhdGEucGFyYW1zLmJsb2JzLCBkYXRhLCBvcHRpb25zLCBvbkRlY29kZWQpOwogICAgfQoKfTsKCmZ1bmN0aW9uIG9uRGVjb2RlZCAoaW1hZ2VBcnIsIGRhdGEpIHsKICAgIGxldCB0cmFuc2Zlck9ianMgPSBpbWFnZUFyci5maWx0ZXIoaW1nID0+IGltZy53aWR0aCk7CiAgICBwb3N0TWVzc2FnZSh7CiAgICAgICAgaWQ6IGRhdGEuaWQsCiAgICAgICAgZXJyb3I6IG51bGwsCiAgICAgICAgcmVzdWx0OiBpbWFnZUFycgogICAgfSwgdHJhbnNmZXJPYmpzKTsKfQ==';