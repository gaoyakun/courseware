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
segmentA.start = { x:-30, y:0 };
segmentA.end = { x:0, y: 0 };

const segmentB = new lib.cwBoundingSegment ();
segmentB.start = { x: 0, y: 0 };
segmentB.end = { x: 0, y: 17 };

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
        ev.canvas.context.beginPath ();
        ev.canvas.context.strokeStyle = testNode.drawColor || '#000';
        ev.canvas.context.lineWidth = 1;
        ev.canvas.context.moveTo (segment.start.x, segment.start.y);
        ev.canvas.context.lineTo (segment.end.x, segment.end.y);
        ev.canvas.context.stroke ();
        //const bbox = segment.getBoundingbox();
        //ev.canvas.context.strokeRect (bbox.x, bbox.y, bbox.w, bbox.h);
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
nodes.push (createSegmentNode (segmentA, 400, 0));
nodes.push (createSegmentNode (segmentB, 0, 200));

view.on (lib.cwMouseMoveEvent.type, (ev: lib.cwMouseMoveEvent) => {
    console.log (`${ev.x}, ${ev.y}`);
});
view.on (lib.cwFrameEvent.type, (ev: lib.cwFrameEvent) => {
    collideTest ();
});
lib.cwScene.init ();
lib.cwApp.run ();


