import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { TerrainData } from "./terrain_data";

/**
 * 地形提供者接口
 */
export interface ITerrainProvider {

    id: string;

    tilingScheme: ITilingScheme;

    //获取指定等级下的 最大几何误差
    getLevelMaximumGeometricError (level: number): number;

    //检查瓦片地形数据是否可用
    getTileDataAvailable (x, y, level): boolean | undefined;

    //加载瓦片地形数据
    loadTileDataAvailability (x, y, level): undefined | Promise<void>

    //请求瓦片几何体(地形数据)
    requestTileGeometry (x, y, level): Promise<TerrainData>;

}