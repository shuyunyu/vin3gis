import { director } from "../director";
import { interactionSystem } from "./interaction_system";
import { rendererSystem } from "./renderer_system";

export class Game {

    public static start () {
        director.registerSystem(rendererSystem);
        director.registerSystem(interactionSystem);
        director.init();
    }

}