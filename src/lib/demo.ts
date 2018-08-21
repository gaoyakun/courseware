import {Transform2d} from './transform';
import {GraphEntity,DemoGraph} from './graph';

export class Bkground extends GraphEntity {
    color: any;

    constructor (color: string = '#000') {
        super();
        this.z = 0;
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
    hittest (graph:DemoGraph, x:number, y:number): boolean {
        return x>=0 && x<graph.canvasWidth && y>=0 && y<graph.canvasHeight;
    }
    onCull (graph:DemoGraph): boolean {
        return false;
    };
    onDragDrop (evt:any, data:any): void {
        if (data.type == 'number') {
            data.entity.localMatrix = Transform2d.getTranslate (evt.offsetX, evt.offsetY);
        }
    }
}

class NumberSequenceBkground extends Bkground {
    rects: {x:number,y:number,w:number,h:number,entity:Number|null}[];

    constructor (color: string = '#000') {
        super(color);
        this.rects = [];
    }

    rectTest (x:number, y:number): number {
        for (let i = 0; i < this.rects.length; i++) {
            const rc = this.rects[i];
            if (x>=rc.x && x<rc.x+rc.w && y>=rc.y && y<rc.y+rc.h) {
                return i;
            }
        }
        return -1;
    }

    findEntity (entity:Number): number {
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].entity == entity) {
                return i;
            }
        }
        return -1;
    }

    addEntity (entity:Number): number {
        let slot = -1;
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].entity == entity) {
                return -1;
            } else if (this.rects[i].entity != null && slot >= 0) {
                return -1;
            } else if (this.rects[i].entity == null && slot < 0) {
                slot = i;
            }
        }
        if (slot >= 0) {
            this.rects[slot].entity = entity;
        }
        return slot;
    }

    packEntities (): void {
        let slot = -1;
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].entity == null && slot < 0) {
                slot = i;
            } else if (this.rects[i].entity != null && slot >= 0) {
                this.rects[slot].entity = this.rects[i].entity;
                this.rects[i].entity = null;
                slot++;
            }
        }
    }

    removeEntity (entity:Number): number {
        let slot = this.findEntity(entity);
        if (slot >= 0) {
            this.rects[slot].entity = null;
            this.packEntities ();
        }
        return slot;
    }

    swapEntities (entity1:Number, entity2:Number): boolean {
        let slot1 = this.findEntity(entity1);
        let slot2 = this.findEntity(entity2);
        if (slot1 >= 0 && slot2 >= 0 && slot1 != slot2) {
            this.rects[slot1].entity = entity2;
            this.rects[slot2].entity = entity1;
            return true;
        }
        return false;
    }
}

export class Dummy extends GraphEntity {
    width: number;
    height: number;

    constructor (width:number, height:number, x:number, y:number) {
        super();
        this.z = 1;
        this.width = width;
        this.height = height;
        this.localMatrix = Transform2d.getTranslate(x, y);
    }
    onCull (graph:DemoGraph): boolean {
        return true;
    }
    hittest (graph:DemoGraph, x:number, y:number): boolean {
        return x > -this.width/2 && x < this.width/2 && y > -this.height/2 && y < this.height/2;
    };
    onDragDrop (evt:any, data:any): void {
        if (data.type == 'number') {
            data.entity.localMatrix = Transform2d.getTranslate (this.localMatrix.e, this.localMatrix.f);
        }
    }
}

export class Number extends GraphEntity {
    image: any;
    width: number;
    height: number;

    constructor (image:any, width:number, height:number, x:number, y:number) {
        super();
        this.z = 2;
        this.image = new Image();
        this.image.src = image;
        this.width = width;
        this.height = height;
        this.localMatrix = Transform2d.getTranslate(x, y);
    };
    draw (graph:DemoGraph): void {
        graph.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    };
    hittest (graph:DemoGraph, x:number, y:number): boolean {
        return x > -this.width/2 && x < this.width/2 && y > -this.height/2 && y < this.height/2;
    };
    onDragStart (evt:any): any {
        this.visible = false;
        return {
            type: 'number',
            entity: this,
            draw: this.draw
        };
    };
    onDragEnd (evt:any): void {
        this.visible = true;
    };
    onDragDrop (evt:any, data:any): void {
        if (data.type == 'number') {
            data.entity.localMatrix = Transform2d.getTranslate (this.localMatrix.e, this.localMatrix.f);
        }
    }
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
                this.bkground.addChild (new Dummy(width, width, startx+i*step, starty));
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
