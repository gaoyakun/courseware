import * as lib from '../../lib';
import * as playground from '../playground';

export class cwPGLabel extends lib.cwSceneObject {
    private _width: number;
    private _height: number;
    private _minwidth: number;
    private _text: string;
    private _font: string;
    private _fontSize: number;
    private _fontStyle: string;
    private _fontVariant: string;
    private _fontWeight: string;
    private _fontFamily: string;
    private _measure: TextMetrics;
    private _textcolor: string;

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
        this._minwidth = 10;
        this._textcolor = opt.textcolor || '#000';
        this.on(lib.cwGetBoundingboxEvent.type, (evt: lib.cwGetBoundingboxEvent) => {
            let width = this._width;
            let height = this._height || this._fontSize;
            if (width == 0 && this._measure !== null) {
                width = this._measure.width;
                if (width < this._minwidth) {
                    width = this._minwidth;
                }
            }
            evt.rect = { x:-width * this.anchorPoint.x, y:-height * this.anchorPoint.y, w:width, h:height };
        });
        this.on(lib.cwDrawEvent.type, (evt: lib.cwDrawEvent) => {
            if (this._font === '') {
                this._font = `${this._fontStyle} ${this._fontVariant} ${this._fontWeight} ${this._fontSize}px ${this._fontFamily}`;
            }
            evt.canvas.context.save();
            evt.canvas.applyTransform(evt.transform);
            evt.canvas.context.textAlign = 'left';
            evt.canvas.context.textBaseline = 'hanging';
            evt.canvas.context.fillStyle = this._textcolor;
            evt.canvas.context.font = this._font;
            let width = this._width;
            let height = this._height || this._fontSize;
            if (width == 0) {
                if (this._measure === null) {
                    this._measure = evt.canvas.context.measureText (this._text);
                }
                width = this._measure.width;
                if (width < this._minwidth) {
                    width = this._minwidth;
                }
            }
            evt.canvas.context.fillText(this._text, -width * this.anchorPoint.x, -height * this.anchorPoint.y, width);
            evt.canvas.context.restore();
        });
        this.on(playground.cwPGGetObjectPropertyEvent.type, (ev: playground.cwPGGetObjectPropertyEvent) => {
            switch (ev.name) {
                case 'text': {
                    ev.value = this.text;
                    break;
                }
                case 'textColor': {
                    ev.value = this._textcolor;
                    break;
                }
                case 'fontSize': {
                    ev.value = this.fontSize;
                    break;
                }
            }
        });
        this.on(playground.cwPGSetObjectPropertyEvent.type, (ev: playground.cwPGSetObjectPropertyEvent) => {
            switch (ev.name) {
                case 'text': {
                    this.text = ev.value;
                    break;
                }
                case 'textColor': {
                    this._textcolor = ev.value;
                    break;
                }
                case 'fontSize': {
                    this.fontSize = Number(ev.value);
                    break;
                }
            }
        });
        this.on(playground.cwPGGetObjectPropertyListEvent.type, (ev: playground.cwPGGetObjectPropertyListEvent) => {
            ev.properties = ev.properties || {};
            ev.properties[this.entityType] = ev.properties[this.entityType] || { desc: this.entityType, properties: [] };
            ev.properties[this.entityType].properties.push ({
                name: 'text',
                desc: '文字内容',
                readonly: false,
                type: 'string',
                value: this.text
            });
            ev.properties[this.entityType].properties.push ({
                name: 'textColor',
                desc: '文字颜色',
                readonly: false,
                type: 'color',
                value: this._textcolor
            });
            ev.properties[this.entityType].properties.push ({
                name: 'fontSize',
                desc: '文字大小',
                readonly: false,
                type: 'number',
                value: this.fontSize
            });
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
    get fontSize () {
        return this._fontSize;
    }
    set fontSize (value: number) {
        if (value !== this._fontSize) {
            this._fontSize = value;
            this._font = '';
            this._measure = null;
        }
    }
}

export class cwPGLabelFactory extends playground.cwPGFactory {
    protected _createEntity (options?:any): lib.cwSceneObject {
        return new cwPGLabel (options);
    }
}