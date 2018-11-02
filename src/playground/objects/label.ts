import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as playground from '../playground';

export class cwPGLabel extends core.cwSceneObject {
    private _width:number;
    private _height:number;
    private _text:string;
    constructor (width:number = 0, height:number = 0, text:string = '') {
        super ();
        this._width = width;
        this._height = height;
        this._text = text;
        this.on (events.cwHitTestEvent.type, (evt: events.cwHitTestEvent) => {
            evt.result = evt.x >= -this._width/2 && evt.x < this._width/2 && evt.y >= -this._height/2 && evt.y < this._height/2;
        });
        this.on (events.cwDrawEvent.type, (evt: events.cwDrawEvent) => {
            evt.canvas.context.save();
            evt.canvas.applyTransform (evt.transform);
            evt.canvas.context.textAlign = 'center';
            evt.canvas.context.fillText(this._text, 0, 0, this._width);
            evt.canvas.context.restore();
        });
    }
}