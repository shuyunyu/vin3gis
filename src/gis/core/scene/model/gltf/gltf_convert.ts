import { Base64Utils } from "../../../../utils/base64_utils";

const gltfMimeTypes: Record<string, string[]> = {
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/ktx': ['ktx'],
    'image/ktx2': ['ktx2'],
    'image/webp': ['webp'],
    'image/vnd-ms.dds': ['dds'],
    'text/plain': ['glsl', 'vert', 'vs', 'frag', 'fs', 'txt'],
    'audio/wav': ['wav']
};

interface IUriData {
    mimeType: string;
    buffer: any;
}

export class GltfConvert {

    /**
     * 将glb二进制数据转换为gltf
     */
    public static convertGlbToGltf (sourceBuf: any, returnBinBuffer?: boolean) {
        let pass = this.checkGlbData(sourceBuf);
        if (!pass) return;
        const jsonBufSize = sourceBuf.readUInt32LE(12);
        const jsonString = sourceBuf.toString('utf8', 20, jsonBufSize + 20);

        const gltf = JSON.parse(jsonString);
        const binBuffer = sourceBuf.slice(jsonBufSize + 28);

        // data the represents the buffers that are neither images or shaders
        const bufferViewList: number[] = [];
        const bufferDataList: any = [];

        // go through all the buffer views and break out buffers as separate files
        if (gltf.bufferViews) {
            for (let bufferViewIndex = 0; bufferViewIndex < gltf.bufferViews.length; bufferViewIndex++) {
                const images = this.findImagesForBufferView(gltf, bufferViewIndex);
                if (images.length > 0) {
                    this.writeImageBuf(gltf, images, bufferViewIndex, binBuffer, returnBinBuffer);
                    continue;
                }

                const shaders = this.findShadersForBufferView(gltf, bufferViewIndex);
                if (shaders.length > 0) {
                    this.writeShaderBuf(gltf, shaders, bufferViewIndex, binBuffer, returnBinBuffer);
                    continue;
                }

                const buffers = this.findExtensionBuffers(gltf, bufferViewIndex);
                if (buffers.length > 0) {
                    this.writeExtensionBuffer(gltf, buffers, bufferViewIndex, binBuffer, returnBinBuffer);
                    continue;
                }

                this.addToBinaryBuf(gltf, bufferViewIndex, binBuffer, bufferViewList, bufferDataList);
            }
        }
        // create a file for the rest of the buffer data
        const newBufferView = [];
        let currentOffset = 0;
        for (let i = 0; i < bufferViewList.length; i++) {
            const view = gltf.bufferViews[bufferViewList[i]];
            const length: number = bufferDataList[i].length;
            view.buffer = 0;
            view.byteOffset = currentOffset;
            view.byteLength = length;
            newBufferView.push(view);
            currentOffset += length;
        }
        gltf.bufferViews = newBufferView;

        // Renumber existing bufferView references.
        // No need to check gltf.images*.bufferView since images were broken out above.
        if (gltf.accessors) {
            for (const accessor of gltf.accessors) {
                if (accessor.bufferView !== undefined) {
                    accessor.bufferView = this.getNewBufferViewIndex(accessor.bufferView, bufferViewList);
                }
                if (accessor.sparse) {
                    if (accessor.sparse.indices && accessor.sparse.indices.bufferView !== undefined) {
                        accessor.sparse.indices.bufferView = this.getNewBufferViewIndex(accessor.sparse.indices.bufferView, bufferViewList);
                    }
                    if (accessor.sparse.values && accessor.sparse.values.bufferView !== undefined) {
                        accessor.sparse.values.bufferView = this.getNewBufferViewIndex(accessor.sparse.values.bufferView, bufferViewList);
                    }
                }
            }
        }

        if (gltf.meshes) {
            for (const mesh of gltf.meshes) {
                for (const primitive of mesh.primitives) {
                    if (primitive.extensions && primitive.extensions.KHR_draco_mesh_compression) {
                        primitive.extensions.KHR_draco_mesh_compression.bufferView = this.getNewBufferViewIndex(primitive.extensions.KHR_draco_mesh_compression.bufferView, bufferViewList);
                    }
                }
            }
        }
        if (gltf.nodes && gltf.meshes && gltf.nodes.length === gltf.meshes.length) {
            for (const node of gltf.nodes) {
                let meshIndex = node.mesh;
                let mesh = gltf.meshes[meshIndex];
                node.name = mesh.name;
            }
        }
        //@ts-ignore
        const finalBuffer = buffer.Buffer.concat(bufferDataList);
        gltf.buffers = [{
            uri: returnBinBuffer ? finalBuffer : "data:application/octet-stream;base64," + Base64Utils.encodeArrayBufferToBase64(finalBuffer),
            byteLength: finalBuffer.length
        }];

        return gltf;
    }

