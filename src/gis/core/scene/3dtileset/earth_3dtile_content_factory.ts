import { Batched3DModel3DTileContent } from "./batched_3dmodel_3dtile_content";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTileset } from "./earth_3dtileset";
import { EarthTileset3DTileContent } from "./earth_tileset_3dtile_content";
import { PointCloud3DTileContent } from "./pointcloud_3dtile_content";

/**
 * 3d tile content 工厂
 */
export const Earth3DTileContentFactory: Record<string, Function> = {

    b3dm: function (tileset: Earth3DTileset, tile: Earth3DTile, arrayBuffer: Uint8Array, byteOffset: number) {
        return new Batched3DModel3DTileContent(tileset, tile, arrayBuffer, byteOffset);
    },

    pnts: function (tileset: Earth3DTileset, tile: Earth3DTile, arrayBuffer: Uint8Array, byteOffset: number) {
        return new PointCloud3DTileContent(tileset, tile, arrayBuffer, byteOffset);
    },

    externalTileset: function (tileset: Earth3DTileset, tile: Earth3DTile, json: any) {
        return new EarthTileset3DTileContent(tileset, tile, json);
    }

}