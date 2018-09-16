import {Transform2d} from './transform';
import {SceneNode,Scene,PathMotion} from './graph';

export class Bkground extends SceneNode {
    color: any;
    constructor (color: string = '#000') {
        super();
        this.z = 0;
        this.color = color;
        this.on ('draw', (e:any)=>{
            if (this.color) {
                e.scene.ctx.save();
                e.scene.ctx.fillStyle = this.color;
                e.scene.ctx.fillRect (0, 0, e.scene.canvasWidth, e.scene.canvasHeight);
                e.scene.ctx.restore();
            }
        });
    }
    hittest (scene:Scene, x:number, y:number): boolean {
        return x>=0 && x<scene.canvasWidth && y>=0 && y<scene.canvasHeight;
    }
    onCull (scene:Scene): boolean {
        return true;
    };
    onDragDrop (evt:any, data:any): void {
        if (data.type == 'number') {
            data.node.localMatrix = Transform2d.getTranslate (evt.offsetX, evt.offsetY);
        }
    }
}

export class Number extends SceneNode {
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
            this.draw (e.scene);
        });
    }
    draw (scene:Scene): void {
        scene.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    }
    hittest (scene:Scene, x:number, y:number): boolean {
        return x > -this.width/2 && x < this.width/2 && y > -this.height/2 && y < this.height/2;
    }
}

interface ISortElement {
    (index:number,width:number,height:number):SceneNode;
}

export function SortNumber(index:number,width:number,height:number) {
    return new Number(`images/number-${index}.png`, width, height);
}

interface ISortBackgroundDrawer {
    (ctx:any,index:number,selected:boolean,x:number,y:number,width:number,height:number):void;
}

export function SortCellDrawer(ctx:any,index:number,selected:boolean,x:number,y:number,width:number,height:number) {
    const bkcolor = '#fff';
    const cellcolor = selected ? '#fcad67' : bkcolor;
    const bordercolor = '#000';
    ctx.save();
    ctx.strokeStyle = bordercolor;
    if (index < 0) {
        ctx.fillStyle = bkcolor;
        ctx.fillRect(x,y,width,height);
        ctx.strokeRect(x,y,width,height);
    } else {
        ctx.fillStyle = cellcolor;
        ctx.fillRect(x,y,width,height);
        ctx.strokeRect(x,y,width,height);
    }
    ctx.restore();
}

