import { Matrix4 } from "three";
import TransformWorker from "./transform_worker.js";
import { Earth3DTilesetGltfUpAxis } from "../../@types/core/earth_3dtileset.js";
import { CoordinateOffsetType } from "../../@types/core/gis.js";
import { BaseWorker } from "../../../core/worker/base_worker.js";
import { TaskProcessor } from "../../../core/worker/task_processor.js";

//把打包进去的THREE对象都替换掉
const transformWorkerStr = (TransformWorker as string).replace(/THREE/g, '{}')

type InputParams = {
    buffer: Float32Array;
    gltfUpAxis: Earth3DTilesetGltfUpAxis;
    transform: number[];
    coordinateOffsetType: CoordinateOffsetType;
}

type OutputParams = Float32Array;

/**
 * 重投影Worker
 */
export class ReprojectWorker extends BaseWorker {

    protected _taskProcessor: TaskProcessor<InputParams, OutputParams>;

    private _inited = false;

    public constructor () {
        super();
    }

    private init () {
        if (this._inited) return;
        this._inited = true;
        this._taskProcessor = new TaskProcessor(this.getWorkerScript());
    }

    private getWorkerScript () {
        const fn = ProjectFunc.toString();
        let body = [
            '/* transform */',
            transformWorkerStr,
            '',
            '/* worker */',
            fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
        ].join('\n');
        return body;
    }

    //重投影mesh
    public project (data: Float32Array, transform: Matrix4, gltfUpAxis: Earth3DTilesetGltfUpAxis, coordinateOffsetType: CoordinateOffsetType) {
        this.init();
        return new Promise<Float32Array>((resolve, reject) => {
            this._taskProcessor.scheduleTask({
                buffer: data,
                transform: transform.toArray(),
                gltfUpAxis: gltfUpAxis,
                coordinateOffsetType: coordinateOffsetType
            }, [data.buffer]).then(out => {
                resolve(out);
            }).catch(err => {
                reject(err);
            });
        });
    }



}

/* WEB WORKER */

function ProjectFunc () {

    let decoderConfig;
    let decoderPending;

    onmessage = function (event) {
        const data = event.data;
        const params = event.data.params;
        // debugger

        handleMessage(data, params);

    };

    function handleMessage (data, params) {
        const buffer = params.buffer;
        const gltfUpAxis = params.gltfUpAxis;
        const coordinateOffsetType = params.coordinateOffsetType;
        const transformArr = params.transform;
    }


    /**
     * geometry重投影
     * @param geometry
     */
    function reprojectGeometry (buffer, gltfUpAxis, projection, coordinateOffsetType, transformArray) {
        //@ts-ignore
        const transform = transform_worker.fromArray(transformArray);
        //@ts-ignore
        let scratchCartesian_0 = new transform_worker.Cartesian3();
        //@ts-ignore
        let scratchCartesian_1 = new transform_worker.Cartesian3();
        for (let i = 0; i < buffer.length; i += 3) {
            const x = buffer[i];
            const y = buffer[i + 1];
            const z = buffer[i + 2];
            //@ts-ignore
            if (gltfUpAxis === transform_worker.gltfUpAxis.Z) {
                scratchCartesian_0.x = x;
                scratchCartesian_0.y = y;
                scratchCartesian_0.z = z;
                //@ts-ignore
                let projected_pos = transform_worker.worker_transfrom.projectRtcCartesian3(projection, coordinateOffsetType, transform, scratchCartesian_0, scratchCartesian_1);
                buffer[i] = projected_pos.x;
                buffer[i + 1] = projected_pos.y;
                buffer[i + 2] = projected_pos.z;
                //@ts-ignore
            } else if (gltfUpAxis === transform_worker.gltfUpAxis.Y) {
                scratchCartesian_0.x = x;
                scratchCartesian_0.y = z;
                scratchCartesian_0.z = y;
                //@ts-ignore
                let projected_pos = transform_worker.worker_transfrom.projectRtcCartesian3(projection, coordinateOffsetType, transform, scratchCartesian_0, scratchCartesian_1);
                buffer[i] = projected_pos.x;
                buffer[i + 1] = projected_pos.y;
                buffer[i + 2] = projected_pos.z;
            }
        }
        return buffer;
    }

}

export const reprojectWorker = new ReprojectWorker();