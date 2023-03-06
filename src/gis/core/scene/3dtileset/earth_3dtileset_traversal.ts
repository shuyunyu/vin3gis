import { Utils } from "../../../../core/utils/utils";
import { Earth3DTileOptimizationHint, Earth3DTileRefine } from "../../../@types/core/earth_3dtileset";
import { ManagedArray } from "../../misc/managed_array";
import { FrameState } from "../frame_state";
import { Earth3DTile } from "./earth_3dtile";
import { Earth3DTileset } from "./earth_3dtileset";

interface TraversalStack {
    stack: ManagedArray<Earth3DTile>;
    stackMaximumLength: number;
    ancestorStack?: ManagedArray<Earth3DTile>;
    ancestorStackMaximumLength?: number;
}

const traversal: TraversalStack = {
    stack: new ManagedArray(),
    stackMaximumLength: 0
}

const emptyTraversal: TraversalStack = {
    stack: new ManagedArray(),
    stackMaximumLength: 0
}

//后代遍历
const descendantTraversal: TraversalStack = {
    stack: new ManagedArray(),
    stackMaximumLength: 0
}

//祖先遍历
const selectionTraversal: TraversalStack = {
    stack: new ManagedArray(),
    stackMaximumLength: 0,
    ancestorStack: new ManagedArray(),
    ancestorStackMaximumLength: 0
}

const descendantSelectionDepth = 2;

/**
 * 3dtileset遍历类
 */
export class Earth3DTilesetTraversal {

    constructor () {

    }

    /**
     * 选择tile
     * @param tileset 
     * @param frameState 
     */
    public selectTiles (tileset: Earth3DTileset, frameState: FrameState) {
        tileset.previousSelectedTiles.length = 0;
        tileset.selectedTiles.forEach(t => tileset.previousSelectedTiles.push(t));
        tileset.requestedTiles.length = 0;
        tileset.selectedTiles.length = 0;
        tileset.selectedTilesToStyle.length = 0;
        tileset.emptyTiles.length = 0;

        tileset.hasMixedContent = false;

        let root = tileset.root;
        this.updateTile(tileset, root, frameState);

        // The root tile is not visible
        if (!this.isVisible(root)) {
            return;
        }

        // The tileset doesn't meet the SSE requirement, therefore the tree does not need to be rendered
        if (root.getScreenSpaceError(frameState, true) <= tileset.maximumScreenSpaceError) {
            return;
        }

        if (!this.skipLevelOfDetail(tileset)) {
            this.executeBaseTraversal(tileset, root, frameState);
        } else if (tileset.immediatelyLoadDesiredLevelOfDetail) {
            this.executeSkipTraversal(tileset, root, frameState);
        } else {
            this.executeBaseAndSkipTraversal(tileset, root, frameState);
        }

        traversal.stack.trim(traversal.stackMaximumLength);
        emptyTraversal.stack.trim(emptyTraversal.stackMaximumLength);
        descendantTraversal.stack.trim(descendantTraversal.stackMaximumLength);
        selectionTraversal.stack.trim(selectionTraversal.stackMaximumLength);
        selectionTraversal.ancestorStack!.trim(selectionTraversal.ancestorStackMaximumLength);

        // Update the priority for any requests found during traversal
        // Update after traversal so that min and max values can be used to normalize priority values
        let requestedTiles = tileset.requestedTiles;
        let length = requestedTiles.length;
        for (let i = 0; i < length; ++i) {
            requestedTiles[i].updatePriority();
        }
    }


    /**
     * 判断可见性
     * @param tile 
     * @returns 
     */
    private isVisible (tile: Earth3DTile) {
        return tile.visible && tile.inRequestVolume;
    }

    /**
     * 更新瓦片
     * @param tileset 
     * @param tile 
     * @param frameState 
     */
    private updateTile (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        // Reset some of the tile's flags and re-evaluate visibility
        this.updateTileVisibility(tileset, tile, frameState);
        //Request priority
        tile.wasMinPriorityChild = false;
        tile.priorityHolder = tile;

        this.updateMinimumMaximumPriority(tileset, tile);

        // SkipLOD
        tile.shouldSelect = false;
        tile.finalResolution = true;
    }

