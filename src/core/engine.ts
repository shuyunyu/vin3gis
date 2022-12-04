import { director } from "./director";
import { eventSystem } from "./system/event_system";
import { interactionSystem } from "./system/interaction_system";
import { rendererSystem } from "./system/renderer_system";
import { requestSystem } from "./system/request_system";

export class Engine {

    private static _inited = false;

    public static init () {
        if (this._inited) return;
        this._inited = true;
        director.registerSystem(rendererSystem);
        director.registerSystem(eventSystem);
        director.registerSystem(interactionSystem);
        director.registerSystem(requestSystem);
        director.init();
    }

}