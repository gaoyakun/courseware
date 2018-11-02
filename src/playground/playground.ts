import * as core from '../lib/core';
import * as events from '../lib/events';
import * as selecttool from './tools/select';
import * as command from './commands';

export class cwPGToolActivateEvent extends events.cwEvent {
    static readonly type: string = '@PGToolActivate';
    tool: cwPGTool;
    constructor (tool: cwPGTool) {
        super (cwPGToolActivateEvent.type);
        this.tool = tool;
    }
}

export class cwPGToolDeactivateEvent extends events.cwEvent {
    static readonly type: string = '@PGToolDeactivate';
    tool: cwPGTool;
    constructor (tool: cwPGTool) {
        super (cwPGToolActivateEvent.type);
        this.tool = tool;
    }
}

export class cwPGComponent extends core.cwComponent {
    static readonly type = 'PGComponent';
    constructor () {
        super (cwPGComponent.type);
        this.on (cwPGToolActivateEvent.type, (ev: cwPGToolActivateEvent) => {
            ev.tool.activateObject (this.object as core.cwSceneObject);
        });
        this.on (cwPGToolDeactivateEvent.type, (ev: cwPGToolDeactivateEvent) => {
            ev.tool.deactivateObject (this.object as core.cwSceneObject);
        })
    }
}

export abstract class cwPGFactory {
    public readonly name:string;
    private _entities:{[name:string]: core.cwSceneObject};
    constructor (name:string) {
        this.name = name;
        this._entities = {};
    }
    public findEntity (name:string): core.cwSceneObject {
        return this._entities[name] || null;
    }
    public createEntity (name:string, failOnExists:boolean): core.cwSceneObject {
        let entity = this.findEntity (name);
        if (entity !== null) {
            return failOnExists ? null : entity;
        }
        entity = this._createEntity (name);
        if (entity === null) {
            return null;
        }
        entity.entityName = name;
        entity.addComponent (new cwPGComponent());
        this._entities[name] = entity;
        return entity;
    }
    public removeEntity (name:string): void {
        delete this._entities[name];
    }
    protected abstract _createEntity (name:string): core.cwSceneObject;
}

export class cwPGTool {
    public activate () {
        core.cwApp.triggerEvent (null, new cwPGToolActivateEvent (this));
    }
    public deactivate () {
        core.cwApp.triggerEvent (null, new cwPGToolDeactivateEvent (this));
    }
    public activateObject (object: core.cwSceneObject) {
    }
    public deactivateObject (object: core.cwSceneObject) {
    }
    public executeCommand (cmd: command.IPGCommand) {
    }
}

export class cwPlayground {
    private _view: core.cwSceneView = null;
    private _factories:{[name:string]:cwPGFactory};
    private _tools:{[name:string]:cwPGTool};
    private _currentTool:string;
    constructor (canvas:HTMLCanvasElement, doubleBuffer:boolean = false) {
        this._view = core.cwScene.addCanvas (canvas, doubleBuffer);
        this._factories = {};
        this._tools[selecttool.cwPGSelectTool.toolname] = new selecttool.cwPGSelectTool();
        this._currentTool = '';
    }
    public addFactory (factory: cwPGFactory): void {
        this._factories[factory.name] = factory;
    }
    public createEntity (type:string, name:string, failOnExists:boolean): core.cwSceneObject {
        const factory = this._factories[type];
        return factory ? factory.createEntity (name, failOnExists) : null;
    }
    public executeCommand (cmd: command.IPGCommand) {
        if (cmd.command == 'UseTool') {
            if (this._currentTool !== cmd.name) {
                const newTool = this._tools[cmd.name];
                if (newTool) {
                    if (this._currentTool !== '') {
                        const prevTool = this._tools[this._currentTool];
                        prevTool.deactivate ();
                    }
                    this._currentTool = cmd.name;
                    newTool.activate ();
                }
            }
        } else if (this._currentTool !== '') {
            const tool = this._tools[this._currentTool];
            tool.executeCommand (cmd);
        }
    }
}
