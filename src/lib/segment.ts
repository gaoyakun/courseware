import { IPoint2d } from './point';

export interface ISegment2d {
    start: IPoint2d;
    end: IPoint2d;
}

function isSameSign (a:number, b:number) {
    return (a >= 0 && b >= 0) || (a <= 0 && b <= 0);
}

export function cwSegmentIntersect (s1: ISegment2d, s2: ISegment2d): IPoint2d {
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