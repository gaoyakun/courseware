import * as point from './point';
import * as shape from './boundingshape';
import * as boundinghull from './boundinghull';
import * as transform from './transform';

export class cwBoundingSphere extends shape.cwBoundingShape {
    public static readonly type: string = 'sphere';
    private _sphere: point.ISphere2d;
    private _dirty: boolean;
    private _boundingbox: point.IRect2d;
    constructor (sphere: point.ISphere2d = null) {
        super (cwBoundingSphere.type);
        this.sphere = sphere;
    }
    get center () {
        return this._sphere ? this._sphere.center : null;
    }
    get radius () {
        return this._sphere ? this._sphere.radius : null;
    }
    set center (pt: point.IPoint2d) {
        if (!this._sphere) {
            this._sphere = { center: pt, radius: 1 };
        } else {
            this._sphere.center = pt;
        }
        this._dirty = true;
    }
    set radius (radius: number) {
        if (!this._sphere) {
            this._sphere = { center: {x:0, y:0}, radius: radius };
        } else {
            this._sphere.radius = radius;
        }
        this._dirty = true;
    }
    get sphere (): point.ISphere2d {
        return this._sphere ? { center: this._sphere.center, radius: this._sphere.radius } : null;
    }
    set sphere (sphere: point.ISphere2d) {
        this._sphere = sphere || null;
        this._dirty = !!sphere;
        this._boundingbox = null;
    }
    get boundingbox () {
        this._checkDirty ();
        return this._boundingbox;
    }
    private _checkDirty () {
        if (this._dirty) {
            this._dirty = false;
            this._boundingbox = { x: this._sphere.center.x - this._sphere.radius + 1, y: this._sphere.center.y - this._sphere.radius + 1, w: 2 * this._sphere.radius-1, h:2 * this._sphere.radius-1 };
        }
    }
    getBoundingbox (): point.IRect2d {
        return this.boundingbox;
    }
    getTransformedShape (transform: transform.cwTransform2d): shape.cwBoundingShape {
        if (!transform || !this._sphere) {
            return new cwBoundingSphere(this._sphere);
        } else {
            const transformedPoints: point.IPoint2d[] = [];
            const A = Math.PI * 0.125;
            const D = A * 2;
            const R = this._sphere.radius/Math.cos(A);
            const shape = new boundinghull.cwBoundingHull ();
            for (let angle = A; angle < Math.PI * 2; angle += D) {
                const pt = transform.transformPoint({ x: R * Math.cos(angle), y: R * Math.sin(angle) });
                pt.x = Math.round(pt.x);
                pt.y = Math.round(pt.y);
                shape.addPoint (pt);
            }
            return shape;
        }
    }
}

