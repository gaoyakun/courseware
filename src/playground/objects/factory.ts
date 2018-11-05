import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as tool from '../tools';

export class cwPGComponent extends core.cwComponent {
    static readonly type = 'PGComponent';
    constructor() {
        super(cwPGComponent.type);
        this.on(tool.cwPGToolActivateEvent.type, (ev: tool.cwPGToolActivateEvent) => {
            ev.tool.activateObject(this.object as core.cwSceneObject);
        });
        this.on(tool.cwPGToolDeactivateEvent.type, (ev: tool.cwPGToolDeactivateEvent) => {
            ev.tool.deactivateObject(this.object as core.cwSceneObject);
        })
        this.on(events.cwComponentAttachedEvent.type, (ev: events.cwComponentAttachedEvent) => {
        });
        this.on(events.cwComponentDetachedEvent.type, (ev: events.cwComponentDetachedEvent) => {
        });
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

