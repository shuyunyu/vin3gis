import { ICartesian2Like } from "../../../@types/core/gis";

type BillboardGeometryCanvasOptions = {
    image: CanvasImageSource;
    width: number;
    height: number;
    center: ICartesian2Like;
}

/**
 * 为BillboardGeometry提供Canvas的类
 */
class BillboardGeometryCanvasProvider {

    public createCanvas (opt: BillboardGeometryCanvasOptions) {
        const canvas = document.createElement('canvas');
        const w = opt.width;
        const h = opt.height;
        const d = Math.ceil(Math.sqrt(w * w + h * h)) * 2;
        canvas.width = canvas.height = d;
        const ctx = canvas.getContext('2d');
        const left = Math.floor((d - opt.width) / 2);
        const top = Math.floor((d - opt.height) / 2);
        ctx.drawImage(opt.image, left - (opt.center.x - 0.5) * opt.width, top + (opt.center.y - 0.5) * opt.height, opt.width, opt.height);

        // canvas.style.width = canvas.style.height = canvas.width + "px";
        // canvas.style.position = "absolute";
        // canvas.style.right = "10px";
        // canvas.style.bottom = "10px";
        // canvas.style.zIndex = "100";
        // canvas.style.border = "1px solid";
        // document.body.appendChild(canvas);

        return canvas;
    }

}

export const billboardGeometryCanvasProvider = new BillboardGeometryCanvasProvider();