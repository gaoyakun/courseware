export class CurveEvaluter {
    cp: Array<{x:number,y:number}>;
    constructor (cp:Array<{x:number,y:number}>) {
        this.cp = cp;
    }
    eval (x:number): number {
        return 0;
    }
}

export class StepEvaluter extends CurveEvaluter {
    h: Array<number>;
    constructor (cp:Array<{x:number,y:number}>) {
        super(cp);
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
        let seg = this.getSegment(x);
        return this.cp[seg].y;
    }
}

export class LinearEvaluter extends CurveEvaluter {
    h: Array<number>;
    constructor (cp:Array<{x:number,y:number}>) {
        super(cp);
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
        let seg = this.getSegment(x);
        let t = x - this.cp[seg].x;
        return (this.cp[seg+1].y-this.cp[seg].y) * t / this.h[seg];
    }
}

export class PolynomialsEvaluter extends CurveEvaluter {
    a: Array<number>;
    h: Array<number>;
    constructor (cp:Array<{x:number,y:number}>) {
        super(cp);
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
        let seg = this.getSegment(x) + 1;
        let t1 = x - this.cp[seg-1].x;
        let t2 = this.h[seg] - t1;
        return ((-this.a[seg - 1] / 6.0 * (t2 + this.h[seg]) * t1 + this.cp[seg - 1].y) * t2 + (this.a[seg] / 6.0 * (t1 + this.h[seg]) * t2 + this.cp[seg].y) * t1) / this.h[seg];
    }
}

