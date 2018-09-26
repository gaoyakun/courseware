export enum cwSplineType {
    STEP = 1,
    LINEAR = 2,
    POLY = 3
}

export class cwCurveEvaluter {
    cp: Array<{x:number,y:number}>;
    clamp: boolean;
    constructor (cp:Array<{x:number,y:number}>, clamp:boolean = false) {
        this.cp = cp;
        this.clamp = clamp;
    }
    eval (x:number): number {
        return 0;
    }
    evalFirst (): number {
        return this.cp.length > 0 ? this.cp[0].y : 0;
    }
    evalLast (): number {
        return this.cp.length > 0 ? this.cp[this.cp.length-1].y : 0;
    }
}

export class cwStepEvaluter extends cwCurveEvaluter {
    h: Array<number>;
    constructor (cp:Array<{x:number,y:number}>, clamp:boolean = false) {
        super(cp, clamp);
        this.h = new Array(cp.length-1);
        this.compute ();
    }
    compute (): void {
        for (let i = 0; i < this.cp.length-1; ++i) {
            this.h[i] = this.cp[i+1].x - this.cp[i].x;
        }
    }
    getSegment (x:number): number {
        let i;
        for (i = 0; i < this.cp.length-1; i++) {
            if (x < this.cp[i+1].x) {
                break;
            }
        }
        return i;
    }
    eval (x:number): number {
        if (this.clamp) {
            if (x < 0) {
                return this.cp[0].y;
            }
            if (x > this.cp[this.cp.length-1].x) {
                return this.cp[this.cp.length-1].y;
            }
        }
        let seg = this.getSegment(x);
        return this.cp[seg].y;
    }
}

export class cwLinearEvaluter extends cwCurveEvaluter {
    h: Array<number>;
    constructor (cp:Array<{x:number,y:number}>, clamp:boolean = false) {
        super(cp, clamp);
        this.h = new Array(cp.length-1);
        this.cp = cp;
        this.compute ();
    }
    compute (): void {
        for (let i = 0; i < this.cp.length-1; ++i) {
            this.h[i] = this.cp[i+1].x - this.cp[i].x;
        }
    }
    getSegment (x:number): number {
        let i;
        for (i = 0; i < this.cp.length-1; i++) {
            if (x < this.cp[i+1].x) {
                break;
            }
        }
        if (i == this.cp.length-1) {
            i--;
        }
        return i;
    }
    eval (x:number): number {
        if (this.clamp) {
            if (x < 0) {
                return this.cp[0].y;
            }
            if (x > this.cp[this.cp.length-1].x) {
                return this.cp[this.cp.length-1].y;
            }
        }
        let seg = this.getSegment(x);
        let t = x - this.cp[seg].x;
        return this.cp[seg].y + (this.cp[seg+1].y-this.cp[seg].y) * t / this.h[seg];
    }
}

export class cwPolynomialsEvaluter extends cwCurveEvaluter {
    a: Array<number>;
    h: Array<number>;
    constructor (cp:Array<{x:number,y:number}>, clamp:boolean = false) {
        super(cp, clamp);
        this.a = new Array(cp.length);
        this.h = new Array(cp.length);
        this.cp = cp;
        this.compute ();
    }
    solveTridiag (sub:Array<number>, diag:Array<number>, sup:Array<number>) {
        let n = this.cp.length - 2;
        for (let i = 2; i <= n; i++) {
            sub[i] /= diag[i-1];
            diag[i] -= sub[i] * sup[i-1];
            this.a[i] -= this.a[i-1] * sub[i];
        }
        this.a[n] /= diag[n];
        for (let i = n-1; i>=1; --i) {
            this.a[i] = (this.a[i]-this.a[i+1]*sup[i])/diag[i];
        }
    }
    compute (): void {
        let nk = this.cp.length;
        let sub = new Array(nk-1);
        let diag = new Array(nk-1);
        let sup = new Array(nk-1);
        this.a[0] = 0;
        this.a[nk-1] = 0;
        for (let i = 1; i < nk; ++i) {
            this.h[i] = this.cp[i].x - this.cp[i-1].x;
        }
        for (let i = 1; i < nk-1; ++i) {
            diag[i] = (this.h[i] + this.h[i+1]) / 3;
            sup[i] = this.h[i+1] / 6;
            sub[i] = this.h[i] / 6;
            this.a[i] = (this.cp[i+1].y - this.cp[i].y)/this.h[i+1] - (this.cp[i].y - this.cp[i-1].y)/this.h[i];
        }
        this.solveTridiag(sub, diag, sup);
    }
    getSegment (x:number): number {
        let i;
        for (i = 0; i < this.cp.length-1; i++) {
            if (x < this.cp[i+1].x) {
                break;
            }
        }
        if (i == this.cp.length-1) {
            i--;
        }
        return i;
    }
    eval (x:number): number {
        if (this.clamp) {
            if (x < 0) {
                return this.cp[0].y;
            }
            if (x > this.cp[this.cp.length-1].x) {
                return this.cp[this.cp.length-1].y;
            }
        }
        let seg = this.getSegment(x) + 1;
        let t1 = x - this.cp[seg-1].x;
        let t2 = this.h[seg] - t1;
        return ((-this.a[seg - 1] / 6.0 * (t2 + this.h[seg]) * t1 + this.cp[seg - 1].y) * t2 + (-this.a[seg] / 6.0 * (t1 + this.h[seg]) * t2 + this.cp[seg].y) * t1) / this.h[seg];
    }
}

