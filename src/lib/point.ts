export interface IPoint2d {
    x: number;
    y: number;
}

export interface IVector2d {
    x: number;
    y: number;
}

export interface IRect2d {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ISegment2d {
    start: IPoint2d;
    end: IPoint2d;
}

export function cwGetTopLeft (rect: IRect2d): IPoint2d {
    return { x: rect.x, y: rect.y };
}

export function cwGetTopRight (rect: IRect2d): IPoint2d {
    return { x: rect.x + rect.w, y: rect.y };
}

export function cwGetBottomLeft (rect: IRect2d): IPoint2d {
    return { x: rect.x, y: rect.y + rect.h };
}

export function cwGetBottomRight (rect: IRect2d): IPoint2d {
    return { x: rect.x + rect.w, y: rect.y + rect.h };
}

export function cwNormalize (v: IVector2d) {
    const len = cwVectorLength (v);
    if (len > 0.0001) {
        v.x /= len;
        v.y /= len;
    }
}

export function cwVectorLengthSq (v: IVector2d) {
    return v.x * v.x + v.y * v.y;
}

export function cwVectorLength (v: IVector2d) {
    return Math.sqrt (cwVectorLengthSq (v));
}

export function cwDistanceSq (p1: IPoint2d, p2: IPoint2d) {
    return cwVectorLengthSq (cwGetVector(p1, p2));
}

export function cwDistance (p1: IPoint2d, p2: IPoint2d) {
    return cwVectorLength (cwGetVector(p1, p2));
}

export function cwDotProduct (v1: IVector2d, v2: IVector2d) {
    return v1.x * v2.x + v1.y * v2.y;
}

export function cwCrossProduct (v1: IVector2d, v2: IVector2d) {
    return v1.x * v2.y - v1.y * v2.x;
}

export function cwGetVector (start: IPoint2d, end: IPoint2d) {
    return { x: end.x - start.x, y: end.y - start.y };
}