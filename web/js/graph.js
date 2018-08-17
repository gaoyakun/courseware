window.GraphEntity = (function(){
    var GraphEntity = function () {
        this.parent = null;
        this.z = 0;
        this.children = [];
        this.localMatrix = new Transform2d();
    };
    GraphEntity.prototype.getWorldMatrix = function () {
        return this.parent ? Transform2d.transform(this.parent.getWorldMatrix(), this.localMatrix) : this.localMatrix;
    };
    GraphEntity.prototype.getBoundingbox = function () {
        return null;
    };
    GraphEntity.prototype.getWorldBoundingbox = function () {
        var bbox = this.getBoundingbox ();
        if (bbox) {
            var worldMatrix = this.getWorldMatrix();
            var lt = worldMatrix.transformPoint({x:bbox.x,y:bbox.y});
            var rt = worldMatrix.transformPoint({x:bbox.x+bbox.w,y:bbox.y});
            var lb = worldMatrix.transformPoint({x:bbox.x,y:bbox.y+bbox.h});
            var rb = worldMatrix.transformPoint({x:bbox.x+bbox.w,y:bbox.y+bbox.h});
            var minx = lt.x;
            var miny = lt.y;
            var maxx = lt.x;
            var maxy = lt.y;
            if (minx > rt.x) {
                minx = rt.x;
            }
            if (maxx < rt.x) {
                maxx = rt.x;
            }
            if (minx > lb.x) {
                minx = lb.x;
            }
            if (maxx < lb.x) {
                maxx = lb.x;
            }
            if (minx > rb.x) {
                minx = rb.x;
            }
            if (maxx < rb.x) {
                maxx = rb.x;
            }
            if (miny > rt.y) {
                miny = rt.y;
            }
            if (maxy < rt.y) {
                maxy = rt.y;
            }
            if (miny > lb.y) {
                miny = lb.y;
            }
            if (maxy < lb.y) {
                maxy = lb.y;
            }
            if (miny > rb.y) {
                miny = rb.y;
            }
            if (maxy < rb.y) {
                maxy = rb.y;
            }
            return { x:minx,y:miny,w:maxx-minx,h:maxy-miny};
        } else {
            return null;
        }
    };
    GraphEntity.prototype.applyTransform = function(ctx) {
        var matrix = this.getWorldMatrix();
        ctx.setTransform (matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    };
    GraphEntity.prototype.draw = function(graph){
        graph.ctx.save();
        graph.ctx.fillStyle('#ff0000');
        graph.ctx.fillRect(-10,-10,20,20);
        graph.ctx.restore();
    };
    GraphEntity.prototype.addChild = function (child) {
        if (child && child.parent===null) {
            child.parent = this;
            this.children.push (child);
        }
    };
    GraphEntity.prototype.remove = function () {
        if (this.parent) {
            for (var i = 0; i < this.parent.children.length; i++) {
                if (this.parent.children[i] == this) {
                    parent.children.splice (i, 1);
                    break;
                }
            }
        }
        this.parent = null;
    };
    GraphEntity.prototype.removeChildren = function () {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].parent = null;
        }
        this.children = [];
    };
    return GraphEntity;
})();

window.DemoGraph = (function(){
    var DemoGraph = function (canvas) {
        this.canvasWidth = canvas.width();
        this.canvasHeight = canvas.height();
        canvas[0].width = this.canvasWidth;
        canvas[0].height = this.canvasHeight;
        this.screenCtx = canvas[0].getContext('2d');

        this.buffer = document.createElement('canvas');
        this.buffer.width = this.canvasWidth;
        this.buffer.height = this.canvasHeight;
        this.ctx = this.buffer.getContext('2d');

        this.images = {};
        this.rootEntity = null;
        this.motions = {};
        this.nextImageId = 1;
        this.nextMotionId = 1;
    };

    DemoGraph.prototype.addImage = function (src) {
        var img = new Image();
        img.src = src;
        this.images[this.nextImageId] = img;
        return this.nextImageId++;
    };

    DemoGraph.prototype.getImage = function (imgId) {
        return this.images[imgId];
    };

    DemoGraph.prototype.addMotion = function (motion) {
        this.motions[this.nextMotionId] = motion;
        return this.nextMotionId++; 
    };

    DemoGraph.prototype.getMotion = function (motionId) {
        return this.motions[motionId];
    };

    DemoGraph.prototype.cull = function (entity, cullResult) {
        var bbox = entity.getWorldBoundingbox ();
        var culled = false;
        if (bbox) {
            var minx = bbox.x;
            var miny = bbox.y;
            var maxx = bbox.x + bbox.w;
            var maxy = bbox.y + bbox.h;
            culled = (minx >= this.canvasWidth || miny >= this.canvasHeight || maxx <= 0 || maxy <= 0);
        }
        if (!culled) {
            var z = entity.z;
            var group = cullResult[z]||[];
            group.push (entity);
            cullResult[z] = group;
        }
        for (var i = 0; i < entity.children.length; i++) {
            this.cull (entity.children[i], cullResult);
        }
    };

    DemoGraph.prototype.draw = function () {
        if (this.rootEntity) {
            var cullResult = {};
            this.cull (this.rootEntity, cullResult);
        }
        var entityGroups = Object.values(cullResult);
        for (var i = 0; i < entityGroups.length; i++) {
            for (var j = 0; j < entityGroups[i].length; j++) {
                entityGroups[i][j].applyTransform (this.ctx);
                entityGroups[i][j].draw (this);
            }
        }
        this.screenCtx.drawImage(this.buffer, 0, 0);
    };

    return DemoGraph;
})();

window.Graph = (function(){
    var Graph = function (canvas) {
        this.canvasWidth = canvas.width();
        this.canvasHeight = canvas.height();
        canvas[0].width = this.canvasWidth;
        canvas[0].height = this.canvasHeight;
        this.ctx = canvas[0].getContext('2d');
    };

    Graph.prototype.histogram = function (options) {
        var paddingH = options.paddingH||20;
        var paddingV = options.paddingV||20;
        var color = options.color||'#f00';
        var bkcolor = options.bkcolor||'#fff';
        var barWidth = Math.round((this.canvasWidth - (options.values.length + 1) * paddingH) / options.values.length);
        var barHeight = this.canvasHeight - 2 * paddingV;
        var barTop = paddingV;
        var barLeft = paddingH;
        var maxValue = 0;
        for (var i = 0; i < options.values.length; i++) {
            if (options.values[i] > maxValue) {
                maxValue = options.values[i];
            }
        }
        this.ctx.fillStyle = bkcolor;
        if (maxValue > 0) {
            this.ctx.fillRect (0, 0, this.canvasWidth, this.canvasHeight);
            this.ctx.fillStyle = color;
            for (var i = 0; i < options.values.length; i++) {
                var top = barTop + Math.round(barHeight * (maxValue-options.values[i])/maxValue);
                var height = this.canvasHeight - paddingV - top;
                this.ctx.fillRect (barLeft, top, barWidth, height);
                barLeft += barWidth;
                barLeft += paddingH;
            }
        }
    };

    return Graph;
})();