    private static getNewBufferViewIndex (oldIndex: number, bufferViewList: any) {
        const newIndex = bufferViewList.indexOf(oldIndex);
        if (newIndex < 0) {
            throw new Error('Problem mapping bufferView indices.');
        }
        return newIndex;
    }

    private static isBase64 (uri: string): boolean {
        return uri.length < 5 ? false : uri.substr(0, 5) === 'data:';
    }

    private static decodeBase64 (uri: string): any {
        //@ts-ignore
        return buffer.Buffer.from(uri.split(',')[1], 'base64');
    }

    private static alignedLength (value: number): number {
        const alignValue = 4;
        if (value == 0) {
            return value;
        }

        const multiple = value % alignValue;
        if (multiple === 0) {
            return value;
        }

        return value + (alignValue - multiple);
    }

    private static guessMimeType (filename: string): string {
        for (const mimeType in gltfMimeTypes) {
            for (const extensionIndex in gltfMimeTypes[mimeType]) {
                const extension = gltfMimeTypes[mimeType][extensionIndex];
                if (filename.toLowerCase().endsWith('.' + extension)) {
                    return mimeType;
                }
            }
        }
        return 'application/octet-stream';
    }

    private static dataFromUri (buffer: any): IUriData | null {
        if (buffer.uri == null) {
            return null;
        }
        if (this.isBase64(buffer.uri)) {
            const mimeTypePos = buffer.uri.indexOf(';');
            if (mimeTypePos > 0) {
                const mimeType = buffer.uri.substring(5, mimeTypePos);
                return { mimeType: mimeType, buffer: this.decodeBase64(buffer.uri) };
            } else {
                return null;
            }
        }
        else {
            // const fullUri = decodeURI(Url.resolve(basePath, buffer.uri));
            // const mimeType = this.guessMimeType(fullUri);
            // return { mimeType: mimeType, buffer: fs.readFileSync(fullUri) };
            return null;
        }
    }

    private static getBuffer (glTF: any, bufferIndex: number, binBuffer: any = null): any {
        const gltfBuffer = glTF.buffers[bufferIndex];
        const data = this.dataFromUri(gltfBuffer);
        if (data != null) {
            return data.buffer;
        }
        else {
            return binBuffer;
        }
    }

    private static findShadersForBufferView (gltf: any, bufferViewIndex: number): Array<any> {
        if (gltf.shaders && gltf.shaders instanceof Array) {
            return gltf.shaders.filter((s: any) => s.bufferView === bufferViewIndex);
        }
        return [];
    }

    // writes to the filesystem shader data from the parameters
    private static writeShaderBuf (gltf: any, shaders: Array<any>, bufferViewIndex: number, binBuffer: any, returnBinBuffer?: boolean) {
        const view = gltf.bufferViews[bufferViewIndex];
        const offset: number = view.byteOffset === undefined ? 0 : view.byteOffset;
        const length: number = view.byteLength;
        let extension = '.glsl';
        const GL_VERTEX_SHADER_ARB = 0x8B31;
        const GL_FRAGMENT_SHADER_ARB = 0x8B30;
        const firstReference = shaders[0];
        if (firstReference.type == GL_VERTEX_SHADER_ARB) {
            extension = '.vert';
        } else if (firstReference.type == GL_FRAGMENT_SHADER_ARB) {
            extension = '.frag';
        }

        const buf = this.getBuffer(gltf, view.buffer, binBuffer);
        if (buf === null) {
            throw new Error('Content of bufferId ' + view.bufferId + ' not found.');
        }

        shaders.forEach(shader => {
            delete shader.bufferView;
            delete shader.mimeType;
            let buffer = buf.slice(offset, offset + length);
            shader.uri = returnBinBuffer ? buffer : Base64Utils.encodeArrayBufferToBase64(buffer)
        });
    }

