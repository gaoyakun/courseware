import * as core from '../../lib/core';
import * as commands from '../commands';
import * as playground from '../playground';
import * as intersect from '../../lib/intersect';

export class cwPGSelectEvent extends core.cwEvent {
    static readonly type: string = '@PGSelect';
    public readonly selectIndex: number;
    constructor(selectIndex: number) {
        super(cwPGSelectEvent.type);
        this.selectIndex = selectIndex;
    }
}

export class cwPGDeselectEvent extends core.cwEvent {
    static readonly type: string = '@PGDeselect';
    constructor() {
        super(cwPGDeselectEvent.type);
    }
}

export class cwPGObjectSelectedEvent extends core.cwEvent {
    static readonly type: string = '@PGObjectSelected';
    readonly objects: core.cwSceneObject[];
    constructor (objects: core.cwSceneObject[]) {
        super (cwPGObjectSelectedEvent.type);
        this.objects = objects;
    }
}

export class cwPGObjectMovedEvent extends core.cwEvent {
    static readonly type: string = '@PGObjectMoved';
    readonly objects: core.cwSceneObject[];
    constructor (objects: core.cwSceneObject[]) {
        super (cwPGObjectMovedEvent.type);
        this.objects = objects;
    }
}

export class cwPGObjectDeselectedEvent extends core.cwEvent {
    static readonly type: string = '@PGObjectDeselected';
    readonly object: core.cwSceneObject;
    constructor (object: core.cwSceneObject) {
        super (cwPGObjectDeselectedEvent.type);
        this.object = object;
    }
}
export class cwPGSelectComponent extends core.cwComponent {
    static readonly type = 'PGSelect';
    readonly tool: cwPGSelectTool;
    private _selected: boolean;
    constructor(tool: cwPGSelectTool) {
        super(cwPGSelectComponent.type);
        this.tool = tool;
        this._selected = false;
        this.on(core.cwDrawEvent.type, (evt: core.cwDrawEvent) => {
            if (this._selected) {
                const bbox = (this.object as core.cwSceneObject).boundingbox;
                if (bbox) {
                    evt.canvas.context.save();
                    evt.canvas.applyTransform(evt.transform);
                    evt.canvas.context.translate (0.5, 0.5);
                    evt.canvas.context.strokeStyle = '#000';
                    evt.canvas.context.lineWidth = 1;
                    evt.canvas.context.strokeRect (bbox.x, bbox.y, bbox.w, bbox.h);
                    evt.canvas.context.restore();
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
    private _selectedObjects: core.cwSceneObject[];
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
    public activate(options: object) {
        super.activate (options);
        this._selectedObjects.length = 0;
        this.on (core.cwKeyDownEvent.type, (ev: core.cwKeyDownEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (core.cwKeyUpEvent.type, (ev: core.cwKeyUpEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (core.cwKeyPressEvent.type, (ev: core.cwKeyPressEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (core.cwMouseDownEvent.type, (ev: core.cwMouseDownEvent) => {
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
        this.on (core.cwMouseMoveEvent.type, (ev: core.cwMouseMoveEvent) => {
            if (this._moving) {
                const dx = ev.x - this._mouseStartPosX;
                const dy = ev.y - this._mouseStartPosY;
                this._mouseStartPosX = ev.x;
                this._mouseStartPosY = ev.y;
                this._selectedObjects.forEach ((obj: core.cwSceneObject) => {
                    const t = obj.translation;
                    obj.translation = { x: t.x + dx, y: t.y + dy };
                });
                core.cwApp.triggerEvent (null, new cwPGObjectMovedEvent (this._selectedObjects));
            } else if (this._rangeSelecting) {
                this.rangeSelectR (this._pg.view.rootNode, this._mouseStartPosX, this._mouseStartPosY, ev.x-this._mouseStartPosX, ev.y-this._mouseStartPosY);
                this._mouseCurrentPosX = ev.x;
                this._mouseCurrentPosY = ev.y;
            }
        });
        this.on (core.cwMouseUpEvent.type, (ev: core.cwMouseUpEvent) => {
            this._moving = false;
            this._rangeSelecting = false;
        });
        this.on (core.cwDrawEvent.type, (ev: core.cwDrawEvent) => {
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
    private rangeSelectR (root:core.cwSceneObject, x:number, y:number, w:number, h:number) {
        const rectRange = [{x:x,y:y},{x:x+w,y:y},{x:x+w,y:y+h},{x:x,y:y+h}];
        root.forEachChild (child => {
            const bbox = child.boundingbox;
            if (bbox) {
                const t = child.worldTransform;
                const rectObject = [
                    t.transformPoint({x:bbox.x,y:bbox.y}),
                    t.transformPoint({x:bbox.x+bbox.w,y:bbox.y}),
                    t.transformPoint({x:bbox.x+bbox.w,y:bbox.y+bbox.h}),
                    t.transformPoint({x:bbox.x,y:bbox.y+bbox.h})
                ];
                if (intersect.cwIntersectionTestHullHull (rectRange, rectObject)) {
                    this.selectObject (child, null);
                } else {
                    this.deselectObject (child);
                }
            }
            this.rangeSelectR (child, x, y, w, h);
        });
    }
    public deactivate() {
        this.off (core.cwKeyDownEvent.type);
        this.off (core.cwKeyUpEvent.type);
        this.off (core.cwKeyPressEvent.type);
        this.off (core.cwMouseDownEvent.type);
        super.deactivate ();
    }
    public activateObject(object: core.cwSceneObject) {
        this.deactivateObject (object);
        object.addComponent(new cwPGSelectComponent(this));
    }
    public deactivateObject(object: core.cwSceneObject) {
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
    public selectObject(object: core.cwSceneObject, ev: core.cwMouseEvent) {
        if (this._selectedObjects.indexOf(object) < 0) {
            const metaDown = ev ? core.cwSysInfo.isMac() ? ev.metaDown : ev.ctrlDown : true;
            if (!metaDown) {
                this.deselectAll();
            }
            this.selectedObjects.push(object);
            object.triggerEx(new cwPGSelectEvent(this.selectedObjects.length));
            core.cwApp.triggerEvent (null, new cwPGObjectSelectedEvent (this._selectedObjects));
        }
    }
    public deselectObject(object: core.cwSceneObject) {
        const index = this._selectedObjects.indexOf(object);
        if (index >= 0) {
            object.triggerEx(new cwPGDeselectEvent());
            this.selectedObjects.splice(index, 1);
            core.cwApp.triggerEvent (null, new cwPGObjectDeselectedEvent (object));
        }
    }
    public deselectAll() {
        while (this.selectedObjects.length > 0) {
            this.deselectObject (this.selectedObjects[this.selectedObjects.length - 1]);
        }
    }
}