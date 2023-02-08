import { MathUtils, Vector2 } from "three";
import { Utils } from "../utils/utils";

export type CanvasTextOptions = {
    font?: string;
    fillStyle?: string;
    align?: Vector2;
    antialias?: boolean;//抗锯齿
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    lineHeight?: number;
    backgroundColor?: string;
    pixelOffsetX?: number;
    pixelOffsetY?: number;
    outputSquare?: boolean; //是否输出正方形
    specSquareSize?: number;//指定的尺寸
}

export type CanvasTextBuildResult = {
    canvas: HTMLCanvasElement;
    textWidth: number;
    textHeight: number;
}

const fontHeightCache: Record<string, number> = {}

/**
 * Canvas绘制文字的构建者
 */
export class CanvasTextBuilder {

    public static buildTextCanvas (text: string, options?: CanvasTextOptions): CanvasTextBuildResult {
        options = options || {};

        const outputSquare = Utils.defaultValue(options.outputSquare, true);

        const font = options.font || '18px Arial';
        const fillStyle = options.fillStyle || '#000000';

        const shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0)';
        const shadowBlur = options.shadowBlur || 0;
        const shadowOffsetX = options.shadowOffsetX || 0;
        const shadowOffsetY = options.shadowOffsetY || 0;
        const lineHeight = options.lineHeight || 1.2;

        const backgroundColor = options.backgroundColor || 'transparent';
        const pixelOffsetX = options.pixelOffsetX || 0;
        const pixelOffestY = options.pixelOffsetY || 0;

        const align = options.align || new Vector2();

        const antialias = Utils.defaultValue(options.antialias, true);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = font;

        const fontHeight = this.calcFontHeight(font);
        const lines = text.split('\n');
        let textWidth = Math.max.apply(null, lines.map(line => ctx.measureText(line).width));
        let textHeight = fontHeight + fontHeight * lineHeight * (lines.length - 1);

        let canvasWidth = Math.max(2, MathUtils.ceilPowerOfTwo(textWidth + Math.abs(pixelOffsetX)));
        let canvasHeight = Math.max(2, MathUtils.ceilPowerOfTwo(textHeight + Math.abs(pixelOffestY)));

        if (outputSquare) {
            let max = Math.max(canvasWidth, canvasHeight);
            if (Utils.defined(options.specSquareSize)) {
                max = Math.max(max, options.specSquareSize);
            }
            canvasWidth = canvasHeight = max;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.font = font;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = backgroundColor;
        // ctx.fillRect(0, 0, textWidth + (2 * horizontalPadding), textHeight + (2 * verticalPadding));
        ctx.fillRect(pixelOffsetX > 0 ? pixelOffestY : 0, pixelOffestY > 0 ? pixelOffestY : 0, textWidth, textHeight);
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = fillStyle;
        if (align.x === 1) {
            ctx.textAlign = 'left';
        } else if (align.x === 0) {
            ctx.textAlign = 'center';
        } else {
            ctx.textAlign = 'right';
        }
        ctx.textBaseline = 'top';
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;

        const x = textWidth * (0.5 - align.x * 0.5);
        const y = 0.5 * ((fontHeight * lineHeight) - fontHeight);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            ctx.fillText(line, x + (pixelOffsetX > 0 ? pixelOffsetX : 0), (fontHeight * lineHeight * i) + (pixelOffestY > 0 ? pixelOffestY : 0) + y);
        }

        textWidth += Math.abs(pixelOffsetX);
        textHeight += Math.abs(pixelOffestY);

        return {
            canvas: canvas,
            textWidth: textWidth,
            textHeight: textHeight
        }

    }

    /**
     * 计算字体的高度
     * @param font 
     * @returns 
     */
    private static calcFontHeight (font: string) {
        const cache = fontHeightCache[font];
        if (Utils.defined(cache)) return cache;
        const div = document.createElement('div');
        const textEle = document.createTextNode('MEq');
        div.appendChild(textEle);
        div.setAttribute('style', `font:${font};position:absolute;top:0;left:0;opacity:0;`);
        document.body.appendChild(div);
        const height = div.offsetHeight;
        fontHeightCache[font] = height;
        document.body.removeChild(div);
        return height;
    }

}