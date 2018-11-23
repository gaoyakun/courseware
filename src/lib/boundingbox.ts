import * as point from './point';
import * as shape from './boundingshape';

export class cwBoundingBox extends shape.cwBoundingShape {
    public static readonly type: string = 'Box';
    public rect: point.IRect2d;
    constructor (rect?: point.IRect2d) {
        super (cwBoundingBox.type);
        this.rect = rect || null;
    }
    getBoundingbox (): point.IRect2d {
        return this.rect;
    }
    containsPoint (pt: point.IPoint2d): boolean {
        return this.rect && pt.x >= this.rect.x && pt.x <= this.rect.x + this.rect.w && pt.y >= this.rect.y && pt.y <= this.rect.y + this.rect.h;
    }
}

