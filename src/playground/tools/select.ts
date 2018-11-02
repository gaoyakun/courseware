import * as playground from '../playground';
import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as command from '../commands';

export class cwPGSelectEvent extends events.cwMouseEvent {
    static readonly type : string = '@PGSelect';
    constructor (x:number,y:number,button:number,shiftDown:boolean,altDown:boolean,ctrlDown:boolean,metaDown:boolean) {
        super (cwPGSelectEvent.type,x,y,button,shiftDown,altDown,ctrlDown,metaDown);
    }
} 

export class cwPGDeselectEvent extends events.cwEvent {
    static readonly type : string = '@PGDeselect';
    constructor () {
        super (cwPGDeselectEvent.type);
    }
}

export class cwPGSelectComponent extends core.cwComponent {
    static readonly type = 'PGSelect';
    readonly tool: cwPGSelectTool;
    constructor (tool: cwPGSelectTool) {
        super (cwPGSelectComponent.type);
        this.tool = tool;
        this.on (events.cwMouseDownEvent.type, (ev: events.cwMouseDownEvent) => {
            if (this.object) {
                this.tool.selectObject (this.object as core.cwSceneObject, ev);
            }
        });
    }
}

export class cwPGSelectTool extends playground.cwPGTool {
    public static readonly toolname: string = 'PGTool_Select';
    private selectedObjects: Array<core.cwSceneObject>;
    public constructor () {
        super ();
        this.selectedObjects = [];
    }
    public activateObject (object: core.cwSceneObject) {
        object.addComponent (new cwPGSelectComponent(this));
    }
    public deactivateObject (object: core.cwSceneObject) {
        object.removeComponentsByType (cwPGSelectComponent.type);
    }
    public executeCommand (cmd: command.IPGCommand): void {
    }
    public selectObject (object: core.cwSceneObject, ev: events.cwMouseEvent) {
        if (this.selectedObjects.indexOf(object) < 0) {
            const e = new cwPGSelectEvent(ev.x, ev.y, ev.button, ev.shiftDown, ev.altDown, ev.ctrlDown, ev.metaDown);
            object.triggerEx (e);
            if (!ev.ctrlDown) {
                this.deselectAll ();
            }
            this.selectedObjects.push (object);
        }
    }
    public deselectObject (object: core.cwSceneObject) {
        const index = this.selectedObjects.indexOf(object);
        if (index >= 0) {
            object.triggerEx (new cwPGDeselectEvent ());
            this.selectedObjects.splice (index, 1);
        }        
    }
    public deselectAll () {
        this.selectedObjects.forEach ((obj: core.cwSceneObject) => {
            obj.triggerEx (new cwPGDeselectEvent ());
        });
        this.selectedObjects.length = 0;
    }
}