import * as lib from './lib'
import * as pg from './playground'

const hullA = new lib.cwBoundingHull ();
[{ x:30, y:50 },{ x:60, y:40 },{ x:60, y:20 },{ x:50, y:0 },{ x:20, y:10 },{ x:0, y:40 }].forEach (point => {
    hullA.addPoint (point);
});

const hullB = new lib.cwBoundingHull ();
[{ x:300, y:500 },{ x:600, y:400 },{ x:600, y:200 },{ x:500, y:0 },{ x:200, y:100 },{ x:0, y:400 }].forEach (point => {
    hullB.addPoint (point);
});

const segmentA = new lib.cwBoundingSegment ();
segmentA.start = { x:-30, y:0 };
segmentA.end = { x:0, y: 0 };

const segmentB = new lib.cwBoundingSegment ();
segmentB.start = { x: 0, y: 0 };
segmentB.end = { x: 0, y: 17 };

const sphereA = new lib.cwBoundingSphere ({ center:{x:0, y:0}, radius: 50});
const sphereB = new lib.cwBoundingSphere ({ center:{x:0, y:0}, radius: 20});

const boxA = new lib.cwBoundingBox ({ x:-30, y:-30, w:61, h:61 });

const nodes: lib.cwSceneObject[] = [];
let view = lib.cwScene.addCanvas (document.querySelector('#test-canvas'), true);

function collideTest () {
    const shapes = nodes.map (node => node.boundingShape.getTransformedShape(node.worldTransform));
    const flags = nodes.map (node => 0);
    for (let i = 0; i < shapes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
            if (lib.cwIntersectionTestShapeShape (shapes[i], shapes[j])) {
                flags[i]++;
                flags[j]++;
            }
        }
    }
    for (let i = 0; i < flags.length; i++) {
        nodes[i].drawColor = flags[i] ? '#f00' : '#000';
    }
}

function createArrowNode (x: number, y: number): lib.cwSceneObject {
    const node = new pg.cwPGArrow (view.rootNode, {
        lineWidth: 5,
        arrowLen: 25,
        style: 'double',
        color: '#ff00ff',
        positionFromX: -20,
        positionFromY: 50,
        positionToX: 40,
        positionToY: 10
    });
    node.translation = { x:x, y:y };
    node.rotation = Math.random() * Math.PI * 2;
    node.addComponent (new lib.cwcDraggable());
    node.on (lib.cwDragBeginEvent.type, (ev: lib.cwDragBeginEvent) => {
        node.dragBeginX = ev.x;
        node.dragBeginY = ev.y;
    });
    node.on (lib.cwDraggingEvent.type, (ev:lib.cwDragOverEvent) => {
        const t = node.worldTransform;
        node.worldTranslation = { x:t.e + ev.x - node.dragBeginX, y:t.f + ev.y - node.dragBeginY };
        node.collapseTransform ();
        node.dragBeginX = ev.x;
        node.dragBeginY = ev.y;
    });
    return node;
}
function createCircleNode (sphere: lib.cwBoundingSphere, x: number, y: number): lib.cwSceneObject {
    const testNode = new lib.cwSceneObject(view.rootNode);
    testNode.z = 999;
    testNode.translation = { x:x, y:y };
    testNode.scale = { x:1.3, y: 0.6 };
    testNode.rotation = Math.random() * Math.PI;
    testNode.anchorPoint = { x:0.5, y:0.5 };
    testNode.addComponent (new lib.cwcDraggable());
    testNode.on(lib.cwGetBoundingShapeEvent.type, (ev: lib.cwGetBoundingShapeEvent) => {
        ev.shape = sphere;
    });
    testNode.on (lib.cwDrawEvent.type, (ev: lib.cwDrawEvent) => {
        ev.canvas.context.beginPath ();
        ev.canvas.context.ellipse (0, 0, sphere.radius, sphere.radius, 0, 0, Math.PI * 2);
        ev.canvas.context.closePath ();
        ev.canvas.context.fillStyle = testNode.drawColor || '#000';
        ev.canvas.context.fill ();
    });
    testNode.on (lib.cwDragBeginEvent.type, (ev: lib.cwDragBeginEvent) => {
        testNode.dragBeginX = ev.x;
        testNode.dragBeginY = ev.y;
    });
    testNode.on (lib.cwDraggingEvent.type, (ev:lib.cwDragOverEvent) => {
        const t = testNode.worldTransform;
        testNode.worldTranslation = { x:t.e + ev.x - testNode.dragBeginX, y:t.f + ev.y - testNode.dragBeginY };
        testNode.collapseTransform ();
        testNode.dragBeginX = ev.x;
        testNode.dragBeginY = ev.y;
    });
    return testNode;
}

