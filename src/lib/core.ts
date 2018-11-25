import { cwTransform2d } from './transform';
import { cwBoundingShape} from './boundingshape';
import { cwIntersectionTestShapePoint } from './intersect';

export type cwCullResult = { [z: number]: Array<{ object: cwEventObserver, z: number, transform: cwTransform2d }> };
export type cwEventHandler<T extends cwEvent> = (evt: T) => void;
export interface IRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export enum cwEventListenerOrder {
    FIRST = 1,
    LAST = 2
}

export class cwEvent {
    readonly type: string;
    eaten: boolean;
    constructor(type: string) {
        this.type = type;
        this.eaten = false;
    }
    eat(): void {
        this.eaten = true;
    }
}

export class cwComponentBeforeAttachEvent extends cwEvent {
    static readonly type: string = '@componentBeforeAttach';
    object: cwObject;
    allow: boolean;
    constructor(object: cwObject) {
        super(cwComponentBeforeAttachEvent.type);
        this.object = object;
        this.allow = true;
    }
}

export class cwComponentAttachedEvent extends cwEvent {
    static readonly type: string = '@componentAttached';
    constructor() {
        super(cwComponentAttachedEvent.type);
    }
}

export class cwComponentBeforeDetachEvent extends cwEvent {
    static readonly type: string = '@componentBeforeDetach';
    allow: boolean;
    constructor() {
        super(cwComponentBeforeDetachEvent.type);
        this.allow = true;
    }
}

export class cwComponentDetachedEvent extends cwEvent {
    static readonly type: string = '@componentDetached';
    constructor() {
        super(cwComponentDetachedEvent.type);
    }
}

export class cwUpdateEvent extends cwEvent {
    static readonly type: string = '@update';
    public readonly deltaTime: number;
    public readonly elapsedTime: number;
    public readonly frameStamp: number;
    constructor(deltaTime: number, elapsedTime: number, frameStamp: number) {
        super(cwUpdateEvent.type);
        this.deltaTime = deltaTime;
        this.elapsedTime = elapsedTime;
        this.frameStamp = frameStamp;
    }
}

export class cwCullEvent extends cwEvent {
    static readonly type: string = '@cull';
    readonly canvasWidth: number;
    readonly canvasHeight: number;
    readonly result: cwCullResult;
    constructor(w: number, h: number) {
        super(cwCullEvent.type);
        this.canvasWidth = w;
        this.canvasHeight = h;
        this.result = {};
    }
    addObject(object: cwEventObserver, z: number, transform: cwTransform2d): void {
        let objectList = this.result[z] || [];
        objectList.push({ object: object, z: z, transform: transform });
        this.result[z] = objectList;
    }
}

export class cwDrawEvent extends cwEvent {
    static readonly type: string = '@draw';
    readonly canvas: cwCanvas;
    readonly z: number;
    readonly transform: cwTransform2d;
    constructor(canvas: cwCanvas, z: number, transform: cwTransform2d) {
        super(cwDrawEvent.type);
        this.canvas = canvas;
        this.z = z;
        this.transform = transform;
    }
}

export class cwHitTestEvent extends cwEvent {
    static readonly type: string = '@hittest';
    x: number;
    y: number;
    result: boolean;
    constructor(x: number, y: number) {
        super(cwHitTestEvent.type);
        this.x = x;
        this.y = y;
        this.result = false;
    }
}

export class cwGetBoundingShapeEvent extends cwEvent {
    static readonly type: string = '@getboundingshape';
    shape?: cwBoundingShape;
    constructor () {
        super (cwGetBoundingShapeEvent.type);
    }
}

export class cwFrameEvent extends cwEvent {
    static readonly type: string = '@frame';
    readonly deltaTime: number;
    readonly elapsedTime: number;
    readonly frameStamp: number;
    constructor(deltaTime: number, elapsedTime: number, frameStamp: number) {
        super(cwFrameEvent.type);
        this.deltaTime = deltaTime;
        this.elapsedTime = elapsedTime;
        this.frameStamp = frameStamp;
    }
}

export class cwFocusEvent extends cwEvent {
    static readonly type: string = '@focus';
    readonly focus: boolean;
    constructor(focus: boolean) {
        super(cwFocusEvent.type);
        this.focus = focus;
    }
}

export class cwKeyboardEvent extends cwEvent {
    readonly key: string;
    readonly keyCode: number;
    readonly shiftDown: boolean;
    readonly altDown: boolean;
    readonly ctrlDown: boolean;
    readonly metaDown: boolean;
    constructor(type: string, key: string, code: number, shift: boolean, alt: boolean, ctrl: boolean, meta: boolean) {
        super(type);
        this.key = key;
        this.keyCode = code;
        this.shiftDown = shift;
        this.altDown = alt;
        this.ctrlDown = ctrl;
        this.metaDown = meta;
    }
}

