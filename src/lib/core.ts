import {Transform2d} from './transform';
import $ from 'jquery';

type cwCullResult = {[z:number]:Array<{object:cwEventObserver,z:number,transform:Transform2d}>};
type cwHitTestResult = Array<cwSceneObject>;
type cwEventHandler = (evt:cwEvent) => void;
type cwEventHandlerEntry = { handler:cwEventHandler,bindObject:any };

export class cwEvent {
    readonly type: string;
    constructor (type:string) {
        this.type = type;
    }
}

export class cwComponentAttachedEvent extends cwEvent {
    static readonly type: string = '@componentAttached';
    constructor () {
        super (cwComponentAttachedEvent.type);
    }
}

export class cwComponentDetachedEvent extends cwEvent {
    static readonly type: string = '@componentDetached';
    constructor () {
        super (cwComponentDetachedEvent.type);
    }
}

export class cwUpdateEvent extends cwEvent {
    static readonly type: string = '@update';
    public readonly deltaTime: number;
    public readonly elapsedTime: number;
    public readonly frameStamp: number;
    constructor (deltaTime:number, elapsedTime:number, frameStamp:number) {
        super (cwUpdateEvent.type);
        this.deltaTime = deltaTime;
        this.elapsedTime = elapsedTime;
        this.frameStamp = frameStamp;
    }
}

export class cwCullEvent extends cwEvent {
    static readonly type: string = '@cull';
    result:cwCullResult;
    constructor () {
        super (cwCullEvent.type);
        this.result = {};
    }
    addObject (object:cwEventObserver, z:number, transform:Transform2d): void {
        let objectList = this.result[z]||[];
        objectList.push ({object:object,z:z,transform:transform});
        this.result[z] = objectList;
    }
}

export class cwDrawEvent extends cwEvent {
    static readonly type: string = '@draw';
    readonly canvas:cwCanvas;
    readonly z:number;
    readonly transform:Transform2d;
    constructor (canvas:cwCanvas, z:number, transform:Transform2d) {
        super (cwDrawEvent.type);
        this.canvas = canvas;
        this.z = z;
        this.transform = transform;
    }
}

export class cwHitTestEvent extends cwEvent {
    static readonly type: string = '@hittest';
    result:cwHitTestResult;
    constructor () {
        super (cwHitTestEvent.type);
        this.result = [];
    }
}

export class cwFrameEvent extends cwEvent {
    static readonly type: string = '@frame';
    readonly deltaTime: number;
    readonly elapsedTime: number;
    readonly frameStamp: number;
    constructor (deltaTime:number, elapsedTime:number, frameStamp:number) {
        super (cwFrameEvent.type);
        this.deltaTime = deltaTime;
        this.elapsedTime = elapsedTime;
        this.frameStamp = frameStamp;
    }
}

export class cwMouseEvent extends cwEvent {
    readonly x:number;
    readonly y:number;
    readonly button:number;
    readonly shiftDown:boolean;
    readonly altDown:boolean;
    readonly ctrlDown:boolean;
    readonly metaDown:boolean;
    constructor (type:string,x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (type);
        this.x = x;
        this.y = y;
        this.button = button;
        this.shiftDown = shiftDown;
        this.altDown = altDown;
        this.ctrlDown = ctrlDown;
        this.metaDown = metaDown;
    }
}

