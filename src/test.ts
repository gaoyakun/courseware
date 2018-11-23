import * as lib from './lib'

const hullA = new lib.cwBoundingHull ();
[{ x:30, y:50 },{ x:60, y:40 },{ x:60, y:20 },{ x:50, y:0 },{ x:20, y:10 },{ x:0, y:40 }].forEach (point => {
    hullA.addPoint (point);
});

const hullB = new lib.cwBoundingHull ();
[{ x:30, y:50 },{ x:60, y:40 },{ x:60, y:20 },{ x:50, y:0 },{ x:20, y:10 },{ x:0, y:40 }].forEach (point => {
    hullB.addPoint (point);
});

const segmentA = new lib.cwBoundingSegment ();
segmentA.start = { x:-30, y:-10 };
segmentA.end = { x:50, y: 60 };

const segmentB = new lib.cwBoundingSegment ();
segmentB.start = { x: 5, y: -20 };
segmentB.end = { x: 24, y: 17 };

let hullNode1: lib.cwSceneObject = null;
let hullNode2: lib.cwSceneObject = null;
let segmentNode1: lib.cwSceneObject = null;
let segmentNode2: lib.cwSceneObject = null;

let fillStyle = '#000';

lib.cwScene.init ();
let view = lib.cwScene.addCanvas (document.querySelector('#test-canvas'), true);

function createHullNode (hull: lib.cwBoundingHull, x:number, y:number): lib.cwSceneObject {
    const testNode = new lib.cwSceneObject(view.rootNode);
    testNode.translation = { x:x, y:y};
    testNode.anchorPoint = { x:0, y:0 };
    testNode.addComponent (new lib.cwcDraggable ());
    testNode.on(lib.cwGetBoundingShapeEvent.type, (ev: lib.cwGetBoundingShapeEvent) => {
        ev.shape = hull;
    });
    testNode.on (lib.cwDrawEvent.type, (ev: lib.cwDrawEvent) => {
        ev.canvas.context.beginPath ();
        ev.canvas.context.fillStyle = fillStyle;
        ev.canvas.context.lineWidth = 1;
        const points = hull.points;
        ev.canvas.context.moveTo (points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ev.canvas.context.lineTo (points[i].x, points[i].y);
        }
        ev.canvas.context.closePath ();
        ev.canvas.context.fill ();
    });
    testNode.on (lib.cwClickEvent.type, (ev: lib.cwClickEvent) => {
        const localPt = lib.cwTransform2d.invert(testNode.worldTransform).transformPoint ({x:ev.x, y:ev.y});
        console.log (`${localPt.x},${localPt.y}`);
        if (lib.cwIntersectionTestHullPoint (hullA.points, localPt)) {
            console.log ('Clicked in hull');
        } else {
            console.log ('Clicked not in hull');
        }
    });
    testNode.on (lib.cwDragBeginEvent.type, (ev: lib.cwDragBeginEvent) => {
        console.log ('drag begin');
        testNode.dragBeginX = ev.x;
        testNode.dragBeginY = ev.y;
    });
    testNode.on (lib.cwDraggingEvent.type, (ev:lib.cwDragOverEvent) => {
        console.log ('dragging');
        const t = testNode.worldTransform;
        testNode.worldTranslation = { x:t.e + ev.x - testNode.dragBeginX, y:t.f + ev.y - testNode.dragBeginY };
        testNode.collapseTransform ();
        testNode.dragBeginX = ev.x;
        testNode.dragBeginY = ev.y;

        const worldHullA = hullA.points.map (point => {
            return hullNode1.worldTransform.transformPoint (point);
        });
        const worldHullB = hullB.points.map (point => {
            return hullNode2.worldTransform.transformPoint (point);
        });
        if (lib.cwIntersectionTestHullHull (worldHullA, worldHullB)) {
            fillStyle = '#f00';
        } else {
            fillStyle = '#000';
        }
    });
    testNode.on (lib.cwDragEndEvent.type, (ev: lib.cwDragDropEvent) => {
        console.log ('drag end');
        delete testNode.dragBeginX;
        delete testNode.dragBeginY;
    });
    return testNode;
}

hullNode1 = createHullNode (hullA, 200, 200);
hullNode2 = createHullNode (hullB, 300, 300);

lib.cwApp.run ();