export class cwKeyDownEvent extends cwKeyboardEvent {
    static readonly type: string = '@keydown';
    constructor(key: string, code: number, shift: boolean, alt: boolean, ctrl: boolean, meta: boolean) {
        super(cwKeyDownEvent.type, key, code, shift, alt, ctrl, meta);
    }
}

export class cwKeyUpEvent extends cwKeyboardEvent {
    static readonly type: string = '@keyup';
    constructor(key: string, code: number, shift: boolean, alt: boolean, ctrl: boolean, meta: boolean) {
        super(cwKeyUpEvent.type, key, code, shift, alt, ctrl, meta);
    }
}

export class cwKeyPressEvent extends cwKeyboardEvent {
    static readonly type: string = '@keypress';
    constructor(key: string, code: number, shift: boolean, alt: boolean, ctrl: boolean, meta: boolean) {
        super(cwKeyPressEvent.type, key, code, shift, alt, ctrl, meta);
    }
}

export class cwMouseEvent extends cwEvent {
    readonly x: number;
    readonly y: number;
    readonly button: number;
    readonly shiftDown: boolean;
    readonly altDown: boolean;
    readonly ctrlDown: boolean;
    readonly metaDown: boolean;
    bubble: boolean;
    constructor(type: string, x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(type);
        this.x = x;
        this.y = y;
        this.button = button;
        this.shiftDown = shiftDown;
        this.altDown = altDown;
        this.ctrlDown = ctrlDown;
        this.metaDown = metaDown;
        this.bubble = true;
    }
    cancelBubble() {
        this.bubble = false;
    }
}

export class cwMouseDownEvent extends cwMouseEvent {
    static readonly type: string = '@mousedown';
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwMouseDownEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
    }
}

export class cwMouseUpEvent extends cwMouseEvent {
    static readonly type: string = '@mouseup';
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwMouseUpEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
    }
}

export class cwMouseMoveEvent extends cwMouseEvent {
    static readonly type: string = '@mousemove';
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwMouseMoveEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
    }
}

export class cwMouseEnterEvent extends cwEvent {
    static readonly type: string = '@mouseenter';
    constructor() {
        super(cwMouseEnterEvent.type);
    }
}

export class cwMouseLeaveEvent extends cwEvent {
    static readonly type: string = '@mouseleave';
    constructor() {
        super(cwMouseLeaveEvent.type);
    }
}

export class cwClickEvent extends cwMouseEvent {
    static readonly type: string = '@click';
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwClickEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
    }
}

export class cwDblClickEvent extends cwMouseEvent {
    static readonly type: string = '@dblclick';
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwDblClickEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
    }
}

export class cwDragBeginEvent extends cwMouseEvent {
    static readonly type: string = '@dragbegin';
    data: any;
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwDragBeginEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
        this.data = null;
    }
}

export class cwDragEndEvent extends cwMouseEvent {
    static readonly type: string = '@dragend';
    data: any;
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean, data: any) {
        super(cwDragEndEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
        this.data = data;
    }
}

export class cwDraggingEvent extends cwMouseEvent {
    static readonly type: string = '@dragging';
    data: any;
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean, data: any) {
        super(cwDraggingEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
        this.data = data;
    }
}

export class cwDragOverEvent extends cwMouseEvent {
    static readonly type: string = '@dragover';
    readonly object: cwSceneObject;
    readonly data: any;
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean, object: cwSceneObject, data: any) {
        super(cwDragOverEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
        this.object = object;
        this.data = data;
    }
}

export class cwDragDropEvent extends cwMouseEvent {
    static readonly type: string = '@dragdrop';
    readonly object: cwSceneObject;
    readonly data: any;
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean, object: cwSceneObject, data: any) {
        super(cwDragDropEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
        this.object = object;
        this.data = data;
    }
}

export class cwResizeEvent extends cwEvent {
    static readonly type: string = '@resize';
    constructor() {
        super(cwResizeEvent.type);
    }
}

export class cwGetPropEvent extends cwEvent {
    static readonly type: string = '@getprop';
    readonly propName: string;
    propValue: any;
    constructor(propName: string) {
        super(cwGetPropEvent.type);
        this.propName = propName;
        this.propValue = undefined;
    }
}

export class cwSetPropEvent extends cwEvent {
    static readonly type: string = '@setprop';
    readonly propName: string;
    readonly propValue: any;
    constructor(propName: string, propValue: any) {
        super(cwSetPropEvent.type);
        this.propName = propName;
        this.propValue = propValue;
    }
}

