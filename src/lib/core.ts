import {Transform2d} from './transform';
import $ from 'jquery';

export interface IEvent {
    type: string;
}

export interface IEventHandler {
    (evt:IEvent):void;
}

export class cwApp {
    private static eventQueue:Array<IEvent> = [];
    private static eventListeners:{[eventType:string]:Array<IEventHandler>} = {};
    private static running = false;
    private static lastFrameTime = 0;
    private static firstFrameTime = 0;
    public static elapsedTime = 0;
    public static deltaTime = 0;
    private static processEvent (evt:IEvent): void {
        let handlerList = cwApp.eventListeners[evt.type];
        if (handlerList) {
            handlerList.forEach ((handler:IEventHandler)=>{
                handler(evt);
            });
        }
    }
    public static postEvent (evt:IEvent): void {
        cwApp.eventQueue.push (evt);
    }
    public static sendEvent (evt:IEvent): void {
        cwApp.processEvent (evt);
    }
    public static processPendingEvents (): void {
        const events = cwApp.eventQueue;
        cwApp.eventQueue = [];
        events.forEach ((evt:IEvent)=>{
            cwApp.processEvent (evt);
        });
    }
    public static addEventListener (eventType:string, handler:IEventHandler) {
        let handlerList = cwApp.eventListeners[eventType]||[];
        if (handlerList.indexOf(handler) < 0) {
            handlerList.push (handler);
        }
        this.eventListeners[eventType] = handlerList;
    }
    public static removeEventListener (eventType:string, handler:IEventHandler) {
        let handlerList = cwApp.eventListeners[eventType];
        if (handlerList) {
            let index = handlerList.indexOf(handler);
            if (index >= 0) {
                handlerList.splice (index, 1);
            }
        }
    }
    public static run () {
        function frame (ts:number) {
            if (cwApp.running) {
                if (cwApp.lastFrameTime == 0) {
                    cwApp.lastFrameTime = ts;
                    cwApp.firstFrameTime = ts;
                }
                cwApp.deltaTime = ts - cwApp.lastFrameTime;
                cwApp.elapsedTime = ts - cwApp.firstFrameTime;
                cwApp.lastFrameTime = ts;
                cwApp.processPendingEvents ();
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
            requestAnimationFrame (frame);
        }
    }
    public static stop () {
        this.running = false;
    }
}

export class cwComponent {
    public readonly type: string;
    public object: cwObject|null;
    constructor (type:string) {
        this.type = type;
        this.object = null;
    }
    toString(): string {
        return `<Component: ${this.type}>`;
    }
}

export class cwObject {
    private components:{[type:string]:Array<cwComponent>};
    constructor () {
        this.components = {}
    }
    addComponent (component:cwComponent): cwObject {
        if (component.object === null) {
            let componentArray = this.components[component.type]||[];
            if (componentArray.indexOf(component) < 0) {
                componentArray.push (component);
                component.object = this;
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
}

export class cwSceneObject extends cwObject {
    private parent:cwSceneObject|null;
    private children: Array<cwSceneObject>;
    constructor () {
        super();
        this.parent = null;
        this.children = [];
    }
    get numChildren () {
        return this.children.length;
    }
    childAt (index:number): cwSceneObject {
        return this.children[index];
    }
    forEachChild (callback:(child:cwSceneObject,index:number)=>void) {
        this.children.forEach(callback);
    }
    addChild (child:cwSceneObject): void {
        if (child.parent === null) {
            child.parent = this;
            this.children.push (child);
        }
    }
    removeChild (child:cwSceneObject): void {
        if (child.parent === this) {
            let index = this.children.indexOf (child);
            this.removeChildAt (index);
        }
    }
    removeChildAt (index:number): void {
        if (index >= 0 && index < this.children.length) {
            let child = this.children[index];
            this.children.splice (index, 1);
            child.parent = null;
        }
    }
    remove (): void {
        if (this.parent) {
            this.parent.removeChild (this);
        }
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
    flip(): void {
        this._screenCtx.drawImage (this._buffer, 0, 0);
    }
}

export class cwcTransform2d extends cwComponent {
    private _transform: Transform2d;
    constructor () {
        super ("Transform2d");
        this._transform = new Transform2d();
    }
    get transform () {
        return this._transform;
    }
    set transform (t: Transform2d) {
        this._transform = t;
    }
}

export class cwcVisual2d extends cwComponent {
    constructor () {
        super ("Draw2d");
    }
    draw (canvas:cwCanvas): void {
    }
}
