import * as core from '../../lib/core';
import * as commands from '../commands';
import * as playground from '../playground';

export class cwPGSelectEvent extends core.cwMouseEvent {
    static readonly type: string = '@PGSelect';
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwPGSelectEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
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
    readonly object: core.cwSceneObject;
    constructor (object: core.cwSceneObject) {
        super (cwPGObjectSelectedEvent.type);
        this.object = object;
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
    public constructor(pg: playground.cwPlayground) {
        super(cwPGSelectTool.toolname, pg);
        this._selectedObjects = [];
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
            const hitObjects = this._pg.view.hitObjects;
            if (hitObjects.length > 1) {
                this.selectObject (hitObjects[0], ev);
            } else {
                this.deselectAll ();
            }
        });
        this.on (core.cwDragBeginEvent.type, (ev: core.cwDragBeginEvent) => {
        });
        this.on (core.cwDragOverEvent.type, (ev: core.cwDragOverEvent) => {
        });
        this.on (core.cwDragDropEvent.type, (ev: core.cwDragDropEvent) => {
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
        if (this._selectedObjects.length == 1) {
            this._selectedObjects[0].triggerEx (new playground.cwPGCommandEvent(cmd));
        }
    }
    public selectObject(object: core.cwSceneObject, ev: core.cwMouseEvent) {
        if (this._selectedObjects.indexOf(object) < 0) {
            if (!ev.metaDown) {
                this.deselectAll();
            }
            this.selectedObjects.push(object);
            object.triggerEx(new cwPGSelectEvent(ev.x, ev.y, ev.button, ev.shiftDown, ev.altDown, ev.ctrlDown, ev.metaDown));
            core.cwApp.triggerEvent (null, new cwPGObjectSelectedEvent (object));
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