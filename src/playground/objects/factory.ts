import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as tool from '../tools';

export class cwPGStartMoveEvent extends events.cwEvent {
    static readonly type: string = '@PGStartMove';
    constructor () {
        super(cwPGStartMoveEvent.type);
    }
}

export class cwPGStopMoveEvent extends events.cwEvent {
    static readonly type: string = '@PGStopMove';
    constructor () {
        super(cwPGStopMoveEvent.type);
    }
}

export class cwPGComponent extends core.cwComponent {
    static readonly type = 'PGComponent';
    mode: string;
    constructor() {
        super(cwPGComponent.type);
        this.mode = '';
        this.on(tool.cwPGToolActivateEvent.type, (ev: tool.cwPGToolActivateEvent) => {
            ev.tool.activateObject(this.object as core.cwSceneObject);
        });
        this.on(tool.cwPGToolDeactivateEvent.type, (ev: tool.cwPGToolDeactivateEvent) => {
            ev.tool.deactivateObject(this.object as core.cwSceneObject);
        })
        this.on(events.cwMouseDownEvent.type, (ev: events.cwMouseDownEvent) => {
            if (this.object) {
                this.object.triggerEx (new cwPGStartMoveEvent ());
            }
        });
        this.on(events.cwMouseUpEvent.type, (ev: events.cwMouseUpEvent) => {
            if (this.object && this.mode == 'freeMove') {
                this.object.triggerEx (new cwPGStopMoveEvent ());
            }
        });
        this.on(cwPGStartMoveEvent.type, (ev: cwPGStartMoveEvent) => {
            this.mode = 'freeMove';
            (this.object as core.cwSceneObject).setCapture ();
        });
        this.on(cwPGStopMoveEvent.type, (ev: cwPGStopMoveEvent) => {
            this.mode = '';
            (this.object as core.cwSceneObject).collapseTransform ();
            (this.object as core.cwSceneObject).releaseCapture ();
        });
        this.on(events.cwMouseMoveEvent.type, (ev: events.cwMouseMoveEvent) => {
            if (this.mode == 'freeMove' && this.object) {
                this.object.worldTranslation = {x:ev.x, y:ev.y};
            }
        });
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

