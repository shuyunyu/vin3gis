import { BoxGeometry, Color, DataTexture, Mesh, MeshBasicMaterial } from "three";
import { AssetLoader } from "../../../core/asset/asset_loader";
import { Director, director } from "../../../core/director";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";
import { imageMerger } from "../../../core/worker/image_merger";
import { TaskProcessor } from "../../../core/worker/task_processor";
import { TransferTypedArrayTestScriptBase64 } from "../../../core/worker/transfer_typed_array_test";

export class GISTest {

    public static run (render: FrameRenderer) {
        // this.testWorker();
        // global.testImageMerger = () => this.testWorker();
        // this.testDataTexture(render);
    }

    private static testWorker () {
        // const url1 = "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=52&y=28&z=6";
        // const url2 = "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=53&y=28&z=6";
        // const url3 = "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=51&y=27&z=6";
        // const url4 = "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=54&y=27&z=6";

        // const urls = [url1, url2, url3, url4];
        // const promiseArr = urls.map(url => AssetLoader.requestImageBlob({ url: url }));
        // const opts: ImageBitmapOptions[] = urls.map(url => {
        //     return { imageOrientation: 'none' };
        // })
        // Promise.all(promiseArr).then(resArr => {
        //     const blobs = resArr.map(res => res.image);
        //     const start = performance.now();
        //     imageMerger.merge(blobs, 2, 2, 256, 256, opts).then(img => {
        //         console.log('merge images: ', performance.now() - start);
        //         const canvas = document.createElement('canvas');
        //         canvas.style.position = "absolute";
        //         canvas.style.right = "10px";
        //         canvas.style.bottom = "10px";
        //         canvas.style.zIndex = "10000";
        //         canvas.width = img.width;
        //         canvas.height = img.height;
        //         canvas.style.border = "1px solid"
        //         document.body.appendChild(canvas);
        //         canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        //     });
        // });
    }

    private static testDataTexture (render: FrameRenderer) {
        // const width = 512;
        // const height = 512;

        // const size = width * height;
        // const data = new Uint8Array(4 * size);
        // const color = new Color(0xffffff);

        // const r = Math.floor(color.r * 255);
        // const g = Math.floor(color.g * 255);
        // const b = Math.floor(color.b * 255);

        // for (let i = 0; i < size; i++) {

        //     const stride = i * 4;

        //     data[stride] = r;
        //     data[stride + 1] = g;
        //     data[stride + 2] = b;
        //     data[stride + 3] = 255;

        // }

        // // used the buffer to create a DataTexture

        // const texture = new DataTexture(data, width, height);
        // texture.needsUpdate = true;

        // const w = 100000;
        // const box = new BoxGeometry(w, w, w);
        // const mtl = new MeshBasicMaterial({ map: texture });

        // const mesh = new Mesh(box, mtl);

        // render.scene.add(mesh);

        // director.addEventListener(Director.EVENT_BEGIN_FRAME, () => {
        //     for (let i = 0; i < size; i++) {

        //         const stride = i * 4;
        //         const r = Math.random() * 255;
        //         const g = Math.random() * 255;
        //         const b = Math.random() * 255;
        //         data[stride] = r;
        //         data[stride + 1] = g;
        //         data[stride + 2] = b;
        //         data[stride + 3] = 255;
        //         texture.needsUpdate = true;

        //     }
        // }, this);
    }

}