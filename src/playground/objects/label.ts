import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as tools from '../tools';
import * as factory from './factory';

export class cwPGLabel extends core.cwSceneObject {
    private _width: number;
    private _height: number;
    private _text: string;
    private _font: string;
    private _fontSize: number;
    private _fontStyle: string;
    private _fontVariant: string;
    private _fontWeight: string;
    private _fontFamily: string;
    private _measure: TextMetrics;
    private _background: string|null;
    private _textcolor: string;
    private _selected: boolean;

    constructor(options:any = null) {
        super();
        const opt = options||{}
        this._width = Number(opt.width || 0);
        this._height = Number(opt.height || 0);
        this._fontSize = Number(opt.fontSize || 16);
        this._fontStyle = opt.fontStyle || 'normal';
        this._fontVariant = opt.fontVariant || 'normal';
        this._fontWeight = opt.fontWeight || 'normal';
        this._fontFamily = opt.fontFamily || '微软雅黑';
        this._font = '';
        this._text = opt.text || '';
        this._measure = null;
        this._background = opt.background || null;
        this._textcolor = opt.textcolor || '#000';
        this._selected = false;
        this.on(events.cwHitTestEvent.type, (evt: events.cwHitTestEvent) => {
            let width = this._width;
            let height = this._height || this._fontSize;
            if (width == 0) {
                if (this._measure === null) {
                    this._measure = this.view.canvas.context.measureText (this._text);
                }
                width = this._measure.width;
            }
            evt.result = evt.x >= -width / 2 && evt.x < width / 2 && evt.y >= -height / 2 && evt.y < height / 2;
        });
        this.on(events.cwDrawEvent.type, (evt: events.cwDrawEvent) => {
            if (this._font === '') {
                this._font = `${this._fontStyle} ${this._fontVariant} ${this._fontWeight} ${this._fontSize}px ${this._fontFamily}`;
            }
            evt.canvas.context.save();
            evt.canvas.applyTransform(evt.transform);
            evt.canvas.context.textAlign = 'center';
            evt.canvas.context.textBaseline = 'bottom';
            evt.canvas.context.fillStyle = '#000';
            evt.canvas.context.font = this._font;
            let width = this._width;
            let height = this._height || this._fontSize;
            if (width == 0) {
                if (this._measure === null) {
                    this._measure = evt.canvas.context.measureText (this._text);
                }
                width = this._measure.width;
            }
            evt.canvas.context.fillText(this._text, 0, height/2, width);
            if (this._selected) {
                evt.canvas.context.strokeStyle = '#000';
                evt.canvas.context.strokeRect (-width/2, -height/2, width, height);
            }
            evt.canvas.context.restore();
        });
        this.on(tools.cwPGSelectEvent.type, (evt: tools.cwPGSelectEvent) => {
            this._selected = true;
        });
        this.on(tools.cwPGDeselectEvent.type, (evt: tools.cwPGDeselectEvent) => {
            this._selected = false;
        });
        this.on(factory.cwPGCommandEvent.type, (evt: factory.cwPGCommandEvent) => {
            if (evt.cmd.command === 'beginEdit') {
                // TODO:
            } else if (evt.cmd.command == 'endEdit') {
                // TODO:
            }
        });
    }
    get text () {
        return this._text;
    }
    set text (value: string) {
        if (value !== this._text) {
            this._text = value;
            this._measure = null;
        }
    }
}

export class cwPGLabelFactory extends factory.cwPGFactory {
    protected _createEntity (options?:any): core.cwSceneObject {
        return new cwPGLabel (options);
    }
}