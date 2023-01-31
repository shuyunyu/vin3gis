//Geometry属性相关的装饰器

import { BaseGeometry } from "../core/datasource/geometry/base_geometry"

/**
 * 触发Geometry重新渲染的属性
 * @returns 
 */
export const GeometryRerenderProperty = () => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (target instanceof BaseGeometry) {
            if (descriptor.set) {
                const oldSet = descriptor.set;
                descriptor.set = function (v: any) {
                    const _caller = this as BaseGeometry;
                    const preVal = _caller[propertyKey];
                    oldSet.apply(_caller, [v]);
                    _caller.rerenderByProp(propertyKey, preVal, v);
                }
            }
        }
    }
}

/**
 * 触发Geometry更新的属性
 * @returns 
 */
export const GeometryUpdateProperty = () => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (target instanceof BaseGeometry) {
            if (descriptor.set) {
                const oldSet = descriptor.set;
                descriptor.set = function (v: any) {
                    const _caller = this as BaseGeometry;
                    const preVal = _caller[propertyKey];
                    oldSet.apply(_caller, [v]);
                    _caller.updateByProp(propertyKey, preVal, v);
                }
            }
        }
    }
}