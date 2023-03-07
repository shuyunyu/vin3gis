export class Earth3DTileContentType {

    /**
     * A Batched 3D Model. This is a binary format with
     */
    public static BATCHED_3D_MODEL: string = "b3dm";

    /**
     * An Instanced 3D Model. This is a binary format with magic number
     */
    public static INSTANCED_3D_MODEL: string = "i3dm";

    /**
     * A Composite model. This is a binary format with magic number
     */
    public static COMPOSITE: string = "cmpt";

    /**
     * A Point Cloud model. This is a binary format with magic number
     */
    public static POINT_CLOUD: string = "pnts";

    /**
     * Vector tiles. This is a binary format with magic number
     */
    public static VECTOR: string = "vctr";

    /**
     * Geometry tiles. This is a binary format with magic number
     */
    public static GEOMETRY: string = "geom";

    /**
     * A glTF model in JSON + external BIN form. This is treated as a JSON format.
     */
    public static GLTF: string = "gltf";

    /**
     * The binary form of a glTF file. 
     */
    public static GLTF_BINARY: string = "glb";

    public static IMPLICIT_SUBTREE: string = "subt";

    public static EXTERNAL_TILESET: string = "externalTileset";

    public static MULTIPLE_CONTENT: string = "multipleContent";

    /**
     * Check if a content is one of the supported binary formats. 
     * @param contentType 
     */
    public static isBinaryFormat (contentType: string) {
        switch (contentType) {
            case Earth3DTileContentType.BATCHED_3D_MODEL:
            case Earth3DTileContentType.INSTANCED_3D_MODEL:
            case Earth3DTileContentType.COMPOSITE:
            case Earth3DTileContentType.POINT_CLOUD:
            case Earth3DTileContentType.VECTOR:
            case Earth3DTileContentType.GEOMETRY:
            case Earth3DTileContentType.IMPLICIT_SUBTREE:
            case Earth3DTileContentType.GLTF_BINARY:
                return true;
            default:
                return false;
        }
    }

}