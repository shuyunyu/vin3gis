import { MathUtils } from "three";

class BIllboardGeometryCanvasProvider {

    public createCanvas (image: CanvasImageSource) {
        const width = Number(image.width);
        const height = Number(image.height);
        const w = MathUtils.ceilPowerOfTwo(width);
        const h = MathUtils.ceilPowerOfTwo(height);
        const size = Math.max(w, h);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        return canvas;
    }

}

export const billboardGeometryCanvasProvider = new BIllboardGeometryCanvasProvider();