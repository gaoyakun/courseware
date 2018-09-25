import { cwSceneObject, cwSceneView, cwScene } from "../lib/core";
import { cwDragOverEvent, cwDragDropEvent, cwDrawEvent, cwDragBeginEvent, cwHitTestEvent } from "../lib/events";
import { cwcImage, cwcDraggable, cwcKeyframeAnimation } from "../lib/components";
import { cwSplineType } from "../lib/curve";

export class DemoBase {
    private rects: {x:number,y:number,w:number,h:number,node:cwSceneObject,selected:boolean}[];
    private view: cwSceneView;
    constructor (canvas:HTMLCanvasElement) {
        this.rects = [];
        this.view = cwScene.addCanvas (canvas);
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
    swapNodes (node1:cwSceneObject, node2:cwSceneObject): boolean {
        let slot1 = this.findNode(node1);
        let slot2 = this.findNode(node2);
        if (slot1 >= 0 && slot2 >= 0 && slot1 != slot2) {
            this.rects[slot1].node = node2;
            this.rects[slot2].node = node1;
            this.dump ('swapNodes');
            return true;
        }
        return false;
    }
    start (numbers:number[], options:any): boolean {
        if (!this.view) {
            return false;
        }
        this.view.empty ();
        this.rects = [];

        this.view.on (cwDragOverEvent.type, (ev:cwDragOverEvent) => {
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
        this.view.on (cwDragDropEvent.type,  (ev:cwDragDropEvent) => {
            const data = ev.data;
            if (data.type == 'number') {
                data.node.collapseTransform ();
                this.packNodes ();
                this.scheduleNodeAnimation ();
            }
        });
        this.view.on (cwDrawEvent.type, (ev:cwDrawEvent) => {
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
            const width = Math.floor((this.view.canvas.width - 2 * margin_h - (numbers.length-1)*padding) / numbers.length);
            const height = options.ratio == null ? width : Math.round(width/options.ratio);
            const step = width + padding;
            const startx = margin_h;
            const starty = margin_v;
            for (let i = 0; i < numbers.length; i++) {
                this.rects.push({x:startx+i*step,y:starty,w:width,h:height,node:null,selected:false})
            }
            for (let i = 0; i < numbers.length; i++) {
                const numNode = new cwSceneObject (this.view.rootNode);
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
        if (this.view) {
            this.view.empty ();
            this.view.draw ();
        }
    }
}