export class NumberSequenceScene extends Scene {
    private rects: {x:number,y:number,w:number,h:number,node:SceneNode,selected:boolean}[];
    private motionParent: SceneNode;
    private aniDuration: number;
    private backgroundDrawer: ISortBackgroundDrawer;
    private elementFactory:ISortElement;
    constructor (canvas:any, backgroundDrawer:ISortBackgroundDrawer=SortCellDrawer,elementFactory:ISortElement=SortNumber) {
        super(canvas);
        this.rects = [];
        this.aniDuration = 100;
        this.backgroundDrawer = backgroundDrawer;
        this.elementFactory = elementFactory;
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
    createDirectMotion (node:SceneNode, x:number, y:number): void {
        //node.localMatrix = Transform2d.getTranslate(x, y)
        if (this.motionParent) {
            this.stopMotion (node);
            this.motionParent.addChild (new PathMotion(node,[{t:0,x:node.localMatrix.e,y:node.localMatrix.f},{t:this.aniDuration,x:x,y:y}],'linear'));
        }
    }
    stopMotion (node: SceneNode): void {
        if (this.motionParent) {
            for (let i=0; i < this.motionParent.children.length;) {
                let motion = this.motionParent.children[i] as PathMotion;
                if (motion.node == node) {
                    motion.stop();
                } else {
                    i++;
                }
            }
        }
    }
    scheduleAnimations (): void {
        for (let i = 0; i < this.rects.length; i++) {
            let node = this.rects[i].node;
            if (node) {
                let target_x = this.rects[i].x + this.rects[i].w/2;
                let target_y = this.rects[i].y + this.rects[i].h/2;
                let x0 = node.localMatrix.e;
                let y0 = node.localMatrix.f;
                if (target_x != x0 || target_y != y0) {
                    this.createDirectMotion (node, target_x, target_y);
                }
            }
        }
    }
    findNode (node:SceneNode): number {
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].node == node) {
                return i;
            }
        }
        return -1;
    }
    setNodePosition (node:SceneNode, pos:number): void {
        this.rects[pos].node = node;
        if (node) {
            this.stopMotion (node);
            node.localMatrix = Transform2d.getTranslate(this.rects[pos].x + this.rects[pos].w/2, this.rects[pos].y + this.rects[pos].h/2);
        }
    }
    addNode (node:SceneNode): number {
        if (this.rootNode) {
            let slot = -1;
            for (let i = 0; i < this.rects.length; i++) {
                if (this.rects[i].node == node) {
                    return -1;
                } else if (this.rects[i].node != null && slot >= 0) {
                    return -1;
                } else if (this.rects[i].node == null && slot < 0) {
                    slot = i;
                }
            }
            if (slot >= 0) {
                this.setNodePosition (node, slot);
            }
            return slot;
        }
    }
    insertNode (pos:number, node:SceneNode): boolean {
        if(this.rootNode) {
            let slot;
            for (slot = this.rects.length-1; slot >= 0; slot--) {
                if (this.rects[slot].node != null) {
                    break;
                }
            }
            if (slot == this.rects.length-1 || slot < pos-1) {
                return false;
            }
            for (let i = slot; i >= pos; i--) {
                this.rects[i+1].node = this.rects[i].node;
            }
            this.setNodePosition (node, pos);
        }
    }
    packNodes (): void {
        let slot = -1;
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].node == null && slot < 0) {
                slot = i;
            } else if (this.rects[i].node != null && slot >= 0) {
                this.rects[slot].node = this.rects[i].node;
                this.rects[i].node = null;
                slot++;
            }
        }
    }
    removeNode (node:SceneNode): number {
        let slot = this.findNode(node);
        if (slot >= 0) {
            this.rects[slot].node = null;
            this.packNodes ();
        }
        return slot;
    }
    swapNodes (node1:SceneNode, node2:SceneNode): boolean {
        let slot1 = this.findNode(node1);
        let slot2 = this.findNode(node2);
        if (slot1 >= 0 && slot2 >= 0 && slot1 != slot2) {
            this.rects[slot1].node = node2;
            node2.localMatrix = Transform2d.getTranslate(this.rects[slot1].x+this.rects[slot1].w/2, this.rects[slot1].y+this.rects[slot1].h/2);
            this.rects[slot2].node = node1;
            node1.localMatrix = Transform2d.getTranslate(this.rects[slot2].x+this.rects[slot2].w/2, this.rects[slot2].y+this.rects[slot2].h/2);
            return true;
        }
        return false;
    }
    onClick (e:any): void {
        const evt = e.evt;
        let rect = this.rectTest (evt.offsetX, evt.offsetY);
        if (rect >= 0 && this.rects[rect].node) {
            if (!evt.metaKey) {
                for (let i = 0; i < this.rects.length; i++) {
                    if (i != rect) {
                        this.rects[i].selected = false;
                    }
                }
            }
            this.rects[rect].selected = !this.rects[rect].selected;
        }
    }
    onDragOver (e:any): void {
        const evt = e.evt;
        const data = e.data;
        if (data.type == 'number') {
            let rect = this.rectTest (evt.offsetX, evt.offsetY);
            if (rect >= 0 && data.node != this.rects[rect].node) {
                this.removeNode (data.node);
                if (this.rects[rect].node == null) {
                    this.setNodePosition (data.node, rect);
                    //this.rects[rect].node = data.node;
                    //data.node.localMatrix = Transform2d.getTranslate(this.rects[rect].x+this.rects[rect].w/2, this.rects[rect].y+this.rects[rect].h/2);
                    this.packNodes ();
                } else {
                    this.insertNode (rect, data.node);
                }
                this.scheduleAnimations ();
            } else if (rect < 0) {
                if (this.removeNode (data.node) >= 0) {
                    this.scheduleAnimations ();
                }
            }
        }
    }
    onDragDrop (e:any): void {
        const evt = e.evt;
        const data = e.data;
        if (data.type == 'number') {
            let rect = this.rectTest (evt.offsetX, evt.offsetY);
            if (rect < 0) {
                this.stopMotion (data.node);
                data.node.localMatrix = Transform2d.getTranslate (evt.offsetX, evt.offsetY);
            }
        }
        this.packNodes ();
    }
    draw (): void {
        this.ctx.setTransform(1,0,0,1,0,0);
        this.backgroundDrawer(this.ctx,-1,false,0,0,this.canvasWidth,this.canvasHeight);
        for (let i = 0; i < this.rects.length; i++) {
            this.backgroundDrawer(this.ctx, i, this.rects[i].selected, this.rects[i].x, this.rects[i].y, this.rects[i].w, this.rects[i].h);
        }
        super.draw ();
    }
    start (bkcolor:any, numbers:number[], options:any) {
        let that = this;
        that.rects = [];
        if (numbers && numbers.length>0) {
            const margin_h = options.margin_h == null ? 0 : options.margin_h;
            const margin_v = options.margin_v == null ? 0 : options.margin_v;
            const padding = options.padding == null ? 0 : options.padding;
            const width = Math.floor((that.canvasWidth - 2 * margin_h - (numbers.length-1)*padding) / numbers.length);
            const height = options.ratio == null ? width : Math.round(width/options.ratio);
            const step = width + padding;
            const startx = margin_h;
            const starty = margin_v;
            for (let i = 0; i < numbers.length; i++) {
                that.rects.push({x:startx+i*step,y:starty,w:width,h:height,node:null,selected:false})
            }
            let bkground = new Bkground(bkcolor);
            bkground.on('dragdrop', function(e){
                that.onDragDrop(e);
            });
            bkground.on('dragover', function(e){
                that.onDragOver(e);
            });
            that.rootNode = new SceneNode();
            that.rootNode.addChild(bkground);
            that.motionParent = new SceneNode();
            that.rootNode.addChild(that.motionParent);
            for (let i = 0; i < numbers.length; i++) {
                let num = this.elementFactory(numbers[i],width,height);
                that.rootNode.addChild (num);
                that.addNode (num);
                num.on('dragstart', function(e){
                    this.visible = false;
                    e.data.allow = true;
                    e.data.type = 'number';
                    e.data.node = this;
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
                num.on('click', function(e){
                    that.onClick (e);
                });
            }
        }
        this.run ();
    }
    end () {
        this.stop ();
        this.draw ();
    }
}
