import * as lib from 'libcatk';
import * as commands from '../commands';
import * as playground from '../playground';

export class cwPGSelectEvent extends lib.BaseEvent {
    static readonly type: string = '@PGSelect';
    public readonly selectIndex: number;
    constructor(selectIndex: number) {
        super(cwPGSelectEvent.type);
        this.selectIndex = selectIndex;
    }
}

export class cwPGDeselectEvent extends lib.BaseEvent {
    static readonly type: string = '@PGDeselect';
    constructor() {
        super(cwPGDeselectEvent.type);
    }
}

export class cwPGObjectSelectedEvent extends lib.BaseEvent {
    static readonly type: string = '@PGObjectSelected';
    readonly objects: lib.SceneObject[];
    constructor (objects: lib.SceneObject[]) {
        super (cwPGObjectSelectedEvent.type);
        this.objects = objects;
    }
}

export class cwPGObjectMovedEvent extends lib.BaseEvent {
    static readonly type: string = '@PGObjectMoved';
    readonly objects: lib.SceneObject[];
    constructor (objects: lib.SceneObject[]) {
        super (cwPGObjectMovedEvent.type);
        this.objects = objects;
    }
}

export class cwPGObjectDeselectedEvent extends lib.BaseEvent {
    static readonly type: string = '@PGObjectDeselected';
    readonly object: lib.SceneObject;
    readonly objects: lib.SceneObject[];
    constructor (object: lib.SceneObject, objects: lib.SceneObject[]) {
        super (cwPGObjectDeselectedEvent.type);
        this.object = object;
        this.objects = objects;
    }
}
export class cwPGSelectComponent extends lib.Component {
    static readonly type = 'PGSelect';
    readonly tool: cwPGSelectTool;
    private _selected: boolean;
    constructor(tool: cwPGSelectTool) {
        super(cwPGSelectComponent.type);
        this.tool = tool;
        this._selected = false;
        this.on(lib.EvtDraw.type, (evt: lib.EvtDraw) => {
            if (this._selected) {
                const shape = (this.object as lib.SceneObject).boundingShape;
                if (shape) {
                    const bbox = shape.getBoundingbox ();
                    evt.canvas.context.strokeStyle = '#000';
                    evt.canvas.context.lineWidth = 1;
                    evt.canvas.context.strokeRect (bbox.x, bbox.y, bbox.w, bbox.h);
                }
            }
        });
        this.on(cwPGSelectEvent.type, (evt: cwPGSelectEvent) => {
            this._selected = true;
        });
        this.on(cwPGDeselectEvent.type, (evt: cwPGDeselectEvent) => {
            this._selected = false;
        });
    }
}