    /**
     * 更新tile可见性
     * @param tileset 
     * @param tile 
     * @param frameState 
     * @returns 
     */
    private updateTileVisibility (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        this.updateVisibility(tileset, tile, frameState);

        if (!this.isVisible(tile)) {
            return;
        }

        let hasChildren = tile.children.length > 0;
        if ((tile.hasTilesetContent || tile.hasImplicitContent) && hasChildren) {
            // Use the root tile's visibility instead of this tile's visibility.
            // The root tile may be culled by the children bounds optimization in which
            // case this tile should also be culled.
            let child = tile.children[0];
            this.updateTileVisibility(tileset, child, frameState);
            tile.visible = child.visible;
        }

        if (this.meetsScreenSpaceErrorEarly(tileset, tile, frameState)) {
            tile.visible = false;
            return;
        }

        // Optimization - if none of the tile's children are visible then this tile isn't visible
        let replace = tile.refine === Earth3DTileRefine.REPLACE;
        let useOptimization = tile.optimChildrenWithinParent === Earth3DTileOptimizationHint.USE_OPTIMIZATION;
        if (replace && useOptimization && hasChildren) {
            if (!this.anyChildrenVisible(tileset, tile, frameState)) {
                tile.visible = false;
                return;
            }
        }
    }

    /**
     * 更新tile可见性
     * @param tileset 
     * @param tile 
     * @param frameState 
     * @returns 
     */
    private updateVisibility (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        if (tile.updatedVisibilityFrame === tileset.updatedVisibilityFrame) {
            // Return early if visibility has already been checked during the traversal.
            // The visibility may have already been checked if the cullWithChildrenBounds optimization is used.
            return;
        }
        tile.updateVisibility(frameState);
        tile.updatedVisibilityFrame = tileset.updatedVisibilityFrame;
    }

    /**
     * 判断tile 是否先 符合 了 屏幕空间误差
     * @param tileset 
     * @param tile 
     * @param frameState 
     * @returns 
     */
    private meetsScreenSpaceErrorEarly (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        let parent = tile.parent;
        if (!Utils.defined(parent) || parent!.hasTilesetContent || parent!.hasImplicitContent || parent!.refine !== Earth3DTileRefine.ADD) {
            return false;
        }
        // Use parent's geometric error with child's box to see if the tile already meet the SSE
        return (tile.getScreenSpaceError(frameState, true) <= tileset.maximumScreenSpaceError);
    }

    /**
     * 判断tile 是否有可见的子节点
     * @param tileset 
     * @param tile 
     * @param frameState 
     * @returns 
     */
    private anyChildrenVisible (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        let anyVisible = false;
        let children = tile.children;
        let length = children.length;
        for (let i = 0; i < length; ++i) {
            let child = children[i];
            this.updateVisibility(tileset, child, frameState);
            anyVisible = anyVisible || this.isVisible(child);
        }
        return anyVisible;
    }

    /**
     * 更新最小最大优先级
     * @param tileset 
     * @param tile 
     */
    private updateMinimumMaximumPriority (tileset: Earth3DTileset, tile: Earth3DTile) {
        tileset.maximumPriority.distance = Math.max(
            tile.priorityHolder.distanceToCamera,
            tileset.maximumPriority.distance
        );
        tileset.minimumPriority.distance = Math.min(
            tile.priorityHolder.distanceToCamera,
            tileset.minimumPriority.distance
        );
        tileset.maximumPriority.depth = Math.max(
            tile.depth,
            tileset.maximumPriority.depth
        );
        tileset.minimumPriority.depth = Math.min(
            tile.depth,
            tileset.minimumPriority.depth
        );
        tileset.maximumPriority.foveatedFactor = Math.max(
            tile.priorityHolder.foveatedFactor,
            tileset.maximumPriority.foveatedFactor
        );
        tileset.minimumPriority.foveatedFactor = Math.min(
            tile.priorityHolder.foveatedFactor,
            tileset.minimumPriority.foveatedFactor
        );
        tileset.maximumPriority.reverseScreenSpaceError = Math.max(
            tile.priorityReverseScreenSpaceError,
            tileset.maximumPriority.reverseScreenSpaceError
        );
        tileset.minimumPriority.reverseScreenSpaceError = Math.min(
            tile.priorityReverseScreenSpaceError,
            tileset.minimumPriority.reverseScreenSpaceError
        );
    }

