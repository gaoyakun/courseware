import {Transform2d} from './transform';
import {GraphEntity,DemoGraph} from './graph';

export class Bkground extends GraphEntity {
    color: any;

    constructor (color: any) {
        super();
        this.color = color;
    }
    draw (graph:DemoGraph): void {
        if (this.color) {
            graph.ctx.save();
            graph.ctx.fillStyle = this.color;
            graph.ctx.fillRect (0, 0, graph.canvasWidth, graph.canvasHeight);
            graph.ctx.restore();
        }
    };
    onCull (graph:DemoGraph): boolean {
        return false;
    };
}

export class Number extends GraphEntity {
    image: any;
    width: number;
    height: number;

    constructor (image:any, width:number, height:number, x:number, y:number) {
        super();
        this.image = new Image();
        this.image.src = image;
        this.width = width;
        this.height = height;
        this.localMatrix = Transform2d.getTranslate(x, y);
    };
    draw (graph:DemoGraph): void {
        graph.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    };
    hittest (x:number, y:number): boolean {
        return x > -this.width/2 && x < this.width/2 && y > -this.height/2 && y < this.height/2;
    };
    onDragStart (evt:any): any {
        this.visible = false;
        return {
            draw: this.draw
        };
    };
    onDragEnd (evt:any): void {
        this.visible = true;
    };
}

