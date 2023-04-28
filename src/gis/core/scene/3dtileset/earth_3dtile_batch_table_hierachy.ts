import { Utils } from "../../../../core/utils/utils";
import { AttributeType } from "../../misc/attribute_type";
import { ComponentDatatype } from "../../misc/component_data_type";
import { getBinaryAccessor } from "../../misc/get_binary_accessor";

export class Earth3DTileBatchTableHierachy {

    public _classes = undefined;
    public _classIds = undefined;
    public _classIndexes = undefined;
    public _parentCounts = undefined;
    public _parentIndexes = undefined;
    public _parentIds = undefined;

    // Total memory used by the typed arrays
    public _byteLength = 0;

    public constructor (options: any) {

        initialize(this, options.extension, options.binaryBody);

        validateHierarchy(this);

    }

    /**
     * Returns whether the feature has this property.
     * @param batchId  the batch ID of the feature
     * @param propertyId  The case-sensitive ID of the property.
     * @returns 
     */
    public hasProperty (batchId: number, propertyId: string) {
        const result = traverseHierarchy(this, batchId, function (
            hierarchy,
            instanceIndex
        ) {
            const classId = hierarchy._classIds[instanceIndex];
            const instances = hierarchy._classes[classId].instances;
            if (Utils.defined(instances[propertyId])) {
                return true;
            }
        });
        return Utils.defined(result);
    }

