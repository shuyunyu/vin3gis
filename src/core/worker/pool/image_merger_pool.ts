import { ImageMerger } from "../image_merger";
import { WorkerPool } from "./worker_pool";

class ImageMergerPool extends WorkerPool<ImageMerger>{

    public constructor () {
        super(ImageMerger, 1);
    }

}

export const imageMergerPool = new ImageMergerPool();