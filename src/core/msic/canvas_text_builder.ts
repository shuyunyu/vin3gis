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
    horizontalPadding?: number;
    verticalPadding?: number;
}

const fontHeightCache: Record<string, number> = {}

/**
 * Canvas绘制文字的构建者
 */
export class CanvasTextBuilder {

    public static buildTextCanvas (text: string, options?: CanvasTextOptions) {
        options = options || {};
        const font = options.font || '18px Arial';
        const fillStyle = options.fillStyle || '#000000';

        const shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0)';
        const shadowBlur = options.shadowBlur || 0;
        const shadowOffsetX = options.shadowOffsetX || 0;
        const shadowOffsetY = options.shadowOffsetY || 0;
        const lineHeight = options.lineHeight || 1;

        const backgroundColor = options.backgroundColor || 'transparent';
        const horizontalPadding = options.horizontalPadding || 0;
        const verticalPadding = options.verticalPadding || 0;

        const align = options.align || new Vector2();

        const antialias = Utils.defaultValue(options.antialias, true);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = font;

        const fontHeight = this.calcFontHeight(font);
        const lines = text.split('\n');
        const textWidth = Math.max.apply(null, lines.map(line => ctx.measureText(line).width));
        const textHeight = fontHeight + fontHeight * lineHeight * (lines.length - 1);

        const canvasWidth = Math.max(2, MathUtils.ceilPowerOfTwo(textWidth + (2 * horizontalPadding)));
        const canvasHeight = Math.max(2, MathUtils.ceilPowerOfTwo(textHeight + (2 * verticalPadding)));

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.font = font;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = backgroundColor;
        // ctx.fillRect(0, 0, textWidth + (2 * horizontalPadding), textHeight + (2 * verticalPadding));
        ctx.fillRect(0, 0, textWidth + (2 * horizontalPadding), textHeight + (2 * verticalPadding));
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
            ctx.fillText(line, x + horizontalPadding, (fontHeight * lineHeight * i) + verticalPadding + y);
        }

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