    private static findExtensionBuffers (gltf: any, bufferViewIndex: number): { 'buffer': any, 'name': string }[] {
        const buffers = [];
        if (gltf.extensions) {
            for (const extensionName in gltf.extensions) {
                const extension = gltf.extensions[extensionName];
                for (const extensionPropertyName in extension) {
                    const extensionProperty = extension[extensionPropertyName];
                    if (extensionProperty instanceof Array) {
                        const bufferName = extensionName + '_' + extensionPropertyName;
                        const curBuffers = extensionProperty.filter((b: any) => b.bufferView === bufferViewIndex);
                        for (const buffer in curBuffers) {
                            buffers.push({ 'buffer': curBuffers[buffer], 'name': bufferName });
                        }
                    }
                }
            }
        }
        return buffers;
    }

    private static writeExtensionBuffer (gltf: any, buffers: { 'buffer': any, 'name': string }[], bufferViewIndex: number, binBuffer: any, returnBuffer?: boolean) {
        const view = gltf.bufferViews[bufferViewIndex];
        const offset: number = view.byteOffset === undefined ? 0 : view.byteOffset;
        const length: number = view.byteLength;
        const buf = this.getBuffer(gltf, view.buffer, binBuffer);
        if (buf === null) {
            throw new Error('Content of bufferId ' + view.bufferId + ' not found.');
        }

        buffers.forEach(buffer => {
            delete buffer.buffer.bufferView;
            delete buffer.buffer.mimeType;
            let b = buf.slice(offset, offset + length);
            buffer.buffer.uri = returnBuffer ? b : Base64Utils.encodeArrayBufferToBase64(b);
        });
    }

    private static addToBinaryBuf (gltf: any, bufferViewIndex: number, binBuffer: any, bufferViewList: number[], bufferDataList: any) {
        const view = gltf.bufferViews[bufferViewIndex];
        const offset: number = view.byteOffset === undefined ? 0 : view.byteOffset;
        const length: number = view.byteLength;
        const aLength = this.alignedLength(length);
        let bufPart: any;
        const buf = this.getBuffer(gltf, view.buffer, binBuffer);
        if (buf === null) {
            throw new Error('Content of bufferId ' + view.bufferId + ' not found.');
        }
        if (length == aLength) {
            bufPart = buf.slice(offset, offset + length);
        } else {
            //@ts-ignore
            bufPart = buffer.Buffer.alloc(aLength, buf.slice(offset, offset + length));
        }

        bufferViewList.push(bufferViewIndex);
        bufferDataList.push(bufPart);
    }

    /**
     * returns any image objects for the given bufferView index if the buffer view is an image
     */
    public static findImagesForBufferView (gltf: any, bufferViewIndex: number): Array<any> {
        if (gltf.images !== undefined && gltf.images instanceof Array) {
            return gltf.images.filter((i: any) => i.bufferView === bufferViewIndex);
        }
        return [];
    }

    public static writeImageBuf (gltf: any, images: Array<any>, bufferViewIndex: number, binBuffer: any, returnBuffer?: boolean) {
        const view = gltf.bufferViews[bufferViewIndex];
        const offset: number = view.byteOffset === undefined ? 0 : view.byteOffset;
        const length: number = view.byteLength;
        const buf = this.getBuffer(gltf, view.buffer, binBuffer);
        if (buf === null) {
            throw new Error('Content of bufferId ' + view.bufferId + ' not found.');
        }
        images.forEach(image => {
            let b = buf.slice(offset, offset + length);
            image.uri = returnBuffer ? {
                buffer: b,
                mimeType: image.mimeType
            } : 'data:' + image.mimeType + ';base64,' + Base64Utils.encodeArrayBufferToBase64(b);
            delete image.bufferView;
            delete image.mimeType;
        });
    }

    /**
     * 检验glb数据
     */
    private static checkGlbData (sourceBuf: any) {
        let pass = true;
        const Binary = {
            Magic: 0x46546C67
        };
        const readMagic = sourceBuf.readUInt32LE(0);
        if (readMagic !== Binary.Magic) {
            console.error('Source file does not appear to be a GLB (glTF Binary) model.');
            pass = false;
        } else {
            const readVersion = sourceBuf.readUInt32LE(4);
            if (readVersion !== 2) {
                console.error('Only GLB version 2 is supported for import. Detected version: ' + readVersion);
                pass = false;
            }
        }
        return pass;
    }

}
