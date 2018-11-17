import { cwComponent, cwSceneObject, cwApp, cwCullEvent, cwHitTestEvent, cwDrawEvent, cwUpdateEvent, cwGetPropEvent, cwSetPropEvent, cwMouseMoveEvent, cwMouseDownEvent, cwMouseUpEvent, cwDragBeginEvent, cwDragDropEvent, cwDragOverEvent, cwComponentAttachedEvent, cwComponentBeforeAttachEvent, cwGetBoundingboxEvent } from './core';
import { cwSpline, cwSplineType } from './curve';

export class cwcKeyframeAnimation extends cwComponent {
    static readonly type = 'KeyframeAnimation';
    private _tracks: { [name: string]: { evalutor: cwSpline, value: any } };
    private _exclusive: boolean;
    private _repeat: number;
    private _duration: number;
    private _startTime: number;
    private _delay: number;
    private _round: number;
    private _autoRemove: boolean;
    constructor(options?: {
        delay?: number;
        repeat?: number;
        exclusive?: boolean;
        autoRemove?: boolean;
        tracks?: {
            [name: string]: {
                cp: Array<{ x: number, y: number }> | Array<{ x: number, y: Array<number> }>;
                type?: cwSplineType;
                clamp?: boolean;
            }
        }
    }) {
        super(cwcKeyframeAnimation.type);
        this._tracks = {};
        this._duration = 0;
        this._startTime = 0;
        this._round = 0;

        const opt = options || {};
        this._delay = opt.delay === undefined ? 0 : opt.delay;
        this._repeat = opt.repeat === undefined ? 0 : opt.repeat;
        this._autoRemove = opt.autoRemove === undefined ? true : opt.autoRemove;
        this._exclusive = !!opt.exclusive;
        if (opt.tracks) {
            for (const trackName in opt.tracks) {
                if (opt.tracks.hasOwnProperty(trackName)) {
                    const trackinfo = opt.tracks[trackName];
                    const type = trackinfo.type === undefined ? cwSplineType.POLY : trackinfo.type;
                    const clamp = trackinfo.clamp === undefined ? true : trackinfo.clamp;
                    this.setTrack(trackName, type, clamp, trackinfo.cp);
                }
            }
        }
        this.on(cwComponentBeforeAttachEvent.type, (ev: cwComponentBeforeAttachEvent) => {
            if (this._exclusive) {
                ev.object.removeComponentsByType(this.type);
            }
        });
        this.on(cwUpdateEvent.type, (e: cwUpdateEvent) => {
            const timeNow = e.elapsedTime;
            if (this._startTime === 0) {
                this._startTime = timeNow;
            }
            if (this._startTime + this._delay > timeNow) {
                return;
            }
            let t = timeNow - this._startTime - this._delay;
            for (const track in this._tracks) {
                if (this._tracks.hasOwnProperty(track)) {
                    this._tracks[track].value = this._tracks[track].evalutor.eval(t);
                }
            }
            if (this.object) {
                for (const prop in this._tracks) {
                    if (this._tracks.hasOwnProperty(prop)) {
                        this.object.triggerEx(new cwSetPropEvent(prop, this._tracks[prop].value));
                    }
                }
            }
            if (t >= this._duration) {
                this._round++;
                if (this._repeat === 0 || this._round < this._repeat) {
                    this._startTime = timeNow + t - this._duration;
                } else if (this._autoRemove) {
                    this.object.removeComponent(this);
                }
            }
        });
    }
    get repeat(): number {
        return this._repeat;
    }
    set repeat(val: number) {
        this._repeat = val;
    }
    get autoRemove(): boolean {
        return this._autoRemove;
    }
    set autoRemove(val: boolean) {
        this._autoRemove = val;
    }
    get delay(): number {
        return this._delay;
    }
    set delay(delay: number) {
        this._delay = delay;
    }
    setTrack(name: string, type: cwSplineType, clamp: boolean, keyFrames: Array<{ x: number, y: number }> | Array<{ x: number, y: Array<number> }>) {
        if (keyFrames.length > 0) {
            if (keyFrames[keyFrames.length - 1].x > this._duration) {
                this._duration = keyFrames[keyFrames.length - 1].x;
            }
            this._tracks[name] = { evalutor: new cwSpline(type, keyFrames, clamp), value: null };
        }
    }
    finish(): void {
        for (let track in this._tracks) {
            this._tracks[track].value = this._tracks[track].evalutor.evalLast();
        }
        if (this.object) {
            for (let prop in this._tracks) {
                this.object.triggerEx(new cwSetPropEvent(prop, this._tracks[prop].value));
            }
        }
        this._round++;
        if (this._repeat == 0 || this._round < this._repeat) {
            this._startTime = cwApp.elapsedTime;
        } else if (this._autoRemove) {
            this.object.removeComponent(this);
        }
    }
}

