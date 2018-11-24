import * as point from './point';
import * as shape from './boundingshape';
import * as boundinghull from './boundinghull';
import * as boundingbox from './boundingbox';
import * as boundingsegment from './boundingsegment';

export function cwIntersectionTestShapeSegment (a: shape.cwBoundingShape, b: point.ISegment2d): point.IPoint2d[] {
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
        case boundingsegment.cwBoundingSegment.type: {
            const pt = cwIntersectionTestSegmentSegment ((a as boundingsegment.cwBoundingSegment).segment, b);
            return pt ? [pt] : [];
        }
        default: {
            return [];
        }
    }
}

export function cwIntersectionTestShapeBox (a: shape.cwBoundingShape, b: point.IRect2d): boolean {
    const box = a.getBoundingbox ();
    if (!box) {
        return false;
    }
    switch (a.type) {
        case boundingbox.cwBoundingBox.type: {
            return cwIntersectionTestBoxBox ((a as boundingbox.cwBoundingBox).rect, b);
        }
        case boundinghull.cwBoundingHull.type: {
            return cwIntersectionTestBoxHull (b, (a as boundinghull.cwBoundingHull).points);
        }
        case boundingsegment.cwBoundingSegment.type: {
            return cwIntersectionTestBoxSegment (b, (a as boundingsegment.cwBoundingSegment).segment) != null;
        }
        default: {
            return false;
        }
    }
}

