import * as tool from './tool';
import * as core from '../../lib/core';
import * as events from '../../lib/events';
import * as select from './select';
import * as components from '../../lib/components';
import * as curve from '../../lib/curve';

export class cwPGSwapComponent extends core.cwComponent {
    static readonly type = 'PGSelect';
    readonly tool: cwPGSwapTool;
    constructor(tool: cwPGSwapTool) {
        super(cwPGSwapComponent.type);
        this.tool = tool;
        this.on(events.cwMouseDownEvent.type, (ev: events.cwMouseDownEvent) => {
            if (this.object) {
                this.tool.selectObject(this.object as core.cwSceneObject, ev);
            }
        });
    }
}

export class cwPGSwapTool extends tool.cwPGTool {
    public static readonly toolname: string = 'PGTool_Swap';
    private _curObject: core.cwSceneObject;
    public constructor() {
        super(cwPGSwapTool.toolname);
        this._curObject = null;
    }
    public activate() {
        super.activate ();
        this._curObject = null;
    }
    public deactivate() {
        if (this._curObject) {
            this._curObject.triggerEx(new select.cwPGDeselectEvent());
            this._curObject = null;
        }
        super.deactivate ();
    }
    public activateObject(object: core.cwSceneObject) {
        this.deactivateObject (object);
        object.addComponent(new cwPGSwapComponent(this));
    }
    public deactivateObject(object: core.cwSceneObject) {
        object.removeComponentsByType(cwPGSwapComponent.type);
    }
    public selectObject(object: core.cwSceneObject, ev: events.cwMouseEvent) {
        if (this._curObject == null) {
            this._curObject = object;
            object.triggerEx(new select.cwPGSelectEvent(ev.x, ev.y, ev.button, ev.shiftDown, ev.altDown, ev.ctrlDown, ev.metaDown));
        } else if (this._curObject !== object) {
            this._curObject.triggerEx(new select.cwPGDeselectEvent());
            this.swapObject (this._curObject, object, 200);
            this._curObject = null;
        }
    }
    private swapObject (object1: core.cwSceneObject, object2: core.cwSceneObject, animationDuration:number) {
        const t1 = object1.translation;
        const t2 = object2.translation;
        (object2.getComponents (components.cwcKeyframeAnimation.type)||[]).forEach (comp=>{
            (comp as components.cwcKeyframeAnimation).finish ();
            object2.removeComponentsByType (components.cwcKeyframeAnimation.type);
        });
        object2.addComponent (new components.cwcKeyframeAnimation({
            delay:0,
            repeat:1,
            exclusive:true,
            tracks: {
                translation: {
                    cp: [{x:0,y:[t2.x,t2.y]}, {x:animationDuration,y:[t1.x,t1.y]}],
                    type: curve.cwSplineType.LINEAR
                }
            }
        }));
        object1.addComponent (new components.cwcKeyframeAnimation({
            delay:0,
            repeat:1,
            exclusive:true,
            tracks: {
                translation: {
                    cp: [{x:0,y:[t1.x,t1.y]}, {x:animationDuration,y:[t2.x,t2.y]}],
                    type: curve.cwSplineType.LINEAR
                }
            }
        }));
    }
}