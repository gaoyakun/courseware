import * as core from '../lib/core';
import * as tool from './tools';
import * as command from './commands';
import * as objects from './objects';

export class cwPlayground {
    public readonly view: core.cwSceneView = null;
    private _factories: { [name: string]: objects.cwPGFactory };
    private _tools: { [name: string]: tool.cwPGTool };
    private _currentTool: string;
    private _entities: { [name: string]: core.cwSceneObject };
    constructor(canvas: HTMLCanvasElement, doubleBuffer: boolean = false) {
        this.view = core.cwScene.addCanvas(canvas, doubleBuffer);
        this._factories = {};
        this._tools = {};

        this._currentTool = '';
        this._entities = {};
        this.addFactory (new objects.cwPGLabelFactory('Label'));
        this.addTool (new tool.cwPGSelectTool());
    }
    public addTool (tool: tool.cwPGTool): void {
        this._tools[tool.name] = tool;
    }
    public addFactory(factory: objects.cwPGFactory): void {
        this._factories[factory.name] = factory;
    }
    public createEntity(type: string, name: string, failOnExists: boolean, options: any): core.cwSceneObject {
        let entity = this.findEntity(name);
        if (entity !== null) {
            return failOnExists ? null : entity;
        }
        const factory = this._factories[type];
        if (factory) {
            entity = factory.createEntity(options);
            entity.entityName = name;
            if (entity) {
                this.view.rootNode.addChild (entity);
                this._entities[name] = entity;
                if (this._currentTool !== '') {
                    const curTool = this._tools[this._currentTool];
                    if (curTool) {
                        entity.triggerEx (new tool.cwPGToolActivateEvent(curTool));
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
                        newTool.activate();
                    }
                }
            }
        } else if (cmd.command == 'CreateObject') {
            const type = cmd.type;
            const name = cmd.name;
            const failOnExists = !!cmd.failOnExists;
            const x = Number(cmd.x || 0);
            const y = Number(cmd.y || 0);
            const obj = this.createEntity (type, name, failOnExists, cmd);
            obj.translation = { x: x, y: y };
        } else if (cmd.command == 'DeleteObject') {
            this.deleteEntity (cmd.name);
        } else if (this._currentTool !== '') {
            const tool = this._tools[this._currentTool];
            tool.executeCommand(cmd);
        }
    }
}