export function cwIntersectionTestShapeHull (a: shape.cwBoundingShape, b: point.IPoint2d[]): boolean {
    const box = a.getBoundingbox ();
    if (!box) {
        return false;
    }
    switch (a.type) {
        case boundingbox.cwBoundingBox.type: {
            return cwIntersectionTestBoxHull ((a as boundingbox.cwBoundingBox).rect, b);
        }
        case boundinghull.cwBoundingHull.type: {
            return cwIntersectionTestHullHull ((a as boundinghull.cwBoundingHull).points, b);
        }
        case boundingsegment.cwBoundingSegment.type: {
            return cwIntersectionTestHullSegment (b, (a as boundingsegment.cwBoundingSegment).segment) != null;
        }
        default: {
            return false;
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
        case boundingsegment.cwBoundingSegment.type: {
            return cwIntersectionTestSegmentPoint ((a as boundingsegment.cwBoundingSegment).segment, b);
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
                case boundingsegment.cwBoundingSegment.type: {
                    const pt = cwIntersectionTestBoxSegment ((a as boundingbox.cwBoundingBox).rect, (b as boundingsegment.cwBoundingSegment).segment);
                    return pt && pt.length > 0;
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
                case boundingsegment.cwBoundingSegment.type: {
                    const pt = cwIntersectionTestHullSegment ((a as boundinghull.cwBoundingHull).points, (b as boundingsegment.cwBoundingSegment).segment);
                    return pt && pt.length > 0;
                }
                default: {
                    return false;
                }
            }
        }
        case boundingsegment.cwBoundingSegment.type: {
            switch (b.type) {
                case boundingbox.cwBoundingBox.type: {
                    const pt = cwIntersectionTestBoxSegment ((b as boundingbox.cwBoundingBox).rect, (a as boundingsegment.cwBoundingSegment).segment);
                    return pt && pt.length > 0;
                }
                case boundinghull.cwBoundingHull.type: {
                    const pt = cwIntersectionTestHullSegment ((b as boundinghull.cwBoundingHull).points, (a as boundingsegment.cwBoundingSegment).segment);
                    return pt && pt.length > 0;
                }
                case boundingsegment.cwBoundingSegment.type: {
                    const pt = cwIntersectionTestSegmentSegment ((b as boundingsegment.cwBoundingSegment).segment, (a as boundingsegment.cwBoundingSegment).segment);
                    return pt != null;
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

export function cwIntersectionTestBoxSegment (a: point.IRect2d, b: point.ISegment2d): point.IPoint2d[] {
    return cwIntersectionTestHullSegment ([point.cwGetTopLeft(a),point.cwGetBottomLeft(a),point.cwGetBottomRight(a),point.cwGetTopRight(a)], b);
}

export function cwIntersectionTestHullPoint (a: point.IPoint2d[], b: point.IPoint2d): boolean {
    for (let i = 0; i < a.length; i++) {
        const v1 = point.cwGetVector(b, a[i]);
        const v2 = point.cwGetVector(b, a[(i+1)%a.length]);
        if (point.cwCrossProduct (v1, v2) > 0) {
            return false;
        }
    }
    return true;
}

export function cwIntersectionTestHullSegment (a: point.IPoint2d[], b: point.ISegment2d): point.IPoint2d[] {
    if (cwIntersectionTestHullPoint(a, b.start) || cwIntersectionTestHullPoint(a, b.end)) {
        return [b.start, b.end];
    }
    const result = [];
    for (let i = 0; i < a.length; i++) {
        const edge = {
            start: a[i],
            end: a[(i+1)%a.length]
        }
        const intersectedPoint = cwIntersectionTestSegmentSegment (edge, b);
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
            const minmax = [{min:9999999,max:-9999999}, {min:9999999,max:-9999999}];
            for (let i = 0; i < 2; i++) {
                polygons[i].forEach (point => {
                    const proj = point.x * nx + point.y * ny;
                    if (proj < minmax[i].min) {
                        minmax[i].min = proj;
                    }
                    if (proj > minmax[i].max) {
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

export function cwIntersectionTestSegmentPoint (s: point.ISegment2d, p: point.IPoint2d): boolean {
    let minx = s.start.x;
    let miny = s.start.y;
    let maxx = s.end.x;
    let maxy = s.end.y;
    if (minx > maxx) {
        const tmp = minx;
        minx = maxx;
        maxx = tmp;
    }
    if (miny > maxy) {
        const tmp = miny;
        miny = maxy;
        maxy = tmp;
    }
    if (p.x < minx || p.x > maxx || p.y < miny || p.y > maxy) {
        return false;
    }
    if (maxx != minx) {
        const deltay = Math.round(miny + (maxy - miny) * (p.x - minx) / (maxx - minx)) - p.y;
        return deltay >= -1 && deltay <= 1;
    } else if (maxy != miny) {
        const deltax = Math.round(minx + (maxx - minx) * (p.y - miny) / (maxy - miny)) - p.x;
        return deltax >= -1 && deltax <= 1;
    } else {
        return p.x == minx && p.y == miny;
    }
}

export function cwIntersectionTestSegmentSegment (s1: point.ISegment2d, s2: point.ISegment2d): point.IPoint2d {
    function isSameSign (a:number, b:number) {
        return (a >= 0 && b >= 0) || (a <= 0 && b <= 0);
    }    
    const x1 = s1.start.x, y1 = s1.start.y;
    const x2 = s1.end.x, y2 = s1.end.y;
    const x3 = s2.start.x, y3 = s2.start.y;
    const x4 = s2.end.x, y4 = s2.end.y;
    const Ax = x2 - x1;
    const Bx = x3 - x4;
    let x1lo, x1hi, y1lo, y1hi, num, offset;

    if (Ax < 0) {
        x1lo = x2;
        x1hi = x1;
    } else {
        x1hi = x2;
        x1lo = x1;
    }

    if (Bx > 0) {
        if (x1hi < x4 || x3 < x1lo) {
            return null;
        } 
    } else {
        if (x1hi < x3 || x4 < x1lo) {
            return null;
        }
    }

    const Ay = y2 - y1;
    const By = y3 - y4;

    if (Ay < 0) {
        y1lo = y2;
        y1hi = y1;
    } else {
        y1hi = y2;
        y1lo = y1;
    }

    if (By > 0) {
        if (y1hi < y4 || y3 < y1lo) {
            return null;
        }
    } else {
        if (y1hi < y3 || y4 < y1lo) {
            return null;
        }
    }

    const Cx = x1 - x3;
    const Cy = y1 - y3;
    const f = Ay * Bx - Ax * By;
    if (f == 0) {
        return null;
    }

    const d = By * Cx - Bx * Cy;
    if (f > 0) {
        if (d < 0 || d > f) {
            return null;
        }
    } else {
        if (d > 0 || d < f) {
            return null;
        }
    }

    const e = Ax * Cy - Ay * Cx;
    if (f > 0) {
        if (e < 0 || e > f) {
            return null;
        }
    } else {
        if (e > 0 || e < f) {
            return null;
        }
    }

    num = d * Ax;
    offset = isSameSign (num, f) ? f/2 : -f/2;
    let x = x1 + (((num + offset) / f) >> 0);
    num = d * Ay;
    offset = isSameSign (num, f) ? f/2 : -f/2;
    let y = y1 + (((num + offset) / f) >> 0);

    return { x:x, y:y };
}