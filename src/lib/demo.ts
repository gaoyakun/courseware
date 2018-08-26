import {Transform2d} from './transform';
import {GraphEntity,DemoGraph,PathMotion} from './graph';

export class Bkground extends GraphEntity {
    color: any;
    constructor (color: string = '#000') {
        super();
        this.z = 0;
        this.color = color;
        this.on ('draw', (e:any)=>{
            if (this.color) {
                e.graph.ctx.save();
                e.graph.ctx.fillStyle = this.color;
                e.graph.ctx.fillRect (0, 0, e.graph.canvasWidth, e.graph.canvasHeight);
                e.graph.ctx.restore();
            }
        });
    }
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
        this.on ('draw', function(e){
            this.draw (e.graph);
        });
    }
    draw (graph:DemoGraph): void {
        graph.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    }
    hittest (graph:DemoGraph, x:number, y:number): boolean {
        return x > -this.width/2 && x < this.width/2 && y > -this.height/2 && y < this.height/2;
    }
}

export class NumberSequenceDemo extends DemoGraph {
    private bkground: Bkground;
    private rects: {x:number,y:number,w:number,h:number,entity:Number}[];
    constructor (canvas:any) {
        super(canvas);
        this.bkground = null;
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
    createDirectMotion (entity:Number, x:number, y:number, duration:number): void {
        if (this.rootEntity) {
            this.rootEntity.addChild (new PathMotion(entity,[{t:0,x:entity.localMatrix.e,y:entity.localMatrix.f},{t:duration,x:x,y:y}],'linear'));
        }
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
        if (this.rootEntity) {
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
                    this.rootEntity.addChild (entity);
                }
                entity.localMatrix = Transform2d.getTranslate(this.rects[slot].x + this.rects[slot].w/2, this.rects[slot].y + this.rects[slot].h/2);
            }
            return slot;
        }
    }
    insertEntity (pos:number, entity:Number): boolean {
        if(this.rootEntity) {
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
                //this.rects[i+1].entity.localMatrix = Transform2d.getTranslate(this.rects[i+1].x+this.rects[i+1].w/2, this.rects[i+1].y+this.rects[i+1].h/2);
                this.createDirectMotion(this.rects[i+1].entity, this.rects[i+1].x+this.rects[i+1].w/2, this.rects[i+1].y+this.rects[i+1].h/2, 100);
            }
            this.rects[pos].entity = entity;
            if (entity.parent == null) {
                this.rootEntity.addChild (entity);
            }
            entity.localMatrix = Transform2d.getTranslate(this.rects[pos].x+this.rects[pos].w/2, this.rects[pos].y+this.rects[pos].h/2);
        }
    }
    packEntities (): void {
        let slot = -1;
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].entity == null && slot < 0) {
                slot = i;
            } else if (this.rects[i].entity != null && slot >= 0) {
                this.rects[slot].entity = this.rects[i].entity;
                //this.rects[slot].entity.localMatrix = Transform2d.getTranslate(this.rects[slot].x+this.rects[slot].w/2, this.rects[slot].y+this.rects[slot].h/2);
                this.createDirectMotion(this.rects[slot].entity, this.rects[slot].x+this.rects[slot].w/2, this.rects[slot].y+this.rects[slot].h/2, 100);
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
    onDragOver (e:any): void {
        const evt = e.evt;
        const data = e.data;
        if (data.type == 'number') {
            let rect = this.rectTest (evt.offsetX, evt.offsetY);
            console.log ('onDragOver: rect=' + rect + ' entity=' + (rect>=0?this.rects[rect].entity:null))
            if (rect >= 0 && data.entity != this.rects[rect].entity) {
                this.removeEntity (data.entity);
                if (this.rects[rect].entity == null) {
                    this.rects[rect].entity = data.entity;
                    data.entity.localMatrix = Transform2d.getTranslate(this.rects[rect].x+this.rects[rect].w/2, this.rects[rect].y+this.rects[rect].h/2);
                } else {
                    this.insertEntity (rect, data.entity);
                }
            } else if (rect < 0) {
                this.removeEntity (data.entity);
            }
        }
    }
    onDragDrop (e:any): void {
        const evt = e.evt;
        const data = e.data;
        this.packEntities ();
        if (data.type == 'number') {
            let rect = this.rectTest (evt.offsetX, evt.offsetY);
            if (rect < 0) {
                //this.createDirectMotion (data.entity, evt.offsetX, evt.offsetY, 1000);
                data.entity.localMatrix = Transform2d.getTranslate (evt.offsetX, evt.offsetY);
            }
        }
    }
    start (bkcolor:any, numbers:number[], options:any) {
        let that = this;
        that.rects = [];
        if (numbers && numbers.length>0) {
            const margin_h = options.margin_h == null ? 0 : options.margin_h;
            const margin_v = options.margin_v == null ? 0 : options.margin_v;
            const padding = options.padding == null ? 0 : options.padding;
            const width = Math.floor((that.canvasWidth - 2 * margin_h - (numbers.length-1)*padding) / numbers.length);
            const step = width + padding;
            const startx = margin_h;
            const starty = margin_v;
            for (let i = 0; i < numbers.length; i++) {
                this.rects.push({x:startx+i*step,y:starty,w:width,h:width,entity:null})
            }
            this.bkground = new Bkground(bkcolor);
            this.bkground.on('dragdrop', function(e){
                that.onDragDrop(e);
            });
            this.bkground.on('dragover', function(e){
                that.onDragOver(e);
            });
            this.rootEntity = this.bkground;
            for (let i = 0; i < numbers.length; i++) {
                let num = new Number('images/number-'+numbers[i]+'.png', width, width);
                that.addEntity (num);
                num.on('dragstart', function(e){
                    this.visible = false;
                    e.data.allow = true;
                    e.data.type = 'number';
                    e.data.entity = this;
                    e.data.draw = this.draw;
                });
                num.on('dragend', function (e){
                    this.visible = true;
                });
                num.on('dragover', function(e){
                    that.onDragOver (e);
                });
                num.on('dragdrop', function(e){
                    that.onDragDrop (e);
                });
            }
        }
        this.rootEntity = this.bkground;
        this.run ();
    }
    end () {
        this.stop ();
        this.bkground.trigger ('draw', {graph:this});
        this.bkground = null;
    }
}
