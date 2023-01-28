import { Color } from "three";
import { ColorUtils } from "../../../../core/utils/color_utils";

type PointGeometryCanvasCreateOptions = {
    canvasSize: number;
    size: number;
    color: Color;
    outline?: boolean;
    outlineSize?: number;
    outlineColor?: Color;
}

/**
 * 为PointGeometry提供Canvas的类
 */
class PointGeometryCanvasProvider {

    /**
     * 创建构建PointGeometry用的Canvas
     * @param opt 
     */
    public createCanvas (opt: PointGeometryCanvasCreateOptions) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.height = opt.canvasSize;
        let size = opt.canvasSize;
        if (opt.outline) {
            const totalSize = opt.size + opt.outlineSize;
            const innerFactor = opt.size / totalSize;
            size = opt.canvasSize * innerFactor;
        }
        const center = opt.canvasSize / 2;
        if (opt.outline) {
            ctx.beginPath();
            ctx.arc(center, center, opt.canvasSize / 2, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.fillStyle = ColorUtils.toCSSHexString(opt.outlineColor);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(center, center, size / 2, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = ColorUtils.toCSSHexString(opt.color);
        ctx.fill();
        return canvas;
    }

}

export const pointGeometryCanvasProvider = new PointGeometryCanvasProvider();