import { Color, ColorSpace } from "three";


export class ColorUtils {

    /**
     * 转换成css hexStr(带有'#')
     * @param color 
     * @param colorSpace 
     * @returns 
     */
    public static toCSSHexString (color: Color, colorSpace?: ColorSpace) {
        return "#" + color.getHexString(colorSpace);
    }

    /**
     * 产生一个随机颜色
     * @returns 
     */
    public static randomColor () {
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();
        return new Color(r, g, b);
    }

}