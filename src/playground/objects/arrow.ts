import * as lib from '../../lib';
import * as playground from '../playground';

export class cwPGArrow extends lib.cwSceneObject {
    private _lineWidth: number;
    private _arrowLineWidth: number;
    private _style: string;
    private _color: string;
    private _objectFrom: string;
    private _positionFrom: lib.IPoint2d;
    private _objectTo: string;
    private _positionTo: lib.IPoint2d;
    private _boundingShape: lib.cwBoundingShape;

    private getSegment (): lib.ISegment2d {
        const result: lib.ISegment2d = { start: { x:this._positionFrom.x, y:this._positionFrom.y }, end: { x:this._positionTo.x, y:this._positionTo.y} };
        let objectFrom: lib.cwSceneObject = null;
        let transformFrom: lib.cwTransform2d = null;
        let objectTo: lib.cwSceneObject = null;
        let transformTo: lib.cwTransform2d = null;
        if (this._objectFrom) {
            const ev = new playground.cwPGGetObjectEvent (this._objectFrom);
            lib.cwApp.triggerEvent (null, ev);
            objectFrom = ev.object;
            if (objectFrom) {
                transformFrom = objectFrom.worldTransform;
                result.start.x = transformFrom.e;
                result.start.y = transformFrom.f;
            }
        }
        if (this._objectTo) {
            const ev = new playground.cwPGGetObjectEvent (this._objectTo);
            lib.cwApp.triggerEvent (null, ev);
            objectTo = ev.object;
            if (objectTo) {
                transformTo = objectTo.worldTransform;
                result.end.x = transformTo.e;
                result.end.y = transformTo.f;
            }
        }
        if (objectFrom) {
            const ptList = lib.cwIntersectionTestShapeSegment (objectFrom.boundingShape.getTransformedShape(transformFrom), result);
            if (ptList && ptList.length > 0) {
                result.start = ptList[0];
            }
        }
        if (objectTo) {
            const ptList = lib.cwIntersectionTestShapeSegment (objectTo.boundingShape.getTransformedShape(transformTo), result);
            if (ptList && ptList.length > 0) {
                result .end = ptList[0];
            }
        }
        return result;
    }

    constructor(params:any = null) {
        super();
        const opt = params||{}
        this._lineWidth = Number(opt.lineWidth || 1);
        this._arrowLineWidth = Number(opt.arrowLineWidth || 1);
        this._style = opt.style || 'single';
        this._color = opt.color || '#000000';
        this._objectFrom = opt.objectFrom || null;
        this._positionFrom = { x:opt.positionFromX===undefined?0:Number(opt.positionFromX), y:opt.positionFromY===undefined?0:Number(opt.positionFromY) };
        this._objectTo = opt.objectTo || null;
        this._positionTo = { x:opt.positionToX===undefined?0:Number(opt.positionToX), y:opt.positionToY===undefined?0:Number(opt.positionToY) };
        this._boundingShape = null;
        this.on(lib.cwGetBoundingShapeEvent.type, (evt: lib.cwGetBoundingShapeEvent) => {
            const seg = this.getSegment ();
            if (!this._boundingShape && this._measure) {
                let width = Math.max(this._measure.width, this._minwidth);
                let height = this._fontSize;
                let boundingWidth = Math.max(width, this._width);
                let boundingHeight = Math.max(height, this._height);
                this._boundingShape = new lib.cwBoundingBox({ x:-boundingWidth * this.anchorPoint.x, y:-boundingHeight * this.anchorPoint.y, w:boundingWidth, h:boundingHeight });
            }
            evt.shape = this._boundingShape;
        });
        this.on(lib.cwDrawEvent.type, (evt: lib.cwDrawEvent) => {
            if (this._font === '') {
                this._font = `${this._fontStyle} ${this._fontVariant} ${this._fontWeight} ${this._fontSize}px ${this._fontFamily}`;
            }
            evt.canvas.context.textAlign = 'left';
            evt.canvas.context.textBaseline = 'hanging';
            evt.canvas.context.font = this._font;
            if (this._measure === null) {
                this._measure = evt.canvas.context.measureText (this._text);
            }
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
                desc: '文字大小',
                readonly: false,
                type: 'number',
                value: this.fontSize
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
    protected _createEntity (options?:any): lib.cwSceneObject {
        return new cwPGLabel (options);
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
            desc: '文字大小',
            readonly: false,
            type: 'number',
            value: 16
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