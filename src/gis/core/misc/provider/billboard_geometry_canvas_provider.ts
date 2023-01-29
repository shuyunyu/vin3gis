
type BillboardGeometryCanvasOptions = {
    image: CanvasImageSource;
    width: number;
    height: number;
}

/**
 * 为BillboardGeometry提供Canvas的类
 */
class BillboardGeometryCanvasProvider {

    public createCanvas (opt: BillboardGeometryCanvasOptions) {
        const canvas = document.createElement('canvas');
        const size = Math.max(opt.width, opt.height);
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(opt.image, (size - opt.width) / 2, (size - opt.height) / 2, opt.width, opt.height);
        return canvas;
    }

}

export const billboardGeometryCanvasProvider = new BillboardGeometryCanvasProvider();