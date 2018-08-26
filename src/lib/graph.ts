import {Transform2d} from './transform';
import {CurveEvaluter,StepEvaluter,LinearEvaluter,PolynomialsEvaluter} from './curve';

export class EventObject {
    private handlers: any;
    private eventQueue: Array<any>;
    constructor () {
        this.handlers = {};
        this.eventQueue = [];
    }
    on (type:string, handler:(evt:any)=>void): void {
        let handlers = this.handlers[type]||[];
        handlers.push (handler);
        this.handlers[type] = handlers;
    };
    off (type:string, handler:(evt:any)=>void): void {
        let handlers = this.handlers[type]||[];
        let idx = handlers.indexOf (handler);
        if (idx >= 0) {
            handlers.splice(idx, 1);
        }
        this.handlers[type] = handlers;
    }
    trigger (type:string, evt:any): void {
        let handlers = this.handlers[type]||[];
        handlers.forEach ((f:Function)=>{
            f.call(this, evt);
        });
    }
    post (type:string, evt:any): void {
        this.eventQueue.push({
            type:type,
            evt:evt
        });
    }
    processEvents (): void {
        this.eventQueue.forEach ((e:any)=>{
            let handlers = this.handlers[e.type]||[];
            handlers.forEach ((f:Function)=>{
                f.call(this, e.evt);
            });
        });
    }
}

export class GraphEntity extends EventObject {
    parent: GraphEntity;
    z: number;
    visible: boolean;
    children: GraphEntity[];
    localMatrix: Transform2d;
    /*
    onCull (graph:DemoGraph)=>boolean;
    onUpdate: (dt:number, rt:number)=>void;
    onMouseEnter: ()=>void;
    onMouseLeave: ()=>void;
    onMouseDown: (evt:any)=>void;
    onMouseUp: (evt:any)=>void;
    onClick: (evt:any)=>void;
    onDblClick: (evt:any)=>void;
    onMouseWheel: (evt:any)=>void;
    onDragStart: (evt:any)=>any;
    onDragEnd: (evt:any, data:any)=>void;
    onDragOver: (evt:any, data:any)=>void;
    onDragDrop: (evt:any, data:any)=>void;
    */