    /**
     * 判断 是否跳过细节选择
     * @param tileset 
     * @returns 
     */
    private skipLevelOfDetail (tileset: Earth3DTileset) {
        return tileset.skipLevelOfDetail;
    }

    /**
     * 判断 tile 是否具有 空内容
     * @param tile 
     * @returns 
     */
    private hasEmptyContent (tile: Earth3DTile) {
        return (tile.hasEmptyContent || tile.hasTilesetContent || tile.hasImplicitContent);
    }

    /**
     * 判断tile是否有未加载的内容
     * @param tile 
     * @returns 
     */
    private hasUnloadedContent (tile: Earth3DTile) {
        return !this.hasEmptyContent(tile) && tile.contentUnloaded;
    }

    /**
     * 更新tile的祖先内容关系
     * @param tile 
     * @param frameState 
     */
    private updateTileAncestorContentLinks (tile: Earth3DTile, frameState: FrameState) {
        tile.ancestorWithContent = undefined;
        tile.ancestorWithContentAvailable = undefined;

        let parent = tile.parent;
        if (Utils.defined(parent)) {
            // ancestorWithContent is an ancestor that has content or has the potential to have
            // content. Used in conjunction with tileset.skipLevels to know when to skip a tile.
            // ancestorWithContentAvailable is an ancestor that is rendered if a desired tile is not loaded.
            let hasContent = !this.hasUnloadedContent(parent!) || parent!.requestedFrame === frameState.frameNumber;
            tile.ancestorWithContent = hasContent ? parent : parent!.ancestorWithContent;
            tile.ancestorWithContentAvailable = parent!.contentAvailable ? parent : parent!.ancestorWithContentAvailable;
        }

    }

    /**
     * 判断 是否在 基础遍历 之内
     * @param tileset 
     * @param tile 
     * @param baseScreenSpaceError 
     * @returns 
     */
    private inBaseTraversal (tileset: Earth3DTileset, tile: Earth3DTile, baseScreenSpaceError: number) {
        if (!this.skipLevelOfDetail(tileset)) {
            return true;
        }
        if (tileset.immediatelyLoadDesiredLevelOfDetail) {
            return false;
        }
        if (!Utils.defined(tile.ancestorWithContent)) {
            // Include root or near-root tiles in the base traversal so there is something to select up to
            return true;
        }
        if (tile.screenSpaceError === 0.0) {
            // If a leaf, use parent's SSE
            return tile.parent!.screenSpaceError > baseScreenSpaceError;
        }
        return tile.screenSpaceError > baseScreenSpaceError;
    }

    /**
     * 判断 是否可以遍历
     * @param tileset 
     * @param tile 
     */
    private canTraverse (tileset: Earth3DTileset, tile: Earth3DTile) {
        if (tile.children.length === 0) {
            return false;
        }
        if (tile.hasTilesetContent || tile.hasImplicitContent) {
            return true;
        }
        return tile.screenSpaceError > tileset.maximumScreenSpaceError;
    }

    /**
     * 子节点根据距离排序(距离降序)
     * @param a 
     * @param b 
     */
    private sortChildrenByDistanceToCamera (a: Earth3DTile, b: Earth3DTile) {
        // Sort by farthest child first since this is going on a stack
        if (b.distanceToCamera === 0 && a.distanceToCamera === 0) {
            return b.centerZDepth - a.centerZDepth;
        }

        return b.distanceToCamera - a.distanceToCamera;
    }

