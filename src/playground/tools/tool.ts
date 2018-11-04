import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as command from '../commands';

export class cwPGToolActivateEvent extends events.cwEvent {
    static readonly type: string = '@PGToolActivate';
    tool: cwPGTool;
    constructor(tool: cwPGTool) {
        super(cwPGToolActivateEvent.type);
        this.tool = tool;
    }
}

export class cwPGToolDeactivateEvent extends events.cwEvent {
    static readonly type: string = '@PGToolDeactivate';
    tool: cwPGTool;
    constructor(tool: cwPGTool) {
        super(cwPGToolActivateEvent.type);
        this.tool = tool;
    }
}

export class cwPGTool {
    public readonly name: string;
    constructor (name: string) {
        this.name = name;
    }
    public activate() {
        core.cwApp.triggerEvent(null, new cwPGToolActivateEvent(this));
    }
    public deactivate() {
        core.cwApp.triggerEvent(null, new cwPGToolDeactivateEvent(this));
    }
    public activateObject(object: core.cwSceneObject) {
    }
    public deactivateObject(object: core.cwSceneObject) {
    }
    public executeCommand(cmd: command.IPGCommand) {
    }
}