    constructor () {
        super ();
        this.parent = null;
        this.z = 0;
        this.visible = true;
        this.children = [];
        this.localMatrix = new Transform2d();
    }
    getWorldMatrix (): Transform2d {
        return this.parent ? Transform2d.transform(this.parent.getWorldMatrix(), this.localMatrix) : this.localMatrix;
    };
    getBoundingbox (): {x:number,y:number,w:number,h:number} {
        return null;
    };
    hittest (graph:DemoGraph, x:number, y:number): boolean {
        return false;
    };
    getWorldBoundingbox (): {x:number,y:number,w:number,h:number} {
        let bbox = this.getBoundingbox ();
        if (bbox) {
            let worldMatrix = this.getWorldMatrix();
            let lt = worldMatrix.transformPoint({x:bbox.x,y:bbox.y});
            let rt = worldMatrix.transformPoint({x:bbox.x+bbox.w,y:bbox.y});
            let lb = worldMatrix.transformPoint({x:bbox.x,y:bbox.y+bbox.h});
            let rb = worldMatrix.transformPoint({x:bbox.x+bbox.w,y:bbox.y+bbox.h});
            let minx = lt.x;
            let miny = lt.y;
            let maxx = lt.x;
            let maxy = lt.y;
            if (minx > rt.x) {
                minx = rt.x;
            }
            if (maxx < rt.x) {
                maxx = rt.x;
            }
            if (minx > lb.x) {
                minx = lb.x;
            }
            if (maxx < lb.x) {
                maxx = lb.x;
            }
            if (minx > rb.x) {
                minx = rb.x;
            }
            if (maxx < rb.x) {
                maxx = rb.x;
            }
            if (miny > rt.y) {
                miny = rt.y;
            }
            if (maxy < rt.y) {
                maxy = rt.y;
            }
            if (miny > lb.y) {
                miny = lb.y;
            }
            if (maxy < lb.y) {
                maxy = lb.y;
            }
            if (miny > rb.y) {
                miny = rb.y;
            }
            if (maxy < rb.y) {
                maxy = rb.y;
            }
            return { x:minx,y:miny,w:maxx-minx,h:maxy-miny};
        } else {
            return null;
        }
    };
    applyTransform (ctx:any): void {
        let matrix = this.getWorldMatrix();
        ctx.setTransform (matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    };
    addChild (child:GraphEntity): void {
        if (child && child.parent===null) {
            child.parent = this;
            this.children.push (child);
        }
    };
    remove (): void {
        if (this.parent) {
            for (let i = 0; i < this.parent.children.length; i++) {
                if (this.parent.children[i] == this) {
                    this.parent.children.splice (i, 1);
                    break;
                }
            }
        }
        this.parent = null;
    };
    removeChildren (): void {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].parent = null;
        }
        this.children = [];
    };
    onCull (graph:DemoGraph): boolean {
        if (this.visible) {
            let bbox = this.getWorldBoundingbox ();
            let culled = false;
            if (bbox) {
                let minx = bbox.x;
                let miny = bbox.y;
                let maxx = bbox.x + bbox.w;
                let maxy = bbox.y + bbox.h;
                culled = (minx >= graph.canvasWidth || miny >= graph.canvasHeight || maxx <= 0 || maxy <= 0);
            }
            return culled;
        } else {
            return true;
        }
    };
    /*
    onUpdate (dt:number, rt:number): void {
    };
    onMouseEnter (): void {
    };
    onMouseLeave (): void {
    };
    onMouseDown (evt:any): void {
    };
    onMouseUp (evt:any): void {
    };
    onClick (evt:any): void {
    };
    onDblClick (evt:any): void {
    };
    onMouseWheel (evt:any): void {
    };
    onDragStart (evt:any): any {
        return null;
    };
    onDragEnd (evt:any, data:any): void {
    };
    onDragOver (evt:any, data:any): void {
    };
    onDragDrop (evt:any, data:any): void {
    };
    */
}

export class Motion extends GraphEntity {
    starttime: number;
    lasttime: number;
    graph: DemoGraph;
    callback: ((motion:Motion)=>void);
    constructor (callback:(motion:Motion)=>void=null) {
        super ();
        this.callback = callback;
        this.lasttime = 0;
        this.starttime = 0;
        this.graph = null;
        this.on ('update', (evt:{dt:number;rt:number})=>{
            if (this.starttime == 0) {
                this.starttime = evt.rt;
                this.lasttime = evt.rt;
            }
            this.onMotion (evt.rt-this.lasttime, evt.rt-this.starttime);
            this.lasttime = evt.rt;
        });
    }
    onCull (graph:DemoGraph): boolean {
        return true;
    }
    /*
    onUpdate (dt:number, rt:number): void {
        if (this.starttime == 0) {
            this.starttime = rt;
            this.lasttime = rt;
        }
        this.onMotion (rt-this.lasttime, rt-this.starttime);
        this.lasttime = rt;
    }
    */
    onMotion (dt:number, rt:number): void {
    }
    stop (): void {
        this.starttime = 0;
        this.lasttime = 0;
        this.remove ();
        if (this.callback) {
            this.callback (this);
        }
    }
}

