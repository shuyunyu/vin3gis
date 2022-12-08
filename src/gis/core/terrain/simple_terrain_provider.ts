import { WebMercatorTilingScheme } from "../tilingscheme/web_mercator_tiling_scheme";
import { BaseTerrainProvider } from "./base_terrain_provider";

/**
 * 简单地形提供者
 */
export class SimpleTerrainProvider extends BaseTerrainProvider {

    public constructor () {
        super(new WebMercatorTilingScheme());
    }

}