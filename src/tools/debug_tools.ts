import { Director, director } from "../core/director";
import { stats } from "./stats";

export class DebugTools {

    /**
     * 显示状态栏面板
     * @param target 状态栏面板挂载的父级元素
     */
    public static showStatsPanel (target?: HTMLElement) {
        target = target || document.body;
        stats.enableTogglePanel = false;
        stats.showAllPanel();
        target.appendChild(stats.dom);
        director.addEventListener(Director.EVENT_BEGIN_FRAME, this.begineFrame, this);
        director.addEventListener(Director.EVENT_END_FRAME, this.endFrame, this);
    }

    private static begineFrame () {
        stats.begin();
    }

    private static endFrame () {
        stats.end();
    }

}