export class PathMotion extends Motion {
    entity: GraphEntity;
    evalutor_x: CurveEvaluter;
    evalutor_y: CurveEvaluter;
    constructor (entity:GraphEntity,cp:Array<{t:number,x:number,y:number}>, mode:string='poly', callback:(motion:Motion)=>void=null) {
        super(callback);
        this.entity = entity;
        let x:Array<{x:number,y:number}> = new Array(cp.length);
        let y:Array<{x:number,y:number}> = new Array(cp.length);
        for (let i = 0; i < cp.length; i++) {
            x[i] = {x:cp[i].t,y:cp[i].x};
            y[i] = {x:cp[i].t,y:cp[i].y};
        }
        if (mode == 'step') {
            this.evalutor_x = new StepEvaluter(x);
            this.evalutor_y = new StepEvaluter(y);
        } else if (mode == 'linear') {
            this.evalutor_x = new LinearEvaluter(x);
            this.evalutor_y = new LinearEvaluter(y);
        } else /*if (mode == 'poly')*/ {
            this.evalutor_x = new PolynomialsEvaluter(x);
            this.evalutor_y = new PolynomialsEvaluter(y);
        }
    }
    onMotion (dt:number, rt:number): void {
        console.log ('motion: dt='+dt + ' rt='+rt);
        let endTime = this.evalutor_x.cp[this.evalutor_x.cp.length-1].x;
        if (rt > endTime) {
            rt = endTime;
        }
        let destX = this.evalutor_x.eval (rt);
        let destY = this.evalutor_y.eval (rt);
        console.log ('motion: destX='+destX + ' destY='+destY);
        this.entity.localMatrix = Transform2d.getTranslate(destX, destY);
        if (rt == endTime) {
            this.stop ();
        }
    }
}

export class DemoGraph extends EventObject {
    canvas: any;
    canvasWidth: number;
    canvasHeight: number;
    screenCtx: any;
    buffer: any;
    ctx: any;
    rootEntity: GraphEntity;
    motions: Motion[];
    nextMotionId: number;
    hoverEntity: GraphEntity;
    draggingEntity: GraphEntity;
    draggingData: any;
    mouseOver: boolean;
    mouseX: number;
    mouseY: number;
    lastFrameTime: number;
    firstFrameTime: number;
    running: boolean;

    constructor (canvas:any) {
        super ();
        this.canvas = canvas;
        this.canvasWidth = this.canvas.width();
        this.canvasHeight = this.canvas.height();
        this.canvas[0].width = this.canvasWidth;
        this.canvas[0].height = this.canvasHeight;
        this.screenCtx = this.canvas[0].getContext('2d');

        this.buffer = document.createElement('canvas');
        this.buffer.width = this.canvasWidth;
        this.buffer.height = this.canvasHeight;
        this.ctx = this.buffer.getContext('2d');

        this.rootEntity = null;
        this.motions = [];
        this.nextMotionId = 1;

        this.hoverEntity = null;
        this.draggingEntity = null;
        this.draggingData = null;
        this.mouseOver = false;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.lastFrameTime = 0;
        this.firstFrameTime = 0;
        this.running = false;

        canvas.on ('mouseenter', (evt:any)=>{
            this.mouseOver = true;
            this.canvas[0].focus();
            this.trigger ('mouseenter', { evt:evt });
            //this.onMouseEnter(evt);
        });
        canvas.on ('mouseleave', (evt:any)=>{
            this.mouseOver = false;
            if (this.draggingEntity) {
                if (this.draggingData) {
                    this.draggingEntity.trigger('dragend', { evt:evt, data:this.draggingData });
                    this.draggingData = null;
                }
                this.draggingEntity = null;
            }
            if (this.hoverEntity) {
                this.hoverEntity.trigger('mouseleave', { evt:evt });
                this.hoverEntity = null;
            }
            this.trigger ('mouseleave', { evt:evt });
            //this.onMouseLeave(evt);
        });
        canvas.on ('mousemove', (evt:any)=>{
            this.mouseX = evt.offsetX;
            this.mouseY = evt.offsetY;
            this.updateHoverEntity (evt);
    
            if (this.draggingEntity && !this.draggingData) {
                this.draggingData = { allow:false };
                this.draggingEntity.trigger('dragstart', { evt:evt, data:this.draggingData });
                if (!this.draggingData.allow) {
                    this.draggingEntity = null;
                    this.draggingData = null;
                }
            } else if (this.hoverEntity && this.draggingEntity && this.draggingData) {
                this.hoverEntity.trigger('dragover', { evt:evt, data:this.draggingData });
            }
            this.trigger ('mousemove', { evt:evt });
            //this.onMouseMove(evt);
        });
        canvas.on ('mousedown', (evt:any)=>{
            if (this.hoverEntity) {
                this.hoverEntity.trigger('mousedown', { evt:evt });
                if (evt.button == 0) {
                    this.draggingEntity = this.hoverEntity;
                    this.draggingData = null;
                }
            }
            this.trigger ('mousedown', { evt:evt });
            //this.onMouseDown(evt);
        });
        canvas.on ('mouseup', (evt:any)=>{
            if (evt.button == 0) {
                if (this.draggingEntity && this.draggingData) {
                    if (this.hoverEntity) {
                        this.hoverEntity.trigger ('dragdrop', { evt:evt, data:this.draggingData });
                    }
                    this.draggingEntity.trigger ('dragend', { evt:evt, data:this.draggingData });
                }
                this.draggingEntity = null;
                this.draggingData = null;
            }
            if (this.hoverEntity) {
                this.hoverEntity.trigger ('mouseup', { evt:evt });
            }
            this.trigger ('mouseup', { evt:evt });
            //this.onMouseUp(evt);
        });
        canvas.on ('click', (evt:any)=>{
            if (this.hoverEntity) {
                this.hoverEntity.trigger ('click', { evt:evt });
            }
            this.trigger ('click', { evt:evt });
            //this.onClick(evt);
        });
        canvas.on ('mousewheel', (evt:any)=>{
            if (this.hoverEntity) {
                this.hoverEntity.trigger ('mousewheel', { evt:evt });
            }
            this.trigger ('mousewheel', { evt:evt });
            //this.onMouseWheel(evt);
        });
        canvas.on ('dblclick', (evt:any)=>{
            if (this.hoverEntity) {
                this.hoverEntity.trigger('dblclick', { evt:evt });
            }
            this.trigger ('dblclick', { evt:evt });
            //this.onDblClick(evt);
        });
    };

