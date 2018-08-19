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
    GraphEntity.prototype.hittest = function (x, y) {
        return false;
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
    GraphEntity.prototype.onCull = function (graph) {
        var bbox = this.getWorldBoundingbox ();
        var culled = false;
        if (bbox) {
            var minx = bbox.x;
            var miny = bbox.y;
            var maxx = bbox.x + bbox.w;
            var maxy = bbox.y + bbox.h;
            culled = (minx >= graph.canvasWidth || miny >= graph.canvasHeight || maxx <= 0 || maxy <= 0);
        }
        return culled;
    };
    GraphEntity.prototype.onUpdate = function (dt, rt) {
    };
    GraphEntity.prototype.onMouseEnter = function () {
    };
    GraphEntity.prototype.onMouseLeave = function () {
    };
    GraphEntity.prototype.onMouseDown = function (evt) {
    };
    GraphEntity.prototype.onMouseUp = function (evt) {
    };
    GraphEntity.prototype.onClick = function (evt) {
    };
    GraphEntity.prototype.onDblClick = function (evt) {
    };
    GraphEntity.prototype.onMouseWheel = function (evt) {
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

        this.hoverEntity = null;
        this.mouseOver = false;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.lastFrameTime = 0;
        this.firstFrameTime = 0;
        this.running = false;

        var that = this;
        canvas.on ('mouseenter', function(){
            that.onMouseEnter();
        });
        canvas.on ('mouseleave', function(){
            that.onMouseLeave();
        });
        canvas.on ('mousemove', function(evt){
            that.onMouseMove(evt.offsetX, evt.offsetY);
        });
        canvas.on ('mousedown', function(evt){
            that.onMouseDown(evt);
        });
        canvas.on ('mouseup', function(evt){
            that.onMouseUp(evt);
        });
        canvas.on ('click', function(evt){
            that.onClick(evt);
        });
        canvas.on ('mousewheel', function(evt){
            that.onMouseWheel(evt);
        });
        canvas.on ('dblclick', function(evt){
            that.onDblClick(evt);
        });
    };

    DemoGraph.prototype.onMouseEnter = function () {
        this.mouseOver = true;
    };

    DemoGraph.prototype.onMouseLeave = function () {
        this.mouseOver = false;
        if (this.hoverEntity) {
            this.hoverEntity.onMouseLeave();
            this.hoverEntity = null;
        }
    };

    DemoGraph.prototype.onMouseMove = function (x, y) {
        this.mouseX = x;
        this.mouseY = y;
        this.updateHoverEntity ();
    };

    DemoGraph.prototype.onMouseDown = function (evt) {
        if (this.hoverEntity) {
            this.hoverEntity.onMouseDown(evt);
        }
    };

    DemoGraph.prototype.onMouseUp = function(evt) {
        if (this.hoverEntity) {
            this.hoverEntity.onMouseUp (evt);
        }
    };

    DemoGraph.prototype.onClick = function(evt) {
        if (this.hoverEntity) {
            this.hoverEntity.onClick (evt);
        }
    };

    DemoGraph.prototype.onDblClick = function(evt) {
        if (this.hoverEntity) {
            this.hoverEntity.onDblClick(evt);
        }
    };

    DemoGraph.prototype.onMouseWheel = function (evt) {
        if (this.hoverEntity) {
            this.hoverEntity.onMouseWheel (evt);
        }
    };

    DemoGraph.prototype.updateHoverEntity = function () {
        if (this.mouseOver) {
            var hitResult = this.hittest (this.mouseX, this.mouseY);
            var hover = hitResult.length>0 ? hitResult[0] : null;
            if (this.hoverEntity != hover) {
                if (this.hoverEntity) {
                    this.hoverEntity.onMouseLeave();
                }
                if (hover) {
                    hover.onMouseEnter();
                }
                this.hoverEntity = hover;
            }
        }
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

    DemoGraph.prototype.hittest = function (x, y) {
        function hittest_r (entity, hitResult) {
            var invWorldMatrix = Transform2d.invert(entity.getWorldMatrix());
            var localPoint = invWorldMatrix.transformPoint ({x:x,y:y});
            if (entity.hittest(localPoint.x, localPoint.y)) {
                hitResult.push(entity);
            }
            for (var i = 0; i < entity.children.length; i++) {
                hittest_r (entity.children[i], hitResult);
            }
        }
        var hitResult = [];
        if (this.rootEntity) {
            hittest_r (this.rootEntity, hitResult);
            hitResult.sort (function(a,b){
                return b.z - a.z;
            });
        }
        return hitResult;
    };

    DemoGraph.prototype.update = function (entity, dt, rt) {
        entity.onUpdate(dt, rt);
        for (var i = 0; i < entity.children.length; i++) {
            this.update (entity.children[i], dt, rt);
        }
    };

    DemoGraph.prototype.cull = function (entity, cullResult, dt, rt) {
        if (!entity.onCull(this)) {
            var z = entity.z;
            var group = cullResult[z]||[];
            group.push (entity);
            cullResult[z] = group;
        }
        for (var i = 0; i < entity.children.length; i++) {
            this.cull (entity.children[i], cullResult);
        }
    };

    DemoGraph.prototype.clear = function (color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.restore();
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

    DemoGraph.prototype.run = function (dt, rt) {
        var that = this;
        function frame (ts) {
            if (that.running) {
                if (that.lastFrameTime == 0) {
                    that.lastFrameTime = ts;
                    that.firstFrameTime = ts;
                }
                var dt = ts - that.lastFrameTime;
                var rt = ts - that.firstFrameTime;
                that.lastFrameTime = ts;
                that.updateHoverEntity ();
                if (that.rootEntity) {
                    that.update (that.rootEntity, dt, rt);
                    that.draw ();
                }
                requestAnimationFrame (frame);
            }
        }
        if (!that.running) {
            that.running = true;
            requestAnimationFrame (frame);
        }
    };

    DemoGraph.prototype.stop = function () {
        this.running = false;
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
