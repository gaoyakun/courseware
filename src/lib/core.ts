import { cwTransform2d } from './transform';
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
    cwUpdateEvent,
    cwCullEvent,
    cwDrawEvent,
    cwHitTestEvent,
    cwResizeEvent,
    cwGetPropEvent,
    cwSetPropEvent,
    cwEventHandler,
    cwComponentBeforeAttachEvent,
    cwComponentBeforeDetachEvent
} from './events';

type cwHitTestResult = Array<cwSceneObject>;
type cwEventHandlerList = { handler: cwEventHandler<any>, next: cwEventHandlerList };
type cwEventHandlerEntry = { handlers: cwEventHandlerList, bindObject: any };

export class cwApp {
    private static eventQueue: Array<{ evt: cwEvent, target: any }> = [];
    private static eventListeners: { [eventType: string]: Array<cwEventHandlerEntry> } = {};
    private static running = false;
    private static lastFrameTime = 0;
    private static firstFrameTime = 0;
    private static frameStamp = 0;
    static elapsedTime = 0;
    static deltaTime = 0;
    private static processEvent(evt: cwEvent, target: any): void {
        let handlerList = cwApp.eventListeners[evt.type];
        if (handlerList) {
            for (let i = 0; i < handlerList.length; i++) {
                const entry = handlerList[i];
                if (!target || entry.bindObject === target) {
                    let h = entry.handlers;
                    while (h) {
                        h.handler.call(entry.bindObject, evt);
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
    static postEvent(target: any, evt: cwEvent): void {
        cwApp.eventQueue.push({ evt: evt, target: target });
    }
    static triggerEvent(target: any, evt: cwEvent): void {
        cwApp.processEvent(evt, target);
    }
    static processPendingEvents(): void {
        const events = cwApp.eventQueue;
        cwApp.eventQueue = [];
        events.forEach((evt: { evt: cwEvent, target: any }) => {
            cwApp.processEvent(evt.evt, evt.target);
        });
    }
    static addEventListener(eventType: string, bindObject: any, handler: cwEventHandler<any>, order: cwEventListenerOrder) {
        let handlerList = cwApp.eventListeners[eventType] || [];
        for (let i = 0; i < handlerList.length; i++) {
            if (handlerList[i].bindObject === bindObject) {
                if (order == cwEventListenerOrder.FIRST) {
                    handlerList[i].handlers = {
                        handler: handler,
                        next: handlerList[i].handlers
                    }
                } else {
                    let h = handlerList[i].handlers;
                    while (h.next) {
                        h = h.next;
                    }
                    h.next = { handler: handler, next: null };
                }
                return;
            }
        }
        handlerList.push({
            bindObject: bindObject,
            handlers: {
                handler: handler,
                next: null
            }
        });
        this.eventListeners[eventType] = handlerList;
    }
    static removeEventListener(eventType: string, bindObject: any, handler?: cwEventHandler<any>) {
        let handlerList = cwApp.eventListeners[eventType] || [];
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
                        handlerList.splice(i, 1);
                    }
                } else {
                    handlerList.splice(i, 1);
                    break;
                }
            }
        }
    }
    static run() {
        function frame(ts: number) {
            if (cwApp.running) {
                if (cwApp.lastFrameTime == 0) {
                    cwApp.lastFrameTime = ts;
                    cwApp.firstFrameTime = ts;
                }
                cwApp.deltaTime = ts - cwApp.lastFrameTime;
                cwApp.elapsedTime = ts - cwApp.firstFrameTime;
                cwApp.lastFrameTime = ts;
                cwApp.frameStamp++;
                cwApp.processPendingEvents();
                cwApp.triggerEvent(null, new cwFrameEvent(cwApp.deltaTime, cwApp.elapsedTime, cwApp.frameStamp));
                if (cwApp.running) {
                    requestAnimationFrame(frame);
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
            requestAnimationFrame(frame);
        }
    }
    static stop() {
        this.running = false;
    }
}

export class cwComponent extends cwEventObserver {
    readonly type: string;
    object: cwObject | null;
    constructor(type: string) {
        super();
        this.type = type;
        this.object = null;
    }
    toString(): string {
        return `<Component: ${this.type}>`;
    }
}

export class cwObject extends cwEventObserver {
    private components: { [type: string]: Array<cwComponent> };
    [name: string]: any;
    constructor() {
        super();
        this.components = {}
    }
    toString(): string {
        return '<cwObject>';
    }
    addComponent(component: cwComponent): cwObject {
        if (component.object === null) {
            let componentArray = this.components[component.type] || [];
            if (componentArray.indexOf(component) < 0) {
                const ev = new cwComponentBeforeAttachEvent(this);
                component.trigger(ev);
                ev.object = null;
                if (ev.allow) {
                    componentArray.push(component);
                    component.object = this;
                    component.trigger(new cwComponentAttachedEvent());
                }

            }
            this.components[component.type] = componentArray;
        }
        return this;
    }
    removeComponent(component: cwComponent): cwObject {
        if (component.object === this) {
            let index = this.components[component.type].indexOf(component);
            this.removeComponentByIndex(component.type, index);
        }
        return this;
    }
    removeComponentByIndex(type: string, index: number): cwObject {
        const components = this.components[type];
        if (components && index >= 0 && index < components.length) {
            const ev = new cwComponentBeforeDetachEvent();
            components[index].trigger(ev);
            if (ev.allow) {
                components[index].trigger(new cwComponentDetachedEvent());
                components[index].object = null;
                components.splice(index, 1);
            }
        }
        return this;
    }
    removeComponentsByType(type: string): cwObject {
        const components = this.components[type];
        while (components && components.length > 0) {
            this.removeComponentByIndex(type, components.length - 1);
        }
        return this;
    }
    removeAllComponents(): cwObject {
        Object.keys(this.components).forEach(type => {
            this.removeComponentsByType(type);
        });
        return this;
    }
    getComponent(type: string, index: number = 0): cwComponent | null {
        let componentArray = this.components[type];
        if (componentArray === undefined || index < 0 || componentArray.length <= index) {
            return null;
        }
        return componentArray[index];
    }
    getComponents(type: string): Array<cwComponent> {
        return this.components[type];
    }
    triggerEx(evt: cwEvent): void {
        super.trigger(evt);
        for (const c in this.components) {
            if (this.components.hasOwnProperty(c)) {
                this.components[c].forEach((comp: cwComponent) => {
                    comp.trigger(evt);
                });
            }
        }
    }
    post(evt: cwEvent): void {
        cwApp.postEvent(this, evt);
    }
}

export class cwSceneObject extends cwObject {
    private _view: cwSceneView;
    private _parent: cwSceneObject | null;
    private _z: number;
    private _visible: boolean;
    private _children: Array<cwSceneObject>;
    private _localTransform: cwTransform2d;
    private _worldTranslation: { x: number, y: number } | null;
    private _worldRotation: number | null;
    private _worldScale: { x: number, y: number } | null;
    constructor(parent: cwSceneObject = null) {
        super();
        this._view = null;
        this._parent = null;
        this._z = 0;
        this._visible = true;
        this._children = [];
        this._localTransform = new cwTransform2d();
        this._worldTranslation = null;
        this._worldRotation = null;
        this._worldScale = null;
        if (parent) {
            parent.addChild(this);
        }
        this.on(cwCullEvent.type, (evt: cwCullEvent) => {
            evt.addObject(this, this.z, this.worldTransform);
        });
        this.on(cwGetPropEvent.type, (ev: cwGetPropEvent) => {
            switch (ev.propName) {
                case 'z':
                    ev.propValue = this.z;
                    ev.eat();
                    break;
                case 'visible':
                    ev.propValue = this.visible;
                    ev.eat();
                    break;
                case 'transform':
                    ev.propValue = this.localTransform;
                    ev.eat();
                    break;
                case 'translation':
                    let t = this.translation;
                    ev.propValue = [t.x, t.y];
                    ev.eat();
                    break;
                case 'scale':
                    let s = this.scale;
                    ev.propValue = [t.x, t.y];
                    ev.eat();
                    break;
                case 'rotation':
                    ev.propValue = this.rotation;
                    ev.eat();
                    break;
                default:
                    break;
            }
        });
        this.on(cwSetPropEvent.type, (ev: cwSetPropEvent) => {
            switch (ev.propName) {
                case 'z':
                    this.z = ev.propValue as number;
                    ev.eat();
                    break;
                case 'visible':
                    this.visible = ev.propValue as boolean;
                    ev.eat();
                    break;
                case 'transform':
                    this.localTransform = ev.propValue as cwTransform2d;
                    ev.eat();
                    break;
                case 'translation':
                    let t = ev.propValue as Array<number>;
                    this.translation = { x: t[0], y: t[1] };
                    break;
                case 'scale':
                    let s = ev.propValue as Array<number>;
                    this.scale = { x: s[0], y: s[1] };
                    break;
                case 'rotation':
                    this.rotation = ev.propValue as number;
                    break;
                default:
                    break;
            }
        });
    }
    get view() {
        return this._view;
    }
    set view(v: cwSceneView) {
        this._view = v;
    }
    get parent() {
        return this._parent;
    }
    get z() {
        return this._z;
    }
    set z(value: number) {
        this._z = value;
    }
    get visible() {
        return this._visible;
    }
    set visible(value: boolean) {
        this._visible = value;
    }
    get localTransform() {
        return this._localTransform;
    }
    set localTransform(t: cwTransform2d) {
        this._localTransform = t;
    }
    get translation(): { x: number, y: number } {
        return this._localTransform.getTranslationPart();
    }
    set translation(t: { x: number, y: number }) {
        this._localTransform.setTranslationPart(t);
    }
    get scale(): { x: number, y: number } {
        return this._localTransform.getScalePart();
    }
    set scale(s: { x: number, y: number }) {
        this._localTransform.setScalePart(s);
    }
    get rotation(): number {
        return this._localTransform.getRotationPart();
    }
    set rotation(r: number) {
        this._localTransform.setRotationPart(r);
    }
    get worldTransform(): cwTransform2d {
        let t = this.parent ? cwTransform2d.transform(this.parent.worldTransform, this._localTransform) : this._localTransform;
        if (this._worldTranslation !== null) {
            t.setTranslationPart(this._worldTranslation);
        }
        if (this._worldRotation !== null) {
            t.setRotationPart(this._worldRotation);
        }
        if (this._worldScale !== null) {
            t.setScalePart(this._worldScale);
        }
        return t;
    };
    get worldTranslation(): { x: number, y: number } | null {
        return this._worldTranslation;
    }
    set worldTranslation(value: { x: number, y: number } | null) {
        this._worldTranslation = value;
    }
    get worldRotation(): number | null {
        return this._worldRotation;
    }
    set worldRotation(value: number | null) {
        this._worldRotation = value;
    }
    get worldScale(): { x: number, y: number } | null {
        return this._worldScale;
    }
    set worldScale(value: { x: number, y: number } | null) {
        this._worldScale = value;
    }
    get numChildren(): number {
        return this._children.length;
    }
    collapseTransform(): void {
        const wt = this.worldTransform;
        this.worldTranslation = null;
        this.worldRotation = null;
        this.worldScale = null;
        if (this.parent) {
            this.localTransform = cwTransform2d.invert(this.parent.worldTransform).transform(wt);
        } else {
            this.localTransform = wt;
        }
    }
    getLocalPoint(x: number, y: number): { x: number, y: number } {
        return cwTransform2d.invert(this.worldTransform).transformPoint({ x: x, y: y });
    }
    childAt(index: number): cwSceneObject {
        return this._children[index];
    }
    forEachChild(callback: (child: cwSceneObject, index: number) => void) {
        this._children.forEach(callback);
    }
    addChild(child: cwSceneObject): void {
        if (child._parent === null) {
            child._parent = this;
            child._view = this._view;
            this._children.push(child);
        }
    }
    removeChild(child: cwSceneObject): void {
        if (child._parent === this) {
            let index = this._children.indexOf(child);
            this.removeChildAt(index);
        }
    }
    removeChildAt(index: number): void {
        if (index >= 0 && index < this._children.length) {
            let child = this._children[index];
            this._children.splice(index, 1);
            child._parent = null;
            child._view = null;
        }
    }
    removeChildren(): void {
        while (this._children.length > 0) {
            this.removeChildAt(0);
        }
    }
    unrefChildren(): void {
        while (this._children.length > 0) {
            this._children[0].unrefChildren();
            this.removeChildAt(0);
        }
    }
    remove(): void {
        if (this._parent) {
            this._parent.removeChild(this);
        }
    }
    applyTransform(ctx: CanvasRenderingContext2D): void {
        let matrix = this.worldTransform;
        ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    };
    triggerRecursive(evt: cwEvent): void {
        super.trigger(evt);
        this.forEachChild((child: cwSceneObject, index: number) => {
            child.triggerRecursive(evt);
        });
    }
    triggerRecursiveEx(evt: cwEvent): void {
        super.triggerEx(evt);
        this.forEachChild((child: cwSceneObject, index: number) => {
            child.triggerRecursiveEx(evt);
        });
    }
    setCapture(): void {
        this._view && this._view.setCaptureObject(this);
    }
    releaseCapture(): void {
        this._view && this._view.captureObject === this && this._view.setCaptureObject(null);
    }
    toString(): string {
        return '<cwSceneObject>';
    }
}

export class cwScene extends cwObject {
    private static capturedView: cwSceneView = null;
    private static hoverView: cwSceneView = null;
    private static focusView: cwSceneView = null;
    private static views: Array<cwSceneView> = [];
    private static clickTick: number = 0;
    private static dblClickTick: number = 0;
    private static clickTime: number = 400;
    private static dblclickTime: number = 400;
    private static hitView(x: number, y: number): cwSceneView {
        if (cwScene.capturedView !== null) {
            return cwScene.capturedView;
        }
        for (let i = 0; i < cwScene.views.length; i++) {
            const view = cwScene.views[i];
            const rc = view.canvas.viewport_rect;
            if (x >= rc.x && x < rc.x + rc.w && y >= rc.y && y < rc.y + rc.h) {
                return view;
            }
        }
        return null;
    }
    private static resizeHandler() {
        let e = new cwResizeEvent();
        cwScene.views.forEach((view: cwSceneView) => {
            view.triggerEx(e);
        });
    }
    private static mouseDownHandler(ev: MouseEvent) {
        cwScene.clickTick = Date.now();
        let view = cwScene.hitView(ev.clientX, ev.clientY);
        if (view !== null) {
            view.handleMouseDown(ev);
        }
    }
    private static mouseUpHandler(ev: MouseEvent) {
        let view = cwScene.hitView(ev.clientX, ev.clientY);
        if (view !== null) {
            let tick = Date.now();
            if (tick < cwScene.clickTick + cwScene.clickTime) {
                if (tick < cwScene.dblClickTick + cwScene.dblclickTime) {
                    view.handleDblClick(ev);
                    cwScene.dblClickTick = 0;
                } else {
                    view.handleClick(ev);
                    cwScene.dblClickTick = tick;
                }
            } else {
                cwScene.dblClickTick = 0;
            }
            view.handleMouseUp(ev);
            cwScene.clickTick = 0;
        } else {
            cwScene.clickTick = 0;
            cwScene.dblClickTick = 0;
        }
    }
    private static mouseMoveHandler(ev: MouseEvent) {
        let view = cwScene.hitView(ev.clientX, ev.clientY);
        if (view != cwScene.hoverView) {
            if (cwScene.hoverView) {
                cwScene.hoverView.triggerEx(new cwMouseLeaveEvent());
                cwScene.hoverView = null;
            }
            if (view !== null) {
                cwScene.hoverView = view;
                view.triggerEx(new cwMouseEnterEvent());
            }
        }
        if (view !== null) {
            const rc = view.canvas.viewport_rect;
            view.updateHitObjects(ev.clientX - rc.x, ev.clientY - rc.y);
            view.handleMouseMove(ev);
        }
    }
    private static keyDownHandler(ev: KeyboardEvent) {
        if (cwScene.focusView) {
            cwScene.focusView.trigger(new cwKeyDownEvent(ev.key, ev.keyCode, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
        }
    }
    private static keyUpHandler(ev: KeyboardEvent) {
        if (cwScene.focusView) {
            cwScene.focusView.trigger(new cwKeyUpEvent(ev.key, ev.keyCode, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
        }
    }
    private static keyPressHandler(ev: KeyboardEvent) {
        if (cwScene.focusView) {
            cwScene.focusView.trigger(new cwKeyPressEvent(ev.key, ev.keyCode, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey));
        }
    }
    private static initEventListeners(): void {
        window.addEventListener('resize', cwScene.resizeHandler);
        window.addEventListener('mousedown', cwScene.mouseDownHandler);
        window.addEventListener('mouseup', cwScene.mouseUpHandler);
        window.addEventListener('mousemove', cwScene.mouseMoveHandler);
        window.addEventListener('keydown', cwScene.keyDownHandler);
        window.addEventListener('keyup', cwScene.keyUpHandler);
        window.addEventListener('keypress', cwScene.keyPressHandler);
    }
    private static doneEventListeners(): void {
        window.removeEventListener('resize', cwScene.resizeHandler);
        window.removeEventListener('mousedown', cwScene.mouseDownHandler);
        window.removeEventListener('mouseup', cwScene.mouseUpHandler);
        window.removeEventListener('mousemove', cwScene.mouseMoveHandler);
        window.removeEventListener('keydown', cwScene.keyDownHandler);
        window.removeEventListener('keyup', cwScene.keyUpHandler);
        window.removeEventListener('keypress', cwScene.keyPressHandler);
    }
    public static addView(view: cwSceneView): boolean {
        if (view && view.canvas && !cwScene.findView(view.canvas.canvas)) {
            cwScene.views.push(view);
            if (!cwScene.focusView) {
                cwScene.setFocusView(view);
            }
            return true;
        }
        return false;
    }
    public static addCanvas(canvas: HTMLCanvasElement, doubleBuffer?: boolean): cwSceneView {
        if (!cwScene.findView(canvas)) {
            const view = new cwSceneView(canvas, doubleBuffer === undefined ? false : doubleBuffer);
            return cwScene.addView(view) ? view : null;
        }
        return null;
    }
    public static setFocusView(view: cwSceneView) {
        if (cwScene.focusView != view) {
            if (cwScene.focusView) {
                cwScene.focusView.trigger(new cwFocusEvent(false));
            }
            cwScene.focusView = view;
            if (cwScene.focusView) {
                cwScene.focusView.trigger(new cwFocusEvent(true));
            }
        }
    }
    public static findView(canvas: HTMLCanvasElement): cwSceneView {
        for (let i = 0; i < cwScene.views.length; i++) {
            if (cwScene.views[i].canvas.canvas === canvas) {
                return cwScene.views[i];
            }
        }
        return null;
    }
    public static removeView(canvas: HTMLCanvasElement): void {
        for (let i = 0; i < cwScene.views.length; i++) {
            if (cwScene.views[i].canvas.canvas === canvas) {
                cwScene.views.splice(i, 1);
            }
        }
    }
    public static setCapture(view: cwSceneView) {
        cwScene.capturedView = view;
    }
    public static init() {
        cwScene.initEventListeners();
    }
    public static done() {
        cwScene.doneEventListeners();
    }
}

export class cwSceneView extends cwObject {
    private _canvas: cwCanvas;
    private _rootNode: cwSceneObject;
    private _captureObject: cwSceneObject;
    private _hitObjects: Array<cwSceneObject>;
    public updateHitObjects(x: number, y: number) {
        const hitTestResult = this.hitTest(x, y);
        for (let i = 0; i < this._hitObjects.length;) {
            if (hitTestResult.indexOf(this._hitObjects[i]) < 0) {
                this._hitObjects[i].trigger(new cwMouseLeaveEvent());
                this._hitObjects.splice(i, 1);
            } else {
                i++;
            }
        }
        for (let i = 0; i < hitTestResult.length; i++) {
            if (this._hitObjects.indexOf(hitTestResult[i]) < 0) {
                hitTestResult[i].trigger(new cwMouseEnterEvent());
            }
        }
        this._hitObjects = hitTestResult;
    }
    private isValidObject(object: cwSceneObject) {
        return object && object.view === this;
    }
    constructor(canvas: HTMLCanvasElement, doubleBuffer: boolean = false) {
        super();
        this._captureObject = null;
        this._hitObjects = [];
        this._rootNode = new cwSceneObject();
        this._rootNode.view = this;
        this._canvas = new cwCanvas(canvas, doubleBuffer);
        this.on(cwFrameEvent.type, (ev: cwFrameEvent) => {
            let updateEvent = new cwUpdateEvent(ev.deltaTime, ev.elapsedTime, ev.frameStamp);
            if (this.rootNode) {
                this.rootNode.triggerRecursiveEx(updateEvent);
            }
            this.draw();
        });
        this.on(cwResizeEvent.type, () => {
            this.canvas.resize();
        });
    }
    get rootNode(): cwSceneObject {
        return this._rootNode;
    }
    get canvas(): cwCanvas {
        return this._canvas;
    }
    get captureObject(): cwSceneObject {
        return this._captureObject;
    }
    get hitObjects(): Array<cwSceneObject> {
        return this._hitObjects;
    }
    empty(): void {
        if (this._rootNode) {
            this._rootNode.unrefChildren();
        }
    }
    unref(): void {
        this.empty();
        if (this._rootNode) {
            this._rootNode.view = null;
            this._rootNode = null;
        }
    }
    setCaptureObject(object: cwSceneObject): void {
        this._captureObject = object;
    }
    handleMouseDown(ev: MouseEvent): void {
        const rc = this.canvas.viewport_rect;
        const e = new cwMouseDownEvent(ev.clientX - rc.x, ev.clientY - rc.y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey);
        if (this.isValidObject(this._captureObject)) {
            this._captureObject.triggerEx(e);
        } else {
            for (let i = 0; i < this._hitObjects.length; i++) {
                const obj = this._hitObjects[i];
                if (this.isValidObject(obj)) {
                    obj.triggerEx(e);
                    if (!e.bubble) {
                        break;
                    }
                }
            }
            if (e.bubble) {
                this.triggerEx(e);
            }
        }
    }
    handleMouseUp(ev: MouseEvent): void {
        const rc = this.canvas.viewport_rect;
        const e = new cwMouseUpEvent(ev.clientX - rc.x, ev.clientY - rc.y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey);
        if (this.isValidObject(this._captureObject)) {
            this._captureObject.triggerEx(e);
        } else {
            for (let i = 0; i < this._hitObjects.length; i++) {
                const obj = this._hitObjects[i];
                if (this.isValidObject(obj)) {
                    obj.triggerEx(e);
                    if (!e.bubble) {
                        break;
                    }
                }
            }
            if (e.bubble) {
                this.triggerEx(e);
            }
        }
    }
    handleMouseMove(ev: MouseEvent): void {
        const rc = this.canvas.viewport_rect;
        const e = new cwMouseMoveEvent(ev.clientX - rc.x, ev.clientY - rc.y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey);
        if (this.isValidObject(this._captureObject)) {
            this._captureObject.triggerEx(e);
        } else {
            for (let i = 0; i < this._hitObjects.length; i++) {
                const obj = this._hitObjects[i];
                if (this.isValidObject(obj)) {
                    obj.triggerEx(e);
                    if (!e.bubble) {
                        break;
                    }
                }
            }
            if (e.bubble) {
                this.triggerEx(e);
            }
        }
    }
    handleClick(ev: MouseEvent): void {
        const rc = this.canvas.viewport_rect;
        const e = new cwClickEvent(ev.clientX - rc.x, ev.clientY - rc.y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey);
        for (let i = 0; i < this._hitObjects.length; i++) {
            const obj = this._hitObjects[i];
            if (this.isValidObject(obj)) {
                obj.triggerEx(e);
                if (!e.bubble) {
                    break;
                }
            }
        }
        if (e.bubble) {
            this.triggerEx(e);
        }
    }
    handleDblClick(ev: MouseEvent): void {
        const rc = this.canvas.viewport_rect;
        const e = new cwDblClickEvent(ev.clientX - rc.x, ev.clientY - rc.y, ev.button, ev.shiftKey, ev.altKey, ev.ctrlKey, ev.metaKey);
        for (let i = 0; i < this._hitObjects.length; i++) {
            const obj = this._hitObjects[i];
            if (this.isValidObject(obj)) {
                obj.triggerEx(e);
                if (!e.bubble) {
                    break;
                }
            }
        }
        if (e.bubble) {
            this.triggerEx(e);
        }
    }
    setFocus(): void {
        cwScene.setFocusView(this);
    }
    draw(): void {
        this.canvas.clear();
        this.triggerEx(new cwDrawEvent(this.canvas, 0, new cwTransform2d()));
        if (this.rootNode) {
            let cullEvent = new cwCullEvent(this.canvas.width, this.canvas.height);
            this.rootNode.triggerRecursiveEx(cullEvent);
            for (let i in cullEvent.result) {
                let group = cullEvent.result[i];
                for (let j = 0; j < group.length; j++) {
                    group[j].object.trigger(new cwDrawEvent(this.canvas, group[j].z, group[j].transform));
                }
            }
        }
        this.canvas.flip();
    }
    hitTest(x: number, y: number): cwHitTestResult {
        function hitTest_r(object: cwSceneObject, result: cwHitTestResult) {
            const pos = cwTransform2d.invert(object.worldTransform).transformPoint({ x: x, y: y });
            const e = new cwHitTestEvent(pos.x, pos.y);
            object.triggerEx(e);
            if (e.result) {
                result.push(object);
            }
            object.forEachChild((child: cwSceneObject, index: number) => {
                hitTest_r(child, result);
            });
        }
        const hitTestResult: cwHitTestResult = [];
        if (this.rootNode) {
            hitTest_r(this.rootNode, hitTestResult);
            hitTestResult.sort((a: cwSceneObject, b: cwSceneObject): number => {
                return b.z - a.z;
            });
        }
        return hitTestResult;
    }
}

export class cwCanvas extends cwObject {
    private readonly _canvas: HTMLCanvasElement;
    private readonly _buffer: HTMLCanvasElement;
    private readonly _screenCtx: CanvasRenderingContext2D;
    private readonly _offscreenCtx: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;
    private _mouseOver: boolean;
    private _doubleBuffer: boolean;
    private static readonly eventNames = ['mouseenter']
    private initEventHandlers() {
        this._canvas.addEventListener('mouseenter', (ev: MouseEvent) => {
            if (!this._mouseOver) {
                this._mouseOver = true;
            }
        });
        this._canvas.addEventListener('mouseleave', (ev: MouseEvent) => {
            this._mouseOver = false;
        });
    }
    constructor(canvas: HTMLCanvasElement, doubleBuffer: boolean = false) {
        super();
        this._canvas = canvas;
        this._width = parseInt(window.getComputedStyle(canvas).width);
        this._height = parseInt(window.getComputedStyle(canvas).height);
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        this._screenCtx = this._canvas.getContext("2d");
        this._buffer = document.createElement("canvas");
        this._buffer.width = this._width;
        this._buffer.height = this._height;
        this._offscreenCtx = this._buffer.getContext("2d");
        this._mouseOver = false;
        this._doubleBuffer = doubleBuffer;
    }
    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    get width(): number {
        return this._width;
    }
    get height(): number {
        return this._height;
    }
    get context(): CanvasRenderingContext2D {
        return this._doubleBuffer ? this._offscreenCtx : this._screenCtx;
    }
    get viewport_rect(): { x: number, y: number, w: number, h: number } {
        const rc = this._canvas.getBoundingClientRect();
        const x = rc.left - document.documentElement.clientLeft;
        const y = rc.top - document.documentElement.clientTop;
        const w = rc.right - rc.left;
        const h = rc.bottom - rc.top;
        return { x: x, y: y, w: w, h: h };
    }
    clear(rect?: { x: number, y: number, w: number, h: number }): void {
        const x = rect ? rect.x : 0;
        const y = rect ? rect.y : 0;
        const w = rect ? rect.w : this._width;
        const h = rect ? rect.h : this._height;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(x, y, w, h);
        if (this._doubleBuffer) {
            this._screenCtx.clearRect(x, y, w, h);
        }
    }
    applyTransform(transform: cwTransform2d): void {
        this.context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
    };
    flip(): void {
        if (this._doubleBuffer) {
            this._screenCtx.drawImage(this._buffer, 0, 0);
        }
    }
    resize(): void {
        this._width = parseInt(window.getComputedStyle(this._canvas).width);
        this._height = parseInt(window.getComputedStyle(this._canvas).height);
        this._canvas.width = this._width;
        this._canvas.height = this._height;
    }
}

