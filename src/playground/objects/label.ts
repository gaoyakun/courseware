import * as lib from 'libcatk';
import * as playground from '../playground';

export class cwPGLabel extends lib.SceneObject {
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
    private _bkColor: string;
    private _bkShape: string;
    private _boundingShape: lib.BoundingShape;

    private parseText (value: string): string {
        const regexp = /\{\{[^\{\}]*\}\}/g;
        const k = value.split (regexp);
        if (k.length === 1) {
            return value;
        }
        const pos = 1;
        while (true) {
            const s = regexp.exec (value);
            if (s === null) {
                break;
            }
            const val = String((new Function('return ' + s[0].slice (2, s[0].length-2)))());
            k.splice (pos, 0, val);
        }
        return k.join ('');
    }
    private update () {
        if (this._font === '') {
            this._font = `${this._fontStyle} ${this._fontVariant} ${this._fontWeight} ${this._fontSize}px ${this._fontFamily}`;
            this._boundingShape = null;
        }
        if (this._measure === null) {
            this.view.canvas.context.textAlign = 'left';
            this.view.canvas.context.textBaseline = 'hanging';
            this.view.canvas.context.font = this._font;
            this._measure = this.view.canvas.context.measureText (this._text);
            this._boundingShape = null;
        }
        if (!this._boundingShape) {
            let width = Math.max(this._measure.width, this._minwidth);
            let height = this._fontSize;
            let boundingWidth = Math.max(width, this._width);
            let boundingHeight = Math.max(height, this._height);
            this._boundingShape = new lib.BoundingBox({ x:-boundingWidth * this.anchorPoint.x, y:-boundingHeight * this.anchorPoint.y, w:boundingWidth, h:boundingHeight });
        }
    }
    constructor(parent: lib.SceneObject, params:any = null) {
        super (parent);
        const opt = params||{}
        this._width = Number(opt.width || 0);
        this._height = Number(opt.height || 0);
        this._fontSize = Number(opt.fontSize || 16);
        this._fontStyle = opt.fontStyle || 'normal';
        this._fontVariant = opt.fontVariant || 'normal';
        this._fontWeight = opt.fontWeight || 'normal';
        this._fontFamily = opt.fontFamily || 'PingFang SC,Hiragino Sans GB,Microsoft YaHei UI,Microsoft YaHei,Source Han Sans CN,sans-serif';
        this._font = '';
        this._text = opt.text ? this.parseText(opt.text) : '';
        this._measure = null;
        this._minwidth = 10;
        this._textcolor = opt.textColor || '#000';
        this._bkColor = opt.bkColor || '#f00';
        this._bkShape = opt.bkShape || 'rect';
        this._boundingShape = null;
        this.anchorPoint = { x:0.5, y:0.5 };
        this.on(lib.EvtUpdate.type, (evt: lib.EvtUpdate) => {
            this.update ();
        });
        this.on(lib.EvtGetBoundingShape.type, (evt: lib.EvtGetBoundingShape) => {
            evt.shape = this._boundingShape;
        });
        this.on(lib.EvtDraw.type, (evt: lib.EvtDraw) => {
            let width = this._measure.width;
            if (width < this._minwidth) {
                width = this._minwidth;
            }
            let height = this._fontSize;
            let boundingWidth = Math.max(this._width, width);
            let boundingHeight = Math.max(this._height, height);
            switch (this._bkShape) {
                case 'rect':
                    evt.canvas.context.fillStyle = this._bkColor;
                    evt.canvas.context.fillRect (-boundingWidth * this.anchorPoint.x, -boundingHeight * this.anchorPoint.y, boundingWidth, boundingHeight);
                    break;
                case 'ellipse':
                    evt.canvas.context.fillStyle = this._bkColor;
                    evt.canvas.context.beginPath ();
                    evt.canvas.context.ellipse (-boundingWidth * this.anchorPoint.x + boundingWidth/2, -boundingHeight * this.anchorPoint.y + boundingHeight/2, boundingWidth/2, boundingHeight/2, 0, 0, Math.PI*2);
                    evt.canvas.context.closePath ();
                    evt.canvas.context.fill ();
                    break;
            }
            let x = (boundingWidth - width)/2 - boundingWidth * this.anchorPoint.x;
            let y = (boundingHeight - height)/2 - boundingHeight * this.anchorPoint.y;
            evt.canvas.context.fillStyle = this._textcolor;
            evt.canvas.context.font = this._font;
            evt.canvas.context.fillText(this._text, x, y, width);
    
        });
        this.on(playground.cwPGGetPropertyEvent.type, (ev: playground.cwPGGetPropertyEvent) => {
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
                case 'fontWeight': {
                    ev.value = this.fontWeight;
                    break;
                }
                case 'fontStyle': {
                    ev.value = this.fontStyle;
                    break;
                }
                case 'width': {
                    ev.value = this._width;
                    break;
                }
                case 'height': {
                    ev.value = this._height;
                    break;
                }
                case 'bkColor': {
                    ev.value = this.bkColor;
                    break;
                }
                case 'bkShape': {
                    ev.value = this.bkShape;
                    break;
                }
            }
        });
        this.on(playground.cwPGSetPropertyEvent.type, (ev: playground.cwPGSetPropertyEvent) => {
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
                case 'fontWeight': {
                    this.fontWeight = String(ev.value);
                    break;
                }
                case 'fontStyle': {
                    this.fontStyle = String(ev.value);
                    break;
                }
                case 'width': {
                    this.width = Number(ev.value);
                    break;
                }
                case 'height': {
                    this.height = Number(ev.value);
                    break;
                }
                case 'bkColor': {
                    this.bkColor = String(ev.value);
                    break;
                }
                case 'bkShape': {
                    this.bkShape = String(ev.value);
                    break;
                }
            }
        });
        this.on(playground.cwPGGetPropertyListEvent.type, (ev: playground.cwPGGetPropertyListEvent) => {
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
                desc: '字体大小',
                readonly: false,
                type: 'number',
                value: this.fontSize
            });
            ev.properties[this.entityType].properties.push ({
                name: 'fontWeight',
                desc: '字体粗细',
                readonly: false,
                type: 'string',
                value: this._fontWeight,
                enum: [{
                    value: 'normal',
                    desc: '正常'
                }, {
                    value: 'bold',
                    desc: '粗体'
                }, {
                    value: 'bolder',
                    desc: '加粗'
                }, {
                    value: 'lighter',
                    desc: '纤细'
                }]
            });
            ev.properties[this.entityType].properties.push ({
                name: 'fontStyle',
                desc: '字体样式',
                readonly: false,
                type: 'string',
                value: this._fontStyle,
                enum: [{
                    value: 'normal',
                    desc: '正常'
                }, {
                    value: 'italic',
                    desc: '斜体'
                }]
            });
            ev.properties[this.entityType].properties.push ({
                name: 'width',
                desc: '宽度',
                readonly: false,
                type: 'number',
                value: this.width
            });
            ev.properties[this.entityType].properties.push ({
                name: 'height',
                desc: '高度',
                readonly: false,
                type: 'number',
                value: this.height
            });
            ev.properties[this.entityType].properties.push ({
                name: 'bkColor',
                desc: '背景颜色',
                readonly: false,
                type: 'color',
                value: this.bkColor
            });
            ev.properties[this.entityType].properties.push ({
                name: 'bkShape',
                desc: '背景样式',
                readonly: false,
                type: 'string',
                value: this.bkShape,
                enum: [{
                    value: 'none',
                    desc: '无'
                }, {
                    value: 'rect',
                    desc: '矩形'
                }, {
                    value: 'ellipse',
                    desc: '圆形'
                }]
            });
        });
    }
    get text () {
        return this._text;
    }
    set text (value: string) {
        const newText = this.parseText (value);
        if (newText !== this._text) {
            this._text = newText;
            this._measure = null;
            this._boundingShape = null;
        }
    }
    setAnchorPoint (pt: {x:number, y:number}) {
        super.setAnchorPoint (pt);
        this._boundingShape = null;
    }
    get fontSize () {
        return this._fontSize;
    }
    set fontSize (value: number) {
        if (value !== this._fontSize) {
            this._fontSize = value;
            this._font = '';
            this._measure = null;
            this._boundingShape = null;
        }
    }
    get fontWeight () {
        return this._fontWeight;
    }
    set fontWeight (value: string) {
        if (value !== this._fontWeight) {
            this._fontWeight = value;
            this._font = '';
            this._measure = null;
            this._boundingShape = null;
        }
    }
    get fontStyle () {
        return this._fontStyle;
    }
    set fontStyle (value: string) {
        if (value !== this._fontStyle) {
            this._fontStyle = value;
            this._font = '';
            this._measure = null;
            this._boundingShape = null;
        }
    }
    get width () {
        return this._width;    
    }
    set width (value: number) {
        if (value !== this._width) {
            this._width = value;
            this._boundingShape = null;
        }
    }
    get height () {
        return this._height;
    }
    set height (value: number) {
        if (value !== this._height) {
            this._height = value;
            this._boundingShape = null;
        }
    }
    get bkColor () {
        return this._bkColor;
    }
    set bkColor (value: string) {
        this._bkColor = value;
    }
    get bkShape () {
        return this._bkShape;
    }
    set bkShape (value: string) {
        this._bkShape = value;
    }
}

