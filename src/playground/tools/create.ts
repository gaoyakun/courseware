import * as events from '../../lib/events';
import * as playground from '../playground';

export class cwPGCreateTool extends playground.cwPGTool {
    public static readonly toolname: string = 'Create';
    public options: { [name: string]: any };
    public constructor(pg: playground.cwPlayground) {
        super(cwPGCreateTool.toolname, pg);
        this.options = {};
    }
    public activate(options: { [name: string]: any }) {
        super.activate (options);
        this.options = options;
        this.on (events.cwMouseDownEvent.type, (ev: events.cwMouseDownEvent) => {
            const object = this._pg.createEntity (this.options.createType, this.options.name||null, !!this.options.failOnExists, this.options);
            object.worldTranslation = { x: ev.x, y: ev.y };
            object.collapseTransform ();
        });
    }
    public deactivate() {
        this.off (events.cwMouseDownEvent.type);
        this.options = {};
        super.deactivate ();
    }
}