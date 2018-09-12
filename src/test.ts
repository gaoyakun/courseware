import * as core from './lib/core';

const scene = new core.cwScene(document.querySelector('#test-canvas'));
const testNode = new core.cwSceneObject();
const visual = new core.cwcVisual();
visual.on(core.CullEvent.type, (evt:core.Event) => {
    const cullEvent = evt as core.CullEvent;
    cullEvent.addObject (visual.object as core.cwSceneObject);
});
visual.on(core.DrawEvent.type, (evt:core.Event) => {
    const drawEvent = evt as core.DrawEvent;
    drawEvent.canvas.context.save();
    drawEvent.canvas.context.fillStyle = '#fff';
    drawEvent.canvas.context.fillRect (100,100,100,100);
    drawEvent.canvas.context.restore();
});
testNode.addComponent (visual);
scene.rootNode.addChild (testNode);

core.cwApp.run ();


