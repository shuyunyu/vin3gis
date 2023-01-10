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

}