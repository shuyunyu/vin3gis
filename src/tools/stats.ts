class Panel {

    public readonly dom: HTMLElement;

    private context: CanvasRenderingContext2D;

    private canvas: HTMLCanvasElement;

    private min: number;

    private max: number;

    private bg: string;

    private fg: string;

    private PR: number;

    private WIDTH: number;

    private HEIGHT: number;

    private TEXT_X: number;

    private TEXT_Y: number;

    private GRAPH_X: number;

    private GRAPH_Y: number;

    private GRAPH_WIDTH: number;

    private GRAPH_HEIGHT: number;

    constructor (name: string, fg: string, bg: string) {
        let min = Infinity, max = 0, round = Math.round;
        let PR = round(window.devicePixelRatio || 1);

        let WIDTH = 80 * PR, HEIGHT = 48 * PR,
            TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
            GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
            GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

        this.PR = PR;
        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
        this.TEXT_X = TEXT_X;
        this.TEXT_Y = TEXT_Y;
        this.GRAPH_X = GRAPH_X;
        this.GRAPH_Y = GRAPH_Y;
        this.GRAPH_WIDTH = GRAPH_WIDTH;
        this.GRAPH_HEIGHT = GRAPH_HEIGHT;

        let canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.cssText = 'width:80px;height:48px';

        let context = canvas.getContext('2d');
        context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
        context.textBaseline = 'top';

        context.fillStyle = bg;
        context.fillRect(0, 0, WIDTH, HEIGHT);

        context.fillStyle = fg;
        context.fillText(name, TEXT_X, TEXT_Y);
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        this.context = context;
        this.canvas = canvas;
        this.dom = canvas;
        this.min = min;
        this.max = max;

        this.fg = fg;
        this.bg = bg;
    }

    public update (value: number, maxValue: number) {

        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);

        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
        this.context.fillStyle = this.fg;
        this.context.fillText(Math.round(value) + ' ' + name + ' (' + Math.round(this.min) + '-' + Math.round(this.max) + ')', this.TEXT_X, this.TEXT_Y);

        this.context.drawImage(this.canvas, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);

        this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);

        this.context.fillStyle = this.bg;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, Math.round((1 - (value / maxValue)) * this.GRAPH_HEIGHT));

    }

}

class Stats {

    private mode: number;

    private container: HTMLDivElement;

    public readonly dom: HTMLDivElement;

    private frames: number;

    private beginTime: number;

    private prevTime: number;

    private fpsPanel: Panel;

    private msPanel: Panel;

    private memPanel: Panel;

    private _enableTogglePanel: boolean = true;

    //是否允许切换面板
    public set enableTogglePanel (val: boolean) {
        this._enableTogglePanel = val;
        this.container.removeEventListener('click', this.planeClickListener);
        this.container.style.cssText = 'position:fixed;top:0;left:0;opacity:0.9;z-index:10000';
        if (this._enableTogglePanel) {
            this.container.addEventListener('click', this.planeClickListener, false);
            this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
        }
    }

    constructor () {
        let mode = 0;
        let container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
        container.addEventListener('click', this.planeClickListener, false);
        this.container = container;

        let beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;

        let fpsPanel = this.addPanel(new Panel('FPS', '#0ff', '#002'));
        let msPanel = this.addPanel(new Panel('MS', '#0f0', '#020'));
        //@ts-ignore
        if (self.performance && self.performance.memory) {

            this.memPanel = this.addPanel(new Panel('MB', '#f08', '#201'));

        }

        this.showPanel(0);
        this.dom = container;
        this.beginTime = beginTime;
        this.prevTime = prevTime;
        this.frames = frames;
        this.fpsPanel = fpsPanel;
        this.msPanel = msPanel;
    }

    private planeClickListener (event: MouseEvent) {
        event.preventDefault();
        this.showPanel(++this.mode % this.container.children.length);

    }

    public begin () {
        //@ts-ignore
        this.beginTime = (performance || Date).now();
    }

    public end () {

        this.frames++;

        let time = (performance || Date).now();

        this.msPanel.update(time - this.beginTime, 200);

        if (time >= this.prevTime + 1000) {

            this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);

            this.prevTime = time;
            this.frames = 0;

            if (this.memPanel) {
                //@ts-ignore
                let memory = performance.memory;
                this.memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);

            }

        }

        return time;

    }

    public update () {

        this.beginTime = this.end();

    }

    public showPanel (id: number) {
        for (let i = 0; i < this.container.children.length; i++) {
            //@ts-ignore
            this.container.children[i].style.display = i === id ? 'block' : 'none';

        }

        this.mode = id;
    }

    public showAllPanel () {
        for (let i = 0; i < this.container.children.length; i++) {
            const child = this.container.children[i];
            //@ts-ignore
            child.style.display = "block";
        }
    }

    public addPanel (panel: Panel) {
        this.container.appendChild(panel.dom);
        return panel;

    }

}

export const stats = new Stats();