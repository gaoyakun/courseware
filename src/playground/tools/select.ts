import * as lib from '../../lib';
import * as commands from '../commands';
import * as playground from '../playground';

export class cwPGSelectEvent extends lib.cwEvent {
    static readonly type: string = '@PGSelect';
    public readonly selectIndex: number;
    constructor(selectIndex: number) {
        super(cwPGSelectEvent.type);
        this.selectIndex = selectIndex;
    }
}

export class cwPGDeselectEvent extends lib.cwEvent {
    static readonly type: string = '@PGDeselect';
    constructor() {
        super(cwPGDeselectEvent.type);
    }
}

export class cwPGObjectSelectedEvent extends lib.cwEvent {
    static readonly type: string = '@PGObjectSelected';
    readonly objects: lib.cwSceneObject[];
    constructor (objects: lib.cwSceneObject[]) {
        super (cwPGObjectSelectedEvent.type);
        this.objects = objects;
    }
}

export class cwPGObjectMovedEvent extends lib.cwEvent {
    static readonly type: string = '@PGObjectMoved';
    readonly objects: lib.cwSceneObject[];
    constructor (objects: lib.cwSceneObject[]) {
        super (cwPGObjectMovedEvent.type);
        this.objects = objects;
    }
}

export class cwPGObjectDeselectedEvent extends lib.cwEvent {
    static readonly type: string = '@PGObjectDeselected';
    readonly object: lib.cwSceneObject;
    constructor (object: lib.cwSceneObject) {
        super (cwPGObjectDeselectedEvent.type);
        this.object = object;
    }
}
export class cwPGSelectComponent extends lib.cwComponent {
    static readonly type = 'PGSelect';
    readonly tool: cwPGSelectTool;
    private _selected: boolean;
    constructor(tool: cwPGSelectTool) {
        super(cwPGSelectComponent.type);
        this.tool = tool;
        this._selected = false;
        this.on(lib.cwDrawEvent.type, (evt: lib.cwDrawEvent) => {
            if (this._selected) {
                const shape = (this.object as lib.cwSceneObject).boundingShape;
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
    private _selectedObjects: lib.cwSceneObject[];
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
    public activate(options: any) {
        super.activate (options);
        this._selectedObjects.length = 0;
        this.on (lib.cwKeyDownEvent.type, (ev: lib.cwKeyDownEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (lib.cwKeyUpEvent.type, (ev: lib.cwKeyUpEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (lib.cwKeyPressEvent.type, (ev: lib.cwKeyPressEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (lib.cwMouseDownEvent.type, (ev: lib.cwMouseDownEvent) => {
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
        this.on (lib.cwMouseMoveEvent.type, (ev: lib.cwMouseMoveEvent) => {
            if (this._moving) {
                const dx = ev.x - this._mouseStartPosX;
                const dy = ev.y - this._mouseStartPosY;
                this._mouseStartPosX = ev.x;
                this._mouseStartPosY = ev.y;
                this._selectedObjects.forEach ((obj: lib.cwSceneObject) => {
                    const t = obj.translation;
                    obj.translation = { x: t.x + dx, y: t.y + dy };
                });
            } else if (this._rangeSelecting) {
                this.rangeSelectR (this._pg.view.rootNode, this._mouseStartPosX, this._mouseStartPosY, ev.x-this._mouseStartPosX, ev.y-this._mouseStartPosY);
                this._mouseCurrentPosX = ev.x;
                this._mouseCurrentPosY = ev.y;
            }
        });
        this.on (lib.cwMouseUpEvent.type, (ev: lib.cwMouseUpEvent) => {
            if (this._moving && this._selectedObjects && this._selectedObjects.length > 0) {
                lib.cwApp.triggerEvent (null, new cwPGObjectMovedEvent (this._selectedObjects));
            }
            this._moving = false;
            this._rangeSelecting = false;
        });
        this.on (lib.cwDrawEvent.type, (ev: lib.cwDrawEvent) => {
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
    private rangeSelectR (root:lib.cwSceneObject, x:number, y:number, w:number, h:number) {
        root.forEachChild (child => {
            const shape = child.boundingShape;
            if (shape) {
                const t = lib.cwTransform2d.invert(child.worldTransform);
                const rectObject = [
                    t.transformPoint({x:x, y:y}),
                    t.transformPoint({x:x ,y:y+h}),
                    t.transformPoint({x:x+w, y:y+h}),
                    t.transformPoint({x:x+w, y:y})
                ];
                if (lib.cwIntersectionTestShapeHull (shape, rectObject)) {
                    this.selectObject (child, null);
                } else {
                    this.deselectObject (child);
                }
            }
            this.rangeSelectR (child, x, y, w, h);
        });
    }
    public deactivate() {
        this.off (lib.cwKeyDownEvent.type);
        this.off (lib.cwKeyUpEvent.type);
        this.off (lib.cwKeyPressEvent.type);
        this.off (lib.cwMouseDownEvent.type);
        this.off (lib.cwMouseMoveEvent.type);
        this.off (lib.cwMouseUpEvent.type);
        this.off (lib.cwDrawEvent.type);
        super.deactivate ();
    }
    public activateObject(object: lib.cwSceneObject) {
        this.deactivateObject (object);
        object.addComponent(new cwPGSelectComponent(this));
    }
    public deactivateObject(object: lib.cwSceneObject) {
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
    public selectObject(object: lib.cwSceneObject, ev: lib.cwMouseEvent) {
        if (this._selectedObjects.indexOf(object) < 0) {
            const metaDown = ev ? lib.cwSysInfo.isMac() ? ev.metaDown : ev.ctrlDown : true;
            if (!metaDown) {
                this.deselectAll();
            }
            this.selectedObjects.push(object);
            object.triggerEx(new cwPGSelectEvent(this.selectedObjects.length));
            lib.cwApp.triggerEvent (null, new cwPGObjectSelectedEvent (this._selectedObjects));
        }
    }
    public deselectObject(object: lib.cwSceneObject) {
        const index = this._selectedObjects.indexOf(object);
        if (index >= 0) {
            object.triggerEx(new cwPGDeselectEvent());
            this.selectedObjects.splice(index, 1);
            lib.cwApp.triggerEvent (null, new cwPGObjectDeselectedEvent (object));
        }
    }
    public deselectAll() {
        while (this.selectedObjects.length > 0) {
            this.deselectObject (this.selectedObjects[this.selectedObjects.length - 1]);
        }
    }
}