export class cwcDraggable extends cwComponent {
    static readonly type = 'Draggable';
    private _dragging: boolean;
    private _draggingData: any;
    constructor() {
        super(cwcDraggable.type);
        this._dragging = false;
        this._draggingData = null;
        this.on(cwMouseDownEvent.type, (e: cwMouseDownEvent) => {
            (this.object as cwSceneObject).setCapture();
            this._dragging = true;
            const dragBeginEvent = new cwDragBeginEvent(e.x, e.y, e.button, e.shiftDown, e.altDown, e.ctrlDown, e.metaDown);
            this.object.triggerEx(dragBeginEvent);
            this._draggingData = dragBeginEvent.data;
            e.cancelBubble();
        });
        this.on(cwMouseUpEvent.type, (e: cwMouseUpEvent) => {
            const obj = this.object as cwSceneObject;
            obj.releaseCapture();

            if (this._dragging) {
                this._dragging = false;
                obj.view.updateHitObjects(e.x, e.y);
                let dragDropEvent = new cwDragDropEvent(e.x, e.y, e.button, e.shiftDown, e.altDown, e.ctrlDown, e.metaDown, obj, this._draggingData);
                for (let i = 0; i < obj.view.hitObjects.length; i++) {
                    obj.view.hitObjects[i].triggerEx(dragDropEvent);
                    if (!dragDropEvent.bubble) {
                        break;
                    }
                }
                if (dragDropEvent.bubble) {
                    obj.view.triggerEx(dragDropEvent);
                }
                this._draggingData = null;
                e.cancelBubble();
            }
        });
        this.on(cwMouseMoveEvent.type, (e: cwMouseMoveEvent) => {
            if (this._dragging) {
                const obj = this.object as cwSceneObject;
                obj.view.updateHitObjects(e.x, e.y);
                let dragOverEvent = new cwDragOverEvent(e.x, e.y, e.button, e.shiftDown, e.altDown, e.ctrlDown, e.metaDown, obj, this._draggingData);
                for (let i = 0; i < obj.view.hitObjects.length; i++) {
                    obj.view.hitObjects[i].triggerEx(dragOverEvent);
                    if (!dragOverEvent.bubble) {
                        break;
                    }
                }
                if (dragOverEvent.bubble) {
                    obj.view.triggerEx(dragOverEvent);
                }
                e.cancelBubble();
            }
        });
    }
}

export class cwcDroppable extends cwComponent {
    static readonly type = 'Droppable';
    constructor() {
        super(cwcDroppable.type);
    }
}

export class cwcImage extends cwComponent {
    static readonly type = 'Image';
    private _image: HTMLImageElement;
    private _width: number;
    private _height: number;
    private _loaded: boolean;
    constructor(filename: string = null, width: number = 0, height: number = 0) {
        super(cwcImage.type);
        this._image = new Image();
        if (filename) {
            this._image.src = filename;
        }
        if (width) {
            this._image.width = width;
            this._width = width;
        } else {
            this._width = this._image.complete ? this._image.width : 0;
        }
        if (height) {
            this._image.height = height;
            this._height = height;
        } else {
            this._height = this._image.complete ? this._image.height : 0;
        }
        if (!this._image.complete) {
            this._loaded = false;
            this._image.onload = () => {
                if (this._width == 0) {
                    this._width = this._image.width;
                }
                if (this._height == 0) {
                    this._height = this._image.height;
                }
                this._loaded = true;
            }
        } else {
            this._loaded = true;
        }
        this.on(cwCullEvent.type, (evt: cwCullEvent) => {
            if (this._loaded) {
                const node = this.object as cwSceneObject;
                evt.addObject(this, node.z, node.worldTransform);
            }
        });
        this.on(cwGetBoundingboxEvent.type, (evt: cwGetBoundingboxEvent) => {
            if (this._loaded) {
                evt.rect = { x:-this._width/2, y:this._height/2, w:this._width, h:this._height};
            }
        });
        this.on(cwDrawEvent.type, (evt: cwDrawEvent) => {
            if (this._loaded) {
                evt.canvas.context.save();
                evt.canvas.applyTransform(evt.transform);
                evt.canvas.context.drawImage(this._image, -this._width / 2, -this._height / 2, this._width, this._height);
                evt.canvas.context.restore();
            }
        });
        this.on(cwGetPropEvent.type, (ev: cwGetPropEvent) => {
            switch (ev.propName) {
                case 'width':
                    ev.propValue = this._width;
                    ev.eat();
                    break;
                case 'height':
                    ev.propValue = this._height;
                    ev.eat();
                    break;
                default:
                    break;
            }
        });
        this.on(cwSetPropEvent.type, (ev: cwSetPropEvent) => {
            switch (ev.propName) {
                case 'width':
                    this._width = ev.propValue as number;
                    this._image.width = this._width;
                    ev.eat();
                    break;
                case 'height':
                    this._height = ev.propValue as number;
                    this._image.height = this._height;
                    ev.eat();
                    break;
                default:
                    break;
            }
        });
    }
}

