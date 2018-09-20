import { cwApp, cwScene, cwSceneObject } from './lib/core';
import { cwUpdateEvent, cwEvent, cwClickEvent } from './lib/events';
import { cwcImage } from './lib/components';

cwScene.init ();
let view = cwScene.addView (document.querySelector('#test-canvas'));

let angle = 0;
let scale = 0;
const testNode = new cwSceneObject(view.rootNode);
testNode.on(cwUpdateEvent.type, (evt:cwEvent) => {
    testNode.localTransform.makeIdentity ();
    testNode.localTransform.translate (100, 100);
    const s = Math.sin(scale)*0.5 + 1;
    const c = Math.cos(scale)*0.5 + 1;
    testNode.localTransform.scale (s, c)
    testNode.localTransform.rotate (angle);
    angle += 0.05;
    scale += 0.1;
});
testNode.addComponent(new cwcImage('images/return.png', 60, 60));
testNode.on (cwClickEvent.type, (_:cwEvent) => {
    console.log ('clicked');
});
cwApp.run ();


