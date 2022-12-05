// // make sure self is defined so that the Dojo build can evaluate this file without crashing.
// if (typeof self === "undefined") {
//     //eslint-disable-next-line no-implicit-globals, no-global-assign
//     self = {};
// }

// self.onmessage = function (event) {
//     var array = event.data.array;
//     var postMessage = self.webkitPostMessage || self.postMessage;

//     try {
//         // transfer the test array back to the caller
//         postMessage(
//             {
//                 array: array,
//             },
//             [array.buffer]
//         );
//     } catch (e) {
//         postMessage({});
//     }
// };


export const TransferTypedArrayTestScriptBase64 = 'Ly8gbWFrZSBzdXJlIHNlbGYgaXMgZGVmaW5lZCBzbyB0aGF0IHRoZSBEb2pvIGJ1aWxkIGNhbiBldmFsdWF0ZSB0aGlzIGZpbGUgd2l0aG91dCBjcmFzaGluZy4KaWYgKHR5cGVvZiBzZWxmID09PSAidW5kZWZpbmVkIikgewogICAgLy9lc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8taW1wbGljaXQtZ2xvYmFscywgbm8tZ2xvYmFsLWFzc2lnbgogICAgc2VsZiA9IHt9Owp9CgpzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldmVudCkgewogICAgdmFyIGFycmF5ID0gZXZlbnQuZGF0YS5hcnJheTsKICAgIHZhciBwb3N0TWVzc2FnZSA9IHNlbGYud2Via2l0UG9zdE1lc3NhZ2UgfHwgc2VsZi5wb3N0TWVzc2FnZTsKCiAgICB0cnkgewogICAgICAgIC8vIHRyYW5zZmVyIHRoZSB0ZXN0IGFycmF5IGJhY2sgdG8gdGhlIGNhbGxlcgogICAgICAgIHBvc3RNZXNzYWdlKAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgICBhcnJheTogYXJyYXksCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgIFthcnJheS5idWZmZXJdCiAgICAgICAgKTsKICAgIH0gY2F0Y2ggKGUpIHsKICAgICAgICBwb3N0TWVzc2FnZSh7fSk7CiAgICB9Cn07Cg=='