function createSegmentNode (segment: lib.cwBoundingSegment, x:number, y:number): lib.cwSceneObject {
    const testNode = new lib.cwSceneObject(view.rootNode);
    testNode.translation = { x:x, y:y };
    //testNode.rotation = Math.random () * Math.PI * 2;
    testNode.anchorPoint = { x:0.5, y:0.5 };
    testNode.addComponent (new lib.cwcDraggable());
    testNode.on(lib.cwGetBoundingShapeEvent.type, (ev: lib.cwGetBoundingShapeEvent) => {
        ev.shape = segment;
    });
    testNode.on (lib.cwDrawEvent.type, (ev: lib.cwDrawEvent) => {
        const v = lib.cwGetVector (segment.start, segment.end);
        const d = lib.cwVectorLength (v);
        const w = 2;
        const dx = w * v.y / d;
        const dy = w * v.x / d;
        ev.canvas.context.beginPath ();
        ev.canvas.context.strokeStyle = testNode.drawColor || '#000';
        ev.canvas.context.fillStyle = testNode.drawColor || '#000';
        ev.canvas.context.lineWidth = 1;
        /*
        ev.canvas.context.moveTo (segment.start.x, segment.start.y);
        ev.canvas.context.lineTo (segment.end.x, segment.end.y);
        ev.canvas.context.stroke ();
        */
        ev.canvas.context.moveTo (segment.start.x + dx, segment.start.y + dy);
        ev.canvas.context.lineTo (segment.start.x - dx, segment.start.y - dy);
        ev.canvas.context.lineTo (segment.end.x - dx, segment.end.y - dy);
        ev.canvas.context.lineTo (segment.end.x + dx, segment.end.y + dy);
        ev.canvas.context.closePath ();
        ev.canvas.context.stroke ();
        ev.canvas.context.fill ();
        /*
        const bbox = segment.getBoundingbox();
        ev.canvas.context.strokeRect (bbox.x, bbox.y, bbox.w, bbox.h);
        */
    });
    testNode.on (lib.cwDragBeginEvent.type, (ev: lib.cwDragBeginEvent) => {
        testNode.dragBeginX = ev.x;
        testNode.dragBeginY = ev.y;
    });
    testNode.on (lib.cwDraggingEvent.type, (ev:lib.cwDragOverEvent) => {
        const t = testNode.worldTransform;
        testNode.worldTranslation = { x:t.e + ev.x - testNode.dragBeginX, y:t.f + ev.y - testNode.dragBeginY };
        testNode.collapseTransform ();
        testNode.dragBeginX = ev.x;
        testNode.dragBeginY = ev.y;
    });
    return testNode;
}

function createHullNode (hull: lib.cwBoundingHull, x:number, y:number): lib.cwSceneObject {
    const testNode = new lib.cwSceneObject(view.rootNode);
    testNode.translation = { x:x, y:y};
    testNode.rotation = Math.random () * Math.PI * 2;
    testNode.anchorPoint = { x:0, y:0 };
    testNode.addComponent (new lib.cwcDraggable ());
    testNode.on(lib.cwGetBoundingShapeEvent.type, (ev: lib.cwGetBoundingShapeEvent) => {
        ev.shape = hull;
    });
    testNode.on (lib.cwDrawEvent.type, (ev: lib.cwDrawEvent) => {
        ev.canvas.context.beginPath ();
        ev.canvas.context.fillStyle = testNode.drawColor || '#000';
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
    });
    testNode.on (lib.cwDragEndEvent.type, (ev: lib.cwDragDropEvent) => {
        console.log ('drag end');
        delete testNode.dragBeginX;
        delete testNode.dragBeginY;
    });
    return testNode;
}

nodes.push (createHullNode (hullA, 200, 200));
nodes.push (createHullNode (hullB, 300, 300));
nodes.push (createSegmentNode (segmentA, 400, 60));
nodes.push (createSegmentNode (segmentB, 100, 200));
nodes.push (createCircleNode (sphereA, 400, 200));
nodes.push (createCircleNode (sphereB, 200, 100));
nodes.push (createArrowNode (60, 250));
view.on (lib.cwMouseMoveEvent.type, (ev: lib.cwMouseMoveEvent) => {
    console.log (`${ev.x}, ${ev.y}`);
});
view.on (lib.cwFrameEvent.type, (ev: lib.cwFrameEvent) => {
    collideTest ();
});
lib.cwScene.init ();
lib.cwApp.run ();


