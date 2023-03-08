import { Matrix4 } from "three";
import { AssetDefines } from "../../../@types/core/asset/asset";
import { Utils } from "../../../core/utils/utils";
import { Earth3DTilesetGltfUpAxis } from "../../@types/core/earth_3dtileset";
import { CoordinateOffsetType } from "../../@types/core/gis";
import { IProjection } from "../projection/projection";
import { GltfConvert } from "../scene/model/gltf/gltf_convert";
const buffer = require('buffer/');

export class GltfLoader {

    private static prefixStr = 'data:application/octet-stream;base64,'

    /**
     * 加载gltf模型
     * @param projection 
     * @param transform 
     * @param coordinateOffsetType 
     * @param gltfUpAxis 
     * @param params 
     */
    public static load (projection: IProjection, transform: Matrix4, coordinateOffsetType: CoordinateOffsetType, gltfUpAxis: Earth3DTilesetGltfUpAxis, params: AssetDefines.LoadAssetParams) {
        if (params.url.endsWith("gltf")) {
            //json类型
            // GISResLoader.instance.loadRemoteJson(options.url, id, groupId, priority, (err: any, res: any) => {
            //     if (err) {
            //         let msg = `load gltf(${options.url}) resource failed: ${err}`;
            //         console.error(msg);
            //         onComplete?.call(null, msg, null);
            //     } else {
            //         this.loadByJson(projection, transform, coordinateOffsetType, gltfUpAxis, res, node, {}, onComplete);
            //     }
            // });
        } else {
            //二进制类型
            // GISResLoader.instance.loadRemoteArrayBuffer(options.url, id, groupId, priority, (err: any, res: any) => {
            //     if (err) {
            //         let msg = `load gltf(${options.url}) resource failed: ${err}`;
            //         console.error(msg);
            //         onComplete?.call(null, msg, null);
            //     } else {
            //         // @ts-ignore
            //         let resBuffer = new buffer.Buffer(res);
            //         this.loadByBinBuffer(projection, transform, coordinateOffsetType, gltfUpAxis, resBuffer, node, {}, onComplete);
            //     }
            // });
        }

    }

    /**
     * 通过Json加载 
     * @param json 
     * @param node 
     * @param onComplete 
     */
    public static loadByJson (projection: IProjection, transform: Matrix4, coordinateOffsetType: CoordinateOffsetType, gltfUpAxis: Earth3DTilesetGltfUpAxis, json: any) {
        this.handleGltfJson(json);
        let buffers = this.readGltfBuffer(json);
        // convertGltfToCCModel(projection, transform, coordinateOffsetType, gltfUpAxis, json, buffers, (error: any, ccmodel: any) => {
        //     if (error) {
        //         onComplete?.call(null, error, null);
        //     } else {
        //         this.creatCCModelNode(ccmodel, json, node, options, onComplete);
        //     }
        // });
    }

    /**
     * 通过二进制数据加载gltf
     * @param binBuffer 
     * @param node 
     * @param onComplete 
     */
    //@ts-ignore
    public static loadByBinBuffer (projection: IProjection, transform: Matrix4, coordinateOffsetType: CoordinateOffsetType, gltfUpAxis: Earth3DTilesetGltfUpAxis, binBuffer: any) {
        let jsonStr: any = GltfConvert.convertGlbToGltf(binBuffer, true);
        this.handleGltfJson(jsonStr);
        let buffers = this.readGltfBuffer(jsonStr);
        // convertGltfToCCModel(projection, transform, coordinateOffsetType, gltfUpAxis, jsonStr, buffers, (error: any, ccmodel: any) => {
        //     if (error) {
        //         onComplete?.call(null, error, null);
        //     } else {
        //         this.creatCCModelNode(ccmodel, jsonStr, node, options, onComplete);
        //     }
        // });
    }

    /**
     * 处理gltf json 移除一些b3dm中加入的数据
     */
    private static handleGltfJson (jsonStr: any) {
        if (Utils.defined(jsonStr) && Utils.defined(jsonStr.meshes) && jsonStr.meshes.length) {
            for (let i = 0; i < jsonStr.meshes.length; i++) {
                const mesh = jsonStr.meshes[i];
                if (mesh.primitives && mesh.primitives.length) {
                    for (let j = 0; j < mesh.primitives.length; j++) {
                        const p = mesh.primitives[j];
                        if (p.attributes) {
                            delete p.attributes._BATCHID;
                        }
                    }

                }
            }
        }
        return jsonStr;
    }


    /**
     * 读取 gltf的buffer内容
     * @param json 
     */
    // @ts-ignore
    private static readGltfBuffer (json: any): buffer.Buffer[] {
        // @ts-ignore
        let buffers: buffer.Buffer[] = [];
        if (json.buffers && json.buffers.length) {
            for (let i = 0; i < json.buffers.length; i++) {
                const bufferStr = json.buffers[i];
                if (Utils.defined(bufferStr.uri)) {
                    if (bufferStr.uri instanceof Uint8Array) {
                        //@ts-ignore
                        buffers.push(new buffer.Buffer(bufferStr.uri));
                    } else {
                        let content = bufferStr.uri.slice(this.prefixStr.length);
                        // @ts-ignore
                        buffers.push(buffer.Buffer.from(content, 'base64'));
                    }

                } else {
                    buffers.push(bufferStr.extras._pipeline.source);
                }

            }
        }
        return buffers;
    }

}