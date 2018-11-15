import * as core from '../../lib/core';
import * as events from '../../lib/events';
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
    private _background: string|null;
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
        this.on(events.cwHitTestEvent.type, (evt: events.cwHitTestEvent) => {
            let width = this._width;
            let height = this._height || this._fontSize;
            if (width == 0) {
                if (this._measure === null) {
                    this._measure = this.view.canvas.context.measureText (this._text);
                }
                width = this._measure.width;
                if (width < this._minwidth) {
                    width = this._minwidth;
                }
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
        this.on(events.cwKeyPressEvent.type, (ev: events.cwKeyPressEvent) => {
            if (this._editing) {
                let text = this._text.substr (0, this.text.length - 1);
                text += ev.key;
                this.text = text + '|';
            }
        });
        this.on(events.cwKeyDownEvent.type, (ev: events.cwKeyDownEvent) => {
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