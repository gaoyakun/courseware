import * as lib from '../../lib';
import * as commands from '../commands';
import * as playground from '../playground';
import * as objects from '../objects';

export class cwPGHandWritingTool extends playground.cwPGTool {
    public static readonly toolname: string = 'HandWriting';
    private _freedrawNode: objects.cwPGFreeDraw;
    private _paramsDraw: any;
    private _paramsErase: any;
    private _mode: string;
    private applyProperty (name:string, value:any) {
        if (this._freedrawNode) {
            this._freedrawNode.triggerEx (new playground.cwPGSetPropertyEvent (name, value));
        }
    }
    private applyProperties (props: any) {
        for (const prop in props) {
            this.applyProperty (prop, props[prop]);
        }
    }
    private findFreedrawNode (rootNode?: lib.cwSceneObject): objects.cwPGFreeDraw {
        const root = rootNode || this._pg.view.rootNode;
        if (root.entityType === 'FreeDraw') {
            return root as objects.cwPGFreeDraw;
        } else {
            for (let i = 0; i < root.numChildren; i++) {
                const result = this.findFreedrawNode (root.childAt (i));
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
    public constructor(pg: playground.cwPlayground) {
        super(cwPGHandWritingTool.toolname, pg);
        this._freedrawNode = null;
        this._mode = 'draw';
        this._paramsDraw = {
            color: '#000',
            lineWidth: 2,
            curveMode: 0
        };
        this._paramsErase = {
            eraseSize: 20
        };
        this.on(playground.cwPGGetPropertyEvent.type, (ev: playground.cwPGGetPropertyEvent) => {
            let params = null;
            if (this._mode === 'draw') {
                params = this._paramsDraw;
            } else if (this._mode === 'erase') {
                params = this._paramsErase;
            }
            if (params && ev.name in params) {
                ev.value = params[ev.name];
            }
        });
        this.on(playground.cwPGSetPropertyEvent.type, (ev: playground.cwPGSetPropertyEvent) => {
            let params = null;
            if (this._mode === 'draw') {
                params = this._paramsDraw;
            } else if (this._mode === 'erase') {
                params = this._paramsErase;
            }
            if (params && ev.name in params) {
                params[ev.name] = ev.value;
                this.applyProperty (ev.name, ev.value);
            }
        });
        this.on(playground.cwPGGetPropertyListEvent.type, (ev: playground.cwPGGetPropertyListEvent) => {
            ev.properties = ev.properties || {};
            if (this._mode === 'draw') {
                ev.properties[this.name] = ev.properties[this.name] || { desc: '画笔工具', properties: []};
                ev.properties[this.name].properties.push ({
                    name: 'color',
                    desc: '画笔颜色',
                    readonly: false,
                    type: 'color',
                    value: this._paramsDraw.color
                });
                ev.properties[this.name].properties.push ({
                    name: 'lineWidth',
                    desc: '画笔粗细',
                    readonly: false,
                    type: 'number',
                    value: this._paramsDraw.lineWidth
                });
                ev.properties[this.name].properties.push ({
                    name: 'curveMode',
                    desc: '平滑模式',
                    readonly: false,
                    type: 'number',
                    value: this._paramsDraw.curveMode,
                    enum: [{
                        value: 0,
                        desc: '无'
                    }, {
                        value: 1,
                        desc: '二次样条'
                    }, {
                        value: 2,
                        desc: '三次样条'
                    }]
                });
            } else if (this._mode = 'erase') {
                ev.properties[this.name] = ev.properties[this.name] || { desc: '橡皮工具', properties: []};
                ev.properties[this.name].properties.push ({
                    name: 'eraseSize',
                    desc: '橡皮大小',
                    readonly: false,
                    type: 'number',
                    value: this._paramsErase.eraseSize
                });
            }
        });
    }
    public activate(options: any) {
        this._mode = (options||{}).mode || 'draw';
        this._freedrawNode = this.findFreedrawNode ();
        if (!this._freedrawNode) {
            const cmd: commands.IPGCommand = {
                command: 'CreateObject',
                type: 'FreeDraw',
                name: null,
                x: 0,
                y: 0
            };
            this._pg.executeCommand (cmd);
            this._freedrawNode = cmd.objectCreated;
        }
        this._freedrawNode.mode = this._mode;
        this._freedrawNode.setCapture ();
        this.applyProperties (this._paramsDraw);
        this.applyProperties (this._paramsErase);
        super.activate (options);
    }
    public deactivate() {
        if (this._freedrawNode) {
            this._freedrawNode.releaseCapture();
            this._freedrawNode.mode = 'none';
            this._freedrawNode = null;
        }
        super.deactivate ();
    }
    public activateObject(object: lib.cwSceneObject) {
        super.activateObject (object);
    }
    public deactivateObject(object: lib.cwSceneObject) {
        super.deactivateObject (object);
    }
}