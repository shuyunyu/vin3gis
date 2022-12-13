//@ts-nocheck
var base64BufferToImageBitMap = function (base64Buffer, mimeType, imageArr, imageIndex, options, onComplete) {
    var blob = new Blob([base64Buffer], {
        type: mimeType
    });
    createImageBitmap(blob, options || {}).then(img => {
        imageArr[imageIndex] = img;
        onComplete(img);
    });
}

var base64BlobToImageBitMap = function (blob, imageArr, imageIndex, options, onComplete) {
    if (blob) {
        try {
            createImageBitmap(blob, options || {}).then(img => {
                imageArr[imageIndex] = img;
                onComplete(img);
            });
        } catch (error) {
            console.error("create imageBitMap failed");
            var image = {
                width: 0,
                height: 0
            };
            imageArr[imageIndex] = image;
            onComplete(image);
        }

    } else {
        var image = {
            width: 0,
            height: 0
        };
        imageArr[imageIndex] = image;
        onComplete(image);
    }

}

var base64BufferToImageBitMapMulti = function (base64Buffers, mimeTypes, data, options, onComplete) {
    let imageArr = [];
    let down = 0;
    for (let i = 0; i < base64Buffers.length; i++) {
        const base64Buffer = base64Buffers[i];
        base64BufferToImageBitMap(base64Buffer, mimeTypes[i], imageArr, i, options[i], function () {
            down++;
            if (down === base64Buffers.length) {
                onComplete(imageArr, data);
            }
        });
    }
}

var base64BloblToImageBitMapMulti = function (blobs, data, options, onComplete) {
    let imageArr = [];
    let down = 0;
    for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        base64BlobToImageBitMap(blob, imageArr, i, options[i], function () {
            down++;
            if (down === blobs.length) {
                onComplete(imageArr, data);
            }
        });
    }
}

var postMessage = globalThis.webkitPostMessage || globalThis.postMessage;

globalThis.onmessage = function (event) {
    var data = event.data;
    var type = data.params.type;
    var options = data.params.options || [];
    if (type == "base64BufferToImageBitMap") {
        base64BufferToImageBitMapMulti(data.params.base64Buffers, data.params.mimeTypes, data, options, onDecoded);
        delete data.params.base64Buffers;
    } else if (type === "base64BlobToImageBitMap") {
        base64BloblToImageBitMapMulti(data.params.blobs, data, options, onDecoded);
    }

};

function onDecoded(imageArr, data) {
    let transferObjs = imageArr.filter(img => img.width);
    postMessage({
        id: data.id,
        error: null,
        result: imageArr
    }, transferObjs);
}

