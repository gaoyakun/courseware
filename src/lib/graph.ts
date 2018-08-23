import {Transform2d} from './transform';

export class GraphEntity {
    parent: GraphEntity|null;
    z: number;
    visible: boolean;
    children: GraphEntity[];
    localMatrix: Transform2d;

    constructor () {
        this.parent = null;
        this.z = 0;
        this.visible = true;
        this.children = [];
        this.localMatrix = new Transform2d();
    }
    getWorldMatrix (): Transform2d {
        return this.parent ? Transform2d.transform(this.parent.getWorldMatrix(), this.localMatrix) : this.localMatrix;
    };
    getBoundingbox (): {x:number,y:number,w:number,h:number}|null {
        return null;
    };
    hittest (graph:DemoGraph, x:number, y:number): boolean {
        return false;
    };
    getWorldBoundingbox (): {x:number,y:number,w:number,h:number}|null {
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
    draw (graph:DemoGraph): void {
        graph.ctx.save();
        graph.ctx.fillStyle('#ff0000');
        graph.ctx.fillRect(-10,-10,20,20);
        graph.ctx.restore();
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
}

export class Motion {
    entity: GraphEntity|null;
    running: boolean;
    starttime: number;
    lasttime: number;
    graph: DemoGraph|null;
    callback: ((motion:Motion)=>void)|null;
    constructor () {
        this.entity = null;
        this.running = false;
        this.callback = null;
        this.lasttime = 0;
        this.starttime = 0;
        this.graph = null;
    }
    onUpdate (dt:number, rt:number): void {
    }
    isRunning (): boolean {
        return this.running;
    }
    start (callback:((motion:Motion)=>void)|null): void {
        if (!this.running) {
            this.callback = callback;
            this.running = true;
        }
    }
    update (dt:number, rt:number): void {
        if (this.running) {
            if (this.starttime = 0) {
                this.starttime = rt;
                this.lasttime = rt;
            }
            this.onUpdate (rt-this.lasttime, rt-this.starttime);
            this.lasttime = rt;
        }
    }
    stop (): void {
        if (this.running) {
            this.running = false;
            if (this.callback) {
                this.callback (this);
                this.callback = null;
            }
            this.starttime = 0;
            this.lasttime = 0;
        }
    }
}

export class ArcMotion extends Motion {
    startPoint: {x:number,y:number};
    endPoint: {x:number,y:number};
    height: number;
    duration: number;
    speed: number;
    private center:{x:number,y:number};
    private transformedStart:{x:number,y:number};
    private theta: number;
    constructor (start:{x:number,y:number}, end:{x:number,y:number}, height:number) {
        super();
        this.startPoint = start;
        this.endPoint = end;
        this.height = height;
        this.duration = 0;
        this.speed = 0;
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        let halfdist = dist/2;
        let radius = (halfdist*halfdist + height*height) / (height * 2);
    }
    onUpdate (dt:number, rt:number): void {
    }
}

export class DemoGraph {
    canvas: any;
    canvasWidth: number;
    canvasHeight: number;
    screenCtx: any;
    buffer: any;
    ctx: any;
    rootEntity: GraphEntity|null;
    motions: Motion[];
    nextMotionId: number;
    hoverEntity: GraphEntity|null;
    draggingEntity: GraphEntity|null;
    draggingData: any;
    mouseOver: boolean;
    mouseX: number;
    mouseY: number;
    lastFrameTime: number;
    firstFrameTime: number;
    running: boolean;

    constructor (canvas:any) {
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
            this.onMouseEnter(evt);
        });
        canvas.on ('mouseleave', (evt:any)=>{
            this.onMouseLeave(evt);
        });
        canvas.on ('mousemove', (evt:any)=>{
            this.onMouseMove(evt);
        });
        canvas.on ('mousedown', (evt:any)=>{
            this.onMouseDown(evt);
        });
        canvas.on ('mouseup', (evt:any)=>{
            this.onMouseUp(evt);
        });
        canvas.on ('click', (evt:any)=>{
            this.onClick(evt);
        });
        canvas.on ('mousewheel', (evt:any)=>{
            this.onMouseWheel(evt);
        });
        canvas.on ('dblclick', (evt:any)=>{
            this.onDblClick(evt);
        });
    };

