import { cwApp, cwScene, cwSceneObject } from './lib/core';
import { cwcKeyframeAnimation, cwcImage, cwcDraggable } from './lib/components';
import { cwEvent, cwClickEvent, cwMouseDownEvent, cwMouseUpEvent } from './lib/events';
import { cwSplineType } from './lib/curve';

cwScene.init ();
let view = cwScene.addView (document.querySelector('#test-canvas'), true);
const testNode = new cwSceneObject(view.rootNode);
testNode.translation = { x:100, y:100 };
testNode.addComponent(new cwcImage('images/return.png', 60, 60));
testNode.addComponent(new cwcKeyframeAnimation({
    repeat:0,
    autoRemove:true,
    tracks:{
        rotation: {
            type:cwSplineType.LINEAR,
            cp:[{x:0,y:0}, {x:4000,y:Math.PI*32}]            
        },
        scale: {
            type:cwSplineType.POLY,
            cp:[{x:0,y:[1,1]},{x:2000,y:[3,3]},{x:4000,y:[1,1]}]
        }
    }
}));
testNode.addComponent(new cwcDraggable());
cwApp.run ();


