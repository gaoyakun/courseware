window.Transform2d = (function(){
    var Transform2d = function () {
        this.makeIdentity();
    };
    Transform2d.getIdentity = function () {
        return new Transform2d();
    };
    Transform2d.getTranslate = function (x, y) {
        return new Transform2d().makeTranslate (x, y);
    };
    Transform2d.getScale = function (x, y) {
        return new Transform2d().makeScale (x, y);
    };
    Transform2d.getRotate = function (theta) {
        return new Transform2d().makeRotate (theta);
    };
    Transform2d.transform = function (t1, t2) {
        return new Transform2d().copyFrom(t1).transform(t2);
    };
    Transform2d.translate = function (t, x, y) {
        return new Transform2d().copyFrom(t).translate(x, y);
    };
    Transform2d.scale = function (t, x, y) {
        return new Transform2d().copyFrom(t).scale(x, y);
    };
    Transform2d.rotate = function (t, theta) {
        return new Transform2d().copyFrom(t).rotate(theta);
    };
    Transform2d.prototype.set = function (a, b, c, d, e, f) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
    };
    Transform2d.prototype.makeIdentity = function () {
        return this.set (1, 0, 0, 1, 0, 0);
    };
    Transform2d.prototype.makeTranslate = function (x, y) {
        return this.set (1, 0, 0, 1, x, y);
    };
    Transform2d.prototype.makeScale = function (x, y) {
        return this.set (x, 0, 0, y, 0, 0);
    };
    Transform2d.prototype.makeRotate = function (theta) {
        var s = Math.sin(theta);
        var c = Math.cos(theta);
        return this.set (c, s, -s, c, 0.0, 0.0);
    };
    Transform2d.prototype.copyFrom = function (otherTransform) {
        return this.set (otherTransform.a, otherTransform.b, otherTransform.c, otherTransform.d, otherTransform.e, otherTransform.f);
    };
    Transform2d.prototype.transform = function (right) {
        return this.set(
            this.a * right.a + this.c * right.b,
            this.b * right.a + this.d * right.b,
            this.a * right.c + this.c * right.d,
            this.b * right.c + this.d * right.d,
            this.a * right.e + this.c * right.f + this.e,
            this.b * right.e + this.d * right.f + this.f
        );
    };
    Transform2d.prototype.transformPoint = function (point) {
        return { 
            x:this.a * point.x + this.c * point.y + this.e, 
            y:this.b * point.x + this.d * point.y + this.f 
        };
    };
    Transform2d.prototype.translate = function (x, y) {
        return this.transform (Transform2d.getTranslate(x, y));
    };
    Transform2d.prototype.scale = function (x, y) {
        return this.transform (Transform2d.getScale(x, y));
    };
    Transform2d.prototype.rotate = function (theta) {
        return this.transform (Transform2d.getRotate(theta));
    };
    return Transform2d;
})();
