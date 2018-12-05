import * as lib from '../../lib';
import * as commands from '../commands';
import * as playground from '../playground';

export class cwPGConnectTool extends playground.cwPGTool {
    public static readonly toolname: string = 'Connect';
    private _createParams: any;
    private _moving: boolean;
    public constructor(pg: playground.cwPlayground) {
        super(cwPGConnectTool.toolname, pg);
        this._createParams = {
            lineWidth: 3,
            arrowLen: 15,
            style: 'single',
            color: '#000000',
            objectFrom: null,
            positionFromX: 0,
            positionFromY: 0,
            objectTo: null,
            positionToX: 0,
            positionToY: 0
        };
        this._moving = false;
        this.on(playground.cwPGGetPropertyEvent.type, (ev: playground.cwPGGetPropertyEvent) => {
            if (ev.name in this._createParams) {
                ev.value = this._createParams[ev.name];
            }
        });
        this.on(playground.cwPGSetPropertyEvent.type, (ev: playground.cwPGSetPropertyEvent) => {
            if (ev.name in this._createParams) {
                this._createParams[ev.name] = ev.value;
            }
        });
        this.on(playground.cwPGGetPropertyListEvent.type, (ev: playground.cwPGGetPropertyListEvent) => {
            ev.properties = ev.properties || {};
            ev.properties[this.name] = ev.properties[this.name] || { desc: '画笔工具', properties: []};
            ev.properties[this.name].properties.push ({
                name: 'lineWidth',
                desc: '线宽',
                readonly: false,
                type: 'number',
                value: this._createParams.lineWidth
            });
            ev.properties[this.name].properties.push ({
                name: 'arrowLen',
                desc: '箭头长度',
                readonly: false,
                type: 'number',
                value: this._createParams.arrowLen
            });
            ev.properties[this.name].properties.push ({
                name: 'style',
                desc: '箭头样式',
                readonly: false,
                type: 'string',
                value: this._createParams.style,
                enum: [{
                    value: 'none',
                    desc: '无'
                }, {
                    value: 'single',
                    desc: '单向箭头'
                }, {
                    value: 'double',
                    desc: '双向箭头'
                }]
            });
            ev.properties[this.name].properties.push ({
                name: 'color',
                desc: '颜色',
                readonly: false,
                type: 'color',
                value: this._createParams.color
            });
        });
    }
    public activate(options?: any) {
        super.activate (options);
        this._moving = false;
        this.on (lib.cwMouseDownEvent.type, (ev: lib.cwMouseDownEvent) => {
            this._moving = true;
            this._createParams.objectFrom = null;
            this._createParams.objectTo = null;
            this._createParams.positionToX = ev.x;
            this._createParams.positionToY = ev.y;
            const hitObjects = this._pg.view.hitObjects;
            if (hitObjects.length > 1 && hitObjects[0].entityType !== 'Arrow') {
                this._createParams.objectFrom = hitObjects[0];
            } else {
                this._createParams.positionFromX = ev.x;
                this._createParams.positionFromY = ev.y;
            }
        });
        this.on (lib.cwMouseMoveEvent.type, (ev: lib.cwMouseMoveEvent) => {
            if (this._moving) {
                const hitObjects = this._pg.view.hitObjects;
                if (hitObjects.length > 1 && hitObjects[0] !== this._createParams.objectFrom && hitObjects[0].entityType !== 'Arrow') {
                    this._createParams.objectTo = hitObjects[0];
                } else {
                    this._createParams.objectTo = null;
                    this._createParams.positionToX = ev.x;
                    this._createParams.positionToY = ev.y;
                }
            }
        });
        this.on (lib.cwMouseUpEvent.type, (ev: lib.cwMouseUpEvent) => {
            this._moving = false;
            let x = 0, y = 0;
            if (this._createParams.objectFrom && this._createParams.objectTo) {
                this._createParams.objectFrom = this._createParams.objectFrom.entityName;
                this._createParams.objectTo = this._createParams.objectTo.entityName;
            } else if (this._createParams.objectFrom) {
                this._createParams.objectFrom = this._createParams.objectFrom.entityName;
                x = this._createParams.positionToX;
                y = this._createParams.positionToY;
                this._createParams.positionToX = 0;
                this._createParams.positionToY = 0;
            } else if (this._createParams.objectTo) {
                this._createParams.objectTo = this._createParams.objectTo.entityName;
                x = this._createParams.positionFromX;
                y = this._createParams.positionFromY;
                this._createParams.positionFromX = 0;
                this._createParams.positionFromY = 0;
            } else {
                x = this._createParams.positionFromX;
                y = this._createParams.positionFromY;
                this._createParams.positionToX -= x;
                this._createParams.positionToY -= y;
                this._createParams.positionFromX = 0;
                this._createParams.positionFromY = 0;
            }
            const cmd: commands.IPGCommand  = {
                command: 'CreateObject',
                type: 'Arrow',
                name: null,
                x: x,
                y: y,
                params: this._createParams
            };
            this._pg.executeCommand (cmd);
        });
        this.on (lib.cwDrawEvent.type, (ev: lib.cwDrawEvent) => {
            if (this._moving) {
                ev.canvas.context.save ();
                ev.canvas.context.setTransform(1, 0, 0, 1, 0.5, 0.5);
                ev.canvas.context.strokeStyle = '#000';
                ev.canvas.context.lineWidth = 1;
                ev.canvas.context.setLineDash ([6,3]);
                ev.canvas.context.beginPath ();
                if (this._createParams.objectFrom) {
                    const t = (this._createParams.objectFrom as lib.cwSceneObject).worldTransform;
                    ev.canvas.context.moveTo (t.e, t.f);
                } else {
                    ev.canvas.context.moveTo (this._createParams.positionFromX, this._createParams.positionFromY);
                }
                if (this._createParams.objectTo) {
                    const t = (this._createParams.objectTo as lib.cwSceneObject).worldTransform;
                    ev.canvas.context.lineTo (t.e, t.f);
                } else {
                    ev.canvas.context.lineTo (this._createParams.positionToX, this._createParams.positionToY);
                }
                ev.canvas.context.stroke ();
                ev.canvas.context.restore ();
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
        super.activateObject (object);
    }
    public deactivateObject(object: lib.cwSceneObject) {
        super.deactivateObject (object);
    }
    public executeCommand(cmd: commands.IPGCommand) {
    }
}