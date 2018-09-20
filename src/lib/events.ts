import { cwApp, cwCanvas } from './core';
import { cwTransform2d } from './transform';
export type cwCullResult = {[z:number]:Array<{object:cwEventObserver,z:number,transform:cwTransform2d}>};
export type cwEventHandler = (evt:cwEvent) => void;

export enum cwEventListenerOrder {
    First = 1,
    Last = 2
}

export class cwEvent {
    readonly type: string;
    eaten: boolean;
    constructor (type:string) {
        this.type = type;
        this.eaten = false;
    }
    eat () {
        this.eaten = true;
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
    readonly canvasWidth:number;
    readonly canvasHeight:number;
    readonly result:cwCullResult;
    constructor (w:number, h:number) {
        super (cwCullEvent.type);
        this.canvasWidth = w;
        this.canvasHeight = h;
        this.result = {};
    }
    addObject (object:cwEventObserver, z:number, transform:cwTransform2d): void {
        let objectList = this.result[z]||[];
        objectList.push ({object:object,z:z,transform:transform});
        this.result[z] = objectList;
    }
}

export class cwDrawEvent extends cwEvent {
    static readonly type: string = '@draw';
    readonly canvas:cwCanvas;
    readonly z:number;
    readonly transform:cwTransform2d;
    constructor (canvas:cwCanvas, z:number, transform:cwTransform2d) {
        super (cwDrawEvent.type);
        this.canvas = canvas;
        this.z = z;
        this.transform = transform;
    }
}

export class cwHitTestEvent extends cwEvent {
    static readonly type: string = '@hittest';
    x:number;
    y:number;
    result:boolean;
    constructor (x:number,y:number) {
        super (cwHitTestEvent.type);
        this.x = x;
        this.y = y;
        this.result = false;
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

export class cwFocusEvent extends cwEvent {
    static readonly type: string = '@focus';
    readonly focus: boolean;
    constructor (focus:boolean) {
        super (cwFocusEvent.type);
        this.focus = focus;
    }
}

export class cwKeyboardEvent extends cwEvent {
    readonly key:string;
    readonly keyCode:number;    
    readonly shiftDown:boolean;
    readonly altDown:boolean;
    readonly ctrlDown:boolean;
    readonly metaDown:boolean;
    constructor (type:string,key:string,code:number,shift:boolean,alt:boolean,ctrl:boolean,meta:boolean) {
        super (type);
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
    constructor (key:string,code:number,shift:boolean,alt:boolean,ctrl:boolean,meta:boolean) {
        super (cwKeyDownEvent.type,key,code,shift,alt,ctrl,meta);
    }
}

export class cwKeyUpEvent extends cwKeyboardEvent {
    static readonly type: string = '@keyup';
    constructor (key:string,code:number,shift:boolean,alt:boolean,ctrl:boolean,meta:boolean) {
        super (cwKeyUpEvent.type,key,code,shift,alt,ctrl,meta);
    }
}

export class cwKeyPressEvent extends cwKeyboardEvent {
    static readonly type: string = '@keypress';
    constructor (key:string,code:number,shift:boolean,alt:boolean,ctrl:boolean,meta:boolean) {
        super (cwKeyPressEvent.type,key,code,shift,alt,ctrl,meta);
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
    bubble:boolean;
    constructor (type:string,x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (type);
        this.x = x;
        this.y = y;
        this.button = button;
        this.shiftDown = shiftDown;
        this.altDown = altDown;
        this.ctrlDown = ctrlDown;
        this.metaDown = metaDown;
        this.bubble = true;
    }
    cancelBubble () {
        this.bubble = false;
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
        super (cwMouseUpEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwMouseMoveEvent extends cwMouseEvent {
    static readonly type: string = '@mousemove';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseMoveEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwMouseEnterEvent extends cwMouseEvent {
    static readonly type: string = '@mouseenter';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseEnterEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwMouseLeaveEvent extends cwMouseEvent {
    static readonly type: string = '@mouseleave';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwMouseLeaveEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwClickEvent extends cwMouseEvent {
    static readonly type: string = '@click';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwClickEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwDblClickEvent extends cwMouseEvent {
    static readonly type: string = '@dblclick';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwDblClickEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
}

export class cwResizeEvent extends cwEvent {
    static readonly type: string = '@resize';
    constructor () {
        super (cwResizeEvent.type);
    }
}

export class cwGetPropEvent extends cwEvent {
    static readonly type: string = '@getprop';
    readonly propName: string;
    propValue: any;
    constructor (propName:string) {
        super (cwGetPropEvent.type);
        this.propName = propName;
        this.propValue = undefined;
    }
}

export class cwSetPropEvent extends cwEvent {
    static readonly type: string = '@setprop';
    readonly propName: string;
    readonly propValue: any;
    constructor (propName:string, propValue:any) {
        super (cwSetPropEvent.type);
        this.propName = propName;
        this.propValue = propValue;
    }
}

export class cwEventObserver {
    on (type:string, handler:cwEventHandler, order?:cwEventListenerOrder): void {
        cwApp.addEventListener (type, this, handler, order||cwEventListenerOrder.First);
    }
    off (type:string, handler?:cwEventHandler): void {
        cwApp.removeEventListener (type, this, handler);
    }
    trigger (evt:cwEvent): void {
        cwApp.triggerEvent (this, evt);
    }
    post (evt:cwEvent): void {
        cwApp.postEvent (this, evt);
    }
}
