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
    rects: {x:number,y:number,w:number,h:number,entity:Number}[];

    constructor (rects:{x:number,y:number,w:number,h:number,entity:Number}[], color: string = '#000') {
        super(color);
        this.rects = rects;
    }

    draw (graph:DemoGraph): void {
        super.draw (graph);
        graph.ctx.strokeStyle = '#fff';
        this.rects.forEach (value=>{
            graph.ctx.strokeRect(value.x,value.y,value.w,value.h);
        });
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
            if (entity.parent == null) {
                this.addChild (entity);
            }
            entity.localMatrix = Transform2d.getTranslate(this.rects[slot].x + this.rects[slot].w/2, this.rects[slot].y + this.rects[slot].h/2);
        }
        return slot;
    }

    insertEntity (pos:number, entity:Number): boolean {
        let slot;
        for (slot = this.rects.length-1; slot >= 0; slot--) {
            if (this.rects[slot].entity != null) {
                break;
            }
        }
        if (slot == this.rects.length-1 || slot < pos-1) {
            return false;
        }
        for (let i = slot; i >= pos; i--) {
            this.rects[i+1].entity = this.rects[i].entity;
            this.rects[i+1].entity.localMatrix = Transform2d.getTranslate(this.rects[i+1].x+this.rects[i+1].w/2, this.rects[i+1].y+this.rects[i+1].h/2);
        }
        this.rects[pos].entity = entity;
        if (entity.parent == null) {
            this.addChild (entity);
        }
        entity.localMatrix = Transform2d.getTranslate(this.rects[pos].x+this.rects[pos].w/2, this.rects[pos].y+this.rects[pos].h/2);
    }

    packEntities (): void {
        let slot = -1;
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].entity == null && slot < 0) {
                slot = i;
            } else if (this.rects[i].entity != null && slot >= 0) {
                this.rects[slot].entity = this.rects[i].entity;
                this.rects[slot].entity.localMatrix = Transform2d.getTranslate(this.rects[slot].x+this.rects[slot].w/2, this.rects[slot].y+this.rects[slot].h/2);
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
            entity2.localMatrix = Transform2d.getTranslate(this.rects[slot1].x+this.rects[slot1].w/2, this.rects[slot1].y+this.rects[slot1].h/2);
            this.rects[slot2].entity = entity1;
            entity1.localMatrix = Transform2d.getTranslate(this.rects[slot2].x+this.rects[slot2].w/2, this.rects[slot2].y+this.rects[slot2].h/2);
            return true;
        }
        return false;
    }

    onDragDrop (evt:any, data:any): void {
        if (data.type == 'number') {
            let rect = this.rectTest (evt.offsetX, evt.offsetY);
            if (rect >= 0 && data.entity != this.rects[rect].entity) {
                this.removeEntity (data.entity);
                if (this.rects[rect].entity == null) {
                    this.addEntity (data.entity);
                } else {
                    this.insertEntity (rect, data.entity);
                }
            } else if (rect < 0) {
                this.removeEntity (data.entity);
                data.entity.localMatrix = Transform2d.getTranslate (evt.offsetX, evt.offsetY);
            }
        }
    }
}

export class Number extends GraphEntity {
    image: any;
    width: number;
    height: number;

    constructor (image:any, width:number, height:number, x:number=0, y:number=0) {
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
        this.parent.onDragDrop (evt, data);
        /*
        if (data.type == 'number') {
            data.entity.localMatrix = Transform2d.getTranslate (this.localMatrix.e, this.localMatrix.f);
        }
        */
    }
}

export class NumberSequenceDemo extends DemoGraph {
    private bkground: NumberSequenceBkground;
    constructor (canvas:any) {
        super(canvas);
        this.bkground = null;
    }
    start (bkcolor:any, numbers:number[], options:any) {
        let rects:{x:number,y:number,w:number,h:number,entity:Number}[] = [];
        if (numbers && numbers.length>0) {
            const margin_h = options.margin_h == null ? 0 : options.margin_h;
            const margin_v = options.margin_v == null ? 0 : options.margin_v;
            const padding = options.padding == null ? 0 : options.padding;
            const step = Math.floor((this.canvasWidth - 2 * margin_h) / numbers.length);
            const width = step > padding ? step - padding : step;
            const startx = margin_h + Math.floor(width / 2);
            const starty = margin_v + Math.floor(width / 2);
            for (let i = 0; i < numbers.length; i++) {
                rects.push({x:startx+i*step,y:starty,w:width,h:width,entity:null})
            }
            this.bkground = new NumberSequenceBkground(rects, bkcolor);
            for (let i = 0; i < numbers.length; i++) {
                this.bkground.addEntity (new Number('images/number-'+numbers[i]+'.png', width, width));
            }
        }
        this.rootEntity = this.bkground;
        this.run ();
    }
    end () {
        this.stop ();
        this.bkground.draw (this);
        this.bkground = null;
    }
}
