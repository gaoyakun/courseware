import * as core from './lib/core';
import {KeyCode} from './lib/keycode';

core.cwScene.init ();
let view = core.cwScene.addView (document.querySelector('#test-canvas'));
view.on ('@mousedown', (ev:core.cwEvent) => {
    core.cwScene.setCapture (view);
    const e = ev as core.cwMouseDownEvent;
    console.log ('mouse down:' + e.x + ',' + e.y);
});
view.on ('@mouseup', (ev:core.cwEvent) => {
    const e = ev as core.cwMouseUpEvent;
    console.log ('mouse up:' + e.x + ',' + e.y);
    core.cwScene.setCapture (null);
});
view.on ('@click', (ev:core.cwEvent) => {
    const e = ev as core.cwClickEvent;
    console.log ('mouse click:' + e.x + ',' + e.y);
});
view.on ('@dblclick', (ev:core.cwEvent) => {
    const e = ev as core.cwDblClickEvent;
    console.log ('mouse double click:' + e.x + ',' + e.y);
});
view.on ('@mousemove', (ev:core.cwEvent) => {
    const e = ev as core.cwMouseMoveEvent;
    //console.log ('mouse move:' + e.x + ',' + e.y);
});
view.on('@mouseleave', (ev:core.cwEvent) => {
    const e = ev as core.cwMouseLeaveEvent;
    //console.log ('mouse leave:' + e.x + ',' + e.y);
});
view.on('@mouseenter', (ev:core.cwEvent) => {
    const e = ev as core.cwMouseEnterEvent;
    //console.log ('mouse enter:' + e.x + ',' + e.y);
});
view.on('@focus', (ev:core.cwEvent) => {
    const e = ev as core.cwFocusEvent;
    console.log ('focus:' + e.focus);
});
view.on('@focus', (ev:core.cwEvent) => {
    const e = ev as core.cwFocusEvent;
    console.log ('focus:' + e.focus);
});
view.on('@keydown', (ev:core.cwEvent) => {
    const e = ev as core.cwKeyDownEvent;
    console.log (`keydown: code=${KeyCode[e.keyCode]} key=${e.key} shift=${e.shiftDown} alt=${e.altDown} ctrl=${e.ctrlDown} meta=${e.metaDown}`);
});
view.on('@keyup', (ev:core.cwEvent) => {
    const e = ev as core.cwKeyDownEvent;
    console.log (`keyup: code=${KeyCode[e.keyCode]} key=${e.key} shift=${e.shiftDown} alt=${e.altDown} ctrl=${e.ctrlDown} meta=${e.metaDown}`);
});
view.on('@keypress', (ev:core.cwEvent) => {
    const e = ev as core.cwKeyDownEvent;
    console.log (`keypress: code=${KeyCode[e.keyCode]} key=${e.key} shift=${e.shiftDown} alt=${e.altDown} ctrl=${e.ctrlDown} meta=${e.metaDown}`);
});

let angle = 0;
const testNode = new core.cwSceneObject(view.rootNode);
testNode.on(core.cwCullEvent.type, (evt:core.cwEvent) => {
    const cullEvent = evt as core.cwCullEvent;
    cullEvent.addObject (testNode, testNode.z, testNode.worldTransform);
});
testNode.on(core.cwUpdateEvent.type, (evt:core.cwEvent) => {
    testNode.localTransform.makeIdentity ();
    testNode.localTransform.rotate (angle);
    testNode.localTransform.translate (100, 100);
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
testNode.on(core.cwHitTestEvent.type, (evt:core.cwEvent) => {
    const hittestEvent = evt as core.cwHitTestEvent;
    hittestEvent.result = hittestEvent.x >= -50 && hittestEvent.x < 50 && hittestEvent.y >= -50 && hittestEvent.y < 50;
});
testNode.on(core.cwMouseEnterEvent.type, (evt:core.cwEvent) => {
    console.log ('Mouse entered');
});
testNode.on(core.cwMouseLeaveEvent.type, (evt:core.cwEvent) => {
    console.log ('Mouse leaved');
});
core.cwApp.run ();


