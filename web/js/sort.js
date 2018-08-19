(function setupPages(){
    Presentation.setup ($('#page-main'));
})();

(function createRandFig(){
    var values = [];
    for (var i = 0; i < 60; i++) {
        values.push (parseInt(Math.random()*100));
    }
    new Graph($('#fig-rand-unsort')).histogram ({
        values:values,
        paddingH:5
    });
    values.sort(function(a,b){
        return a - b;
    });
    new Graph($('#fig-rand-sorted')).histogram ({
        values:values,
        paddingH:5
    });
})();

function createBubbleSortDemo(){
    var Background = function (color) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    };
    Background.prototype = new GraphEntity();
    Background.prototype.draw = function(graph) {
        graph.ctx.save();
        graph.ctx.fillStyle = 'rgb(' + parseInt(this.r) + ',' + parseInt(this.g) + ',' + parseInt(this.b) + ')';
        graph.ctx.fillRect(0,0,graph.canvasWidth,graph.canvasHeight);
        graph.ctx.restore();
    };
    Background.prototype.onCull = function(graph) {
        return false;
    };
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
    Number.prototype.onClick = function () {
        console.log (this.image.src);
    };

    var demo = new DemoGraph($('#demo-bubble-sort'));
    demo.rootEntity = new Background('#ff0000');
    demo.rootEntity.addChild(new Number('images/number-0.png', 64, 64, 40, 80));
    demo.rootEntity.addChild(new Number('images/number-1.png', 64, 64, 110, 80));
    demo.rootEntity.addChild(new Number('images/number-2.png', 64, 64, 180, 80));
    demo.rootEntity.addChild(new Number('images/number-3.png', 64, 64, 250, 80));
    demo.rootEntity.addChild(new Number('images/number-4.png', 64, 64, 320, 80));
    demo.rootEntity.addChild(new Number('images/number-5.png', 64, 64, 390, 80));
    demo.rootEntity.addChild(new Number('images/number-6.png', 64, 64, 460, 80));
    demo.rootEntity.addChild(new Number('images/number-7.png', 64, 64, 530, 80));
    demo.rootEntity.addChild(new Number('images/number-8.png', 64, 64, 600, 80));
    demo.rootEntity.addChild(new Number('images/number-9.png', 64, 64, 670, 80));
    demo.run ();
}

window.addEventListener ('pageIn', function(e){
    if (e.id == 'page-bubble-sort') {
        createBubbleSortDemo ();
    }
});

