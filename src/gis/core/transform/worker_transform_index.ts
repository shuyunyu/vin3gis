import * as worker_transform from "./worker_transform";

globalThis["transform_worker"] = worker_transform;

export * from "./worker_transform";