export class cwSpline {
    private _evalutors: Array<cwCurveEvaluter>;
    private _array:boolean;
    private initArray (type:cwSplineType, cp:Array<{x:number,y:Array<number>}>,clamp:boolean) {
        const numElements = cp[0].y.length;
        if (numElements > 0) {
            for (let i = 0; i < numElements; i++) {
                let t = [];
                for (let j = 0; j < cp.length; j++) {
                    let val = cp[j].y.length > i ? cp[j].y[i] : 0;
                    t.push ({x:cp[j].x, y:val});
                }
                switch (type) {
                case cwSplineType.STEP:
                    this._evalutors.push (new cwStepEvaluter(t, clamp));
                    break;
                case cwSplineType.LINEAR:
                    this._evalutors.push (new cwLinearEvaluter(t, clamp));
                    break;
                case cwSplineType.POLY:
                default:
                    this._evalutors.push (new cwPolynomialsEvaluter(t, clamp));
                    break;
                }
            }
            this._array = true;
        }
    }
    private initNonArray (type:cwSplineType, cp:Array<{x:number,y:number}>,clamp:boolean) {
        switch (type) {
        case cwSplineType.STEP:
            this._evalutors.push (new cwStepEvaluter(cp, clamp));
            break;
        case cwSplineType.LINEAR:
            this._evalutors.push (new cwLinearEvaluter(cp, clamp));
            break;
        case cwSplineType.POLY:
        default:
            this._evalutors.push (new cwPolynomialsEvaluter(cp, clamp));
            break;
        }
        this._array = false;
    }
    constructor (type:cwSplineType, cp:Array<{x:number,y:number}>|Array<{x:number,y:Array<number>}>, clamp:boolean = false) {
        this._evalutors = [];
        this._array = false;
        if (cp.length > 0) {
            if (typeof cp[0].y === 'number') {
                this.initNonArray (type, cp as Array<{x:number,y:number}>, clamp);
            } else {
                this.initArray (type, cp as Array<{x:number,y:Array<number>}>, clamp);
            }
        }
    }
    eval (x:number): number|Array<number> {
        if (this._evalutors.length > 0) {
            if (this._array) {
                let result:Array<number> = [];
                this._evalutors.forEach ((evalutor:cwCurveEvaluter) => {
                    result.push (evalutor.eval (x));
                });
                return result;
            } else {
                return this._evalutors[0].eval (x);
            }
        } else {
            return 0;
        }
    }
    evalFirst (): number|Array<number> {
        if (this._evalutors.length > 0) {
            if (this._array) {
                let result:Array<number> = [];
                this._evalutors.forEach ((evalutor:cwCurveEvaluter) => {
                    result.push (evalutor.evalFirst ());
                });
                return result;
            } else {
                return this._evalutors[0].evalFirst ();
            }
        } else {
            return 0;
        }
    }
    evalLast (): number|Array<number> {
        if (this._evalutors.length > 0) {
            if (this._array) {
                let result:Array<number> = [];
                this._evalutors.forEach ((evalutor:cwCurveEvaluter) => {
                    result.push (evalutor.evalLast ());
                });
                return result;
            } else {
                return this._evalutors[0].evalLast ();
            }
        } else {
            return 0;
        }
    }
}
