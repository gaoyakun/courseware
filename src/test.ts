import { cwApp, cwScene, cwSceneObject, cwDragOverEvent, cwDragDropEvent, cwDragBeginEvent } from './lib/core';
import { cwcKeyframeAnimation, cwcImage, cwcDraggable } from './lib/components';
import { cwSplineType } from './lib/curve';

cwScene.init ();
let view = cwScene.addCanvas (document.querySelector('#test-canvas'), true);
const testNode = new cwSceneObject(view.rootNode);
const frameAnimation = new cwcKeyframeAnimation({
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
});
testNode.translation = { x:100, y:100 };
testNode.addComponent(new cwcImage('images/return.png', 60, 60));
testNode.addComponent(frameAnimation);
testNode.addComponent(new cwcDraggable());
testNode.on (cwDragBeginEvent.type, function(ev:cwDragBeginEvent) {
    this.removeComponent (frameAnimation);
});
view.on (cwDragOverEvent.type, function(ev:cwDragOverEvent) {
    ev.object.worldTranslation = {x:ev.x, y:ev.y};
});
view.on (cwDragDropEvent.type, function(ev:cwDragDropEvent) {
    ev.object.worldTranslation = null;;
    testNode.addComponent (frameAnimation);
});
cwApp.run ();


