import { Utils } from "../../../core/utils/utils";
import { ITilingScheme } from "../tilingscheme/tiling_scheme";
import { TerrainData } from "./terrain_data";
import { ITerrainProvider } from "./terrain_provider";

export class BaseTerrainProvider implements ITerrainProvider {

    public readonly id: string;

    public readonly tilingScheme: ITilingScheme;

    private _levelZeroMaximumGeometricError: number;

    public constructor (tilingScheme: ITilingScheme) {
        this.id = Utils.createGuid();
        this.tilingScheme = tilingScheme;
        let width = this.tilingScheme.projection.rectangle.width;
        let tilesOfXAtZeroLevel = this.tilingScheme.getNumberOfXTilesAtLevel(0);
        this._levelZeroMaximumGeometricError = width / tilesOfXAtZeroLevel / this.tilingScheme.tileWidth;
    }

    public getLevelMaximumGeometricError (level: number): number {
        return this._levelZeroMaximumGeometricError! / (1 << level);
    }

    public getTileDataAvailable (x: any, y: any, level: any): boolean {
        return true;
    }

    public loadTileDataAvailability (x: any, y: any, level: any): Promise<void> {
        return new Promise<void>((resolve) => resolve());
    }

    public requestTileGeometry (x: any, y: any, level: any): Promise<TerrainData> {
        return new Promise<TerrainData>((resolve) => {
            resolve(new TerrainData());
        })
    }

}