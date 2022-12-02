import { director } from "./director";
import { eventSystem } from "./system/event_system";
import { interactionSystem } from "./system/interaction_system";
import { rendererSystem } from "./system/renderer_system";
import { requestSystem } from "./system/request_system";

export class Engine {

    public static init () {
        director.registerSystem(rendererSystem);
        director.registerSystem(eventSystem);
        director.registerSystem(interactionSystem);
        director.registerSystem(requestSystem);
        director.init();
    }

}