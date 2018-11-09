import * as tool from './tool';
import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as command from '../commands';

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

export class cwPGSelectComponent extends core.cwComponent {
    static readonly type = 'PGSelect';
    readonly tool: cwPGSelectTool;
    constructor(tool: cwPGSelectTool) {
        super(cwPGSelectComponent.type);
        this.tool = tool;
        this.on(events.cwMouseDownEvent.type, (ev: events.cwMouseDownEvent) => {
            if (this.object) {
                this.tool.selectObject(this.object as core.cwSceneObject, ev);
            }
        });
    }
}

export class cwPGSelectTool extends tool.cwPGTool {
    public static readonly toolname: string = 'PGTool_Select';
    private _selectedObjects: core.cwSceneObject[];
    public constructor() {
        super(cwPGSelectTool.toolname);
        this._selectedObjects = [];
    }
    get selectedObjects () {
        return this._selectedObjects;
    }
    public activate() {
        super.activate ();
        this._selectedObjects.length = 0;
    }
    public deactivate() {
        super.deactivate ();
        this._selectedObjects.length = 0;
    }
    public activateObject(object: core.cwSceneObject) {
        this.deactivateObject (object);
        object.addComponent(new cwPGSelectComponent(this));
    }
    public deactivateObject(object: core.cwSceneObject) {
        const components = object.getComponents(cwPGSelectComponent.type);
        if (components && components.length > 0) {
            object.triggerEx (new cwPGDeselectEvent());
            object.removeComponentsByType(cwPGSelectComponent.type);
        }
    }
    public selectObject(object: core.cwSceneObject, ev: events.cwMouseEvent) {
        if (this._selectedObjects.indexOf(object) < 0) {
            if (!ev.ctrlDown) {
                this.deselectAll();
            }
            this._selectedObjects.push(object);
            const e = new cwPGSelectEvent(ev.x, ev.y, ev.button, ev.shiftDown, ev.altDown, ev.ctrlDown, ev.metaDown);
            object.triggerEx(e);
        }
    }
    public deselectObject(object: core.cwSceneObject) {
        const index = this._selectedObjects.indexOf(object);
        if (index >= 0) {
            object.triggerEx(new cwPGDeselectEvent());
            this._selectedObjects.splice(index, 1);
        }
    }
    public deselectAll() {
        this._selectedObjects.forEach((obj: core.cwSceneObject) => {
            obj.triggerEx(new cwPGDeselectEvent());
        });
        this._selectedObjects.length = 0;
    }
}