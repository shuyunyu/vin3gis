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
        const size = Math.max(opt.width, opt.height) * 2;
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(opt.image, (size - opt.width) * opt.center.x, (size - opt.height) * opt.center.y, opt.width, opt.height);
        return canvas;
    }

}

export const billboardGeometryCanvasProvider = new BillboardGeometryCanvasProvider();