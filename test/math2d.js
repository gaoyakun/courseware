function evalSpline (controlPoints, pos) {
    let a = new Array(controlPoints.length);
    let h = new Array(controlPoints.length);
    function solveTridiag(sub, diag, sup) {
        let n = controlPoints.length - 2;
        for (let i = 2; i <= n; i++) {
            sub[i] /= diag[i-1];
            diag[i] -= sub[i] * sup[i-1];
            a[i] -= a[i-1] * sub[i];
        }
        a[n] /= diag[n];
        for (let i = n-1; i>=1; --i) {
            a[i] = (a[i]-a[i+1]*sup[i])/diag[i];
        }
    }
    function computeSpline() {
        let nk = controlPoints.length;
        let sub = new Array(nk-1);
        let diag = new Array(nk-1);
        let sup = new Array(nk-1);
        a[0] = 0;
        a[nk-1] = 0;

        for (let i = 1; i < nk; ++i) {
            h[i] = controlPoints[i].x - controlPoints[i-1].x;
        }
        for (let i = 1; i < nk-1; ++i) {
            diag[i] = (h[i] + h[i+1]) / 3;
            sup[i] = h[i+1] / 6;
            sub[i] = h[i] / 6;
            a[i] = (controlPoints[i+1].y - controlPoints[i].y)/h[i+1] - (controlPoints[i].y - controlPoints[i-1].y)/h[i];
        }
        solveTridiag(sub, diag, sup);
    }
    function getSegment(x) {
        let i;
        for (i = 0; i < controlPoints.length-1; i++) {
            if (x < controlPoints[i+1].x) {
                break;
            }
        }
        if (i == controlPoints.length) {
            i--;
        }
        return i;
    }
    computeSpline();
    let seg = getSegment(pos);
    if (seg > controlPoints.length - 2) {
        seg = controlPoints.length - 2;
    }
    ++seg;
    let t1 = pos - controlPoints[seg-1].x;
    let t2 = h[seg] - t1;
    return ((-a[seg - 1] / 6.0 * (t2 + h[seg]) * t1 + controlPoints[seg - 1].y) * t2 + (a[seg] / 6.0 * (t1 + h[seg]) * t2 + controlPoints[seg].y) * t1) / h[seg];
}

const cp = [{x:0,y:0},{x:100,y:50},{x:200,y:0}];
for (let i = 0; i <= 200; i += 2) {
    console.log (evalSpline(cp, i));
}