import { director } from "./director";
import { interactionSystem } from "./system/interaction_system";
import { rendererSystem } from "./system/renderer_system";

export class Game {

    public static start () {
        director.registerSystem(rendererSystem);
        director.registerSystem(interactionSystem);
        director.init();
    }

}