    updateHoverEntity (evt:any): void {
        if (this.mouseOver) {
            let hitResult = this.hittest (this.mouseX, this.mouseY);
            let hover = hitResult.length>0 ? hitResult[0] : null;
            if (this.hoverEntity != hover) {
                if (this.hoverEntity) {
                    this.hoverEntity.trigger('mouseleave', { evt:evt });
                }
                if (hover) {
                    hover.trigger('mouseenter', { evt:evt });
                }
                this.hoverEntity = hover;
            }
        }
    };

    hittest (x:number, y:number): GraphEntity[] {
        function hittest_r (graph:DemoGraph, entity:GraphEntity, hitResult:GraphEntity[]) {
            let invWorldMatrix = Transform2d.invert(entity.getWorldMatrix());
            let localPoint = invWorldMatrix.transformPoint ({x:x,y:y});
            if (entity.hittest(graph, localPoint.x, localPoint.y)) {
                hitResult.push(entity);
            }
            for (let i = 0; i < entity.children.length; i++) {
                hittest_r (graph, entity.children[i], hitResult);
            }
        }
        let hitResult:GraphEntity[] = [];
        if (this.rootEntity) {
            hittest_r (this, this.rootEntity, hitResult);
            hitResult.sort (function(a,b){
                return b.z - a.z;
            });
        }
        return hitResult;
    };

    update (entity:GraphEntity, dt:number, rt:number): void {
        entity.processEvents ();
        entity.trigger ('update', { dt:dt, rt:rt });
        for (let i = 0; i < entity.children.length; i++) {
            this.update (entity.children[i], dt, rt);
        }
    };

    cull (entity:GraphEntity, cullResult:any): void {
        if (!entity.onCull(this)) {
            let z = entity.z;
            let group = cullResult[z]||[];
            group.push (entity);
            cullResult[z] = group;
        }
        for (let i = 0; i < entity.children.length; i++) {
            this.cull (entity.children[i], cullResult);
        }
    };

    clear (color:any): void {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.restore();
    };

