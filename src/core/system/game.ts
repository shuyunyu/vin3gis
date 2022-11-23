import { director } from "../director";
import { rendererSystem } from "./renderer_system";

export class Game {

    public static start () {
        director.registerSystem(rendererSystem);
        director.init();
    }

}