export class cwSysInfo {
    private static _isWindows = (navigator.platform == 'Win32' || navigator.platform == 'Windows');
    private static _isMac = (navigator.platform == 'Mac68K' || navigator.platform == 'MacPPC' || navigator.platform == 'Macintosh' || navigator.platform == 'MacIntel');
    private static _isX11 = (navigator.platform == 'X11');
    private static _isLinux = String(navigator.platform).indexOf('Linux') >= 0;
    private static _isAndroid = (navigator.userAgent.toLowerCase().match(/android/i) || []).indexOf ('android') >= 0;
    static isWindows () {
        return this._isWindows;
    }
    static isMac () {
        return this._isMac;
    }
    static isUnix () {
        return this._isX11 && !this._isWindows && !this._isMac;
    }
    static isLinux () {
        return this._isLinux;
    }
    static isAndroid () {
        return this._isLinux && this._isAndroid;
    }
}

export class cwEventObserver {
    on<T extends cwEvent>(type: string, handler: cwEventHandler<T>, order?: cwEventListenerOrder): void {
        cwApp.addEventListener(type, this, handler, order || cwEventListenerOrder.FIRST);
    }
    off<T extends cwEvent>(type: string, handler?: cwEventHandler<T>): void {
        cwApp.removeEventListener(type, this, handler);
    }
    trigger(evt: cwEvent): void {
        cwApp.triggerEvent(this, evt);
    }
    triggerEx(evt: cwEvent): void {
        this.trigger (evt);
    }
    post<T extends cwEvent>(evt: T): void {
        cwApp.postEvent(this, evt);
    }
}

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
    private _anchorPoint: { x: number, y: number };
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
        this._anchorPoint = { x:0, y:0 };
        if (parent) {
            parent.addChild(this);
        }
        this.on(cwCullEvent.type, (evt: cwCullEvent) => {
            evt.addObject(this, this.z, this.worldTransform);
        });
        this.on(cwHitTestEvent.type, (evt: cwHitTestEvent) => {
            const shape = this.boundingShape;
            evt.result = shape ? cwIntersectionTestShapePoint(shape, {x:evt.x, y:evt.y}) : false;
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
                case 'anchorPoint':
                    ev.propValue = this.anchorPoint;
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
                case 'anchorPoint':
                    this.anchorPoint = ev.propValue;
                    break;
                default:
                    break;
            }
        });
    }
    get boundingShape() {
        const ev = new cwGetBoundingShapeEvent ();
        this.triggerEx (ev);
        return ev.shape || null;
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
        return this.localTransform.getTranslationPart();
    }
    set translation(t: { x: number, y: number }) {
        this.localTransform.setTranslationPart(t);
    }
    get scale(): { x: number, y: number } {
        return this.localTransform.getScalePart();
    }
    set scale(s: { x: number, y: number }) {
        this.localTransform.setScalePart(s);
    }
    get rotation(): number {
        return this.localTransform.getRotationPart();
    }
    set rotation(r: number) {
        this.localTransform.setRotationPart(r);
    }
    get worldTransform(): cwTransform2d {
        let t = this.parent ? cwTransform2d.transform(this.parent.worldTransform, this.localTransform) : this.localTransform;
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
    get anchorPoint() {
        return this._anchorPoint;
    }
    set anchorPoint (pt) {
        this._anchorPoint = pt;
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
        window.addEventListener(window.onpointerdown ? 'pointerdown' : 'mousedown', cwScene.mouseDownHandler);
        window.addEventListener(window.onpointerup ? 'pointerup' : 'mouseup', cwScene.mouseUpHandler);
        window.addEventListener(window.onpointermove ? 'pointermove' : 'mousemove', cwScene.mouseMoveHandler);
        window.addEventListener('keydown', cwScene.keyDownHandler);
        window.addEventListener('keyup', cwScene.keyUpHandler);
        window.addEventListener('keypress', cwScene.keyPressHandler);
    }
    private static doneEventListeners(): void {
        window.removeEventListener('resize', cwScene.resizeHandler);
        window.removeEventListener(window.onpointerdown ? 'pointerdown' : 'mousedown', cwScene.mouseDownHandler);
        window.removeEventListener(window.onpointerup ? 'pointerup' : 'mouseup', cwScene.mouseUpHandler);
        window.removeEventListener(window.onpointermove ? 'pointermove' : 'mousemove', cwScene.mouseMoveHandler);
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
        this._hitObjects.push (this._rootNode);
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
            this.canvas.clear();
            this.triggerEx(new cwDrawEvent(this.canvas, 0, new cwTransform2d()));
            this.canvas.flip();
        });
        this.on(cwResizeEvent.type, () => {
            this.canvas.resize();
        });
        this.on(cwDrawEvent.type, (ev: cwDrawEvent) => {
            if (this.rootNode) {
                let cullEvent = new cwCullEvent(ev.canvas.width, ev.canvas.height);
                this.rootNode.triggerRecursiveEx(cullEvent);
                for (let i in cullEvent.result) {
                    let group = cullEvent.result[i];
                    for (let j = 0; j < group.length; j++) {
                        ev.canvas.context.save();
                        ev.canvas.applyTransform(group[j].transform);
                        ev.canvas.context.translate (0.5, 0.5);
                        group[j].object.triggerEx(new cwDrawEvent(ev.canvas, group[j].z, group[j].transform));
                        ev.canvas.context.restore();
                    }
                }
            }
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

export function ResizeSensor(element:HTMLElement, callback:Function)
{
    let zIndex = parseInt(window.getComputedStyle(element).zIndex);
    if(isNaN(zIndex)) { 
        zIndex = 0; 
    };
    zIndex--;

    let expand = document.createElement('div');
    expand.style.position = "absolute";
    expand.style.left = "0px";
    expand.style.top = "0px";
    expand.style.right = "0px";
    expand.style.bottom = "0px";
    expand.style.overflow = "hidden";
    expand.style.zIndex = String(zIndex);
    expand.style.visibility = "hidden";

    let expandChild = document.createElement('div');
    expandChild.style.position = "absolute";
    expandChild.style.left = "0px";
    expandChild.style.top = "0px";
    expandChild.style.width = "10000000px";
    expandChild.style.height = "10000000px";
    expand.appendChild(expandChild);

    let shrink = document.createElement('div');
    shrink.style.position = "absolute";
    shrink.style.left = "0px";
    shrink.style.top = "0px";
    shrink.style.right = "0px";
    shrink.style.bottom = "0px";
    shrink.style.overflow = "hidden";
    shrink.style.zIndex = String(zIndex);
    shrink.style.visibility = "hidden";

    let shrinkChild = document.createElement('div');
    shrinkChild.style.position = "absolute";
    shrinkChild.style.left = "0px";
    shrinkChild.style.top = "0px";
    shrinkChild.style.width = "200%";
    shrinkChild.style.height = "200%";
    shrink.appendChild(shrinkChild);

    element.appendChild(expand);
    element.appendChild(shrink);

    function setScroll()
    {
        expand.scrollLeft = 10000000;
        expand.scrollTop = 10000000;

        shrink.scrollLeft = 10000000;
        shrink.scrollTop = 10000000;
    };
    setScroll();

    let size = element.getBoundingClientRect();

    let currentWidth = size.width;
    let currentHeight = size.height;

    let onScroll = function() {
        let size = element.getBoundingClientRect();

        let newWidth = size.width;
        let newHeight = size.height;

        if(newWidth != currentWidth || newHeight != currentHeight) {
            currentWidth = newWidth;
            currentHeight = newHeight;

            callback();
        }

        setScroll();
    };

    expand.addEventListener('scroll', onScroll);
    shrink.addEventListener('scroll', onScroll);
}

export class cwCanvas extends cwObject {
    private readonly _canvas: HTMLCanvasElement;
    private _buffer: HTMLCanvasElement;
    private _screenCtx: CanvasRenderingContext2D;
    private _offscreenCtx: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;
    private _doubleBuffer: boolean;
    private static readonly eventNames = ['mouseenter']
    private adjustCanvasSize (canvas:HTMLCanvasElement) {
        const computedStyle = window.getComputedStyle (canvas.parentElement);
        this._width = canvas.parentElement.clientWidth - parseFloat (computedStyle.paddingLeft) - parseFloat (computedStyle.paddingRight);
        this._height = canvas.parentElement.clientHeight - parseFloat (computedStyle.paddingTop) - parseFloat (computedStyle.paddingBottom);
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        this._screenCtx = this._canvas.getContext("2d");
        this._buffer = document.createElement("canvas");
        this._buffer.width = this._width;
        this._buffer.height = this._height;
        this._offscreenCtx = this._buffer.getContext("2d");
    }
    constructor(canvas: HTMLCanvasElement, doubleBuffer: boolean = false) {
        super();
        this._canvas = canvas;
        if (this._canvas) {
            this.adjustCanvasSize (this._canvas);
            ResizeSensor (this._canvas.parentElement, () => {
                this.adjustCanvasSize (this._canvas);
            });
        }
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
        this.context.setTransform(transform.a, transform.b, transform.c, transform.d, Math.round(transform.e), Math.round(transform.f));
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

