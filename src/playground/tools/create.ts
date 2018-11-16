import * as events from '../../lib/events';
import * as playground from '../playground';
import * as commands from '../commands';

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
            this._pg.executeCommand (cmd);
        });
    }
    public deactivate() {
        this.off (events.cwMouseDownEvent.type);
        this.options = {};
        super.deactivate ();
    }
}