    draw (): void {
        let cullResult: Object = {};
        if (this.rootEntity) {
            this.cull (this.rootEntity, cullResult);
        }
        for (let i in cullResult) {
            let group:GraphEntity[] = (cullResult as any)[i];
            for (let j = 0; j < group.length; j++) {
                group[j].applyTransform (this.ctx);
                group[j].trigger ('draw', { graph:this });
                //group[j].draw (this);
            }
        }
        if (this.draggingEntity && this.draggingData && this.draggingData.draw) {
            let matrix = Transform2d.getTranslate(this.mouseX, this.mouseY);
            this.ctx.setTransform (matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
            this.draggingData.draw.call (this.draggingEntity, this);
        }
        this.screenCtx.drawImage(this.buffer, 0, 0);
    };

    run (): void {
        let that = this;
        function frame (ts:number) {
            if (that.running) {
                if (that.lastFrameTime == 0) {
                    that.lastFrameTime = ts;
                    that.firstFrameTime = ts;
                }
                let dt = ts - that.lastFrameTime;
                let rt = ts - that.firstFrameTime;
                that.lastFrameTime = ts;
                that.updateHoverEntity (null);
                if (that.rootEntity) {
                    that.update (that.rootEntity, dt, rt);
                    that.draw ();
                }
                requestAnimationFrame (frame);
            }
        }
        if (!this.running) {
            this.running = true;
            requestAnimationFrame (frame);
        }
    };

    stop (): void {
        this.running = false;
    };
}

export class Graph {
    canvasWidth: number;
    canvasHeight: number;
    ctx: any;

    constructor (canvas:any) {
        this.canvasWidth = canvas.width();
        this.canvasHeight = canvas.height();
        canvas[0].width = this.canvasWidth;
        canvas[0].height = this.canvasHeight;
        this.ctx = canvas[0].getContext('2d');
    };

    histogram (options:any): void {
        let paddingH = options.paddingH||20;
        let paddingV = options.paddingV||20;
        let color = options.color||'#f00';
        let bkcolor = options.bkcolor||'#fff';
        let barWidth = Math.round((this.canvasWidth - (options.values.length + 1) * paddingH) / options.values.length);
        let barHeight = this.canvasHeight - 2 * paddingV;
        let barTop = paddingV;
        let barLeft = paddingH;
        let maxValue = 0;
        for (let i = 0; i < options.values.length; i++) {
            if (options.values[i] > maxValue) {
                maxValue = options.values[i];
            }
        }
        this.ctx.fillStyle = bkcolor;
        if (maxValue > 0) {
            this.ctx.fillRect (0, 0, this.canvasWidth, this.canvasHeight);
            this.ctx.fillStyle = color;
            for (let i = 0; i < options.values.length; i++) {
                let top = barTop + Math.round(barHeight * (maxValue-options.values[i])/maxValue);
                let height = this.canvasHeight - paddingV - top;
                this.ctx.fillRect (barLeft, top, barWidth, height);
                barLeft += barWidth;
                barLeft += paddingH;
            }
        }
    };
}
/*
window.Graph = (function(){
    let Graph = function (canvas) {
        this.canvasWidth = canvas.width();
        this.canvasHeight = canvas.height();
        canvas[0].width = this.canvasWidth;
        canvas[0].height = this.canvasHeight;
        this.ctx = canvas[0].getContext('2d');
    };

    Graph.prototype.histogram = function (options) {
        let paddingH = options.paddingH||20;
        let paddingV = options.paddingV||20;
        let color = options.color||'#f00';
        let bkcolor = options.bkcolor||'#fff';
        let barWidth = Math.round((this.canvasWidth - (options.values.length + 1) * paddingH) / options.values.length);
        let barHeight = this.canvasHeight - 2 * paddingV;
        let barTop = paddingV;
        let barLeft = paddingH;
        let maxValue = 0;
        for (let i = 0; i < options.values.length; i++) {
            if (options.values[i] > maxValue) {
                maxValue = options.values[i];
            }
        }
        this.ctx.fillStyle = bkcolor;
        if (maxValue > 0) {
            this.ctx.fillRect (0, 0, this.canvasWidth, this.canvasHeight);
            this.ctx.fillStyle = color;
            for (let i = 0; i < options.values.length; i++) {
                let top = barTop + Math.round(barHeight * (maxValue-options.values[i])/maxValue);
                let height = this.canvasHeight - paddingV - top;
                this.ctx.fillRect (barLeft, top, barWidth, height);
                barLeft += barWidth;
                barLeft += paddingH;
            }
        }
    };

    return Graph;
})();
*/
