import {cwTransform2d} from './transform';
import $ from 'jquery';
import {
    cwEvent, 
    cwEventListenerOrder, 
    cwFrameEvent, 
    cwEventObserver, 
    cwMouseDownEvent, 
    cwComponentAttachedEvent, 
    cwComponentDetachedEvent,
    cwDblClickEvent,
    cwClickEvent,
    cwMouseUpEvent,
    cwMouseLeaveEvent,
    cwMouseEnterEvent,
    cwMouseMoveEvent,
    cwKeyDownEvent,
    cwKeyUpEvent,
    cwKeyPressEvent,
    cwFocusEvent,
    cwMouseEvent,
    cwUpdateEvent,
    cwCullEvent,
    cwDrawEvent,
    cwHitTestEvent,
    cwResizeEvent,
    cwGetPropEvent,
    cwSetPropEvent,
    cwEventHandler
} from './events';

type cwHitTestResult = Array<cwSceneObject>;
type cwEventHandlerList = { handler:cwEventHandler, next:cwEventHandlerList };
type cwEventHandlerEntry = { handlers:cwEventHandlerList,bindObject:any };

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
            for (let i = 0; i < handlerList.length; i++) {
                const entry = handlerList[i];
                if (!target || entry.bindObject === target) {
                    let h = entry.handlers;
                    while (h) {
                        h.handler.call (entry.bindObject, evt);
                        if (evt.eaten) {
                            break;
                        }
                        h = h.next;
                    }
                    if (target) {
                        break;
                    }
                }
            }
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
    static addEventListener (eventType:string, bindObject:any, handler:cwEventHandler, order:cwEventListenerOrder) {
        let handlerList = cwApp.eventListeners[eventType]||[];
        for (let i = 0; i < handlerList.length; i++) {
            if (handlerList[i].bindObject === bindObject) {
                if (order == cwEventListenerOrder.First) {
                    handlerList[i].handlers = {
                        handler: handler,
                        next: handlerList[i].handlers
                    }
                } else {
                    let h = handlerList[i].handlers;
                    while (h.next) {
                        h = h.next;
                    }
                    h.next = { handler:handler, next:null };
                }
                return;
            }
        }
        handlerList.push ({
            bindObject: bindObject,
            handlers: {
                handler: handler,
                next: null
            }
        });
        this.eventListeners[eventType] = handlerList;
    }
    static removeEventListener (eventType:string, bindObject:any, handler?:cwEventHandler) {
        let handlerList = cwApp.eventListeners[eventType]||[];
        for (let i = 0; i < handlerList.length; i++) {
            if (handlerList[i].bindObject === bindObject) {
                if (handler) {
                    let h = handlerList[i].handlers;
                    let ph = null;
                    while (h && h.handler !== handler) {
                        ph = h;
                        h = h.next;
                    }
                    if (h) {
                        if (ph) {
                            ph.next = h.next;
                        } else {
                            handlerList[i].handlers = h.next;
                        }
                    }
                    if (!handlerList[i].handlers) {
                        handlerList.splice (i, 1);
                    }
                } else {
                    handlerList.splice (i, 1);
                    break;
                }
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
    toString (): string {
        return '<cwObject>';
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
    private _localTransform: cwTransform2d;
    constructor (parent:cwSceneObject = null) {
        super();
        this._parent = null;
        this._z = 0;
        this._visible = true;
        this._children = [];
        this._localTransform = new cwTransform2d();
        if (parent) {
            parent.addChild (this);
        }
        this.on (cwGetPropEvent.type, (ev:cwEvent) => {
            const e = ev as cwGetPropEvent;
            switch (e.propName) {
            case 'z':
                e.propValue = this.z;
                e.eat();
                break;
            case 'visible':
                e.propValue = this.visible;
                e.eat();
                break;
            case 'transform':
                e.propValue = this.localTransform;
                e.eat();
                break;
            case 'translation':
                let t = this.translation;
                e.propValue = [t.x,t.y];
                e.eat();
                break;
            case 'scale':
                let s = this.scale;
                e.propValue = [t.x,t.y];
                e.eat();
                break;
            case 'rotation':
                e.propValue = this.rotation;
                e.eat();
                break;
            default:
                break;
            }
        });
        this.on (cwSetPropEvent.type, (ev:cwEvent) => {
            const e = ev as cwSetPropEvent;
            switch (e.propName) {
            case 'z':
                this.z = e.propValue as number;
                e.eat ();
                break;
            case 'visible':
                this.visible = e.propValue as boolean;
                e.eat ();
                break;
            case 'transform':
                this.localTransform = e.propValue as cwTransform2d;
                e.eat ();
                break;
            case 'translation':
                let t = e.propValue as Array<number>;
                this.translation = {x:t[0],y:t[1]};
                break;
            case 'scale':
                let s = e.propValue as Array<number>;
                this.scale = {x:s[0],y:s[1]};
                break;
            case 'rotation':
                this.rotation = e.propValue as number;
                break;
            default:
                break;
            }
        });
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
    set localTransform (t:cwTransform2d) {
        this._localTransform = t;
    }
    get translation (): {x:number,y:number} {
        return this._localTransform.getTranslationPart();
    }
    set translation (t:{x:number,y:number}) {
        this._localTransform.setTranslationPart (t);
    }
    get scale (): {x:number,y:number} {
        return this._localTransform.getScalePart ();
    }
    set scale (s:{x:number,y:number}) {
        this._localTransform.setScalePart (s);
    }
    get rotation (): number {
        return this._localTransform.getRotationPart ();
    }
    set rotation (r:number) {
        this._localTransform.setRotationPart (r);
    }
    get worldTransform (): cwTransform2d {
        return this.parent ? cwTransform2d.transform(this.parent.worldTransform, this._localTransform) : this._localTransform;
    };
    get numChildren () {
        return this._children.length;
    }
    getLocalPoint (x:number, y:number): {x:number,y:number} {
        return cwTransform2d.invert(this.worldTransform).transformPoint({x:x,y:y});
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
    toString (): string {
        return '<cwSceneObject>';
    }
}

export class cwScene extends cwObject {
    private static capturedView:cwSceneView = null;
    private static hoverView:cwSceneView = null;
    private static focusView:cwSceneView = null;
    private static views:Array<cwSceneView> = [];
    private static clickTick:number = 0;
    private static dblClickTick:number = 0;
    private static clickTime:number = 400;
    private static dblclickTime:number = 400;
    private static hitView (x:number,y:number):cwSceneView {
        if (cwScene.capturedView !== null) {
            return cwScene.capturedView;
        }
        for (let i = 0; i < cwScene.views.length; i++) {
            let view = cwScene.views[i];
            let canvas = view.canvas.canvas;
            let l = canvas.offsetLeft;
            let t = canvas.offsetTop;
            let r = l + canvas.offsetWidth;
            let b = t + canvas.offsetHeight;
            if (x >= l && x < r && y >= t && y < b) {
                return view;
            }
        }
        return null;
    }
    private static initEventListeners (): void {
        window.addEventListener ('resize', (ev: UIEvent) => {
            let e = new cwResizeEvent();
            cwScene.views.forEach ((view:cwSceneView) => {
                view.trigger (e);
            });
        });
        window.addEventListener ('mousedown', (ev:MouseEvent) => {
            cwScene.clickTick = Date.now();
            let view = cwScene.hitView (ev.clientX, ev.clientY);
            if (view !== null) {
                view.trigger (new cwMouseDownEvent (ev.clientX-view.canvas.canvas.offsetLeft, ev.clientY-view.canvas.canvas.offsetTop, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
            }
        });
        window.addEventListener ('mouseup', (ev:MouseEvent) => {
            let view = cwScene.hitView (ev.clientX, ev.clientY);
            if (view !== null) {
                let x = ev.clientX-view.canvas.canvas.offsetLeft;
                let y = ev.clientY-view.canvas.canvas.offsetTop;
                let tick = Date.now();
                if (tick < cwScene.clickTick + cwScene.clickTime) {
                    if (tick < cwScene.dblClickTick + cwScene.dblclickTime) {
                        view.trigger (new cwDblClickEvent (x, y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
                        cwScene.dblClickTick = 0;
                    } else {
                        view.trigger (new cwClickEvent (x, y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
                        cwScene.dblClickTick = tick;
                    }
                } else {
                    cwScene.dblClickTick = 0;
                }
                view.trigger (new cwMouseUpEvent (x, y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
                cwScene.clickTick = 0;
            } else {
                cwScene.clickTick = 0;
                cwScene.dblClickTick = 0;
            }
        });
        window.addEventListener ('mousemove', (ev:MouseEvent) => {
            let view = cwScene.hitView (ev.clientX, ev.clientY);
            if (view != cwScene.hoverView) {
                if (cwScene.hoverView) {
                    cwScene.hoverView.trigger (new cwMouseLeaveEvent (ev.clientX-cwScene.hoverView.canvas.canvas.offsetLeft, ev.clientY-cwScene.hoverView.canvas.canvas.offsetTop, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
                    cwScene.hoverView = null;
                }
            }
            if (view !== null) {
                cwScene.hoverView = view;
                let x = ev.clientX-view.canvas.canvas.offsetLeft;
                let y = ev.clientY-view.canvas.canvas.offsetTop;
                view.trigger (new cwMouseEnterEvent (x, y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
                const moveEvent = new cwMouseMoveEvent (x, y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey);
                view.updateHitObjects (moveEvent);
                view.trigger (moveEvent);
            }
        });
        window.addEventListener ('keydown', (ev:KeyboardEvent) => {
            if (cwScene.focusView) {
                cwScene.focusView.trigger (new cwKeyDownEvent(ev.key,ev.keyCode,ev.shiftKey,ev.altKey,ev.ctrlKey,ev.metaKey));
            }
        });
        window.addEventListener ('keyup', (ev:KeyboardEvent) => {
            if (cwScene.focusView) {
                cwScene.focusView.trigger (new cwKeyUpEvent(ev.key,ev.keyCode,ev.shiftKey,ev.altKey,ev.ctrlKey,ev.metaKey));
            }
        });
        window.addEventListener ('keypress', (ev:KeyboardEvent) => {
            if (cwScene.focusView) {
                cwScene.focusView.trigger (new cwKeyPressEvent(ev.key,ev.keyCode,ev.shiftKey,ev.altKey,ev.ctrlKey,ev.metaKey));
            }
        });
    }
    public static updateViews (): void {

    }
    public static addView (canvas:HTMLCanvasElement, doubleBuffer?:boolean): cwSceneView {
        if (!cwScene.findView (canvas)) {
            const view = new cwSceneView(canvas, doubleBuffer===undefined?false:doubleBuffer);
            cwScene.views.push (view);
            if (!cwScene.focusView) {
                cwScene.setFocusView (view);
            }
            return view;
        }
        return null;
    }
    public static setFocusView (view:cwSceneView) {
        if (cwScene.focusView != view) {
            if (cwScene.focusView) {
                cwScene.focusView.trigger (new cwFocusEvent(false));
            }
            cwScene.focusView = view;
            if (cwScene.focusView) {
                cwScene.focusView.trigger (new cwFocusEvent(true));
            }
        }
    }
    public static findView (canvas:HTMLCanvasElement): cwSceneView {
        for (let i = 0; i < cwScene.views.length; i++) {
            if (cwScene.views[i].canvas.canvas === canvas) {
                return cwScene.views[i];
            }
        }
        return null;
    }
    public static removeView (canvas:HTMLCanvasElement): void {
        for (let i = 0; i < cwScene.views.length; i++) {
            if (cwScene.views[i].canvas.canvas === canvas) {
                cwScene.views.splice (i, 1);
            }
        }
    }
    public static setCapture (view:cwSceneView) {
        cwScene.capturedView = view;
    }
    public static init () {
        cwScene.initEventListeners ();
    }
}

export class cwSceneView extends cwObject {
    readonly rootNode: cwSceneObject;
    readonly canvas: cwCanvas;
    clearColor: string|null;
    private hitObjects: Array<cwSceneObject>;
    public updateHitObjects (ev:cwMouseEvent) {
        const hitTestResult = this.hitTest (ev.x, ev.y);
        for (let i = 0; i < this.hitObjects.length; ) {
            if (hitTestResult.indexOf(this.hitObjects[i]) < 0) {
                const pt = this.hitObjects[i].getLocalPoint(ev.x, ev.y);
                this.hitObjects[i].trigger (new cwMouseLeaveEvent(pt.x,pt.y,ev.button,ev.shiftDown,ev.altDown,ev.ctrlDown,ev.metaDown));
                this.hitObjects.splice(i, 1);
            } else {
                i++;
            }
        }
        for (let i = 0; i < hitTestResult.length; i++) {
            if (this.hitObjects.indexOf(hitTestResult[i]) < 0) {
                const pt = hitTestResult[i].getLocalPoint(ev.x, ev.y);
                hitTestResult[i].trigger (new cwMouseEnterEvent(pt.x,pt.y,ev.button,ev.shiftDown,ev.altDown,ev.ctrlDown,ev.metaDown));
            }
        }
        this.hitObjects = hitTestResult;
    }
    private wrapMouseEvent (type:string): void {
        this.on (type, (evt:cwEvent) => {
            let e = evt as cwMouseEvent;
            for (let i = 0; i < this.hitObjects.length; i++) {
                this.hitObjects[i].triggerEx (evt);
                if (!e.bubble) {
                    break;
                }
            }
        });
    }
    constructor (canvas:HTMLCanvasElement, doubleBuffer:boolean = false) {
        super ();
        this.hitObjects = [];
        this.rootNode = new cwSceneObject();
        this.clearColor = '#000';
        this.canvas = new cwCanvas(canvas, doubleBuffer);
        this.on (cwFrameEvent.type, (evt:cwEvent) => {
            let frameEvent = evt as cwFrameEvent;
            let updateEvent = new cwUpdateEvent(frameEvent.deltaTime,frameEvent.elapsedTime,frameEvent.frameStamp);
            this.rootNode.triggerRecursiveEx (updateEvent);
            this.draw ();
        });
        this.on (cwResizeEvent.type, () => {
            this.canvas.resize ();
        });
        this.wrapMouseEvent(cwMouseDownEvent.type);
        this.wrapMouseEvent(cwMouseUpEvent.type);
        this.wrapMouseEvent(cwMouseMoveEvent.type);
        this.wrapMouseEvent(cwClickEvent.type);
        this.wrapMouseEvent(cwDblClickEvent.type);
    }
    setFocus (): void {
        cwScene.setFocusView (this);
    }
    draw (): void {
        this.canvas.clear ();
        let cullEvent = new cwCullEvent(this.canvas.width, this.canvas.height);
        this.rootNode.triggerRecursiveEx (cullEvent);
        for (let i in cullEvent.result) {
            let group = cullEvent.result[i];
            for (let j = 0; j < group.length; j++) {
                group[j].object.trigger (new cwDrawEvent(this.canvas, group[j].z, group[j].transform));
            }
        }
        this.canvas.flip ();
    }
    hitTest (x:number, y:number): cwHitTestResult {
        function hitTest_r (object:cwSceneObject, result:cwHitTestResult) {
            const pos = cwTransform2d.invert(object.worldTransform).transformPoint ({x:x, y:y});
            const e = new cwHitTestEvent(pos.x,pos.y);
            object.triggerEx (e);
            if (e.result) {
                result.push (object);
            }
            object.forEachChild ((child:cwSceneObject,index:number) => {
                hitTest_r (child, result);
            });
        }
        const hitTestResult:cwHitTestResult = [];
        if (this.rootNode) {
            hitTest_r (this.rootNode, hitTestResult);
        }
        hitTestResult.sort ((a:cwSceneObject, b:cwSceneObject):number => {
            return b.z - a.z;
        });
        return hitTestResult;
    }
}

export class cwCanvas extends cwObject {
    private readonly _canvas:HTMLCanvasElement;
    private readonly _buffer:HTMLCanvasElement;
    private readonly _screenCtx:CanvasRenderingContext2D;
    private readonly _offscreenCtx:CanvasRenderingContext2D;
    private _width:number;
    private _height:number;
    private _mouseOver:boolean;
    private _doubleBuffer:boolean;
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
    constructor (canvas:HTMLCanvasElement, doubleBuffer:boolean = false) {
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
        this._doubleBuffer = doubleBuffer;
    }
    get canvas():HTMLCanvasElement {
        return this._canvas;
    }
    get width():number {
        return this._width;
    }
    get height():number {
        return this._height;
    }
    get context():CanvasRenderingContext2D {
        return this._doubleBuffer ? this._offscreenCtx : this._screenCtx;
    }
    clear (rect?:{x:number,y:number,w:number,h:number}): void {
        const x = rect ? rect.x : 0;
        const y = rect ? rect.y : 0;
        const w = rect ? rect.w : this._width;
        const h = rect ? rect.h : this._height;
        this.context.setTransform (1,0,0,1,0,0);
        this.context.clearRect (x, y, w, h);
        if (this._doubleBuffer) {
            this._screenCtx.clearRect (x, y, w, h);
        }
    }
    applyTransform (transform:cwTransform2d): void {
        this.context.setTransform (transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
    };
    flip (): void {
        if (this._doubleBuffer) {
            this._screenCtx.drawImage (this._buffer, 0, 0);
        }
    }
    resize (): void {
        this._width = $(this._canvas).width();
        this._height = $(this._canvas).height();
        this._canvas.width = this._width;
        this._canvas.height = this._height;
    }
}

