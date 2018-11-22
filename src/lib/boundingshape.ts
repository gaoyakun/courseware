import * as point from './point';

export abstract class cwBoundingShape {
    readonly type: string;
    constructor (type: string) {
        this.type = type;
    }
    abstract getBoundingbox (): point.IRect2d;
}