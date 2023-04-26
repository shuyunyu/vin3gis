import { Matrix4, Mesh } from "three";
import TransformWorker from "./transform_worker.js";
import { CoordinateOffsetType } from "../../@types/core/gis";
import { BaseWorker } from "../../../core/worker/base_worker";
import { TaskProcessor } from "../../../core/worker/task_processor";

//把打包进去的THREE对象都替换掉
const transformWorkerStr = (TransformWorker as string).replace(/THREE/g, '{}');

type InputParams = {
    buffer: Float32Array;
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
    public project (data: Float32Array, transform: Matrix4, coordinateOffsetType: CoordinateOffsetType) {
        this.init();
        return new Promise<Float32Array>((resolve, reject) => {
            this._taskProcessor.scheduleTask({
                buffer: data,
                transform: transform.toArray(),
                coordinateOffsetType: coordinateOffsetType
            }, [data.buffer]).then(out => {
                resolve(out);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * 重投影mesh
     * @param mesh 
     */
    public projectMesh (mesh: Mesh, transform: Matrix4, coordinateOffsetType: CoordinateOffsetType) {
        return new Promise<Mesh>((resolve, reject) => {
            const geometry = mesh.geometry;
            if (!geometry) {
                resolve(mesh);
            } else {
                const positionAttr = geometry.getAttribute('position');
                const normalAttr = geometry.getAttribute('normal');
                const promiseList: Promise<Float32Array>[] = [];
                if (positionAttr) {
                    promiseList.push(this.project(positionAttr.array as Float32Array, transform, coordinateOffsetType))
                }
                if (normalAttr) {
                    promiseList.push(this.project(normalAttr.array as Float32Array, transform, coordinateOffsetType));
                }
                Promise.all(promiseList).then((res: Float32Array[]) => {
                    if (positionAttr) {
                        //@ts-ignore
                        positionAttr.array = res[0];
                    }
                    if (normalAttr) {
                        //@ts-ignore
                        normalAttr.array = res[1];
                    }
                    resolve(mesh);
                }).catch(err => {
                    resolve(mesh);
                });
            }
        });
    }

    public projectMeshes (meshes: Mesh[], transform: Matrix4, coordinateOffsetType: CoordinateOffsetType) {
        const promiseList = meshes.map(mesh => this.projectMesh(mesh, transform, coordinateOffsetType));
        return Promise.all(promiseList);
    }

}

/* WEB WORKER */

function ProjectFunc () {

    onmessage = function (event) {
        const data = event.data;
        const params = event.data.params;
        // debugger

        handleMessage(data, params);

    };

    function handleMessage (data, params) {
        // debugger;
        const buffer = params.buffer;
        const coordinateOffsetType = params.coordinateOffsetType;
        const transformArr = params.transform;
        //@ts-ignore
        const rpBuffer = reprojectGeometry(buffer, transform_worker.webMercatorProjection, coordinateOffsetType, transformArr);
        postMessage({
            id: data.id,
            error: null,
            result: params.buffer
            //@ts-ignore
        }, [rpBuffer.buffer])
    }


    /**
     * geometry重投影
     * @param geometry
     */
    function reprojectGeometry (buffer, projection, coordinateOffsetType, transformArray) {
        //@ts-ignore
        const transform = (new transform_worker.Matrix4()).fromArray(transformArray);
        //@ts-ignore
        let scratchCartesian_0 = new transform_worker.Cartesian3();
        //@ts-ignore
        let scratchCartesian_1 = new transform_worker.Cartesian3();
        for (let i = 0; i < buffer.length; i += 3) {
            const x = buffer[i];
            const y = buffer[i + 1];
            const z = buffer[i + 2];
            scratchCartesian_0.x = x;
            scratchCartesian_0.y = y;
            scratchCartesian_0.z = z;
            //@ts-ignore
            let projected_pos = transform_worker.WorkerTransform.projectRtcCartesian3(projection, coordinateOffsetType, transform, scratchCartesian_0, scratchCartesian_1);
            buffer[i] = projected_pos.x;
            buffer[i + 1] = projected_pos.y;
            buffer[i + 2] = projected_pos.z;
        }
        return buffer;
    }

}

export const reprojectWorker = new ReprojectWorker();