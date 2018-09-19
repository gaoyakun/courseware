import * as core from './lib/core';
import {KeyCode} from './lib/keycode';

core.cwScene.init ();
let view = core.cwScene.addView (document.querySelector('#test-canvas'));

let angle = 0;
let scale = 0;
const testNode = new core.cwSceneObject(view.rootNode);
testNode.on(core.cwUpdateEvent.type, (evt:core.cwEvent) => {
    testNode.localTransform.makeIdentity ();
    testNode.localTransform.translate (100, 100);
    const s = Math.sin(scale)*0.5 + 1;
    const c = Math.cos(scale)*0.5 + 1;
    testNode.localTransform.scale (s, c)
    testNode.localTransform.rotate (angle);
    angle += 0.05;
    scale += 0.1;
});
testNode.addComponent(new core.cwcImage('images/return.png', 60, 60));
testNode.on (core.cwClickEvent.type, (ev:core.cwEvent) => {
    console.log ('clicked');
});
core.cwApp.run ();


