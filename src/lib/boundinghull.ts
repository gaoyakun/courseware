import * as point from './point';
import * as shape from './boundingshape';
import * as transform from './transform';

export class cwBoundingHull extends shape.cwBoundingShape {
    public static readonly type: string = 'Hull';
    private _points: {x:number,y:number}[];
    private _boundingbox: {x:number,y:number,w:number,h:number};
    private _dirtyFlag: boolean;
    constructor (points?: point.IPoint2d[]) {
        super (cwBoundingHull.type);
        this._points = points || [];
        this._boundingbox = null;
        this._dirtyFlag = this._points.length > 0;
    }
    addPoint (point:{x:number,y:number}) {
        this._points.push (point);
        this._dirtyFlag = true;
    }
    get length (): number {
        return this._points.length;
    }
    get boundingbox () {
        this._checkDirty ();
        return this._boundingbox;
    }
    get points () {
        this._checkDirty ();
        return this._points;
    }
    getPoint (index: number) {
        this._checkDirty ();
        return this._points[index];
    }
    removePoint (index: number) {
        this._points.splice (index, 1);
        if (this._points.length == 0) {
            this._boundingbox = null;
            this._dirtyFlag = false;
        } else {
            this._dirtyFlag = true;
        }
    }
    clear () {
        this._points.length = 0;
        this._boundingbox = null;
        this._dirtyFlag = false;
    }
    getBoundingbox (): point.IRect2d {
        return this.boundingbox;
    }
    getTransformedShape (transform: transform.cwTransform2d): shape.cwBoundingShape {
        if (!transform) {
            return new cwBoundingHull(this._points);
        } else {
            return new cwBoundingHull(this._points.map(point => {
                return transform.transformPoint (point);
            }));
        }
    }
    private _checkDirty () {
        if (this._dirtyFlag) {
            this._dirtyFlag = false;
            this._adjustPoints ();
            this._computeBoundingbox ();
        }
    }
    private _adjustPoints () {
        const num = this._points.length;
        if (num < 3) {
            return;
        }
        const adjusted = [ this._points[0], this._points[1] ];
        for (let i = 2; i < num; i++) {
            let last = adjusted.length - 1;
            while (last > 0) {
                const v1 = point.cwGetVector (adjusted[0], adjusted[last]);
                const v2 = point.cwGetVector (adjusted[0], this._points[i]);
                const t = point.cwCrossProduct (v1, v2);
                if (t < 0) {
                    adjusted.splice (last + 1, 0, this._points[i]);
                    break;
                } else if (t == 0 && point.cwVectorLengthSq(v2) > point.cwVectorLengthSq(v1)) {
                    adjusted.splice (last + 1, 0, this._points[i]);
                    break;
                }
                last--;
            }
            if (last == 0) {
                adjusted.splice ( 1, 0, this._points[i]);
            }
        }
        this._points = adjusted;
    }
    private _computeBoundingbox () {
        if (this._points.length > 0) {
            let minx = this._points[0].x;
            let miny = this._points[0].y;
            let maxx = minx;
            let maxy = miny;
            this._points.forEach (point => {
                const x = point.x;
                const y = point.y;
                if (x < minx) {
                    minx = x;
                } else if (x > maxx) {
                    maxx = x;
                }
                if (y < miny) {
                    miny = y;
                } else if (y > maxy) {
                    maxy = y;
                }
            });
            this._boundingbox = { x: minx, y: miny, w: maxx - minx + 1, h: maxy - miny + 1 };
        } else {
            this._boundingbox = null;
        }
    }
}
