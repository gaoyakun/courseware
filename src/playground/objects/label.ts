import * as core from '../../lib/core';
import * as tools from '../tools';
import * as playground from '../playground';

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
    private _textcolor: string;
    private _selected: boolean;
    private _editing: boolean;

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
        this._savedText = '';
        this._measure = null;
        this._minwidth = 10;
        this._background = opt.background || null;
        this._textcolor = opt.textcolor || '#000';
        this._selected = false;
        this._editing = false;
        this.on(core.cwGetBoundingboxEvent.type, (evt: core.cwGetBoundingboxEvent) => {
            let width = this._width;
            let height = this._height || this._fontSize;
            if (width == 0 && this._measure !== null) {
                width = this._measure.width;
                if (width < this._minwidth) {
                    width = this._minwidth;
                }
            }
            evt.rect = { x:-width/2, y:-height/2, w:width, h:height };
        });
        this.on(core.cwDrawEvent.type, (evt: core.cwDrawEvent) => {
            if (this._font === '') {
                this._font = `${this._fontStyle} ${this._fontVariant} ${this._fontWeight} ${this._fontSize}px ${this._fontFamily}`;
            }
            evt.canvas.context.save();
            evt.canvas.applyTransform(evt.transform);
            evt.canvas.context.textAlign = 'center';
            evt.canvas.context.textBaseline = 'bottom';
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
            if (this._editing) {
                this.triggerEx (new playground.cwPGCommandEvent({ command: 'cancelEdit' }));
            }
        });
        this.on(playground.cwPGCommandEvent.type, (evt: playground.cwPGCommandEvent) => {
            if (evt.cmd.command === 'beginEdit') {
                if (!this._editing) {
                    this._editing = true;
                    this._savedText = this._text;
                    this.text += '|';
                }
            } else if (evt.cmd.command == 'endEdit') {
                if (this._editing) {
                    this._editing = false;
                    this.text = this._text.substr (0, this.text.length - 1);
                }
            } else if (evt.cmd.command == 'cancelEdit') {
                if (this._editing) {
                    this._editing = false;
                    this.text = this._savedText;
                }
            } else if (evt.cmd.command == 'fontScaleUp') {
                this.fontSize = this.fontSize + Number(evt.cmd.step);
            } else if (evt.cmd.command == 'fontScaleDown') {
                let fontSize = this.fontSize - Number(evt.cmd.step);
                if (fontSize < 8) {
                    fontSize = 8;
                }
                this.fontSize = fontSize;
            }
        });
        this.on(core.cwKeyPressEvent.type, (ev: core.cwKeyPressEvent) => {
            if (this._editing) {
                let text = this._text.substr (0, this.text.length - 1);
                text += ev.key;
                this.text = text + '|';
            }
        });
        this.on(core.cwKeyDownEvent.type, (ev: core.cwKeyDownEvent) => {
            if (this._editing) {
                if (ev.keyCode == 13) {
                    this.triggerEx (new playground.cwPGCommandEvent({ command: 'endEdit' }));
                } else if (ev.keyCode == 8) {
                    let text = this._text.substr (0, this.text.length - 1);
                    if (text.length > 0) {
                        text = text.substr (0, text.length - 1);
                    }
                    this.text = text + '|';
                } else if (ev.keyCode == 27) {
                    this.triggerEx (new playground.cwPGCommandEvent({ command: 'cancelEdit' }));
                }
            }
        });
        this.on(playground.cwPGGetObjectPropertyEvent.type, (ev: playground.cwPGGetObjectPropertyEvent) => {
            const object = this.object as core.cwSceneObject;
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
    protected _createEntity (options?:any): core.cwSceneObject {
        return new cwPGLabel (options);
    }
}