import {Transform2d} from './transform';
import $ from 'jquery';

type CullResult = {[z:number]:Array<cwSceneObject>};
type HitTestResult = Array<cwSceneObject>;
type EventHandler = (evt:Event) => void;
type EventHandlerEntry = { handler:EventHandler,bindObject:any };

export class Event {
    readonly type: string;
    constructor (type:string) {
        this.type = type;
    }
}

export class ComponentAttachedEvent extends Event {
    static readonly type: string = '@componentAttached';
    constructor () {
        super (ComponentAttachedEvent.type);
    }
}

export class ComponentDetachedEvent extends Event {
    static readonly type: string = '@componentDetached';
    constructor () {
        super (ComponentDetachedEvent.type);
    }
}

export class UpdateEvent extends Event {
    static readonly type: string = '@update';
    public readonly deltaTime: number;
    public readonly elapsedTime: number;
    public readonly frameStamp: number;
    constructor (deltaTime:number, elapsedTime:number, frameStamp:number) {
        super (UpdateEvent.type);
        this.deltaTime = deltaTime;
        this.elapsedTime = elapsedTime;
        this.frameStamp = frameStamp;
    }
}

export class CullEvent extends Event {
    static readonly type: string = '@cull';
    result:CullResult;
    constructor () {
        super (CullEvent.type);
        this.result = {};
    }
    addObject (object:cwSceneObject): void {
        let objectList = this.result[object.z]||[];
        objectList.push (object);
        this.result[object.z] = objectList;
    }
}

export class DrawEvent extends Event {
    static readonly type: string = '@draw';
    readonly canvas:cwCanvas;
    constructor (canvas:cwCanvas) {
        super (DrawEvent.type);
        this.canvas = canvas;
    }
}

export class HitTestEvent extends Event {
    static readonly type: string = '@hittest';
    result:HitTestResult;
    constructor () {
        super (HitTestEvent.type);
        this.result = [];
    }
}

export class FrameEvent extends Event {
    static readonly type: string = '@frame';
    public readonly deltaTime: number;
    public readonly elapsedTime: number;
    public readonly frameStamp: number;
    constructor (deltaTime:number, elapsedTime:number, frameStamp:number) {
        super (FrameEvent.type);
        this.deltaTime = deltaTime;
        this.elapsedTime = elapsedTime;
        this.frameStamp = frameStamp;
    }
}

export class cwApp {
    private static eventQueue:Array<{evt:Event,target:any}> = [];
    private static eventListeners:{[eventType:string]:Array<EventHandlerEntry>} = {};
    private static running = false;
    private static lastFrameTime = 0;
    private static firstFrameTime = 0;
    private static frameStamp = 0;
    static elapsedTime = 0;
    static deltaTime = 0;
    private static processEvent (evt:Event,target:any): void {
        let handlerList = cwApp.eventListeners[evt.type];
        if (handlerList) {
            handlerList.forEach ((handler:EventHandlerEntry)=>{
                if (!target || handler.bindObject === target) {
                    handler.handler.call (handler.bindObject, evt);
                }
            });
        }
    }
    static postEvent (target:any, evt:Event): void {
        cwApp.eventQueue.push ({evt:evt,target:target});
    }
    static triggerEvent (target:any, evt:Event): void {
        cwApp.processEvent (evt,target);
    }
    static processPendingEvents (): void {
        const events = cwApp.eventQueue;
        cwApp.eventQueue = [];
        events.forEach ((evt:{evt:Event,target:any})=>{
            cwApp.processEvent (evt.evt,evt.target);
        });
    }
    static addEventListener (eventType:string, bindObject:any, handler:EventHandler) {
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
                cwApp.triggerEvent(null, new FrameEvent(cwApp.deltaTime, cwApp.elapsedTime, cwApp.frameStamp));
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
    on (type:string, handler:EventHandler): void {
        cwApp.addEventListener (type, this, handler);
    }
    off (type:string): void {
        cwApp.removeEventListener (type, this);
    }
    trigger (evt:Event): void {
        cwApp.triggerEvent (this, evt);
    }
    post (evt:Event): void {
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
                component.trigger (new ComponentAttachedEvent());
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
            components[index].trigger (new ComponentDetachedEvent());
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
    triggerEx (evt:Event): void {
        super.trigger (evt);
        for (const c in this.components) {
            if (this.components.hasOwnProperty(c)) {
                this.components[c].forEach ((comp:cwComponent) => {
                    comp.trigger (evt);
                });
            }
        }
    }
    post (evt:Event): void {
        cwApp.postEvent (this, evt);
    }
}

export class cwSceneObject extends cwObject {
    private _parent:cwSceneObject|null;
    private _z:number;
    private _visible:boolean;
    private _children: Array<cwSceneObject>;
    private _localTransform: Transform2d;
    constructor () {
        super();
        this._parent = null;
        this._z = 0;
        this._visible = true;
        this._children = [];
        this._localTransform = new Transform2d();
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
    triggerRecursive (evt:Event): void {
        super.trigger (evt);
        this.forEachChild ((child:cwSceneObject, index:number) => {
            child.triggerRecursive (evt);
        });
    }
    triggerRecursiveEx (evt:Event): void {
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
        this.on (FrameEvent.type, (evt:Event) => {
            let frameEvent = evt as FrameEvent;
            let updateEvent = new UpdateEvent(frameEvent.deltaTime,frameEvent.elapsedTime,frameEvent.frameStamp);
            this.rootNode.triggerRecursiveEx (updateEvent);
            this.draw ();
        });
    }
    draw (): void {
        if (this.clearColor !== null) {
            this.canvas.clear (this.clearColor);
        }
        let cullEvent = new CullEvent();
        this.rootNode.triggerRecursiveEx (cullEvent);
        let drawEvent = new DrawEvent (this.canvas);
        for (let i in cullEvent.result) {
            let group = cullEvent.result[i];
            for (let j = 0; j < group.length; j++) {
                group[j].applyTransform (this.canvas.context);
                group[j].triggerEx (drawEvent);
            }
        }
        this.canvas.flip ();
    }
    hitTest (): HitTestResult {
        let evt = new HitTestEvent ();
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
    flip (): void {
        this._screenCtx.drawImage (this._buffer, 0, 0);
    }
}

export class cwcVisual extends cwComponent {
    static readonly type = 'Visual';
    constructor () {
        super (cwcVisual.type);
        this.on (CullEvent.type, (evt:Event) => {});
        this.on (HitTestEvent.type, (evt:Event) => {});
        this.on (DrawEvent.type, (evt:Event) => {});
    }
}

