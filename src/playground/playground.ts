import {
    cwApp, cwComponent, cwObject, cwSceneObject, cwScene, cwSceneView, cwCanvas
} from '../lib/core';

export abstract class cwPlaygroundFactory {
    public readonly name:string;
    private _entities:{[name:string]:cwSceneObject};
    constructor (name:string) {
        this.name = name;
        this._entities = {};
    }
    public findEntity (name:string): cwSceneObject {
        return this._entities[name] || null;
    }
    public createEntity (name:string, failOnExists:boolean): cwSceneObject {
        let entity = this.findEntity (name);
        if (entity !== null) {
            return failOnExists ? null : entity;
        }
        entity = this._createEntity (name);
        if (entity === null) {
            return null;
        }
        entity.entityName = name;
        this._entities[name] = entity;
        return entity;
    }
    public removeEntity (name:string): void {
        delete this._entities[name];
    }
    protected abstract _createEntity (name:string): cwSceneObject;
}

export class cwPlaygroundEntity extends cwComponent {
    static readonly type = 'PlaygroundEntity';
    constructor () {
        super (cwPlaygroundEntity.type);
    }
}

export class cwPlaygroundTool {

}

export class cwPlayground {
    private _view:cwSceneView = null;
    private _factories:{[name:string]:cwPlaygroundFactory};
    constructor (canvas:HTMLCanvasElement, doubleBuffer:boolean = false) {
        this._view = cwScene.addCanvas (canvas, doubleBuffer);
        this._factories = {};
    }
    public addFactory (factory: cwPlaygroundFactory): void {
        this._factories[factory.name] = factory;
    }
    public createEntity (type:string, name:string, failOnExists:boolean): cwSceneObject {
        const factory = this._factories[type];
        return factory ? factory.createEntity (name, failOnExists) : null;
    }
}