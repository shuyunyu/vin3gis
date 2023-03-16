import { ImageDecoder } from "../image_decoder";
import { WorkerPool } from "./worker_pool";

class ImageDecoderPool extends WorkerPool<ImageDecoder>{

    public constructor () {
        super(ImageDecoder, 1);
    }

}

export const imageDecoderPool = new ImageDecoderPool();