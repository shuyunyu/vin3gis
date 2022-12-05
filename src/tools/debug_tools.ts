import { Director, director } from "../core/director";
import { FrameRenderer } from "../core/renderer/frame_renderer";
import { rendererSystem } from "../core/system/renderer_system";
import { RendererStats } from "./renderer_stats";
import { stats } from "./stats";

export class DebugTools {

    private static rendererStatsArr: RendererStats[] = [];

    /**
     * 显示状态栏面板
     * @param target 状态栏面板挂载的父级元素
     */
    public static showStatsPanel (target?: HTMLElement) {
        target = target || document.body;
        stats.enableTogglePanel = false;
        stats.showAllPanel();
        target.appendChild(stats.dom);
        rendererSystem.rendererTargetAddEvent.addEventListener(this.onRendererTargetAdd, this);
        rendererSystem.rendererTargetRemoveEvent.addEventListener(this.onRendererTargetRemove, this);
        director.addEventListener(Director.EVENT_BEGIN_FRAME, this.begineFrame, this);
        director.addEventListener(Director.EVENT_END_FRAME, this.endFrame, this);
    }

    public static onRendererTargetAdd (target: FrameRenderer) {
        const rs = this.rendererStatsArr.find(r => r.renderer === target);
        if (!rs) {
            this.rendererStatsArr.push(new RendererStats(target));
        }
    }

    public static onRendererTargetRemove (target: FrameRenderer) {
        const index = this.rendererStatsArr.findIndex(r => r.renderer === target);
        if (index > -1) {
            const rs = this.rendererStatsArr.splice(index, 1)[0];
            rs.dispose();
        }
    }

    private static begineFrame () {
        stats.begin();
        this.rendererStatsArr.forEach(rs => rs.begine());
    }

    private static endFrame () {
        stats.end();
        this.rendererStatsArr.forEach(rs => rs.end());
    }

}