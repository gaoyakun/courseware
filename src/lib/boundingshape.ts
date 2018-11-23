import * as point from './point';
import * as transform from './transform';

export abstract class cwBoundingShape {
    readonly type: string;
    constructor (type: string) {
        this.type = type;
    }
    abstract getBoundingbox (): point.IRect2d;
    abstract getTransformedShape (transform: transform.cwTransform2d): cwBoundingShape;
}