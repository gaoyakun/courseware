import * as core from './lib/core';
import {Transform2d} from './lib/transform';

core.cwScene.init ();
let view = core.cwScene.addView (document.querySelector('#test-canvas'));
view.on ('@mousedown', (ev:core.cwEvent) => {
    console.log ('mouse down');
});
view.on ('@mouseup', (ev:core.cwEvent) => {
    console.log ('mouse up');
});
view.on ('@click', (ev:core.cwEvent) => {
    console.log ('mouse click');
});
view.on ('@dblclick', (ev:core.cwEvent) => {
    console.log ('mouse double click');
});

let angle = 0;
const testNode = new core.cwSceneObject(view.rootNode);
testNode.on(core.cwCullEvent.type, (evt:core.cwEvent) => {
    const cullEvent = evt as core.cwCullEvent;
    cullEvent.addObject (testNode, testNode.z, testNode.worldTransform);
});
testNode.on(core.cwUpdateEvent.type, (evt:core.cwEvent) => {
    testNode.localTransform.makeIdentity ();
    testNode.localTransform.translate (100, 100);
    testNode.localTransform.rotate (angle);
    angle += 0.1;
});
testNode.on(core.cwDrawEvent.type, (evt:core.cwEvent) => {
    const drawEvent = evt as core.cwDrawEvent;
    drawEvent.canvas.context.save();
    drawEvent.canvas.applyTransform (drawEvent.transform);
    drawEvent.canvas.context.fillStyle = '#fff';
    drawEvent.canvas.context.fillRect (-50,-50,100,100);
    drawEvent.canvas.context.restore();
});
core.cwApp.run ();


