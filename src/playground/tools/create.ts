import * as lib from '../../lib';
import * as playground from '../playground';
import * as commands from '../commands';

export class cwPGCreateTool extends playground.cwPGTool {
    public static readonly toolname: string = 'Create';
    public options: { [name: string]: any };
    private _factoryProperties: playground.IProperty[];
    private _creationParams: { [name:string]: any };
    public constructor(pg: playground.cwPlayground) {
        super(cwPGCreateTool.toolname, pg);
        this.options = {};
        this._factoryProperties = null;
        this._creationParams = {};
    }
    public activate(options: any) {
        this.options = options;
        this._factoryProperties = this._pg.getFactory (options.createType).getCreationProperties();
        this._creationParams = {};
        if (this._factoryProperties) {
            this._factoryProperties.forEach (prop => {
                this._creationParams[prop.name] = prop.value;
            });
        }
        this.on (lib.cwMouseDownEvent.type, (ev: lib.cwMouseDownEvent) => {
            const cmd: commands.IPGCommand  = {
                command: 'CreateObject',
                type: this.options.createType,
                name: null,
            };
            for (const arg in this.options) {
                if (arg !== 'command' && arg !== 'createType' && arg !== 'type') {
                    cmd[arg] = this.options[arg];
                }
            }
            cmd.x = ev.x;
            cmd.y = ev.y;
            cmd.params = this._creationParams;
            this._pg.executeCommand (cmd);
        });
        this.on(playground.cwPGGetPropertyEvent.type, (ev: playground.cwPGGetPropertyEvent) => {
            if (ev.name in this._creationParams) {
                ev.value = this._creationParams[ev.name];
            }
        });
        this.on(playground.cwPGSetPropertyEvent.type, (ev: playground.cwPGSetPropertyEvent) => {
            if (ev.name in this._creationParams) {
                this._creationParams[ev.name] = ev.value;
            }
        });
        this.on(playground.cwPGGetPropertyListEvent.type, (ev: playground.cwPGGetPropertyListEvent) => {
            if (this._factoryProperties && this._factoryProperties.length > 0) {
                ev.properties = ev.properties || {};
                ev.properties[this.options.createType] = ev.properties[this.options.createType] || { desc: this.options.createType, properties: []};
                ev.properties[this.options.createType].properties = this._factoryProperties;
            }
        });
        super.activate (options);
    }
    public deactivate() {
        this.off (lib.cwMouseDownEvent.type);
        this.options = {};
        super.deactivate ();
    }
}