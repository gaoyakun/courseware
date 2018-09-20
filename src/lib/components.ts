import { cwComponent, cwSceneObject } from './core';
import { cwEvent, cwCullEvent, cwHitTestEvent, cwDrawEvent } from './events';

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
    }
}

