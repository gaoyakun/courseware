import { cwSceneObject, cwSceneView, cwScene } from "../lib/core";
import { cwDragOverEvent, cwDragDropEvent, cwDrawEvent, cwDragBeginEvent, cwHitTestEvent } from "../lib/events";
import { cwcImage, cwcDraggable, cwcKeyframeAnimation } from "../lib/components";
import { cwSplineType } from "../lib/curve";

export class DemoBase {
    private rects: {x:number,y:number,w:number,h:number,node:cwSceneObject,selected:boolean}[];
    private _view: cwSceneView;
    constructor (canvas:HTMLCanvasElement) {
        this.rects = [];
        this._view = cwScene.addCanvas (canvas);
    }
    get view (): cwSceneView {
        return this._view;
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
    findNode (node:cwSceneObject): number {
        for (let i = 0; i < this.rects.length; i++) {
            if (this.rects[i].node === node) {
                return i;
            }
        }
        return -1;
    }
    setNodePosition (node:cwSceneObject, pos:number, noAnimation?:boolean): void {
        this.rects[pos].node = node;
        if (node) {
            if (noAnimation===undefined) {
                noAnimation = false;
            }
            node.removeComponentsByType (cwcKeyframeAnimation.type);
            if (noAnimation ) {
                node.translation = {x:this.rects[pos].x + this.rects[pos].w/2,y:this.rects[pos].y + this.rects[pos].h/2};
            } else {
                const worldTransform = node.worldTransform;
                node.addComponent (new cwcKeyframeAnimation({
                    repeat: 1,
                    tracks: {
                        translation: { type:cwSplineType.LINEAR, cp:[{x:0,y:[worldTransform.e, worldTransform.f]}, {x:100,y:[this.rects[pos].x+this.rects[pos].w/2, this.rects[pos].y+this.rects[pos].h/2]}]}
                    }
                }));
            }
        }
    }
    scheduleNodeAnimation () {
        this.rects.forEach ((rc, index) => {
            this.setNodePosition (rc.node, index, false);
        });
    }
    dump (prefix:string) {
        return;
        let str = `${prefix}:`;
        this.rects.forEach (rc => {
            str += ` ${rc.node ? rc.node.number : '-'}`;
        });
        console.log (str)
    }
    addNode (node:cwSceneObject): number {
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
            this.setNodePosition (node, slot, true);
        }
        this.dump ('addNode');
        return slot;
    }
    insertNode (pos:number, node:cwSceneObject): boolean {
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
        this.rects[pos].node = node;
        this.dump ('insertNode');
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
        this.dump ('packNodes');
    }
    removeNode (node:cwSceneObject): number {
        let slot = this.findNode(node);
        if (slot >= 0) {
            this.rects[slot].node = null;
            this.packNodes ();
            this.dump ('removeNode');
        }
        return slot;
    }
    playDemo (sequence:Array<{type:string,from:number,to:number}>, duration:number) {
        let delay = 0;
        sequence.forEach (element => {
            setTimeout (()=>{
                if (element.type == 'move') {
                    this.moveNode (element.from, element.to, 0, duration);
                } else if (element.type == 'swap') {
                    this.swapNodes (element.from, element.to, 0, duration);
                }
            }, delay);
            delay += duration;
            delay += 100;
        });
    }
    playShuffleDemo () {
        let sequence:Array<{type:string,from:number,to:number}> = [];
        for (let i = 0; i < 20; i++) {
            const a = Math.floor(Math.random() * this.rects.length);
            const b = Math.floor(Math.random() * this.rects.length);
            if (a != b) {
                sequence.push ({type:'swap',from:a,to:b});
            }
        }
        this.playDemo (sequence, 200);
    }
    playBubbleSortDemo (): boolean {
        let sequence:Array<{type:string,from:number,to:number}> = [];
        let numbers:Array<number> = [];
        this.rects.forEach (rc=>{
            if (!rc.node) {
                return false;
            }
            numbers.push (rc.node.number);
        });
        for (let i = numbers.length-1; i >= 0; i--) {
            for (let j = 0;j < i;j++) {
                if (numbers[j] > numbers[j+1]) {
                    let tmp = numbers[j];
                    numbers[j] = numbers[j+1];
                    numbers[j+1] = tmp;
                    sequence.push ({ type:'swap',from:j,to:j+1});
                }
            }
        }
        this.playDemo (sequence, 200);
        return true;
    }
    moveNode (pos1:number, pos2:number, delay:number, animationDuration:number): boolean {
        if (pos1 == pos2) {
            return false;
        }
        const step = pos1 < pos2 ? 1 : -1;
        const node1 = this.rects[pos1].node;
        for (let i = pos1; i != pos2+step; i += step) {
            let node = this.rects[i].node;
            let j = i == pos1 ? pos2 : i-step;
            let a = i == pos1 ? cwSplineType.POLY : cwSplineType.LINEAR;
            const h = i == pos1 ? this.rects[0].h : 0;
            const x1 = this.rects[i].x+this.rects[i].w/2;
            const y1 = this.rects[i].y+this.rects[i].h/2;
            const x2 = this.rects[j].x+this.rects[i+step].w/2;
            const y2 = this.rects[j].y+this.rects[i+step].h/2;
            (node.getComponents (cwcKeyframeAnimation.type)||[]).forEach (comp=>{
                (comp as cwcKeyframeAnimation).finish ();
            });
            node.addComponent (new cwcKeyframeAnimation({
                delay:delay,
                repeat:1,
                exclusive:true,
                tracks: {
                    translation: {
                        cp: [{x:0,y:[x1,y1]}, {x:animationDuration/2,y:[(x1+x2)/2,(y1+y2)/2-h]}, {x:animationDuration,y:[x2,y2]}],
                        type: a
                    }
                }
            }));
            if (i != pos1) {
                this.rects[j].node = this.rects[i].node;
            }
        }
        this.rects[pos2].node = node1;
    }
    swapNodes (pos1:number, pos2:number, delay:number, animationDuration:number): boolean {
        let node1 = this.rects[pos1].node;
        let node2 = this.rects[pos2].node;
        if (node1 && node2 && node1 !== node2) {
            const t1 = node1.translation;
            const t2 = node2.translation;
            const h = this.rects[0].h;
            this.rects[pos1].node = node2;
            (node2.getComponents (cwcKeyframeAnimation.type)||[]).forEach (comp=>{
                (comp as cwcKeyframeAnimation).finish ();
            });
            node2.addComponent (new cwcKeyframeAnimation({
                delay:delay,
                repeat:1,
                exclusive:true,
                tracks: {
                    translation: {
                        cp: [{x:0,y:[t2.x,t2.y]},{x:animationDuration/2,y:[(t1.x+t2.x)/2,(t1.y+t2.y)/2-h/2]},{x:animationDuration,y:[t1.x,t1.y]}],
                        type: cwSplineType.POLY
                    }
                }
            }));
            this.rects[pos2].node = node1;
            node1.removeComponentsByType (cwcKeyframeAnimation.type);
            node1.addComponent (new cwcKeyframeAnimation({
                delay:delay,
                repeat:1,
                tracks: {
                    translation: {
                        cp: [{x:0,y:[t1.x,t1.y]},{x:animationDuration/2,y:[(t1.x+t2.x)/2,(t1.y+t2.y)/2+h/2]},{x:animationDuration,y:[t2.x,t2.y]}],
                        type: cwSplineType.POLY
                    }
                }
            }));
            return true;
        }
        return false;
    }
    start (numbers:number[], options:any): boolean {
        if (!this._view) {
            return false;
        }
        this._view.empty ();
        this.rects = [];

        this._view.on (cwDragOverEvent.type, (ev:cwDragOverEvent) => {
            const data = ev.data;
            if (data.type == 'number') {
                let rect = this.rectTest (ev.x, ev.y);
                if (rect >= 0 && data.node != this.rects[rect].node) {
                    this.removeNode (data.node);
                    if (this.rects[rect].node == null) {
                        this.setNodePosition (data.node, rect);
                        this.packNodes ();
                    } else {
                        this.insertNode (rect, data.node);
                    }
                    this.scheduleNodeAnimation ();
                } else if (rect < 0) {
                    if (this.removeNode (data.node) >= 0) {
                        this.scheduleNodeAnimation ();
                    }
                }
                data.node.worldTranslation = {x:ev.x, y:ev.y};
            }
        });
        this._view.on (cwDragDropEvent.type,  (ev:cwDragDropEvent) => {
            const data = ev.data;
            if (data.type == 'number') {
                data.node.collapseTransform ();
                this.packNodes ();
                this.scheduleNodeAnimation ();
            }
        });
        this._view.on (cwDrawEvent.type, (ev:cwDrawEvent) => {
            ev.canvas.context.strokeStyle = '#080';
            ev.canvas.context.lineWidth = 2;
            ev.canvas.context.fillStyle = '#0ff';
            for (let i = 0; i < this.rects.length; i++) {
                const rc = this.rects[i];
                ev.canvas.context.fillRect (rc.x, rc.y, rc.w, rc.h);
                ev.canvas.context.strokeRect (rc.x, rc.y, rc.w, rc.h);
            }
        });

        if (numbers && numbers.length>0) {
            const margin_h = options.margin_h == null ? 0 : options.margin_h;
            const margin_v = options.margin_v == null ? 0 : options.margin_v;
            const padding = options.padding == null ? 0 : options.padding;
            const width = Math.floor((this._view.canvas.width - 2 * margin_h - (numbers.length-1)*padding) / numbers.length);
            const height = options.ratio == null ? width : Math.round(width/options.ratio);
            const step = width + padding;
            const startx = margin_h;
            const starty = margin_v;
            for (let i = 0; i < numbers.length; i++) {
                this.rects.push({x:startx+i*step,y:starty,w:width,h:height,node:null,selected:false})
            }
            for (let i = 0; i < numbers.length; i++) {
                const numNode = new cwSceneObject (this._view.rootNode);
                numNode.number = numbers[i];
                numNode.addComponent (new cwcImage(`images/number-${numbers[i]}.png`, width, height));
                numNode.addComponent (new cwcDraggable());
                numNode.on (cwDragBeginEvent.type, function(ev:cwDragBeginEvent) {
                    ev.data = { type:'number', node:this };
                });
                this.addNode (numNode);
            }
        }
    }
    end () {
        if (this._view) {
            this._view.empty ();
            this._view.draw ();
        }
    }
}