    /**
     * 更新并且Push子节点
     * @param tileset 
     * @param tile 
     * @param stack 
     * @param frameState 
     */
    private updateAndPushChildren (tileset: Earth3DTileset, tile: Earth3DTile, stack: ManagedArray<Earth3DTile>, frameState: FrameState) {
        let i;
        let replace = tile.refine === Earth3DTileRefine.REPLACE;
        let children = tile.children;
        let length = children.length;

        for (let i = 0; i < length; i++) {
            this.updateTile(tileset, children[i], frameState);
        }

        // Sort by distance to take advantage of early Z and reduce artifacts for skipLevelOfDetail
        children.sort(this.sortChildrenByDistanceToCamera);

        // For traditional replacement refinement only refine if all children are loaded.
        // Empty tiles are exempt since it looks better if children stream in as they are loaded to fill the empty space.
        let checkRefines = !this.skipLevelOfDetail(tileset) && replace && !this.hasEmptyContent(tile);
        let refines = true;

        let anyChildrenVisible = false;

        // Determining min child
        let minIndex = -1;
        let minimumPriority = Number.MAX_VALUE;

        let child;
        for (let i = 0; i < length; i++) {
            child = children[i];
            if (this.isVisible(child)) {
                stack.push(child);
                if (child.foveatedFactor < minimumPriority) {
                    minIndex = i;
                    minimumPriority = child.foveatedFactor;
                }
                anyChildrenVisible = true;
            } else if (checkRefines || tileset.loadSiblings) {
                // Keep non-visible children loaded since they are still needed before the parent can refine.
                // Or loadSiblings is true so always load tiles regardless of visibility.
                if (child.foveatedFactor < minimumPriority) {
                    minIndex = i;
                    minimumPriority = child.foveatedFactor;
                }
                this.loadTile(tileset, child, frameState);
                this.touchTile(tileset, child, frameState);
            }
            if (checkRefines) {
                let childRefines;
                if (!child.inRequestVolume) {
                    childRefines = false;
                } else if (this.hasEmptyContent(child)) {
                    childRefines = this.executeEmptyTraversal(tileset, child, frameState);
                } else {
                    childRefines = child.contentAvailable;
                }
                refines = refines && childRefines;
            }
        }

        if (!anyChildrenVisible) {
            refines = false;
        }

        if (minIndex !== -1 && !this.skipLevelOfDetail(tileset) && replace) {
            // An ancestor will hold the _foveatedFactor and _distanceToCamera for descendants between itself and its highest priority descendant. Siblings of a min children along the way use this ancestor as their priority holder as well.
            // Priority of all tiles that refer to the _foveatedFactor and _distanceToCamera stored in the common ancestor will be differentiated based on their _depth.
            let minPriorityChild = children[minIndex];
            minPriorityChild.wasMinPriorityChild = true;
            let priorityHolder =
                (tile.wasMinPriorityChild || tile === tileset.root) &&
                    minimumPriority <= tile.priorityHolder.foveatedFactor
                    ? tile.priorityHolder
                    : tile; // This is where priority dependency chains are wired up or started anew.
            priorityHolder.foveatedFactor = Math.min(
                minPriorityChild.foveatedFactor,
                priorityHolder.foveatedFactor
            );
            priorityHolder.distanceToCamera = Math.min(
                minPriorityChild.distanceToCamera,
                priorityHolder.distanceToCamera
            );

            for (i = 0; i < length; ++i) {
                child = children[i];
                child.priorityHolder = priorityHolder;
            }
        }
        return refines;
    }

    /**
     * 添加  空tile
     * @param tileset 
     * @param tile 
     */
    private addEmptyTile (tileset: Earth3DTileset, tile: Earth3DTile) {
        tileset.emptyTiles.push(tile);
    }

    /**
     * 判断 是否达到了 跳过的阈值
     * @param tileset 
     * @param tile 
     * @returns 
     */
    private reachedSkippingThreshold (tileset: Earth3DTileset, tile: Earth3DTile) {
        let ancestor = tile.ancestorWithContent;
        return (
            !tileset.immediatelyLoadDesiredLevelOfDetail &&
            (tile.priorityProgressiveResolutionScreenSpaceErrorLeaf ||
                (Utils.defined(ancestor) &&
                    tile.screenSpaceError <
                    ancestor!.screenSpaceError / tileset.skipScreenSpaceErrorFactor &&
                    tile.depth > ancestor!.depth + tileset.skipLevels))
        );
    }

