import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as commands from '../commands';
import * as playground from '../playground';

export class cwPGSelectEvent extends events.cwMouseEvent {
    static readonly type: string = '@PGSelect';
    constructor(x: number, y: number, button: number, shiftDown: boolean, altDown: boolean, ctrlDown: boolean, metaDown: boolean) {
        super(cwPGSelectEvent.type, x, y, button, shiftDown, altDown, ctrlDown, metaDown);
    }
}

export class cwPGDeselectEvent extends events.cwEvent {
    static readonly type: string = '@PGDeselect';
    constructor() {
        super(cwPGDeselectEvent.type);
    }
}

export class cwPGObjectSelectedEvent extends events.cwEvent {
    static readonly type: string = '@PGObjectSelected';
    readonly object: core.cwSceneObject;
    constructor (object: core.cwSceneObject) {
        super (cwPGObjectSelectedEvent.type);
        this.object = object;
    }
}

export class cwPGObjectDeselectedEvent extends events.cwEvent {
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
    constructor(tool: cwPGSelectTool) {
        super(cwPGSelectComponent.type);
        this.tool = tool;
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
        this.on (events.cwKeyDownEvent.type, (ev: events.cwKeyDownEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (events.cwKeyUpEvent.type, (ev: events.cwKeyUpEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (events.cwKeyPressEvent.type, (ev: events.cwKeyPressEvent) => {
            if (this._selectedObjects.length == 1) {
                this._selectedObjects[0].triggerEx (ev);
            }
        });
        this.on (events.cwMouseDownEvent.type, (ev: events.cwMouseDownEvent) => {
            const hitObjects = this._pg.view.hitObjects;
            if (hitObjects.length > 1) {
                this.selectObject (hitObjects[0], ev);
            } else {
                this.deselectAll ();
            }
        });
        this.on (events.cwDragBeginEvent.type, (ev: events.cwDragBeginEvent) => {
            console.log ('drag begin');
        });
        this.on (events.cwDragOverEvent.type, (ev: events.cwDragOverEvent) => {
            console.log ('drag over');
        });
        this.on (events.cwDragDropEvent.type, (ev: events.cwDragDropEvent) => {
            console.log ('drag drop');
        });
    }
    public deactivate() {
        this.off (events.cwKeyDownEvent.type);
        this.off (events.cwKeyUpEvent.type);
        this.off (events.cwKeyPressEvent.type);
        this.off (events.cwMouseDownEvent.type);
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
    public selectObject(object: core.cwSceneObject, ev: events.cwMouseEvent) {
        if (this._selectedObjects.indexOf(object) < 0) {
            if (!ev.ctrlDown) {
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