    onMouseEnter (evt:any): void {
        this.mouseOver = true;
        this.canvas[0].focus();
    };

    onMouseLeave (evt:any): void {
        this.mouseOver = false;
        if (this.draggingEntity) {
            if (this.draggingData) {
                this.draggingEntity.onDragEnd(evt, this.draggingData);
                this.draggingData = null;
            }
            this.draggingEntity = null;
        }
        if (this.hoverEntity) {
            this.hoverEntity.onMouseLeave();
            this.hoverEntity = null;
        }
    };

    onMouseMove (evt:any): void {
        this.mouseX = evt.offsetX;
        this.mouseY = evt.offsetY;
        this.updateHoverEntity ();

        if (this.draggingEntity && !this.draggingData) {
            this.draggingData = this.draggingEntity.onDragStart(evt);
            if (!this.draggingData) {
                this.draggingEntity = null;
                this.draggingData = null;
            }
        } else if (this.hoverEntity && this.draggingEntity && this.draggingData && this.draggingEntity != this.hoverEntity) {
            this.hoverEntity.onDragOver(evt, this.draggingData);
        }
    };

    onMouseDown (evt:any): void {
        if (this.hoverEntity) {
            this.hoverEntity.onMouseDown(evt);
            if (evt.button == 0) {
                this.draggingEntity = this.hoverEntity;
                this.draggingData = null;
            }
        }
    };

    onMouseUp (evt:any): void {
        if (evt.button == 0) {
            if (this.draggingEntity && this.draggingData) {
                if (this.hoverEntity && this.hoverEntity != this.draggingEntity) {
                    this.hoverEntity.onDragDrop (evt, this.draggingData);
                }
                this.draggingEntity.onDragEnd (evt, this.draggingData);
            }
            this.draggingEntity = null;
            this.draggingData = null;
        }
        if (this.hoverEntity) {
            this.hoverEntity.onMouseUp (evt);
        }
    };

    onClick (evt:any): void {
        if (this.hoverEntity) {
            this.hoverEntity.onClick (evt);
        }
    };

    onDblClick (evt:any): void {
        if (this.hoverEntity) {
            this.hoverEntity.onDblClick(evt);
        }
    };

    onMouseWheel (evt:any): void {
        if (this.hoverEntity) {
            this.hoverEntity.onMouseWheel (evt);
        }
    };

    updateHoverEntity (): void {
        if (this.mouseOver) {
            let hitResult = this.hittest (this.mouseX, this.mouseY);
            let hover = hitResult.length>0 ? hitResult[0] : null;
            if (this.hoverEntity != hover) {
                if (this.hoverEntity) {
                    this.hoverEntity.onMouseLeave();
                }
                if (hover) {
                    hover.onMouseEnter();
                }
                this.hoverEntity = hover;
            }
        }
    };

    playMotion (motion:Motion, callback:(motion:Motion)=>void): void {
        if (!motion.graph) {
            motion.graph = this;
            this.motions.push (motion);
            motion.start (callback);
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
        entity.onUpdate(dt, rt);
        for (let i = 0; i < entity.children.length; i++) {
            this.update (entity.children[i], dt, rt);
        }

        let nullpos = 0;
        for (let i = 0; i < this.motions.length; i++) {
            if (!this.motions[i].isRunning()) {
                this.motions[i].graph = null;
                let tmp = this.motions[i];
                this.motions[i] = this.motions[nullpos];
                this.motions[nullpos] = tmp;
                nullpos++;
            } else {
                this.motions[i].onUpdate (dt, rt);
            }
        }
        if (nullpos > 0) {
            this.motions.splice(0, nullpos);
        }

        // for debug
        for (let i = 0; i < this.motions.length; i++) {
            if (!this.motions[i].graph || !this.motions[i].isRunning()) {
                console.error ('ASSERT error: remove finished motion failed');
            }
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
                group[j].draw (this);
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
                that.updateHoverEntity ();
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
