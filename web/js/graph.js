window.Graph = (function(){
    var DemoGraph = function (canvas) {
        this.canvasWidth = canvas.width();
        this.canvasHeight = canvas.height();
        canvas[0].width = this.canvasWidth;
        canvas[0].height = this.canvasHeight;
        this.entities = {};
        this.motions = {};
        this.nextEntityId = 1;
        this.nextMotionId = 1;
    };

    DemoGraph.prototype.addEntity = function (entity) {
        this.entities[this.nextEntityId] = entity;
        return this.nextEntityId++;
    };

    DemoGraph.prototype.addMotion = function (motion) {
        this.motions[this.nextMotionId] = motion;
        return this.nextMotionId++; 
    };

    var Graph = function () {
    };

    Graph.prototype.histogram = function (canvas, options) {
        var canvasWidth = canvas.width();
        var canvasHeight = canvas.height();
        canvas[0].width = canvasWidth;
        canvas[0].height = canvasHeight;
        var paddingH = options.paddingH||20;
        var paddingV = options.paddingV||20;
        var color = options.color||'#f00';
        var bkcolor = options.bkcolor||'#fff';
        var barWidth = Math.round((canvasWidth - (options.values.length + 1) * paddingH) / options.values.length);
        var barHeight = canvasHeight - 2 * paddingV;
        var barTop = paddingV;
        var barLeft = paddingH;
        var maxValue = 0;
        for (var i = 0; i < options.values.length; i++) {
            if (options.values[i] > maxValue) {
                maxValue = options.values[i];
            }
        }
        var ctx = canvas[0].getContext('2d');
        ctx.fillStyle = bkcolor;
        if (maxValue > 0) {
            ctx.fillRect (0, 0, canvasWidth, canvasHeight);
            ctx.fillStyle = color;
            for (var i = 0; i < options.values.length; i++) {
                var top = barTop + Math.round(barHeight * (maxValue-options.values[i])/maxValue);
                var height = canvasHeight - paddingV - top;
                ctx.fillRect (barLeft, top, barWidth, height);
                barLeft += barWidth;
                barLeft += paddingH;
            }
        }
    };

    return new Graph();
})();
