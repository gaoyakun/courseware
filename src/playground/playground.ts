import * as lib from '../lib';
import * as command from './commands';

export class cwPGComponent extends lib.cwComponent {
    static readonly type = 'PGComponent';
    constructor() {
        super(cwPGComponent.type);
        this.on(cwPGToolActivateEvent.type, (ev: cwPGToolActivateEvent) => {
            ev.tool.activateObject(this.object as lib.cwSceneObject);
        });
        this.on(cwPGToolDeactivateEvent.type, (ev: cwPGToolDeactivateEvent) => {
            ev.tool.deactivateObject(this.object as lib.cwSceneObject);
        });
        this.on(cwPGSetObjectPropertyEvent.type, (ev: cwPGSetObjectPropertyEvent) => {
            const object = this.object as lib.cwSceneObject;
            switch (ev.name) {
                case 'localx': {
                    const t = object.translation;
                    t.x = Number(ev.value);
                    object.translation = t;
                    break;
                }
                case 'localy': {
                    const t = object.translation;
                    t.y = Number(ev.value);
                    object.translation = t;
                    break;
                }
                case 'anchorx': {
                    const t = object.anchorPoint;
                    t.x = Number(ev.value);
                    object.anchorPoint = t;
                    break;
                }
                case 'anchory': {
                    const t = object.anchorPoint;
                    t.y = Number(ev.value);
                    object.anchorPoint = t;
                    break;
                }
                case 'entityName': {
                    object.entityName = ev.value;
                    break;
                }
            }
        });
        this.on(cwPGGetObjectPropertyEvent.type, (ev: cwPGGetObjectPropertyEvent) => {
            const object = this.object as lib.cwSceneObject;
            switch (ev.name) {
                case 'localx': {
                    ev.value = object.translation.x;
                    break;
                }
                case 'localy': {
                    ev.value = object.translation.y;
                    break;
                }
                case 'anchorx': {
                    ev.value = object.anchorPoint.x;
                    break;
                }
                case 'anchory': {
                    ev.value = object.anchorPoint.y;
                    break;
                }
                case 'entityName': {
                    ev.value = object.entityName;
                    break;
                }
                case 'entityType': {
                    ev.value = object.entityType;
                    break;
                }
            }
        });
        this.on(cwPGGetObjectPropertyListEvent.type, (ev: cwPGGetObjectPropertyListEvent) => {
            ev.properties = ev.properties || {};
            ev.properties.general = ev.properties.general || { desc: '通用', properties: [] };
            ev.properties.general.properties.push ({
                name: 'entityType',
                desc: '类型',
                readonly: true,
                type: 'string',
                value: this.object.entityType
            });
            ev.properties.general.properties.push ({
                name: 'entityName',
                desc: '名称',
                readonly: false,
                type: 'string',
                value: this.object.entityName
            });
            ev.properties.general.properties.push ({
                name: 'localx',
                desc: '位置X',
                readonly: false,
                type: 'number',
                value: (this.object as lib.cwSceneObject).translation.x
            });
            ev.properties.general.properties.push ({
                name: 'localy',
                desc: '位置Y',
                readonly: false,
                type: 'number',
                value: (this.object as lib.cwSceneObject).translation.y
            });
            ev.properties.general.properties.push ({
                name: 'anchorx',
                desc: '锚点X',
                readonly: false,
                type: 'number',
                value: (this.object as lib.cwSceneObject).anchorPoint.x
            });
            ev.properties.general.properties.push ({
                name: 'anchory',
                desc: '锚点Y',
                readonly: false,
                type: 'number',
                value: (this.object as lib.cwSceneObject).anchorPoint.y
            })
        });
    }
}

export abstract class cwPGFactory {
    public readonly name: string;
    constructor(name: string) {
        this.name = name;
    }
    public createEntity(options?: any): lib.cwSceneObject {
        const entity = this._createEntity (options);
        if (entity === null) {
            return null;
        }
        entity.addComponent(new cwPGComponent());
        if (options && options.x !== undefined && options.y !== undefined) {
            entity.translation = { x:options.x, y:options.y };
        }
        return entity;
    }
    protected abstract _createEntity(options?:any): lib.cwSceneObject;
}

export class cwPGToolActivateEvent extends lib.cwEvent {
    static readonly type: string = '@PGToolActivate';
    tool: cwPGTool;
    constructor(tool: cwPGTool) {
        super(cwPGToolActivateEvent.type);
        this.tool = tool;
    }
}

export class cwPGToolDeactivateEvent extends lib.cwEvent {
    static readonly type: string = '@PGToolDeactivate';
    tool: cwPGTool;
    constructor(tool: cwPGTool) {
        super(cwPGToolDeactivateEvent.type);
        this.tool = tool;
    }
}

export interface IObjectProperty {
    name: string;
    desc: string;
    type: string;
    value: any;
    enum?: any[];
    readonly: boolean;
}