export class cwPGSelectTool extends playground.cwPGTool {
    public static readonly toolname: string = 'Select';
    private _selectedObjects: lib.SceneObject[];
    private _moving: boolean;
    private _rangeSelecting: boolean;
    private _mouseStartPosX: number;
    private _mouseStartPosY: number;
    private _mouseCurrentPosX: number;
    private _mouseCurrentPosY: number;
    public constructor(pg: playground.cwPlayground) {
        super(cwPGSelectTool.toolname, pg);
        this._selectedObjects = [];
        this._moving = false;
        this._rangeSelecting = false;
        this._mouseStartPosX = 0;
        this._mouseStartPosY = 0;
        this._mouseCurrentPosX = 0;
        this._mouseCurrentPosY = 0;
    }
    get selectedObjects () {
        return this._selectedObjects;
    }
    public activate(options?: any) {
        super.activate (options);
        this._selectedObjects.length = 0;
        this.on (lib.EvtKeyDown.type, (ev: lib.EvtKeyDown) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (lib.EvtKeyUp.type, (ev: lib.EvtKeyUp) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (lib.EvtKeyPress.type, (ev: lib.EvtKeyPress) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (lib.EvtMouseDown.type, (ev: lib.EvtMouseDown) => {
            this._mouseStartPosX = ev.x;
            this._mouseStartPosY = ev.y;
            const hitObjects = this._pg.view.hitObjects;
            if (hitObjects.length > 1) {
                this.selectObject (hitObjects[0], ev);
                this._moving = true;
                this._rangeSelecting = false;
            } else {
                this.deselectAll ();
                this._rangeSelecting = true;
                this._moving = false;
                this._mouseCurrentPosX = ev.x;
                this._mouseCurrentPosY = ev.y;
            }
        });
        this.on (lib.EvtMouseMove.type, (ev: lib.EvtMouseMove) => {
            if (this._moving) {
                const dx = ev.x - this._mouseStartPosX;
                const dy = ev.y - this._mouseStartPosY;
                this._mouseStartPosX = ev.x;
                this._mouseStartPosY = ev.y;
                this._selectedObjects.forEach ((obj: lib.SceneObject) => {
                    const t = obj.translation;
                    obj.translation = { x: t.x + dx, y: t.y + dy };
                });
            } else if (this._rangeSelecting) {
                this.rangeSelectR (this._pg.view.rootNode, this._mouseStartPosX, this._mouseStartPosY, ev.x-this._mouseStartPosX, ev.y-this._mouseStartPosY);
                this._mouseCurrentPosX = ev.x;
                this._mouseCurrentPosY = ev.y;
            }
        });
        this.on (lib.EvtMouseUp.type, (ev: lib.EvtMouseUp) => {
            if (this._moving && this._selectedObjects && this._selectedObjects.length > 0) {
                lib.App.triggerEvent (null, new cwPGObjectMovedEvent (this._selectedObjects));
            }
            this._moving = false;
            this._rangeSelecting = false;
        });
        this.on (lib.EvtDraw.type, (ev: lib.EvtDraw) => {
            if (this._rangeSelecting) {
                ev.canvas.context.save ();
                ev.canvas.context.setTransform(1, 0, 0, 1, 0.5, 0.5);
                ev.canvas.context.strokeStyle = '#000';
                ev.canvas.context.lineWidth = 1;
                ev.canvas.context.setLineDash ([6,3]);
                ev.canvas.context.beginPath ();
                ev.canvas.context.moveTo (this._mouseStartPosX, this._mouseStartPosY);
                ev.canvas.context.lineTo (this._mouseCurrentPosX, this._mouseStartPosY);
                ev.canvas.context.lineTo (this._mouseCurrentPosX, this._mouseCurrentPosY);
                ev.canvas.context.moveTo (this._mouseStartPosX, this._mouseStartPosY);
                ev.canvas.context.lineTo (this._mouseStartPosX, this._mouseCurrentPosY);
                ev.canvas.context.lineTo (this._mouseCurrentPosX, this._mouseCurrentPosY);
                ev.canvas.context.stroke ();
                ev.canvas.context.restore ();
            }
        });
    }
    private rangeSelectR (root:lib.SceneObject, x:number, y:number, w:number, h:number) {
        root.forEachChild (child => {
            if (w == 0 || h == 0) {
                this.deselectObject (child);
            } else {
                const shape = child.boundingShape;
                if (shape) {
                    const t = lib.Matrix2d.invert(child.worldTransform);
                    const rectObject = [
                        t.transformPoint({x:x, y:y}),
                        t.transformPoint({x:x ,y:y+h}),
                        t.transformPoint({x:x+w, y:y+h}),
                        t.transformPoint({x:x+w, y:y})
                    ];
                    if (lib.IntersectionTestShapeHull (shape, rectObject)) {
                        this.selectObject (child, null);
                    } else {
                        this.deselectObject (child);
                    }
                }
                this.rangeSelectR (child, x, y, w, h);
            }
        });
    }
    public deactivate() {
        this.off (lib.EvtKeyDown.type);
        this.off (lib.EvtKeyUp.type);
        this.off (lib.EvtKeyPress.type);
        this.off (lib.EvtMouseDown.type);
        this.off (lib.EvtMouseMove.type);
        this.off (lib.EvtMouseUp.type);
        this.off (lib.EvtDraw.type);
        super.deactivate ();
    }
    public activateObject(object: lib.SceneObject) {
        this.deactivateObject (object);
        object.addComponent(new cwPGSelectComponent(this));
    }
    public deactivateObject(object: lib.SceneObject) {
        const components = object.getComponents(cwPGSelectComponent.type);
        if (components && components.length > 0) {
            this.deselectObject (object);
            object.removeComponentsByType(cwPGSelectComponent.type);
        }
    }
    public executeCommand(cmd: commands.IPGCommand) {
        if (cmd.command === 'GetSelected') {
            cmd.selectedObjects = this._selectedObjects;
        }
    }
    public selectObject(object: lib.SceneObject, ev: lib.EvtMouse) {
        if (this._selectedObjects.indexOf(object) < 0) {
            const metaDown = ev ? lib.EvtSysInfo.isMac() ? ev.metaDown : ev.ctrlDown : true;
            if (!metaDown) {
                this.deselectAll();
            }
            this.selectedObjects.push(object);
            object.triggerEx(new cwPGSelectEvent(this.selectedObjects.length));
            lib.App.triggerEvent (null, new cwPGObjectSelectedEvent (this._selectedObjects));
        }
    }
    public deselectObject(object: lib.SceneObject) {
        const index = this._selectedObjects.indexOf(object);
        if (index >= 0) {
            object.triggerEx(new cwPGDeselectEvent());
            this.selectedObjects.splice(index, 1);
            lib.App.triggerEvent (null, new cwPGObjectDeselectedEvent (object, this._selectedObjects));
        }
    }
    public deselectAll() {
        while (this.selectedObjects.length > 0) {
            this.deselectObject (this.selectedObjects[this.selectedObjects.length - 1]);
        }
    }
}