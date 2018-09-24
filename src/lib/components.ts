import { cwComponent, cwSceneObject, cwScene } from './core';
import { cwEvent, cwCullEvent, cwHitTestEvent, cwDrawEvent, cwUpdateEvent, cwGetPropEvent, cwSetPropEvent, cwMouseMoveEvent, cwMouseDownEvent, cwMouseUpEvent } from './events';
import { cwSpline, cwSplineType } from './curve';

export class cwcKeyframeAnimation extends cwComponent {
    static readonly type = 'KeyframeAnimation';
    private _tracks: { [name:string]: { evalutor: cwSpline, value: any } };
    private _repeat: number;
    private _duration: number;
    private _startTime: number;
    private _delay: number;
    private _round: number;
    private _autoRemove: boolean;
    constructor (options?:{
        delay?:number;
        repeat?:number;
        autoRemove?:boolean;
        tracks?:{
            [name:string]:{
                cp:Array<{x:number,y:number}>|Array<{x:number,y:Array<number>}>;
                type?:cwSplineType;
                clamp?:boolean;
            }
        }
    }) {
        super (cwcKeyframeAnimation.type);
        this._tracks = {};
        this._duration = 0;
        this._startTime = 0;
        this._round = 0;

        const opt = options||{};
        this._delay = opt.delay === undefined ? 0 : opt.delay;
        this._repeat = opt.repeat === undefined ? 0 : opt.repeat;
        this._autoRemove = opt.autoRemove === undefined ? true : opt.autoRemove;
        if (opt.tracks) {
            for (const trackName in opt.tracks) {
                const trackinfo = opt.tracks[trackName];
                let type = trackinfo.type === undefined ? cwSplineType.POLY : trackinfo.type;
                let clamp = trackinfo.clamp === undefined ? false : trackinfo.clamp;
                this.setTrack (trackName, type, clamp, trackinfo.cp);
            }
        }
        
        this.on (cwUpdateEvent.type, (ev:cwEvent) => {
            const e = ev as cwUpdateEvent;
            const timeNow = e.elapsedTime;
            if (this._startTime == 0) {
                this._startTime = timeNow;
            }
            if (this._startTime + this._delay > timeNow) {
                return;
            }
            const t = timeNow - this._startTime - this._delay;
            for (let track in this._tracks) {
                this._tracks[track].value = this._tracks[track].evalutor.eval (t);
            }
            if (t >= this._duration) {
                this._round++;
                if (this._repeat == 0 || this._round < this._repeat) {
                    this._startTime = timeNow;
                } else if (this._autoRemove) {
                    this.object.removeComponent (this);
                }
            }
            for (let prop in this._tracks) {
                this.object.triggerEx (new cwSetPropEvent(prop, this._tracks[prop].value));
            }
        });
    }
    get repeat(): number {
        return this._repeat;
    }
    set repeat (val:number) {
        this._repeat = val;
    }
    get autoRemove (): boolean {
        return this._autoRemove;
    }
    set autoRemove (val:boolean) {
        this._autoRemove = val;
    }
    get delay (): number {
        return this._delay;
    }
    set delay (delay:number) {
        this._delay = delay;
    }
    setTrack (name:string, type:cwSplineType, clamp:boolean, keyFrames:Array<{x:number,y:number}>|Array<{x:number,y:Array<number>}>) {
        if (keyFrames.length > 0) {
            if (keyFrames[keyFrames.length-1].x > this._duration) {
                this._duration = keyFrames[keyFrames.length-1].x;
            }
            this._tracks[name] = { evalutor: new cwSpline(type, keyFrames, clamp), value: null };
        }
    }
}

export class cwcDraggable extends cwComponent {
    static readonly type = 'Draggable';
    private _dragging:boolean;
    constructor () {
        super (cwcDraggable.type);
        this._dragging = false;
        this.on (cwMouseDownEvent.type, (ev:cwEvent) => {
            (this.object as cwSceneObject).setCapture ();
            this._dragging = true;
            const e = ev as cwMouseMoveEvent;
            (this.object as cwSceneObject).worldTranslation = {x:e.x, y:e.y};
        });
        this.on (cwMouseUpEvent.type, (ev:cwEvent) => {
            (this.object as cwSceneObject).releaseCapture ();
            this._dragging = false;
            (this.object as cwSceneObject).worldTranslation = null;
        });
        this.on (cwMouseMoveEvent.type, (ev:cwEvent) => {
            if (this._dragging) {
                const e = ev as cwMouseMoveEvent;
                (this.object as cwSceneObject).worldTranslation = {x:e.x, y:e.y};
            }
        });
    }
}

export class cwcImage extends cwComponent {
    static readonly type = 'Image';
    private _image:HTMLImageElement;
    private _width:number;
    private _height:number;
    private _loaded:boolean;
    constructor (filename:string = null, width:number = 0, height:number = 0) {
        super (cwcImage.type);
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
        this.on (cwCullEvent.type, (evt:cwEvent) => {
            if (this._loaded) {
                const cullEvent = evt as cwCullEvent;
                const node = this.object as cwSceneObject;
                cullEvent.addObject (this, node.z, node.worldTransform);
            }
        });
        this.on (cwHitTestEvent.type, (evt:cwEvent) => {
            if (this._loaded) {
                const hittestEvent = evt as cwHitTestEvent;
                hittestEvent.result = hittestEvent.x >= -this._width/2 && hittestEvent.x < this._width/2 && hittestEvent.y >= -this._height/2 && hittestEvent.y < this._height/2;
            }
        });
        this.on (cwDrawEvent.type, (evt:cwEvent) => {
            if (this._loaded) {
                const drawEvent = evt as cwDrawEvent;
                drawEvent.canvas.context.save();
                drawEvent.canvas.applyTransform (drawEvent.transform);
                drawEvent.canvas.context.drawImage(this._image, -this._width/2, -this._height/2, this._width, this._height);
                drawEvent.canvas.context.restore();
            }
        });
        this.on (cwGetPropEvent.type, (ev:cwEvent) => {
            const e = ev as cwGetPropEvent;
            switch (e.propName) {
            case 'width':
                e.propValue = this._width;
                e.eat ();
                break;
            case 'height':
                e.propValue = this._height;
                e.eat ();
                break;
            default:
                break;
            }
        });
        this.on (cwSetPropEvent.type, (ev:cwEvent) => {
            const e = ev as cwSetPropEvent;
            switch (e.propName) {
            case 'width':
                this._width = e.propValue as number;
                this._image.width = this._width;
                e.eat ();
                break;
            case 'height':
                this._height = e.propValue as number;
                this._image.height = this._height;
                e.eat ();
                break;
            default:
                break;
            }
        });
    }
}

