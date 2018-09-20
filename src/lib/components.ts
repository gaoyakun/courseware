import { cwComponent, cwSceneObject } from './core';
import { cwEvent, cwCullEvent, cwHitTestEvent, cwDrawEvent, cwUpdateEvent, cwGetPropEvent, cwSetPropEvent } from './events';
import { CurveEvaluter,StepEvaluter,LinearEvaluter,PolynomialsEvaluter} from './curve';

export enum cwInterpolateMode {
    imConstant = 'constant',
    imLinear = 'linear',
    imPoly = 'poly'
}

export class cwcKeyframeAnimation extends cwComponent {
    static readonly type = 'KeyframeAnimation';
    private _tracks: { [name:string]: { evalutor: CurveEvaluter, value: number } };
    private _repeat: number;
    private _duration: number;
    private _startTime: number;
    private _delay: number;
    private _round: number;
    private _autoRemove: boolean;
    constructor (delay:number = 0, repeat:number = 1, autoRemove:boolean = true) {
        super (cwcKeyframeAnimation.type);
        this._tracks = {};
        this._repeat = repeat;
        this._duration = 0;
        this._startTime = 0;
        this._round = 0;
        this._delay = delay;
        this._autoRemove = autoRemove;
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
    setTrack (name:string, mode:cwInterpolateMode, clamp:boolean, keyFrames:Array<{x:number,y:number}>) {
        if (keyFrames.length > 0) {
            if (keyFrames[keyFrames.length-1].x > this._duration) {
                this._duration = keyFrames[keyFrames.length-1].x;
            }
            if (mode == cwInterpolateMode.imConstant) {
                this._tracks[name] = { evalutor: new StepEvaluter(keyFrames, clamp), value: 0 };
            } else if (mode == cwInterpolateMode.imLinear) {
                this._tracks[name] = { evalutor: new LinearEvaluter(keyFrames, clamp), value: 0 };
            } else if (mode == cwInterpolateMode.imPoly) {
                this._tracks[name] = { evalutor: new PolynomialsEvaluter(keyFrames, clamp), value: 0 };
            }
        }
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