    /**
     * Returns whether any feature has this property.
     * @param propertyId The case-sensitive ID of the property.
     * @returns 
     */
    public propertyExists (propertyId: string) {
        const classes = this._classes;
        const classesLength = classes.length;
        for (let i = 0; i < classesLength; ++i) {
            const instances = classes[i].instances;
            if (Utils.defined(instances[propertyId])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns an array of property IDs.
     * @param batchId the batch ID of the feature
     * @param results An array into which to store the results.
     * @returns 
     */
    public getPropertyIds (batchId: number, results?: string[]) {
        results = Utils.defined(results) ? results : [];
        results.length = 0;

        traverseHierarchy(this, batchId, function (hierarchy, instanceIndex) {
            const classId = hierarchy._classIds[instanceIndex];
            const instances = hierarchy._classes[classId].instances;
            for (const name in instances) {
                if (instances.hasOwnProperty(name)) {
                    if (results.indexOf(name) === -1) {
                        results.push(name);
                    }
                }
            }
        });

        return results;
    }

    /**
     * Returns a copy of the value of the property with the given ID.
     * @param batchId the batch ID of the feature
     * @param propertyId The case-sensitive ID of the property.
     * @returns {*} The value of the property or <code>undefined</code> if the feature does not have this property.
     */
    public getProperty (batchId: number, propertyId: string) {
        return traverseHierarchy(this, batchId, function (hierarchy, instanceIndex) {
            const classId = hierarchy._classIds[instanceIndex];
            const instanceClass = hierarchy._classes[classId];
            const indexInClass = hierarchy._classIndexes[instanceIndex];
            const propertyValues = instanceClass.instances[propertyId];
            if (Utils.defined(propertyValues)) {
                if (Utils.defined(propertyValues.typedArray)) {
                    return getBinaryProperty(propertyValues, indexInClass);
                }
                return Utils.clone(propertyValues[indexInClass], true);
            }
        });
    }

    /**
     * Sets the value of the property with the given ID. Only properties of the
     * instance may be set; parent properties may not be set.
     * @param batchId The batchId of the feature
     * @param propertyId The case-sensitive ID of the property.
     * @param value The value of the property that will be copied.
     * @returns 
     */
    public setProperty (batchId: number, propertyId: string, value: any) {
        const result = traverseHierarchy(this, batchId, function (
            hierarchy,
            instanceIndex
        ) {
            const classId = hierarchy._classIds[instanceIndex];
            const instanceClass = hierarchy._classes[classId];
            const indexInClass = hierarchy._classIndexes[instanceIndex];
            const propertyValues = instanceClass.instances[propertyId];
            if (Utils.defined(propertyValues)) {
                //>>includeStart('debug', pragmas.debug);
                if (instanceIndex !== batchId) {
                    throw new Error(
                        `Inherited property "${propertyId}" is read-only.`
                    );
                }
                //>>includeEnd('debug');
                if (Utils.defined(propertyValues.typedArray)) {
                    setBinaryProperty(propertyValues, indexInClass, value);
                } else {
                    propertyValues[indexInClass] = Utils.clone(value, true);
                }
                return true;
            }
        });
        return Utils.defined(result);
    }

    /**
     * Check if a feature belongs to a class with the given name
     * @param batchId 
     * @param className 
     * @returns 
     */
    public isClass (batchId: number, className: string) {
        // PERFORMANCE_IDEA : cache results in the ancestor classes to speed up this check if this area becomes a hotspot
        // PERFORMANCE_IDEA : treat class names as integers for faster comparisons
        const result = traverseHierarchy(this, batchId, function (
            hierarchy,
            instanceIndex
        ) {
            const classId = hierarchy._classIds[instanceIndex];
            const instanceClass = hierarchy._classes[classId];
            if (instanceClass.name === className) {
                return true;
            }
        });
        return Utils.defined(result);
    }

    /**
     * Get the name of the class a given feature belongs to
     * @param batchId 
     * @returns 
     */
    public getClassName = function (batchId: number) {
        const classId = this._classIds[batchId];
        const instanceClass = this._classes[classId];
        return instanceClass.name;
    }

}

function initialize (hierarchy: Earth3DTileBatchTableHierachy, hierarchyJson: any, binaryBody: Uint8Array) {
    let i;
    let classId;
    let binaryAccessor;

    const instancesLength = hierarchyJson.instancesLength;
    const classes = hierarchyJson.classes;
    let classIds = hierarchyJson.classIds;
    let parentCounts = hierarchyJson.parentCounts;
    let parentIds = hierarchyJson.parentIds;
    let parentIdsLength = instancesLength;
    let byteLength = 0;

    if (Utils.defined(classIds.byteOffset)) {
        classIds.componentType = Utils.defaultValue(
            classIds.componentType,
            ComponentDatatype.UNSIGNED_SHORT
        );
        classIds.type = AttributeType.SCALAR;
        binaryAccessor = getBinaryAccessor(classIds);
        classIds = binaryAccessor.createArrayBufferView(
            binaryBody.buffer,
            binaryBody.byteOffset + classIds.byteOffset,
            instancesLength
        );
        byteLength += classIds.byteLength;
    }

    let parentIndexes;
    if (Utils.defined(parentCounts)) {
        if (Utils.defined(parentCounts.byteOffset)) {
            parentCounts.componentType = Utils.defaultValue(
                parentCounts.componentType,
                ComponentDatatype.UNSIGNED_SHORT
            );
            parentCounts.type = AttributeType.SCALAR;
            binaryAccessor = getBinaryAccessor(parentCounts);
            parentCounts = binaryAccessor.createArrayBufferView(
                binaryBody.buffer,
                binaryBody.byteOffset + parentCounts.byteOffset,
                instancesLength
            );
            byteLength += parentCounts.byteLength;
        }
        parentIndexes = new Uint16Array(instancesLength);
        parentIdsLength = 0;
        for (i = 0; i < instancesLength; ++i) {
            parentIndexes[i] = parentIdsLength;
            parentIdsLength += parentCounts[i];
        }

        byteLength += parentIndexes.byteLength;
    }

    if (Utils.defined(parentIds) && Utils.defined(parentIds.byteOffset)) {
        parentIds.componentType = Utils.defaultValue(
            parentIds.componentType,
            ComponentDatatype.UNSIGNED_SHORT
        );
        parentIds.type = AttributeType.SCALAR;
        binaryAccessor = getBinaryAccessor(parentIds);
        parentIds = binaryAccessor.createArrayBufferView(
            binaryBody.buffer,
            binaryBody.byteOffset + parentIds.byteOffset,
            parentIdsLength
        );

        byteLength += parentIds.byteLength;
    }

    const classesLength = classes.length;
    for (i = 0; i < classesLength; ++i) {
        const classInstancesLength = classes[i].length;
        const properties = classes[i].instances;
        const binaryProperties = this.getBinaryProperties(
            classInstancesLength,
            properties,
            binaryBody
        );
        byteLength += this.countBinaryPropertyMemory(binaryProperties);
        classes[i].instances = Utils.combine(binaryProperties, properties);
    }

    const classCounts = new Array(classesLength).fill(0);
    const classIndexes = new Uint16Array(instancesLength);
    for (i = 0; i < instancesLength; ++i) {
        classId = classIds[i];
        classIndexes[i] = classCounts[classId];
        ++classCounts[classId];
    }
    byteLength += classIndexes.byteLength;

    hierarchy._classes = classes;
    hierarchy._classIds = classIds;
    hierarchy._classIndexes = classIndexes;
    hierarchy._parentCounts = parentCounts;
    hierarchy._parentIndexes = parentIndexes;
    hierarchy._parentIds = parentIds;
    hierarchy._byteLength = byteLength;
}

function getBinaryProperties (featuresLength: number, properties: any, binaryBody: Uint8Array) {
    let binaryProperties;
    for (const name in properties) {
        if (properties.hasOwnProperty(name)) {
            const property = properties[name];
            const byteOffset = property.byteOffset;
            if (Utils.defined(byteOffset)) {
                // This is a binary property
                const componentType = property.componentType;
                const type = property.type;
                if (!Utils.defined(componentType)) {
                    throw new Error("componentType is required.");
                }
                if (!Utils.defined(type)) {
                    throw new Error("type is required.");
                }
                if (!Utils.defined(binaryBody)) {
                    throw new Error(
                        `Property ${name} requires a batch table binary.`
                    );
                }

                const binaryAccessor = getBinaryAccessor(property);
                const componentCount = binaryAccessor.componentsPerAttribute;
                const classType = binaryAccessor.classType;
                const typedArray = binaryAccessor.createArrayBufferView(
                    binaryBody.buffer,
                    binaryBody.byteOffset + byteOffset,
                    featuresLength
                );

                if (!Utils.defined(binaryProperties)) {
                    binaryProperties = {};
                }

                // Store any information needed to access the binary data, including the typed array,
                // componentCount (e.g. a VEC4 would be 4), and the type used to pack and unpack (e.g. Cartesian4).
                binaryProperties[name] = {
                    typedArray: typedArray,
                    componentCount: componentCount,
                    type: classType,
                };
            }
        }
    }
    return binaryProperties;
}

function countBinaryPropertyMemory (binaryProperties: any) {
    let byteLength = 0;
    for (const name in binaryProperties) {
        if (binaryProperties.hasOwnProperty(name)) {
            byteLength += binaryProperties[name].typedArray.byteLength;
        }
    }
    return byteLength;
}

const scratchValidateStack = [];

function validateHierarchy (hierarchy: Earth3DTileBatchTableHierachy) {
    const stack = scratchValidateStack;
    stack.length = 0;

    const classIds = hierarchy._classIds;
    const instancesLength = classIds.length;

    for (let i = 0; i < instancesLength; ++i) {
        this.validateInstance(hierarchy, i, stack);
    }
}

function validateInstance (hierarchy, instanceIndex, stack) {
    const parentCounts = hierarchy._parentCounts;
    const parentIds = hierarchy._parentIds;
    const parentIndexes = hierarchy._parentIndexes;
    const classIds = hierarchy._classIds;
    const instancesLength = classIds.length;

    if (!Utils.defined(parentIds)) {
        // No need to validate if there are no parents
        return;
    }

    if (instanceIndex >= instancesLength) {
        throw new Error(
            `Parent index ${instanceIndex} exceeds the total number of instances: ${instancesLength}`
        );
    }
    if (stack.indexOf(instanceIndex) > -1) {
        throw new Error(
            "Circular dependency detected in the batch table hierarchy."
        );
    }

    stack.push(instanceIndex);
    const parentCount = Utils.defined(parentCounts) ? parentCounts[instanceIndex] : 1;
    const parentIndex = Utils.defined(parentCounts)
        ? parentIndexes[instanceIndex]
        : instanceIndex;
    for (let i = 0; i < parentCount; ++i) {
        const parentId = parentIds[parentIndex + i];
        // Stop the traversal when the instance has no parent (its parentId equals itself), else continue the traversal.
        if (parentId !== instanceIndex) {
            this.validateInstance(hierarchy, parentId, stack);
        }
    }
    stack.pop(instanceIndex);
}


// The size of this array equals the maximum instance count among all loaded tiles, which has the potential to be large.
const scratchVisited = [];
const scratchStack = [];
let marker = 0;
function traverseHierarchyMultipleParents (
    hierarchy,
    instanceIndex,
    endConditionCallback
) {
    const classIds = hierarchy._classIds;
    const parentCounts = hierarchy._parentCounts;
    const parentIds = hierarchy._parentIds;
    const parentIndexes = hierarchy._parentIndexes;
    const instancesLength = classIds.length;

    // Ignore instances that have already been visited. This occurs in diamond inheritance situations.
    // Use a marker value to indicate that an instance has been visited, which increments with each run.
    // This is more efficient than clearing the visited array every time.
    const visited = scratchVisited;
    visited.length = Math.max(visited.length, instancesLength);
    const visitedMarker = ++marker;

    const stack = scratchStack;
    stack.length = 0;
    stack.push(instanceIndex);

    while (stack.length > 0) {
        instanceIndex = stack.pop();
        if (visited[instanceIndex] === visitedMarker) {
            // This instance has already been visited, stop traversal
            continue;
        }
        visited[instanceIndex] = visitedMarker;
        const result = endConditionCallback(hierarchy, instanceIndex);
        if (Utils.defined(result)) {
            // The end condition was met, stop the traversal and return the result
            return result;
        }
        const parentCount = parentCounts[instanceIndex];
        const parentIndex = parentIndexes[instanceIndex];
        for (let i = 0; i < parentCount; ++i) {
            const parentId = parentIds[parentIndex + i];
            // Stop the traversal when the instance has no parent (its parentId equals itself)
            // else add the parent to the stack to continue the traversal.
            if (parentId !== instanceIndex) {
                stack.push(parentId);
            }
        }
    }
}

function traverseHierarchySingleParent (
    hierarchy,
    instanceIndex,
    endConditionCallback
) {
    let hasParent = true;
    while (hasParent) {
        const result = endConditionCallback(hierarchy, instanceIndex);
        if (Utils.defined(result)) {
            // The end condition was met, stop the traversal and return the result
            return result;
        }
        const parentId = hierarchy._parentIds[instanceIndex];
        hasParent = parentId !== instanceIndex;
        instanceIndex = parentId;
    }
}

function traverseHierarchy (hierarchy, instanceIndex, endConditionCallback) {
    // Traverse over the hierarchy and process each instance with the endConditionCallback.
    // When the endConditionCallback returns a value, the traversal stops and that value is returned.
    const parentCounts = hierarchy._parentCounts;
    const parentIds = hierarchy._parentIds;
    if (!Utils.defined(parentIds)) {
        return endConditionCallback(hierarchy, instanceIndex);
    } else if (Utils.defined(parentCounts)) {
        return traverseHierarchyMultipleParents(
            hierarchy,
            instanceIndex,
            endConditionCallback
        );
    }
    return traverseHierarchySingleParent(
        hierarchy,
        instanceIndex,
        endConditionCallback
    );
}

function getBinaryProperty (binaryProperty, index) {
    const typedArray = binaryProperty.typedArray;
    const componentCount = binaryProperty.componentCount;
    if (componentCount === 1) {
        return typedArray[index];
    }
    return binaryProperty.type.unpack(typedArray, index * componentCount);
}

function setBinaryProperty (binaryProperty, index, value) {
    const typedArray = binaryProperty.typedArray;
    const componentCount = binaryProperty.componentCount;
    if (componentCount === 1) {
        typedArray[index] = value;
    } else {
        binaryProperty.type.pack(value, typedArray, index * componentCount);
    }
}