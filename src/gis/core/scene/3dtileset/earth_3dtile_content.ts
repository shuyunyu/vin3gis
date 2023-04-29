import { FrameState } from "../frame_state";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTileset } from "./earth_3dtileset";
import { Earth3DTileBatchTable } from "./earth_3dtile_batch_table";
import { Earth3DTileFeature } from "./earth_3dtile_feature";

export interface IEarth3DTileContent {

    tileset: Earth3DTileset;

    tile: Earth3DTile;

    featurePropertiesDirty: boolean;

    //content准备完毕的promise
    readyPromise: Promise<IEarth3DTileContent>;

    update (tileset: Earth3DTileset, frameState: FrameState): void;

    show (tileset: Earth3DTileset): void;

    hide (tileset: Earth3DTileset): void;

    destroy (): void;

    featuresLength: number;

    getFeature: (batchId: number) => Earth3DTileFeature;

    pointsLength: number;

    trianglesLength: number;

    geometryByteLength: number;

    texturesByteLength: number;

    batchTableByteLength: number;

    innerContents?: IEarth3DTileContent[];

    batchTable?: Earth3DTileBatchTable;

    hasProperty: (batchId: number, name: string) => boolean;
}
