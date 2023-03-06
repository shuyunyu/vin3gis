import { Matrix3, Matrix4 } from "three";
import { Cartesian2 } from "../cartesian/cartesian2";
import { Cartesian3 } from "../cartesian/cartesian3";
import { Cartesian4 } from "../cartesian/cartesian4";
import { ComponentDatatype } from "./component_data_type";

const ComponentsPerAttribute: Record<string, number> = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
};

const ClassPerType: Record<string, any> = {
    SCALAR: undefined,
    VEC2: Cartesian2,
    VEC3: Cartesian3,
    VEC4: Cartesian4,
    // MAT2: Mat2,
    MAT3: Matrix3,
    MAT4: Matrix4,
};

export function getBinaryAccessor (accessor: any) {
    let componentType = accessor.componentType;
    let componentDatatype: any;
    if (typeof componentType === "string") {
        componentDatatype = ComponentDatatype.fromName(componentType);
    } else {
        componentDatatype = componentType;
    }

    let componentsPerAttribute = ComponentsPerAttribute[accessor.type];
    let classType = ClassPerType[accessor.type];
    return {
        componentsPerAttribute: componentsPerAttribute,
        classType: classType,
        createArrayBufferView: function (buffer: any, byteOffset: number, length: number) {
            return ComponentDatatype.createArrayBufferView(
                componentDatatype,
                buffer,
                byteOffset,
                componentsPerAttribute * length
            );
        },
    };
}