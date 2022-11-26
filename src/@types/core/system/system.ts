export namespace SystemDefines {

    //系统优先级
    export enum Priority {
        LOW = 0,
        MEDIUM = 100,
        HIGH = 200,
        INTERACTION = 190,
        REQUEST = 150
    }

    //请求任务类型
    export enum RequestTaskeType {
        RASTER_TILE = "raster_tile",
        JSON = "json"
    }

}