import { Vector2 } from "three";

export class AnchorConstant {

    public static LeftTop = Object.freeze(new Vector2(0, 1));

    public static LeftCenter = Object.freeze(new Vector2(0, 0.5));

    public static LeftBottom = Object.freeze(new Vector2(0, 0));

    public static RightTop = Object.freeze(new Vector2(1, 1));

    public static RightCenter = Object.freeze(new Vector2(1, 0.5));

    public static RightBottom = Object.freeze(new Vector2(1, 0));

    public static CenterTop = Object.freeze(new Vector2(0.5, 1));

    public static Center = Object.freeze(new Vector2(0.5, 0.5));

    public static CenterBottom = Object.freeze(new Vector2(0.5, 0));

}