import * as point from './point';
import * as shape from './boundingshape';
import * as boundinghull from './boundinghull';
import * as boundingbox from './boundingbox';
import * as segment from './segment';

export function cwIntersectionTestShapeSegment (a: shape.cwBoundingShape, b: segment.ISegment2d): point.IPoint2d[] {
    const box = a.getBoundingbox ();
    if (!box) {
        return [];
    }
    switch (a.type) {
        case boundingbox.cwBoundingBox.type: {
            return cwIntersectionTestBoxSegment ((a as boundingbox.cwBoundingBox).rect, b);
        }
        case boundinghull.cwBoundingHull.type: {
            return cwIntersectionTestHullSegment ((a as boundinghull.cwBoundingHull).points, b);
        }
        default: {
            return [];
        }
    }
}

export function cwIntersectionTestShapePoint (a: shape.cwBoundingShape, b: point.IPoint2d): boolean {
    const box = a.getBoundingbox ();
    if (!cwIntersectionTestBoxPoint (box, b)) {
        return false;
    }
    switch (a.type) {
        case boundingbox.cwBoundingBox.type: {
            return true;
        }
        case boundinghull.cwBoundingHull.type: {
            return cwIntersectionTestHullPoint ((a as boundinghull.cwBoundingHull).points, b);
        }
        default: {
            return false;
        }
    }
}
export function cwIntersectionTestShapeShape (a: shape.cwBoundingShape, b: shape.cwBoundingShape): boolean {
    const box_a = a.getBoundingbox ();
    const box_b = b.getBoundingbox ();
    if (!cwIntersectionTestBoxBox (box_a, box_b)) {
        return false;
    }
    switch (a.type) {
    case boundingbox.cwBoundingBox.type: {
        switch (b.type) {
            case boundingbox.cwBoundingBox.type: {
                return true;
            }
            case boundinghull.cwBoundingHull.type: {
                return cwIntersectionTestBoxHull ((a as boundingbox.cwBoundingBox).rect, (b as boundinghull.cwBoundingHull).points);
            }
            default: {
                return false;
            }
        }
    }
    case boundinghull.cwBoundingHull.type: {
            switch (b.type) {
                case boundingbox.cwBoundingBox.type: {
                    return cwIntersectionTestBoxHull ((b as boundingbox.cwBoundingBox).rect, (a as boundinghull.cwBoundingHull).points);
                }
            case boundinghull.cwBoundingHull.type: {
                    return cwIntersectionTestHullHull ((a as boundinghull.cwBoundingHull).points, (b as boundinghull.cwBoundingHull).points);
                }
            default: {
                    return false;
                }
            }
        }
    }
}

export function cwIntersectionTestBoxBox (a: point.IRect2d, b: point.IRect2d): boolean {
    return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
}

export function cwIntersectionTestBoxPoint (a: point.IRect2d, b: point.IPoint2d): boolean {
    return b.x >= a.x && b.x <= a.x + a.w && b.y >= a.y && b.y <= a.y + a.h;
}

export function cwIntersectionTestBoxHull (a: point.IRect2d, b: point.IPoint2d[]) {
    return cwIntersectionTestHullHull ([ point.cwGetTopLeft(a), point.cwGetBottomLeft(a), point.cwGetBottomRight(a), point.cwGetTopRight(a) ], b);
}

export function cwIntersectionTestBoxSegment (a: point.IRect2d, b: segment.ISegment2d): point.IPoint2d[] {
    // TODO:
    return [];
}

export function cwIntersectionTestHullPoint (a: point.IPoint2d[], b: point.IPoint2d): boolean {
    for (let i = 1; i < a.length; i++) {
        const v1 = point.cwGetVector(b, a[i]);
        const v2 = point.cwGetVector(b, a[i-1]);
        if (point.cwCrossProduct (v1, v2) > 0) {
            return false;
        }
    }
    return true;
}

export function cwIntersectionTestHullSegment (a: point.IPoint2d[], b: segment.ISegment2d): point.IPoint2d[] {
    const result = [];
    for (let i = 1; i < a.length; i++) {
        const edge = {
            start: a[i-1],
            end: a[i]
        }
        const intersectedPoint = segment.cwSegmentIntersect (edge, b);
        if (intersectedPoint) {
            result.push (intersectedPoint);
        }
    }
    if (result.length > 1) {
        result.sort ((p, q) => {
            return point.cwDistanceSq (p, b.start) - point.cwDistanceSq (q, b.start);
        });
    }
    return result;
}

export function cwIntersectionTestHullHull (a: point.IPoint2d[], b: point.IPoint2d[]): boolean {
    const polygons = [ a, b ];
    for (let n = 0; n < 2; n++) {
        const polygon = polygons[n];
        for (let edge = 0; edge < polygon.length; edge++) {
            const edgeX = polygon[(edge+1)%polygon.length].x - polygon[edge].x;
            const edgeY = polygon[(edge+1)%polygon.length].y - polygon[edge].y;
            const mag = Math.sqrt(edgeX*edgeX + edgeY*edgeY);
            if (mag < 1) {
                continue;
            }
            const nx = -edgeY/mag;
            const ny = edgeX/mag;
            const minmax = [{min:polygon[0].x,max:polygon[0].y}, {min:polygon[1].x,max:polygon[1].y}];
            for (let i = 0; i < 2; i++) {
                polygons[i].forEach (point => {
                    const proj = point.x * nx + point.y * ny;
                    if (proj < minmax[i].min) {
                        minmax[i].min = proj;
                    } else if (proj > minmax[i].max) {
                        minmax[i].max = proj;
                    }
                });
            }
            if (minmax[0].min > minmax[1].max || minmax[0].max < minmax[1].min) {
                return false;
            }
        }
    }
    return true;
}