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
            graph.ctx.height = graph.ctx.height;
            /*
            graph.ctx.save();
            graph.ctx.fillStyle = this.color;
            graph.ctx.fillRect (0, 0, graph.canvasWidth, graph.canvasHeight);
            graph.ctx.restore();
            */
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

export class NumberSequenceDemo extends DemoGraph {
    private bkground: Bkground|null;
    private options: any;
    constructor (canvas:any) {
        super(canvas);
        this.bkground = null;
        this.options = {}
    }
    start (bkcolor:any, numbers:number[]|null, options:any) {
        this.bkground = new Bkground(bkcolor);
        if (numbers && numbers.length>0) {
            const margin_h = options.margin_h == null ? 0 : options.margin_h;
            const margin_v = options.margin_v == null ? 0 : options.margin_v;
            const padding = options.padding == null ? 0 : options.padding;
            const step = Math.floor((this.canvasWidth - 2 * margin_h) / numbers.length);
            const width = step > padding ? step - padding : step;
            const startx = margin_h + Math.floor(width / 2);
            const starty = margin_v + Math.floor(width / 2);
            for (let i = 0; i < numbers.length; i++) {
                this.bkground.addChild (new Number('images/number-'+numbers[i]+'.png', width, width, startx+i*step, starty));
            }
        }
        this.rootEntity = this.bkground;
        this.run ();
    }
    end () {
        this.stop ();
        this.bkground = null;
        this.options = {}
    }
}