export class cwMouseDownEvent extends cwMouseEvent {
    static readonly type: string = '@mousedown';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseDownEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwMouseUpEvent extends cwMouseEvent {
    static readonly type: string = '@mouseup';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseDownEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwMouseMoveEvent extends cwMouseEvent {
    static readonly type: string = '@mousemove';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseDownEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwMouseEnterEvent extends cwMouseEvent {
    static readonly type: string = '@mouseenter';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseDownEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwMouseLeaveEvent extends cwMouseEvent {
    static readonly type: string = '@mouseleave';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseDownEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwClickEvent extends cwMouseEvent {
    static readonly type: string = '@click';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseDownEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwDblClickEvent extends cwMouseEvent {
    static readonly type: string = '@dblclick';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseDownEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwApp {
    private static eventQueue:Array<{evt:cwEvent,target:any}> = [];
    private static eventListeners:{[eventType:string]:Array<cwEventHandlerEntry>} = {};
    private static running = false;
    private static lastFrameTime = 0;
    private static firstFrameTime = 0;
    private static frameStamp = 0;
    static elapsedTime = 0;
    static deltaTime = 0;
    private static processEvent (evt:cwEvent,target:any): void {
        let handlerList = cwApp.eventListeners[evt.type];
        if (handlerList) {
            handlerList.forEach ((handler:cwEventHandlerEntry)=>{
                if (!target || handler.bindObject === target) {
                    handler.handler.call (handler.bindObject, evt);
                }
            });
        }
    }
    static postEvent (target:any, evt:cwEvent): void {
        cwApp.eventQueue.push ({evt:evt,target:target});
    }
    static triggerEvent (target:any, evt:cwEvent): void {
        cwApp.processEvent (evt,target);
    }
    static processPendingEvents (): void {
        const events = cwApp.eventQueue;
        cwApp.eventQueue = [];
        events.forEach ((evt:{evt:cwEvent,target:any})=>{
            cwApp.processEvent (evt.evt,evt.target);
        });
    }
    static addEventListener (eventType:string, bindObject:any, handler:cwEventHandler) {
        let handlerList = cwApp.eventListeners[eventType]||[];
        for (let i = 0; i < handlerList.length; i++) {
            if (handlerList[i].bindObject === bindObject) {
                handlerList[i].handler = handler;
                return;
            }
        }
        handlerList.push ({
            bindObject: bindObject,
            handler: handler
        });
        this.eventListeners[eventType] = handlerList;
    }
    static removeEventListener (eventType:string, bindObject:any) {
        let handlerList = cwApp.eventListeners[eventType]||[];
        for (let i = 0; i < handlerList.length; i++) {
            if (handlerList[i].bindObject === bindObject) {
                handlerList.splice (i, 1);
                break;
            }
        }
    }
    static run () {
        function frame (ts:number) {
            if (cwApp.running) {
                if (cwApp.lastFrameTime == 0) {
                    cwApp.lastFrameTime = ts;
                    cwApp.firstFrameTime = ts;
                }
                cwApp.deltaTime = ts - cwApp.lastFrameTime;
                cwApp.elapsedTime = ts - cwApp.firstFrameTime;
                cwApp.lastFrameTime = ts;
                cwApp.frameStamp++;
                cwApp.processPendingEvents ();
                cwApp.triggerEvent(null, new cwFrameEvent(cwApp.deltaTime, cwApp.elapsedTime, cwApp.frameStamp));
                if (cwApp.running) {
                    requestAnimationFrame (frame);
                }
            }
        }
        if (!cwApp.running) {
            cwApp.running = true;
            cwApp.lastFrameTime = 0;
            cwApp.firstFrameTime = 0;
            cwApp.elapsedTime = 0;
            cwApp.deltaTime = 0;
            cwApp.frameStamp = 0;
            requestAnimationFrame (frame);
        }
    }
    static stop () {
        this.running = false;
    }
}

export class cwEventObserver {
    on (type:string, handler:cwEventHandler): void {
        cwApp.addEventListener (type, this, handler);
    }
    off (type:string): void {
        cwApp.removeEventListener (type, this);
    }
    trigger (evt:cwEvent): void {
        cwApp.triggerEvent (this, evt);
    }
    post (evt:cwEvent): void {
        cwApp.postEvent (this, evt);
    }
}

export class cwComponent extends cwEventObserver {
    readonly type: string;
    object: cwObject|null;
    constructor (type:string) {
        super ();
        this.type = type;
        this.object = null;
    }
    toString(): string {
        return `<Component: ${this.type}>`;
    }
}

export class cwObject extends cwEventObserver {
    private components:{[type:string]:Array<cwComponent>};
    constructor () {
        super ();
        this.components = {}
    }
    addComponent (component:cwComponent): cwObject {
        if (component.object === null) {
            let componentArray = this.components[component.type]||[];
            if (componentArray.indexOf(component) < 0) {
                componentArray.push (component);
                component.object = this;
                component.trigger (new cwComponentAttachedEvent());
            }
            this.components[component.type] = componentArray;
        }
        return this;
    }
    removeComponent (component:cwComponent): cwObject {
        if (component.object === this) {
            let index = this.components[component.type].indexOf(component);
            this.removeComponentByIndex (component.type, index);
        }
        return this;
    }
    removeComponentByIndex (type:string, index:number): cwObject {
        const components = this.components[type];
        if (components && index>=0 && index<components.length) {
            components[index].object = null;
            components[index].trigger (new cwComponentDetachedEvent());
            components.splice(index, 1);
        }
        return this;
    }
    removeComponentsByType (type:string): cwObject {
        const components = this.components[type];
        while (components && components.length>0) {
            this.removeComponentByIndex (type, components.length-1);
        }
        return this;
    }
    removeAllComponents (): cwObject {
        Object.keys (this.components).forEach (type => {
            this.removeComponentsByType (type);
        });
        return this;
    }
    getComponent (type:string, index:number=0): cwComponent|null {
        let componentArray = this.components[type];
        if (componentArray === undefined || index < 0 || componentArray.length <= index) {
            return null;
        }
        return componentArray[index];
    }
    getComponents (type:string): Array<cwComponent> {
        return this.components[type];
    }
    triggerEx (evt:cwEvent): void {
        super.trigger (evt);
        for (const c in this.components) {
            if (this.components.hasOwnProperty(c)) {
                this.components[c].forEach ((comp:cwComponent) => {
                    comp.trigger (evt);
                });
            }
        }
    }
    post (evt:cwEvent): void {
        cwApp.postEvent (this, evt);
    }
}

export class cwSceneObject extends cwObject {
    private _parent:cwSceneObject|null;
    private _z:number;
    private _visible:boolean;
    private _children: Array<cwSceneObject>;
    private _localTransform: Transform2d;
    constructor (parent:cwSceneObject = null) {
        super();
        this._parent = null;
        this._z = 0;
        this._visible = true;
        this._children = [];
        this._localTransform = new Transform2d();
        if (parent) {
            parent.addChild (this);
        }
    }
    get parent () {
        return this._parent;
    }
    get z () {
        return this._z;
    }
    set z (value:number) {
        this._z = value;
    }
    get visible () {
        return this._visible;
    }
    set visible (value:boolean) {
        this._visible = value;
    }
    get localTransform () {
        return this._localTransform;
    }
    set localTransform (t:Transform2d) {
        this._localTransform = t;
    }
    get worldTransform (): Transform2d {
        return this.parent ? Transform2d.transform(this.parent.worldTransform, this._localTransform) : this._localTransform;
    };
    get numChildren () {
        return this._children.length;
    }
    childAt (index:number): cwSceneObject {
        return this._children[index];
    }
    forEachChild (callback:(child:cwSceneObject,index:number)=>void) {
        this._children.forEach(callback);
    }
    addChild (child:cwSceneObject): void {
        if (child._parent === null) {
            child._parent = this;
            this._children.push (child);
        }
    }
    removeChild (child:cwSceneObject): void {
        if (child._parent === this) {
            let index = this._children.indexOf (child);
            this.removeChildAt (index);
        }
    }
    removeChildAt (index:number): void {
        if (index >= 0 && index < this._children.length) {
            let child = this._children[index];
            this._children.splice (index, 1);
            child._parent = null;
        }
    }
    remove (): void {
        if (this._parent) {
            this._parent.removeChild (this);
        }
    }
    applyTransform (ctx:CanvasRenderingContext2D): void {
        let matrix = this.worldTransform;
        ctx.setTransform (matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    };
    triggerRecursive (evt:cwEvent): void {
        super.trigger (evt);
        this.forEachChild ((child:cwSceneObject, index:number) => {
            child.triggerRecursive (evt);
        });
    }
    triggerRecursiveEx (evt:cwEvent): void {
        super.triggerEx (evt);
        this.forEachChild ((child:cwSceneObject, index:number) => {
            child.triggerRecursiveEx (evt);
        });
    }
}

export class cwScene extends cwObject {
    readonly rootNode: cwSceneObject;
    public clearColor: string|null;
    public readonly canvas: cwCanvas;
    constructor (canvas:HTMLCanvasElement) {
        super ();
        this.rootNode = new cwSceneObject();
        this.clearColor = null;
        this.canvas = new cwCanvas(canvas);
        this.on (cwFrameEvent.type, (evt:cwEvent) => {
            let frameEvent = evt as cwFrameEvent;
            let updateEvent = new cwUpdateEvent(frameEvent.deltaTime,frameEvent.elapsedTime,frameEvent.frameStamp);
            this.rootNode.triggerRecursiveEx (updateEvent);
            this.draw ();
        });
    }
    draw (): void {
        if (this.clearColor !== null) {
            this.canvas.clear (this.clearColor);
        }
        let cullEvent = new cwCullEvent();
        this.rootNode.triggerRecursiveEx (cullEvent);
        for (let i in cullEvent.result) {
            let group = cullEvent.result[i];
            for (let j = 0; j < group.length; j++) {
                group[j].object.trigger (new cwDrawEvent(this.canvas, group[j].z, group[j].transform));
            }
        }
        this.canvas.flip ();
    }
    hitTest (): cwHitTestResult {
        let evt = new cwHitTestEvent ();
        this.rootNode.triggerRecursiveEx (evt);
        return evt.result;
    }
}

export class cwCanvas extends cwObject {
    private _canvas:HTMLCanvasElement;
    private _buffer:HTMLCanvasElement;
    private _width:number;
    private _height:number;
    private _screenCtx:CanvasRenderingContext2D;
    private _offscreenCtx:CanvasRenderingContext2D;
    private _mouseOver:boolean;
    private static readonly eventNames = ['mouseenter']
    private initEventHandlers () {
        this._canvas.addEventListener ('mouseenter', (ev:MouseEvent) => {
            if (!this._mouseOver) {
                this._mouseOver = true;
                console.log ('Canvas mouse entered');
            }
        });
        this._canvas.addEventListener ('mouseleave', (ev:MouseEvent) => {
            this._mouseOver = false;
            console.log ('Canvas mouse leaved');
        });
    }
    constructor (canvas:HTMLCanvasElement) {
        super ();
        this._canvas = canvas;
        this._width = $(canvas).width();
        this._height = $(canvas).height();
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        this._screenCtx = this._canvas.getContext ("2d");
        this._buffer = document.createElement ("canvas");
        this._buffer.width = this._width;
        this._buffer.height = this._height;
        this._offscreenCtx = this._buffer.getContext ("2d");
        this._mouseOver = false;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get context() {
        return this._offscreenCtx;
    }
    clear (color:string): void {
        this._offscreenCtx.save ();
        this._offscreenCtx.fillStyle = color;
        this._offscreenCtx.fillRect (0, 0, this._width, this._height);
        this._offscreenCtx.restore ();
    }
    applyTransform (transform:Transform2d): void {
        this._offscreenCtx.setTransform (transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
    };
    flip (): void {
        this._screenCtx.drawImage (this._buffer, 0, 0);
    }
}

export class cwcVisual extends cwComponent {
    static readonly type = 'Visual';
    constructor () {
        super (cwcVisual.type);
        this.on (cwCullEvent.type, (evt:cwEvent) => {});
        this.on (cwHitTestEvent.type, (evt:cwEvent) => {});
        this.on (cwDrawEvent.type, (evt:cwEvent) => {});
    }
}

