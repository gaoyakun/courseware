import * as lib from '../../lib';
import * as playground from '../playground';

export class cwPGFreeDraw extends lib.cwSceneObject {
    private _lineWidth: number;
    private _color: string;
    private _curveMode: number;
    private _eraseSize: number;
    private _mode: string;
    private _cp: lib.IPoint2d[];
    private _lastMoveTime: number;
    private _action: boolean;
    private _canvas: HTMLCanvasElement;
    private _boundingShape: lib.cwBoundingBox;

    private finishDraw () {
        if (this._mode === 'draw' && this._cp.length > 0) {
            const context = this.canvas.getContext('2d');
            if (this._cp.length === 1) {
                context.lineTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5);
            } else if (this._cp.length) {
                context.quadraticCurveTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5, this._cp[1].x + 0.5, this._cp[1].y + 0.5);
            }
            context.stroke ();
            this._cp.length = 0;
        }
    }
    constructor(parent: lib.cwSceneObject, params:any = null) {
        super(parent);
        this._canvas = null;
        this._boundingShape = null;
        this._cp = [];
        this._lastMoveTime = 0;
        this._action = false;
        const opt = params||{}
        this._lineWidth = Number(opt.lineWidth || 1);
        this._color = opt.color || '#000000';
        this._mode = opt.mode || 'draw';
        this._eraseSize = opt.eraseSize || 20;
        this._curveMode = opt.curveMode || 0;
        this.on(lib.cwCanvasResizeEvent.type, (evt: lib.cwCanvasResizeEvent) => {
            if (evt.view === this.view && this._canvas) {
                this._canvas.width = evt.view.canvas.width;
                this._canvas.height = evt.view.canvas.height;
                if (this._boundingShape) {
                    this._boundingShape.rect = {x:0, y:0, w:this._canvas.width, h:this._canvas.height};
                }
            }
        })
        this.on(lib.cwGetBoundingShapeEvent.type, (evt: lib.cwGetBoundingShapeEvent) => {
            if (this._boundingShape === null) {
                this._boundingShape = new lib.cwBoundingBox ({x:0, y:0, w:this.canvas.width, h:this.canvas.height});
            }
            evt.shape = this._boundingShape;
        });
        this.on(lib.cwHitTestEvent.type, (evt: lib.cwHitTestEvent) => {
            const canvas = this.canvas;
            if (evt.x >= 0 && evt.x < canvas.width && evt.y >= 0 && evt.y < canvas.height) {
                const data = canvas.getContext('2d').getImageData (evt.x, evt.y, 1, 1);
                if (data && data.data[3] > 0) {
                    evt.result = true;
                }
            }
            evt.eat ();
        });
        this.on(lib.cwDrawEvent.type, (evt: lib.cwDrawEvent) => {
            const w = this.canvas.width;
            const h = this.canvas.height;
            evt.canvas.context.drawImage (this.canvas, -Math.round(w * this.anchorPoint.x)-0.5, -Math.round(h * this.anchorPoint.y)-0.5, w, h);
        });
        this.on (lib.cwMouseDownEvent.type, (ev: lib.cwMouseDownEvent) => {
            const pt = lib.cwTransform2d.invert(this.worldTransform).transformPoint({x:ev.x, y:ev.y});
            if (this._mode === 'draw') {
                const context = this.canvas.getContext('2d');
                context.lineWidth = this._lineWidth;
                context.strokeStyle = this._color;
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.beginPath ();
                context.moveTo (pt.x + 0.5, pt.y + 0.5);
                this._cp.length = 0;
                this._action = true;
            } else if (this._mode === 'erase') {
                const context = this.canvas.getContext('2d');
                context.clearRect (pt.x - this._eraseSize / 2, pt.y - this._eraseSize / 2, this._eraseSize, this._eraseSize);
                this._action = true;
            }
        });
        this.on (lib.cwMouseMoveEvent.type, (ev: lib.cwMouseMoveEvent) => {
            if (this._action) {
                const pt = lib.cwTransform2d.invert(this.worldTransform).transformPoint({x:ev.x, y:ev.y});
                if (this._mode === 'draw') {
                    const context = this.canvas.getContext('2d');
                    if (this._curveMode === 0) {
                        context.lineTo (pt.x + 0.5, pt.y + 0.5);
                        context.stroke ();
                    } else if (this._curveMode === 1) {
                        if (this._cp.length === 1) {
                            context.quadraticCurveTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5, pt.x + 0.5, pt.y + 0.5);
                            context.stroke ();
                            this._cp.length = 0;
                        } else {
                            this._cp.push ({x: pt.x, y: pt.y});
                            this._lastMoveTime = Date.now();
                        }
                    } else if (this._curveMode === 2) {
                        if (this._cp.length === 2) {
                            context.bezierCurveTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5, this._cp[1].x + 0.5, this._cp[1].y + 0.5, pt.x + 0.5, pt.y + 0.5);
                            context.stroke ();
                            this._cp.length = 0;
                        } else {
                            this._cp.push ({x: pt.x, y: pt.y});
                            this._lastMoveTime = Date.now();
                        }
                    }
                } else if (this._mode === 'erase') {
                    const context = this.canvas.getContext('2d');
                    context.clearRect (pt.x - this._eraseSize / 2, pt.y - this._eraseSize / 2, this._eraseSize, this._eraseSize);
                }
            }
        });
        this.on (lib.cwFrameEvent.type, (ev: lib.cwFrameEvent) => {            
            if (this._mode === 'draw' && this._action) {
                const t = Date.now();
                if (t > this._lastMoveTime + 250) {
                    this.finishDraw ();
                }
            }
        });
        this.on (lib.cwMouseUpEvent.type, (ev: lib.cwMouseUpEvent) => {
            if (this._mode === 'draw' && this._action) {
                this.finishDraw ();
                this._action = false;
            }
        });
        this.on(playground.cwPGGetPropertyEvent.type, (ev: playground.cwPGGetPropertyEvent) => {
            switch (ev.name) {
                case 'lineWidth': {
                    ev.value = this._lineWidth;
                    break;
                }
                case 'color': {
                    ev.value = this._color;
                    break;
                }
                case 'curveMode': {
                    ev.value = this._curveMode;
                    break;
                }
                case 'eraseSize': {
                    ev.value = this._eraseSize;
                    break;
                }
            }
        });
        this.on(playground.cwPGSetPropertyEvent.type, (ev: playground.cwPGSetPropertyEvent) => {
            switch (ev.name) {
                case 'lineWidth': {
                    this._lineWidth = Number(ev.value);
                    break;
                }
                case 'color': {
                    this._color = String(ev.value);
                    break;
                }
                case 'curveMode': {
                    this._curveMode = Number(ev.value);
                    break;
                }
                case 'eraseSize': {
                    this._eraseSize = Number(ev.value);
                    break;
                }
            }
        });
        this.on(playground.cwPGGetPropertyListEvent.type, (ev: playground.cwPGGetPropertyListEvent) => {
            ev.properties = ev.properties || {};
            ev.properties[this.entityType] = ev.properties[this.entityType] || { desc: this.entityType, properties: [] };
            ev.properties[this.entityType].properties.push ({
                name: 'lineWidth',
                desc: '画笔宽度',
                readonly: false,
                type: 'number',
                value: this._lineWidth
            });
            ev.properties[this.entityType].properties.push ({
                name: 'color',
                desc: '画笔颜色',
                readonly: false,
                type: 'color',
                value: this._color
            });
            ev.properties[this.entityType].properties.push ({
                name: 'curveMode',
                desc: '平滑模式',
                readonly: false,
                type: 'number',
                value: this._curveMode,
                enum: [{
                    value: 0,
                    desc: '无'
                }, {
                    value: 1,
                    desc: '二次样条'
                }, {
                    value: 2,
                    desc: '三次样条'
                }]
            });
            ev.properties[this.entityType].properties.push ({
                name: 'eraseSize',
                desc: '橡皮宽度',
                readonly: false,
                type: 'number',
                value: this._eraseSize
            })
        });
    }
    get mode () {
        return this._mode;
    }
    set mode (value: string) {
        if (this._mode !== value) {
            if (this._mode === 'draw') {
                this.finishDraw ();
            }
            this._action = false;
            this._mode = value;
        }
    }
    get canvas () {
        if (this._canvas === null) {
            this._canvas = document.createElement('canvas');
            this._canvas.style.backgroundColor = '#00000000';
            this._canvas.width = this.view.canvas.width;
            this._canvas.height = this.view.canvas.height;
            if (this._boundingShape) {
                this._boundingShape = new lib.cwBoundingBox ({x:0, y:0, w:this._canvas.width, h:this._canvas.height});
            }
        }
        return this._canvas;
    }
}

export class cwPGFreeDrawFactory extends playground.cwPGFactory {
    protected _createEntity (options?:any): lib.cwSceneObject {
        return new cwPGFreeDraw (null, options);
    }
    public getCreationProperties (): playground.IProperty[] {
        return [{
            name: 'lineWidth',
            desc: '画笔宽度',
            readonly: false,
            type: 'number',
            value: 3
        }, {
            name: 'color',
            desc: '颜色',
            readonly: false,
            type: 'color',
            value: '#000000'
        }, {
            name: 'curveMode',
            desc: '平滑模式',
            readonly: false,
            type: 'number',
            value: 0,
            enum: [{
                value: 0,
                desc: '无'
            }, {
                value: 1,
                desc: '二次样条'
            }, {
                value: 2,
                desc: '三次样条'
            }]
        }, {
            name: 'eraseSize',
            desc: '橡皮宽度',
            readonly: false,
            type: 'number',
            value: 20
        }];
    }
}