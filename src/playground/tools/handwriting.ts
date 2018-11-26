import * as lib from '../../lib';
import * as commands from '../commands';
import * as playground from '../playground';

export class cwPGHandWritingTool extends playground.cwPGTool {
    public static readonly toolname: string = 'HandWriting';
    private static readonly NONE: number = 0;
    private static readonly DRAWING: number = 1;
    private static readonly ERASING: number = 2;
    private _mode: number;
    private _action: boolean;
    private _overlayId: number;
    private _cp: lib.IPoint2d[];
    private _lastMoveTime: number;
    private _params: any;
    public constructor(pg: playground.cwPlayground) {
        super(cwPGHandWritingTool.toolname, pg);
        const buffer = document.createElement ('canvas');
        buffer.width = this._pg.view.canvas.width;
        buffer.height = this._pg.view.canvas.height;
        buffer.style.backgroundColor = 'rgba(0,0,0,0)';
        this._mode = cwPGHandWritingTool.NONE;
        this._action = false;
        this._overlayId = pg.view.canvas.createOverlay ();
        this._cp = [];
        this._lastMoveTime = 0;
        this._params = {
            penColor: '#000',
            penWidth: 2
        };
        this.on(playground.cwPGGetPropertyEvent.type, (ev: playground.cwPGGetPropertyEvent) => {
            if (ev.name in this._params) {
                ev.value = this._params[ev.name];
            }
        });
        this.on(playground.cwPGSetPropertyEvent.type, (ev: playground.cwPGSetPropertyEvent) => {
            if (ev.name in this._params) {
                this._params[ev.name] = ev.value;
            }
        });
        this.on(playground.cwPGGetPropertyListEvent.type, (ev: playground.cwPGGetPropertyListEvent) => {
            ev.properties = ev.properties || {};
            ev.properties[this.name] = ev.properties[this.name] || { desc: '画笔工具', properties: []};
            ev.properties[this.name].properties.push ({
                name: 'penColor',
                desc: '画笔颜色',
                readonly: false,
                type: 'color',
                value: this._params.penColor
            });
            ev.properties[this.name].properties.push ({
                name: 'penWidth',
                desc: '画笔粗细',
                readonly: false,
                type: 'number',
                value: this._params.penWidth
            });
        });
    }
    public activate(options: object) {
        super.activate (options);
        this.on (lib.cwMouseDownEvent.type, (ev: lib.cwMouseDownEvent) => {
            if (this._mode === cwPGHandWritingTool.DRAWING) {
                const context = this._pg.view.canvas.getOverlayContext(this._overlayId);
                context.lineWidth = this._params.penWidth;
                context.strokeStyle = this._params.penColor;
                context.beginPath ();
                context.moveTo (ev.x + 0.5, ev.y + 0.5);
                this._cp.length = 0;
                this._action = true;
            } else if (this._mode === cwPGHandWritingTool.ERASING) {
                const context = this._pg.view.canvas.getOverlayContext(this._overlayId);
                context.clearRect (ev.x - 20, ev.y - 20, 40, 40);
                this._action = true;
            }
        });
        this.on (lib.cwMouseMoveEvent.type, (ev: lib.cwMouseMoveEvent) => {
            if (this._action) {
                if (this._mode === cwPGHandWritingTool.DRAWING) {
                    if (this._cp.length == 2) {
                        const context = this._pg.view.canvas.getOverlayContext(this._overlayId);
                        context.bezierCurveTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5, this._cp[1].x + 0.5, this._cp[1].y + 0.5, ev.x + 0.5, ev.y + 0.5);
                        context.stroke ();
                        this._cp.length = 0;
                    } else {
                        this._cp.push ({x: ev.x, y: ev.y});
                        this._lastMoveTime = Date.now();
                    }
                } else if (this._mode === cwPGHandWritingTool.ERASING) {
                    const context = this._pg.view.canvas.getOverlayContext(this._overlayId);
                    context.clearRect (ev.x - 20, ev.y - 20, 40, 40);
                }
            }
        });
        this.on (lib.cwFrameEvent.type, (ev: lib.cwFrameEvent) => {
            if (this._action && this._mode === cwPGHandWritingTool.DRAWING && this._cp.length > 0) {
                const t = Date.now();
                if (t > this._lastMoveTime + 50) {
                    const context = this._pg.view.canvas.getOverlayContext(this._overlayId);
                    if (this._cp.length === 1) {
                        context.lineTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5);
                    } else if (this._cp.length) {
                        context.quadraticCurveTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5, this._cp[1].x + 0.5, this._cp[1].y + 0.5);
                    }
                    context.stroke ();
                    this._cp.length = 0;
                }
            }
        });
        this.on (lib.cwMouseUpEvent.type, (ev: lib.cwMouseUpEvent) => {
            if (this._action) {
                if (this._mode === cwPGHandWritingTool.DRAWING && this._cp.length > 0) {
                    const context = this._pg.view.canvas.getOverlayContext(this._overlayId);
                    if (this._cp.length === 1) {
                        context.lineTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5);
                    } else if (this._cp.length) {
                        context.quadraticCurveTo (this._cp[0].x + 0.5, this._cp[0].y + 0.5, this._cp[1].x + 0.5, this._cp[1].y + 0.5);
                    }
                    context.stroke ();
                    this._cp.length = 0;
                }
                this._action = false;
            }
        });
    }
    public deactivate() {
        this.off (lib.cwMouseDownEvent.type);
        this.off (lib.cwMouseMoveEvent.type);
        this.off (lib.cwMouseUpEvent.type);
        super.deactivate ();
    }
    public activateObject(object: lib.cwSceneObject) {
        this.deactivateObject (object);
    }
    public deactivateObject(object: lib.cwSceneObject) {
    }
    public executeCommand(cmd: commands.IPGCommand) {
        if (cmd.command === 'HandWritingMode') {
            if (cmd.mode === 'draw') {
                this._mode = cwPGHandWritingTool.DRAWING;
            } else if (cmd.mode === 'erase') {
                this._mode = cwPGHandWritingTool.ERASING;
            }
        }
    }
}