export class cwPGLabelFactory extends playground.cwPGFactory {
    protected _createEntity (options?:any): lib.SceneObject {
        return new cwPGLabel (null, options);
    }
    public getCreationProperties (): playground.IProperty[] {
        return [{
            name: 'text',
            desc: '文字内容',
            readonly: false,
            type: 'string',
            value: '标签'
        }, {
            name: 'textColor',
            desc: '文字颜色',
            readonly: false,
            type: 'color',
            value: '#000'
        }, {
            name: 'fontSize',
            desc: '字体大小',
            readonly: false,
            type: 'number',
            value: 16
        }, {
            name: 'fontWeight',
            desc: '字体粗细',
            readonly: false,
            type: 'string',
            value: 'normal',
            enum: [{
                value: 'normal',
                desc: '正常'
            }, {
                value: 'bold',
                desc: '粗体'
            }, {
                value: 'bolder',
                desc: '加粗'
            }, {
                value: 'lighter',
                desc: '纤细'
            }]
        }, {
            name: 'fontStyle',
            desc: '字体样式',
            readonly: false,
            type: 'string',
            value: 'normal',
            enum: [{
                value: 'normal',
                desc: '正常'
            }, {
                value: 'italic',
                desc: '斜体'
            }]
        }, {
            name: 'width',
            desc: '宽度',
            readonly: false,
            type: 'number',
            value: 0
        }, {
            name: 'height',
            desc: '高度',
            readonly: false,
            type: 'number',
            value: 0
        }, {
            name: 'bkColor',
            desc: '背景颜色',
            readonly: false,
            type: 'color',
            value: '#0000ff'
        }, {
            name: 'bkShape',
            desc: '背景样式',
            readonly: false,
            type: 'string',
            value: 'none',
            enum: [{
                value: 'none',
                desc: '无'
            }, {
                value: 'rect',
                desc: '矩形'
            }, {
                value: 'ellipse',
                desc: '圆形'
            }]
        }];
    }
}