export interface IObjectPropertyList {
    [group: string]: {  
        desc: string;
        properties: IObjectProperty[] 
    }
}

export class cwPGGetObjectPropertyListEvent extends lib.cwEvent {
    static readonly type: string = '@PGGetObjectPropertyList';
    properties?: IObjectPropertyList;
    constructor () {
        super (cwPGGetObjectPropertyListEvent.type);
    }
}

export class cwPGSetObjectPropertyEvent extends lib.cwEvent {
    static readonly type: string = '@PGSetObjectPropertyEvent';
    name: string;
    value: any;
    constructor (name: string, value: any) {
        super (cwPGSetObjectPropertyEvent.type);
        this.name = name;
        this.value = value;
    }
}

export class cwPGGetObjectPropertyEvent extends lib.cwEvent {
    static readonly type: string = '@PGGetObjectPropertyEvent';
    name: string;
    value?: any;
    constructor (name: string) {
        super (cwPGGetObjectPropertyEvent.type);
        this.name = name;
    }
}

export class cwPGTool extends lib.cwEventObserver {
    public readonly name: string;
    protected readonly _pg: cwPlayground;
    constructor (name: string, pg: cwPlayground) {
        super ();
        this.name = name;
        this._pg = pg;
    }
    public activate(options: object) {
        lib.cwApp.triggerEvent(null, new cwPGToolActivateEvent(this));
    }
    public deactivate() {
        lib.cwApp.triggerEvent(null, new cwPGToolDeactivateEvent(this));
    }
    public activateObject(object: lib.cwSceneObject) {
    }
    public deactivateObject(object: lib.cwSceneObject) {
    }
    public executeCommand(cmd: command.IPGCommand) {
    }
}