    /**
     * 加载tile
     * @param tileset 
     * @param tile 
     * @param frameState 
     */
    private loadTile (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        if (tile.requestedFrame === frameState.frameNumber || (!this.hasUnloadedContent(tile) && !tile.contentExpired)) {
            return;
        }
        tile.requestedFrame = frameState.frameNumber;
        tileset.requestedTiles.push(tile);
    }

    private touchTile (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        if (tile.touchedFrame === frameState.frameNumber) {
            return;
        }
        tileset.cache.touch(tile);
        tile.touchedFrame = frameState.frameNumber;
    }

    private visitTile (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        tile.visitedFrame = frameState.frameNumber;
    }

    private selectTile (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        if (tile.contentVisibility(frameState)) {
            let tileContent = tile.content!;
            if (tileContent.featurePropertiesDirty) {
                // A feature's property in this tile changed, the tile needs to be re-styled.
                tileContent.featurePropertiesDirty = false;
                // Force applying the style to this tile
                tile.lastStyleTime = 0;
                tileset.selectedTilesToStyle.push(tile);
            } else if (tile.selectedFrame < frameState.frameNumber - 1) {
                // Tile is newly selected; it is selected this frame, but was not selected last frame.
                tileset.selectedTilesToStyle.push(tile);
            }
            tile.selectedFrame = frameState.frameNumber;
            tileset.selectedTiles.push(tile);
        }
    }

    /**
     * 选择后代瓦片
     * @param tileset 
     * @param tile 
     * @param frameState 
     */
    private selectDescendants (tileset: Earth3DTileset, root: Earth3DTile, frameState: FrameState) {
        var stack = descendantTraversal.stack;
        stack.push(root);
        while (stack.length > 0) {
            descendantTraversal.stackMaximumLength = Math.max(
                descendantTraversal.stackMaximumLength,
                stack.length
            );
            var tile = stack.pop()!;
            var children = tile.children;
            var childrenLength = children.length;
            for (var i = 0; i < childrenLength; ++i) {
                var child = children[i];
                if (this.isVisible(child)) {
                    if (child.contentAvailable) {
                        this.updateTile(tileset, child, frameState);
                        this.touchTile(tileset, child, frameState);
                        this.selectTile(tileset, child, frameState);
                    } else if (child.depth - root.depth < descendantSelectionDepth) {
                        // Continue traversing, but not too far
                        stack.push(child);
                    }
                }
            }
        }
    }

    /**
     * 选择 想要的 tile
     * @param tileset 
     * @param tile 
     * @param frameState 
     */
    private selectDesiredTile (tileset: Earth3DTileset, tile: Earth3DTile, frameState: FrameState) {
        if (!this.skipLevelOfDetail(tileset)) {
            if (tile.contentAvailable) {
                // The tile can be selected right away and does not require traverseAndSelect
                this.selectTile(tileset, tile, frameState);
            }
            return;
        }
        // If this tile is not loaded attempt to select its ancestor instead
        var loadedTile = tile.contentAvailable ? tile : tile.ancestorWithContentAvailable;
        if (Utils.defined(loadedTile)) {
            // Tiles will actually be selected in traverseAndSelect
            loadedTile!.shouldSelect = true;
        } else {
            // If no ancestors are ready traverse down and select tiles to minimize empty regions.
            // This happens often for immediatelyLoadDesiredLevelOfDetail where parent tiles are not necessarily loaded before zooming out.
            this.selectDescendants(tileset, tile, frameState);
        }
    }

