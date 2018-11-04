import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as factory from './factory';

export class cwPGLabel extends core.cwSceneObject {
    private _width: number;
    private _height: number;
    private _text: string;
    constructor(options:any = null) {
        super();
        const opt = options||{}
        this._width = Number(opt.width || 0);
        this._height = Number(opt.height || 0);
        this._text = opt.text || '';
        this.on(events.cwHitTestEvent.type, (evt: events.cwHitTestEvent) => {
            evt.result = evt.x >= -this._width / 2 && evt.x < this._width / 2 && evt.y >= -this._height / 2 && evt.y < this._height / 2;
        });
        this.on(events.cwDrawEvent.type, (evt: events.cwDrawEvent) => {
            evt.canvas.context.save();
            evt.canvas.applyTransform(evt.transform);
            evt.canvas.context.strokeStyle = '#000';
            evt.canvas.context.strokeRect (-this._width/2, -this._height/2, this._width, this._height);
            evt.canvas.context.textAlign = 'center';
            evt.canvas.context.fillStyle = '#000';
            evt.canvas.context.fillText(this._text, 0, 0, this._width);
            evt.canvas.context.restore();
        });
    }
}

export class cwPGLabelFactory extends factory.cwPGFactory {
    protected _createEntity (options?:any): core.cwSceneObject {
        return new cwPGLabel (options);
    }
}