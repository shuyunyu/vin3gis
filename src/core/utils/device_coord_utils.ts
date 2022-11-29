import { ICartesian2Like } from "../../gis/@types/core/gis";
import { Cartesian2 } from "../../gis/core/cartesian/cartesian2";

/**
 * 设备坐标相关处理方法
 */
export class DeviceCoordUtils {

    /**
     * 将相对于html元素的坐标 转换为threejs中的NDC坐标
     *  参考: https://threejs.org/docs/index.html?q=ray#api/en/core/Raycaster.setFromCamera
     * @param coord 
     * @param out 
     */
    public coordToNDCCoord (coord: ICartesian2Like, domEle: HTMLElement, out?: Cartesian2) {
        out = out || new Cartesian2();
        out.x = (coord.x / domEle.clientWidth) * 2 - 1;
        out.y = - (coord.y / domEle.clientHeight) * 2 + 1;
        return out;
    }

}