    /**
     * 执行空遍历
     * @param tileset 
     * @param root 
     * @param frameState 
     */
    private executeEmptyTraversal (tileset: Earth3DTileset, root: Earth3DTile, frameState: FrameState) {
        // Depth-first traversal that checks if all nearest descendants with content are loaded. Ignores visibility.
        let allDescendantsLoaded = true;
        let stack = emptyTraversal.stack;
        stack.push(root);

        while (stack.length > 0) {
            emptyTraversal.stackMaximumLength = Math.max(
                emptyTraversal.stackMaximumLength,
                stack.length
            );

            let tile = stack.pop()!;
            let children = tile.children;
            let childrenLength = children.length;

            // Only traverse if the tile is empty - traversal stop at descendants with content
            let emptyContent = this.hasEmptyContent(tile);
            let traverse = emptyContent && this.canTraverse(tileset, tile);
            let emptyLeaf = emptyContent && tile.children.length === 0;

            // Traversal stops but the tile does not have content yet
            // There will be holes if the parent tries to refine to its children, so don't refine
            // One exception: a parent may refine even if one of its descendants is an empty leaf
            if (!traverse && !tile.contentAvailable && !emptyLeaf) {
                allDescendantsLoaded = false;
            }

            this.updateTile(tileset, tile, frameState);
            if (!this.isVisible(tile)) {
                // Load tiles that aren't visible since they are still needed for the parent to refine
                this.loadTile(tileset, tile, frameState);
                this.touchTile(tileset, tile, frameState);
            }

            if (traverse) {
                for (let i = 0; i < childrenLength; ++i) {
                    let child = children[i];
                    stack.push(child);
                }
            }
        }

        return allDescendantsLoaded;
    }

    /**
     * 执行 基本的遍历
     * @param tileset 
     * @param root 
     * @param frameState 
     */
    private executeBaseTraversal (tileset: Earth3DTileset, root: Earth3DTile, frameState: FrameState) {
        let baseScreenSpaceError = tileset.maximumScreenSpaceError;
        let maximumScreenSpaceError = tileset.maximumScreenSpaceError;
        this.executeTraversal(tileset, root, baseScreenSpaceError, maximumScreenSpaceError, frameState);
    }

    /**
     * 执行 跳跃遍历
     * @param tileset 
     * @param root 
     * @param frameState 
     */
    private executeSkipTraversal (tileset: Earth3DTileset, root: Earth3DTile, frameState: FrameState) {
        let baseScreenSpaceError = Number.MAX_VALUE;
        let maximumScreenSpaceError = tileset.maximumScreenSpaceError;
        this.executeTraversal(tileset, root, baseScreenSpaceError, maximumScreenSpaceError, frameState);
        this.traverseAndSelect(tileset, root, frameState);
    }

    /**
     * 执行 基础+跳跃遍历
     * @param tileset 
     * @param root 
     * @param frameState 
     */
    private executeBaseAndSkipTraversal (tileset: Earth3DTileset, root: Earth3DTile, frameState: FrameState) {
        var baseScreenSpaceError = Math.max(
            tileset.baseScreenSpaceError,
            tileset.maximumScreenSpaceError
        );
        var maximumScreenSpaceError = tileset.maximumScreenSpaceError;
        this.executeTraversal(tileset, root, baseScreenSpaceError, maximumScreenSpaceError, frameState
        );
        this.traverseAndSelect(tileset, root, frameState);
    }

