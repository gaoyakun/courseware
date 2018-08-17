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
        this.color = color;
    }
    Background.prototype = new GraphEntity();
    Background.prototype.draw = function(graph) {
        graph.ctx.save();
        graph.ctx.fillStyle = this.color;
        graph.ctx.fillRect(0,0,graph.canvasWidth,graph.canvasHeight);
        graph.ctx.restore();
    };

    var Number = function (image, width, height) {
        this.image = new Image();
        this.image.src = image;
        this.width = width;
        this.height = height;
    };
    Number.prototype = new GraphEntity();
    Number.prototype.draw = function(graph) {
        graph.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
    }

    var demo = new DemoGraph($('#demo-bubble-sort'));
    demo.rootEntity = new Background('#ff0000');
    var n0 = new Number('images/number-0.png', 64, 64);
    var n1 = new Number('images/number-0.png', 64, 64);
    var angle = 0;
    n0.z = 1;
    demo.rootEntity.addChild (n0);
    setInterval (function(){
        n0.localMatrix = Transform2d.getTranslate(300,300).rotate(angle).translate(0,100);
        angle += 0.05;
        demo.draw();
    }, 16);
}

window.addEventListener ('pageIn', function(e){
    if (e.id == 'page-bubble-sort') {
        createBubbleSortDemo ();
    }
});

