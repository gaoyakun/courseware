import * as core from './lib/core';

const scene = new core.cwScene(document.querySelector('#test-canvas'));
const testNode = new core.cwSceneObject(scene.rootNode);
testNode.on(core.CullEvent.type, (evt:core.Event) => {
    const cullEvent = evt as core.CullEvent;
    cullEvent.addObject (testNode, testNode.z, testNode.worldTransform);
});
testNode.on(core.DrawEvent.type, (evt:core.Event) => {
    const drawEvent = evt as core.DrawEvent;
    drawEvent.canvas.context.save();
    drawEvent.canvas.applyTransform (drawEvent.transform);
    drawEvent.canvas.context.fillStyle = '#fff';
    drawEvent.canvas.context.fillRect (100,100,100,100);
    drawEvent.canvas.context.restore();
});
testNode.localTransform.translate(100, 0);
testNode.localTransform.rotate(90);
core.cwApp.run ();


