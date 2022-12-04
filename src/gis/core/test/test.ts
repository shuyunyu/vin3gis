import { BoxGeometry, Color, DataTexture, Mesh, MeshBasicMaterial } from "three";
import { Director, director } from "../../../core/director";
import { FrameRenderer } from "../../../core/renderer/frame_renderer";

export class GISTest {

    public static run (render: FrameRenderer) {
        return;
        const width = 512;
        const height = 512;

        const size = width * height;
        const data = new Uint8Array(4 * size);
        const color = new Color(0xffffff);

        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);

        for (let i = 0; i < size; i++) {

            const stride = i * 4;

            data[stride] = r;
            data[stride + 1] = g;
            data[stride + 2] = b;
            data[stride + 3] = 255;

        }

        // used the buffer to create a DataTexture

        const texture = new DataTexture(data, width, height);
        texture.needsUpdate = true;

        const w = 100000;
        const box = new BoxGeometry(w, w, w);
        const mtl = new MeshBasicMaterial({ map: texture });

        const mesh = new Mesh(box, mtl);

        render.scene.add(mesh);

        director.addEventListener(Director.EVENT_BEGIN_FRAME, () => {
            for (let i = 0; i < size; i++) {

                const stride = i * 4;
                const r = Math.random() * 255;
                const g = Math.random() * 255;
                const b = Math.random() * 255;
                data[stride] = r;
                data[stride + 1] = g;
                data[stride + 2] = b;
                data[stride + 3] = 255;
                texture.needsUpdate = true;

            }
        }, this);

    }

}