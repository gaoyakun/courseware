import * as core from '../lib/core';
import * as components from '../lib/components';
import * as events from '../lib/events';
import * as command from './commands';

export class cwPGCommandEvent extends events.cwEvent {
    static readonly type: string = '@PGCommand';
    cmd: command.IPGCommand;
    constructor (cmd: command.IPGCommand) {
        super(cwPGCommandEvent.type);
        this.cmd = cmd;
    }
}

export class cwPGComponent extends core.cwComponent {
    static readonly type = 'PGComponent';
    constructor() {
        super(cwPGComponent.type);
        this.on(cwPGToolActivateEvent.type, (ev: cwPGToolActivateEvent) => {
            ev.tool.activateObject(this.object as core.cwSceneObject);
        });
        this.on(cwPGToolDeactivateEvent.type, (ev: cwPGToolDeactivateEvent) => {
            ev.tool.deactivateObject(this.object as core.cwSceneObject);
        })
    }
}

export abstract class cwPGFactory {
    public readonly name: string;
    constructor(name: string) {
        this.name = name;
    }
    public createEntity(options?: any): core.cwSceneObject {
        const entity = this._createEntity (options);
        if (entity === null) {
            return null;
        }
        entity.addComponent(new cwPGComponent());
        return entity;
    }
    protected abstract _createEntity(options?:any): core.cwSceneObject;
}

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
        super(cwPGToolDeactivateEvent.type);
        this.tool = tool;
    }
}

export class cwPGTool extends events.cwEventObserver {
    public readonly name: string;
    protected readonly _pg: cwPlayground;
    constructor (name: string, pg: cwPlayground) {
        super ();
        this.name = name;
        this._pg = pg;
    }
    public activate(options: object) {
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

export class cwPlayground extends events.cwEventObserver {
    public readonly view: core.cwSceneView = null;
    private _factories: { [name: string]: cwPGFactory };
    private _tools: { [name: string]: cwPGTool };
    private _currentTool: string;
    private _entities: { [name: string]: core.cwSceneObject };
    constructor(canvas: HTMLCanvasElement, doubleBuffer: boolean = false) {
        super ();
        this.view = core.cwScene.addCanvas(canvas, doubleBuffer);
        this.view.rootNode.addComponent (new components.cwcDraggable());
        this._factories = {};
        this._tools = {};

        this._currentTool = '';
        this._entities = {};
        this.view.on (events.cwKeyDownEvent.type, (ev: events.cwKeyDownEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.on (events.cwKeyUpEvent.type, (ev: events.cwKeyUpEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.on (events.cwKeyPressEvent.type, (ev: events.cwKeyPressEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwMouseDownEvent.type, (ev: events.cwMouseDownEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwMouseUpEvent.type, (ev: events.cwMouseUpEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwMouseMoveEvent.type, (ev: events.cwMouseMoveEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwClickEvent.type, (ev: events.cwClickEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwDblClickEvent.type, (ev: events.cwDblClickEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwDragBeginEvent.type, (ev: events.cwDragBeginEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwDragOverEvent.type, (ev: events.cwDragOverEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (events.cwDragDropEvent.type, (ev: events.cwDragDropEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
    }
    public addTool (tool: cwPGTool): void {
        this._tools[tool.name] = tool;
    }
    public addFactory(factory: cwPGFactory): void {
        this._factories[factory.name] = factory;
    }
    public createEntity(type: string, name: string|null, failOnExists: boolean, options: any): core.cwSceneObject {
        let entity = null;
        if (name === null) {
            let id = 1;
            while (true) {
                name = `${type.toLowerCase()}${id++}`;
                if (this.findEntity(name) === null) {
                    break;
                }
            }
        } else {
            entity = this.findEntity(name);
            if (entity !== null) {
                return failOnExists ? null : entity;
            }
        }
        const factory = this._factories[type];
        if (factory) {
            entity = factory.createEntity(options);
            entity.entityName = name;
            entity.entityType = factory.name;
            if (entity) {
                entity.entityName = name;
                entity.entityType = type;
                this.view.rootNode.addChild (entity);
                this._entities[name] = entity;
                if (this._currentTool !== '') {
                    const curTool = this._tools[this._currentTool];
                    if (curTool) {
                        entity.triggerEx (new cwPGToolActivateEvent(curTool));
                    }
                }
            }
        }
        return entity;
    }
    public deleteEntity(name: string): void {
        const entity = this.findEntity (name);
        if (entity) {
            entity.remove ();
            delete this._entities[name];
        }
    }
    public findEntity(name: string): core.cwSceneObject {
        return this._entities[name] || null;
    }
    public executeCommand(cmd: command.IPGCommand) {
        if (cmd.command == 'UseTool') {
            if (this._currentTool !== cmd.name) {
                if (this._currentTool !== '') {
                    const prevTool = this._tools[this._currentTool];
                    prevTool.deactivate();
                }
                this._currentTool = '';
                if (cmd.name) {
                    const newTool = this._tools[cmd.name];
                    if (newTool) {
                        this._currentTool = cmd.name;
                        newTool.activate(cmd.args||{});
                    }
                }
            }
        } else if (cmd.command == 'CreateObject') {
            const type = cmd.type;
            const name = cmd.name||null;
            const failOnExists = !!cmd.failOnExists;
            const obj = this.createEntity (type, name, failOnExists, cmd);
            cmd.objectCreated = obj;
        } else if (cmd.command == 'DeleteObject') {
            this.deleteEntity (cmd.name);
        } else if (this._currentTool) {
            this._tools[this._currentTool].executeCommand (cmd);
        }
    }
}
