import { FrameRenderer } from "../../core/renderer/frame_renderer";
import { RequestScheduler } from "../../core/xhr/scheduler/request_scheduler";
import { DebugTools } from "../../tools/debug_tools";
import { RendererStats } from "../../tools/renderer_stats";
import { EarthScene } from "../core/scene/earth_scene";

/**
 * 地图状态监视器
 */
export class MapStatsMonitor {

    private _scene: EarthScene;

    private _items = [
        "SelectTileCount",
        "RendererTileCount",
        "XHRRequestCount"
    ];

    private _rendererStats: RendererStats;

    public constructor (renderer: FrameRenderer, scene: EarthScene) {
        this._scene = scene;
        this._rendererStats = DebugTools.getRendererStats(renderer);
        this._rendererStats.appendStatsItems(this._items);
    }

    public update () {
        this._rendererStats.setStatsItemVal(0, "" + this._scene.globleSurfaceManager.curFrameSelectTIleCount);
        this._rendererStats.setStatsItemVal(1, "" + this._scene.tileNodeRenderer.renderTileNodeCount);
        const curRequestCount = RequestScheduler.curRequestCount;
        this._rendererStats.setStatsItemVal(2, "<span " + (curRequestCount > RequestScheduler.maxConcurrency ? "style='color:red;'" : "") + ">" + curRequestCount + "<span>");
    }

}