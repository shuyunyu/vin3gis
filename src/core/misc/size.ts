export class Size {

    public width: number;

    public height: number;

    public constructor (width: number = 0, height: number = 0) {
        this.width = width;
        this.height = height;
    }

    public clone () {
        return new Size(this.width, this.height);
    }

}