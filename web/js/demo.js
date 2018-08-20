window.Background = (function(){
    var Background = function(color) {
        this.color = color;
    };
    Background.prototype = new GraphEntity();
    Background.prototype.draw = function (graph) {
        if (this.color) {
            graph.ctx.save();
            graph.ctx.fillStyle = this.color;
            graph.ctx.fillRect (0, 0, graph.canvasWidth, graph.canvasHeight);
            graph.ctx.restore();
        }
    };
    Background.prototype.onCull = function (graph) {
        return false;
    };
    return Background;
})();

window.Number = (function(){
    var Number = function (image, width, height, x, y) {
        this.image = new Image();
        this.image.src = image;
        this.width = width;
        this.height = height;
        this.localMatrix = Transform2d.getTranslate(x, y);
    };
    Number.prototype = new GraphEntity();
    Number.prototype.draw = function(graph) {
        graph.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    };
    Number.prototype.hittest = function(x, y) {
        return x > -this.width/2 && x < this.width/2 && y > -this.height/2 && y < this.height/2;
    };
    Number.prototype.onDragStart = function (evt) {
        this.visible = false;
        return {
            draw: this.draw
        };
    };
    Number.prototype.onDragEnd = function (evt) {
        this.visible = true;
    };
    return Number;
})();

