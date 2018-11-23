import * as point from './point';
import * as shape from './boundingshape';
import * as boundinghull from './boundinghull';
import * as transform from './transform';

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
    getTransformedShape (transform: transform.cwTransform2d): shape.cwBoundingShape {
        if (!transform) {
            return new cwBoundingBox (this.rect);
        } else {
            const pointLeftTop = { x:this.rect.x, y:this.rect.y };
            const pointLeftBottom = { x:this.rect.x, y:this.rect.y+this.rect.h-1 };
            const pointRightBottom = { x:this.rect.x+this.rect.w-1, y:this.rect.y+this.rect.h-1 };
            const pointRightTop = { x:this.rect.x+this.rect.w-1, y:this.rect.y };
            return new boundinghull.cwBoundingHull ([
                transform.transformPoint (pointLeftTop),
                transform.transformPoint (pointLeftBottom),
                transform.transformPoint (pointRightBottom),
                transform.transformPoint (pointRightTop)
            ]);
        }
    }
}