export class cwPlayground extends lib.cwEventObserver {
    public readonly view: lib.cwSceneView = null;
    private _factories: { [name: string]: cwPGFactory };
    private _tools: { [name: string]: cwPGTool };
    private _currentTool: string;
    private _entities: { [name: string]: lib.cwSceneObject };
    constructor(canvas: HTMLCanvasElement, doubleBuffer: boolean = false) {
        super ();
        this.view = lib.cwScene.addCanvas(canvas, doubleBuffer);
        this.view.rootNode.addComponent (new lib.cwcDraggable());
        this._factories = {};
        this._tools = {};

        this._currentTool = '';
        this._entities = {};
        this.view.on (lib.cwKeyDownEvent.type, (ev: lib.cwKeyDownEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.on (lib.cwKeyUpEvent.type, (ev: lib.cwKeyUpEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.on (lib.cwKeyPressEvent.type, (ev: lib.cwKeyPressEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwMouseDownEvent.type, (ev: lib.cwMouseDownEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwMouseUpEvent.type, (ev: lib.cwMouseUpEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwMouseMoveEvent.type, (ev: lib.cwMouseMoveEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwClickEvent.type, (ev: lib.cwClickEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwDblClickEvent.type, (ev: lib.cwDblClickEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwDragBeginEvent.type, (ev: lib.cwDragBeginEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwDragOverEvent.type, (ev: lib.cwDragOverEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.rootNode.on (lib.cwDragDropEvent.type, (ev: lib.cwDragDropEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        });
        this.view.on (lib.cwDrawEvent.type, (ev: lib.cwDrawEvent) => {
            if (this._currentTool !== '') {
                const tool = this._tools[this._currentTool];
                tool.trigger (ev);
            }
        }, lib.cwEventListenerOrder.LAST);
    }
    public addTool (tool: cwPGTool): void {
        this._tools[tool.name] = tool;
    }
    public addFactory(factory: cwPGFactory): void {
        this._factories[factory.name] = factory;
    }
    public createEntity(type: string, name: string|null, failOnExists: boolean, options: any): lib.cwSceneObject {
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
    public findEntity(name: string): lib.cwSceneObject {
        return this._entities[name] || null;
    }
    public encodeCommand(cmd: command.IPGCommand) {
        let str = cmd.command;
        for (const name in cmd) {
            if (name !== 'command') {
                str += ` ${name}=${cmd[name]}`;
            }
        }
        return str;
    }
    public executeCommand(cmd: command.IPGCommand) {
        console.log (`CMD: ${this.encodeCommand(cmd)}`);
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
        } else if (cmd.command == 'DeleteObjects') {
            if (cmd.objects) {
                cmd.objects.forEach ((name:string) => {
                    this.deleteEntity (name);
                });
            }
        } else if (cmd.command == 'AlignObjectsLeft') {
            if (cmd.objects && cmd.objects.length > 1) {
                const objects: lib.cwSceneObject[] = cmd.objects.map ((name:string) => this.findEntity(name));
                let minx = objects[0].worldTransform.e;
                for (let i = 1; i < objects.length; i++) {
                    const x = objects[i].worldTransform.e;
                    if (x < minx) {
                        minx = x;
                    }
                }
                objects.forEach (obj => {
                    obj.worldTranslation = { x:minx, y:obj.worldTransform.f };
                    obj.collapseTransform ();
                });
            }
        } else if (cmd.command == 'AlignObjectsRight') {
            if (cmd.objects && cmd.objects.length > 1) {
                const objects: lib.cwSceneObject[] = cmd.objects.map ((name:string) => this.findEntity(name));
                let maxx = objects[0].worldTransform.e;
                for (let i = 1; i < objects.length; i++) {
                    const x = objects[i].worldTransform.e;
                    if (x > maxx) {
                        maxx = x;
                    }
                }
                objects.forEach (obj => {
                    obj.worldTranslation = { x:maxx, y:obj.worldTransform.f };
                    obj.collapseTransform ();
                });
            }
        } else if (cmd.command == 'AlignObjectsTop') {
            if (cmd.objects && cmd.objects.length > 1) {
                const objects: lib.cwSceneObject[] = cmd.objects.map ((name:string) => this.findEntity(name));
                let miny = objects[0].worldTransform.f;
                for (let i = 1; i < objects.length; i++) {
                    const y = objects[i].worldTransform.f;
                    if (y < miny) {
                        miny = y;
                    }
                }
                objects.forEach (obj => {
                    obj.worldTranslation = { x:obj.worldTransform.e, y:miny };
                    obj.collapseTransform ();
                });
            }
        } else if (cmd.command == 'AlignObjectsBottom') {
            if (cmd.objects && cmd.objects.length > 1) {
                const objects: lib.cwSceneObject[] = cmd.objects.map ((name:string) => this.findEntity(name));
                let maxy = objects[0].worldTransform.f;
                for (let i = 1; i < objects.length; i++) {
                    const y = objects[i].worldTransform.f;
                    if (y > maxy) {
                        maxy = y;
                    }
                }
                objects.forEach (obj => {
                    obj.worldTranslation = { x:obj.worldTransform.e, y:maxy };
                    obj.collapseTransform ();
                });
            }
        } else if (cmd.command == 'AlignObjectsHorizontal') {
            if (cmd.objects && cmd.objects.length > 1) {
                const firstObject = this.findEntity (cmd.objects[0]);
                if (firstObject) {
                    const y = firstObject.worldTransform.f;
                    for (let i = 1; i < cmd.objects.length; i++) {
                        const obj = this.findEntity (cmd.objects[i]);
                        if (obj) {
                            obj.worldTranslation = { x:obj.worldTransform.e, y:y };
                            obj.collapseTransform ();
                        }
                    }
                }
            }
        } else if (cmd.command == 'ArrangeObjectsHorizontal') {
            if (cmd.objects && cmd.objects.length > 2) {
                const objects: lib.cwSceneObject[] = cmd.objects.map ((name:string) => this.findEntity(name));
                objects.sort ((a, b) => {
                    return a.worldTransform.e - b.worldTransform.e;
                });
                const posStart = objects[0].worldTransform.e;
                const gap = (objects[objects.length-1].worldTransform.e - posStart) / (objects.length - 1);
                for (let i = 1; i < objects.length - 1; i++) {
                    objects[i].worldTranslation = { x:posStart + i * gap, y:objects[i].worldTransform.f };
                    objects[i].collapseTransform ();
                }
            }
        } else if (cmd.command == 'ArrangeObjectsVertical') {
            if (cmd.objects && cmd.objects.length > 2) {
                const objects: lib.cwSceneObject[] = cmd.objects.map ((name:string) => this.findEntity(name));
                objects.sort ((a, b) => {
                    return a.worldTransform.f - b.worldTransform.f;
                });
                const posStart = objects[0].worldTransform.f;
                const gap = (objects[objects.length-1].worldTransform.f - posStart) / (objects.length - 1);
                for (let i = 1; i < objects.length - 1; i++) {
                    objects[i].worldTranslation = { x:objects[i].worldTransform.e, y:posStart + i * gap };
                    objects[i].collapseTransform ();
                }
            }
        } else if (cmd.command == 'SetObjectProperty') {
            const obj = this.findEntity (cmd.objectName);
            if (obj) {
                const ev = new cwPGSetObjectPropertyEvent (cmd.propName, cmd.propValue);
                obj.triggerEx (ev);
                if (obj.entityName != cmd.objectName) {
                    if (this.findEntity(obj.entityName)) {
                        obj.entityName = cmd.objectName;
                    } else {
                        delete this._entities[cmd.objectName];
                        this._entities[obj.entityName] = obj;
                    }
                }
            }
        } else if (cmd.command == 'GetObjectProperty') {
            const obj = this.findEntity (cmd.objectName);
            if (obj) {
                const ev = new cwPGGetObjectPropertyEvent (cmd.propName);
                obj.triggerEx (ev);
                cmd.propValue = ev.value;
            }
        } else if (this._currentTool) {
            this._tools[this._currentTool].executeCommand (cmd);
        }
    }
}