    /**
     * 执行遍历
     * @param tileset 
     * @param root 
     * @param baseScreenSpaceError 
     * @param maximumScreenSpaceError 
     * @param frameState 
     */
    private executeTraversal (tileset: Earth3DTileset, root: Earth3DTile, baseScreenSpaceError: number, maximumScreenSpaceError: number, frameState: FrameState) {
        // Depth-first traversal that traverses all visible tiles and marks tiles for selection.
        // If skipLevelOfDetail is off then a tile does not refine until all children are loaded.
        // This is the traditional replacement refinement approach and is called the base traversal.
        // Tiles that have a greater screen space error than the base screen space error are part of the base traversal,
        // all other tiles are part of the skip traversal. The skip traversal allows for skipping levels of the tree
        // and rendering children and parent tiles simultaneously.
        let stack = traversal.stack;
        stack.push(root);

        while (stack.length > 0) {
            traversal.stackMaximumLength = Math.max(traversal.stackMaximumLength, stack.length);

            let tile = stack.pop()!;
            this.updateTileAncestorContentLinks(tile, frameState);
            let baseTraversal = this.inBaseTraversal(tileset, tile, baseScreenSpaceError);

            let add = tile.refine === Earth3DTileRefine.ADD;
            let replace = tile.refine === Earth3DTileRefine.REPLACE;
            let parent = tile.parent;
            let parentRefines = !Utils.defined(parent) || parent!.refines;
            let refines = false;

            if (this.canTraverse(tileset, tile)) {
                refines = this.updateAndPushChildren(tileset, tile, stack, frameState) && parentRefines;
            }

            let stoppedRefining = !refines && parentRefines;
            if (this.hasEmptyContent(tile)) {
                // Add empty tile just to show its debug bounding volume
                // If the tile has tileset content load the external tileset
                // If the tile cannot refine further select its nearest loaded ancestor
                this.addEmptyTile(tileset, tile);
                this.loadTile(tileset, tile, frameState);
                if (stoppedRefining) {
                    this.selectDesiredTile(tileset, tile, frameState);
                }
            } else if (add) {
                // Additive tiles are always loaded and selected
                this.selectDesiredTile(tileset, tile, frameState);
                this.loadTile(tileset, tile, frameState);
            } else if (replace) {
                if (baseTraversal) {
                    // Always load tiles in the base traversal
                    // Select tiles that can't refine further
                    this.loadTile(tileset, tile, frameState);
                    if (stoppedRefining) {
                        this.selectDesiredTile(tileset, tile, frameState);
                    }
                } else if (stoppedRefining) {
                    // In skip traversal, load and select tiles that can't refine further
                    this.selectDesiredTile(tileset, tile, frameState);
                    this.loadTile(tileset, tile, frameState);
                } else if (this.reachedSkippingThreshold(tileset, tile)) {
                    // In skip traversal, load tiles that aren't skipped. In practice roughly half the tiles stay unloaded.
                    this.loadTile(tileset, tile, frameState);
                }
            }
            this.visitTile(tileset, tile, frameState);
            this.touchTile(tileset, tile, frameState);
            tile.refines = refines;
        }
    }

    /**
     * 遍历 并且 选择 tile
     * @param tileset 
     * @param root 
     * @param frameState 
     */
    private traverseAndSelect (tileset: Earth3DTileset, root: Earth3DTile, frameState: FrameState) {
        let stack = selectionTraversal.stack;
        let ancestorStack = selectionTraversal.ancestorStack!;
        let lastAncestor;

        stack.push(root);

        while (stack.length > 0 || ancestorStack.length > 0) {
            selectionTraversal.stackMaximumLength = Math.max(
                selectionTraversal.stackMaximumLength,
                stack.length
            );
            selectionTraversal.ancestorStackMaximumLength = Math.max(
                selectionTraversal.ancestorStackMaximumLength!,
                ancestorStack.length
            );
            if (ancestorStack.length > 0) {
                let waitingTile = ancestorStack.peek();
                if (waitingTile.stackLength === stack.length) {
                    ancestorStack.pop();
                    if (waitingTile !== lastAncestor) {
                        waitingTile.finalResolution = false;
                    }
                    this.selectTile(tileset, waitingTile, frameState);
                    continue;
                }
            }

            let tile = stack.pop();
            if (!Utils.defined(tile)) {
                // stack is empty but ancestorStack isn't
                continue;
            }

            let add = tile!.refine === Earth3DTileRefine.ADD;
            let shouldSelect = tile!.shouldSelect;
            let children = tile!.children;
            let childrenLength = children.length;
            let traverse = this.canTraverse(tileset, tile!);

            if (shouldSelect) {
                if (add) {
                    this.selectTile(tileset, tile!, frameState);
                } else {
                    tile!.selectionDepth = ancestorStack.length;
                    if (tile!.selectionDepth > 0) {
                        tileset.hasMixedContent = true;
                    }
                    lastAncestor = tile;
                    if (!traverse) {
                        this.selectTile(tileset, tile!, frameState);
                        continue;
                    }
                    ancestorStack.push(tile!);
                    tile!.stackLength = stack.length;
                }
            }

            if (traverse) {
                for (let i = 0; i < childrenLength; ++i) {
                    let child = children[i];
                    if (this.isVisible(child)) {
                        stack.push(child);
                    }
                }
            }
        }

    }

}