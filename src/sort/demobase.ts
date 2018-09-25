import { cwSceneObject, cwSceneView, cwScene } from "../lib/core";
import { cwDragOverEvent, cwDragDropEvent, cwDrawEvent, cwDragBeginEvent, cwHitTestEvent } from "../lib/events";
import { cwcImage, cwcDraggable } from "../lib/components";

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
    setNodePosition (node:cwSceneObject, pos:number): void {
        this.rects[pos].node = node;
        if (node) {
            node.translation = {x:this.rects[pos].x + this.rects[pos].w/2,y:this.rects[pos].y + this.rects[pos].h/2};
        }
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
            this.setNodePosition (node, slot);
        }
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
        this.setNodePosition (node, pos);
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
    removeNode (node:cwSceneObject): number {
        let slot = this.findNode(node);
        if (slot >= 0) {
            this.rects[slot].node = null;
            this.packNodes ();
        }
        return slot;
    }
    swapNodes (node1:cwSceneObject, node2:cwSceneObject): boolean {
        let slot1 = this.findNode(node1);
        let slot2 = this.findNode(node2);
        if (slot1 >= 0 && slot2 >= 0 && slot1 != slot2) {
            this.rects[slot1].node = node2;
            node2.translation = {x:this.rects[slot1].x+this.rects[slot1].w/2, y:this.rects[slot1].y+this.rects[slot1].h/2};
            this.rects[slot2].node = node1;
            node1.translation = {x:this.rects[slot2].x+this.rects[slot2].w/2, y:this.rects[slot2].y+this.rects[slot2].h/2};
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
                } else if (rect < 0) {
                    this.removeNode (data.node);
                    data.node.worldTranslation = {x:ev.x, y:ev.y};
                    data.node.collapseTransform ();
                }
            }
        });
        this.view.on (cwDragDropEvent.type,  (ev:cwDragDropEvent) => {
            const data = ev.data;
            if (data.type == 'number') {
                let rect = this.rectTest (ev.x, ev.y);
                if (rect < 0) {
                    data.node.translation = {x:ev.x, y:ev.y};
                }
            }
            this.packNodes ();
        });
        this.view.on (cwDrawEvent.type, (ev:cwDrawEvent) => {
            ev.canvas.context.fillStyle = '#000';
            ev.canvas.context.strokeStyle = '#fff';
            ev.canvas.context.lineWidth = 2;
            ev.canvas.context.fillRect (0, 0, ev.canvas.width, ev.canvas.height);
            for (let i = 0; i < this.rects.length; i++) {
                const rc = this.rects[i];
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
        }
    }
}
