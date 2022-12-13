import { DebugTools } from "../tools/debug_tools";
import { director } from "./director";
import { disposeSystem } from "./system/dispose_system";
import { eventSystem } from "./system/event_system";
import { interactionSystem } from "./system/interaction_system";
import { rendererSystem } from "./system/renderer_system";
import { requestSystem } from "./system/request_system";
import { tweenSystem } from "./system/tween_system";
import { RequestTask } from "./xhr/scheduler/request_task";

export class Engine {

    private static _inited = false;

    public static DEBUG = false;

    public static init () {
        if (this._inited) return;
        this._inited = true;
        if (this.DEBUG) {
            DebugTools.showStatsPanel();
        }
        RequestTask.DEBUG = this.DEBUG;
        director.registerSystem(rendererSystem);
        director.registerSystem(eventSystem);
        director.registerSystem(interactionSystem);
        director.registerSystem(tweenSystem);
        director.registerSystem(requestSystem);
        director.registerSystem(disposeSystem);
        director.init();
    }

}