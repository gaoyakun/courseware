import * as lib from 'libcatk';
import * as select from './select';
import * as playground from '../playground';

export class cwPGSwapComponent extends lib.Component {
    static readonly type = 'PGSelect';
    readonly tool: cwPGSwapTool;
    public selected: boolean;
    constructor(tool: cwPGSwapTool) {
        super(cwPGSwapComponent.type);
        this.tool = tool;
        this.selected = false;
        this.on(lib.EvtMouseDown.type, (ev: lib.EvtMouseDown) => {
            if (this.tool.currentObject) {
                (this.tool.currentObject.getComponent (cwPGSwapComponent.type, 0) as cwPGSwapComponent).selected = false;
            } else {
                this.selected = true;
            }
            this.tool.selectObject(this.object as lib.SceneObject, ev);
        });
        this.on(lib.EvtDraw.type, (evt: lib.EvtDraw) => {
            if (this.selected) {
                const shape = (this.object as lib.SceneObject).boundingShape;
                if (shape) {
                    const bbox = shape.getBoundingbox ();
                    evt.canvas.context.strokeStyle = '#000';
                    evt.canvas.context.lineWidth = 1;
                    evt.canvas.context.strokeRect (bbox.x, bbox.y, bbox.w, bbox.h);
                }
            }
        });
    }
}

export class cwPGSwapTool extends playground.cwPGTool {
    public static readonly toolname: string = 'Swap';
    private _curObject: lib.SceneObject;
    public constructor(pg: playground.cwPlayground) {
        super(cwPGSwapTool.toolname, pg);
        this._curObject = null;
    }
    get currentObject () {
        return this._curObject;
    }
    public activate(options?: any) {
        super.activate (options);
        this._curObject = null;
    }
    public deactivate() {
        if (this._curObject) {
            this._curObject.triggerEx(new select.cwPGDeselectEvent());
            this._curObject = null;
        }
        super.deactivate ();
    }
    public activateObject(object: lib.SceneObject) {
        this.deactivateObject (object);
        object.addComponent(new cwPGSwapComponent(this));
    }
    public deactivateObject(object: lib.SceneObject) {
        object.removeComponentsByType(cwPGSwapComponent.type);
    }
    public selectObject(object: lib.SceneObject, ev: lib.EvtMouse) {
        if (this._curObject == null) {
            this._curObject = object;
        } else if (this._curObject !== object) {
            this.swapObject (this._curObject, object, 200);
            this._curObject = null;
        } else {
            this._curObject = null;
        }
    }
    private swapObject (object1: lib.SceneObject, object2: lib.SceneObject, animationDuration:number) {
        const t1 = object1.translation;
        const t2 = object2.translation;
        (object2.getComponents (lib.CoKeyframeAnimation.type)||[]).forEach (comp=>{
            (comp as lib.CoKeyframeAnimation).finish ();
            object2.removeComponentsByType (lib.CoKeyframeAnimation.type);
        });
        object2.addComponent (new lib.CoKeyframeAnimation({
            delay:0,
            repeat:1,
            exclusive:true,
            tracks: {
                translation: {
                    cp: [{x:0,y:[t2.x,t2.y]}, {x:animationDuration,y:[t1.x,t1.y]}],
                    type: lib.SplineType.LINEAR
                }
            }
        }));
        object1.addComponent (new lib.CoKeyframeAnimation({
            delay:0,
            repeat:1,
            exclusive:true,
            tracks: {
                translation: {
                    cp: [{x:0,y:[t1.x,t1.y]}, {x:animationDuration,y:[t2.x,t2.y]}],
                    type: lib.SplineType.LINEAR
                }
            }
        }));
    }
}