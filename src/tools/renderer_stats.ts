import { FrameRenderer } from "../core/renderer/frame_renderer";
import { Utils } from "../core/utils/utils";

/**
 * 渲染状态
 */
export class RendererStats {

    public readonly renderer: FrameRenderer;

    private _ele: HTMLElement;

    //追加的项目
    private _appendItems: string[];

    private _appendItemEles: HTMLSpanElement[] = [];

    public constructor (renderer: FrameRenderer) {
        this.renderer = renderer;
        this.createEle();
        [
            "DrawCall",
            "Triangle",
            "Line",
            "Point",
            "GeometryCount",
            "GeometryMemory",
            "TextureCount"
        ].forEach(item => this.createItemEle(item));
    }

    /**
     * 最近要显示的状态项目
     * @param items 
     */
    public appendStatsItems (items: string[]) {
        this._appendItems = items;
        this._appendItems.forEach(item => {
            this._appendItemEles.push(this.createItemEle(item));
        });
    }

    /**
     * 设置追加的状态项的值
     * @param item 
     * @param val
     */
    public setStatsItemVal (item: string | number, val: string) {
        const index = typeof item === "number" ? item : this._appendItems.indexOf(item);
        if (index > -1) {
            this._appendItemEles[index].innerHTML = val;
        }
    }

    public begine () {

    }

    public end (dt: number) {
        const info = this.renderer.renderer.info;
        const drawcall = info.render.calls;
        const triangles = info.render.triangles;
        const lines = info.render.lines;
        const points = info.render.points;
        const geometries = info.memory.geometries;
        const geometryMemory = Utils.formatBytes(this.renderer.geometryMemory, 2);
        const textures = info.memory.textures;
        this._ele.children[0].children[1].innerHTML = "" + drawcall;
        this._ele.children[1].children[1].innerHTML = "" + triangles;
        this._ele.children[2].children[1].innerHTML = "" + lines;
        this._ele.children[3].children[1].innerHTML = "" + points;
        this._ele.children[4].children[1].innerHTML = "" + geometries;
        this._ele.children[5].children[1].innerHTML = "" + geometryMemory;
        this._ele.children[6].children[1].innerHTML = "" + textures;
    }

    public dispose () {
        if (this._ele) {
            this.renderer.domElement.parentElement.removeChild(this._ele);
            this._ele = null;
        }
    }

    private createItemEle (title: string, val = "0.0000") {
        const div = document.createElement('div');
        div.style.color = "#fff";
        div.style.fontSize = "15px";
        div.style.fontWeight = "500";
        div.style.height = "20px";
        div.style.lineHeight = "20px";
        div.style.marginLeft = "5px";
        this._ele.appendChild(div);
        const titleSpan = document.createElement('span');
        div.appendChild(titleSpan);
        titleSpan.innerText = title;
        titleSpan.style.width = "65%";
        titleSpan.style.display = "inline-block";
        titleSpan.style.overflowX = "hidden";
        const valSpan = document.createElement('span');
        div.appendChild(valSpan);
        valSpan.style.width = "calc(35% - 5px)";
        valSpan.style.display = "inline-block";
        valSpan.innerText = val;
        valSpan.style.textAlign = "right";
        return valSpan;
    }

    private createEle () {
        const div = document.createElement('div');
        this._ele = div;
        div.style.position = "fixed";
        div.style.left = "10px";
        div.style.bottom = "10px";
        div.style.zIndex = "10000";
        div.style.width = "230px";
        div.style.minHeight = "20px";
        div.style.backgroundColor = "#333";
        div.style.opacity = "0.8";
        div.style.borderRadius = "5px";
        div.style.overflowY = "hidden";
        div.style.userSelect = "none";
        div.style.paddingTop = "5px";
        div.style.paddingBottom = "5px";
        this.renderer.domElement.parentElement.appendChild(this._ele);
    }

}
