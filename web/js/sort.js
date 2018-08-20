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
    var demo = new DemoGraph($('#demo-bubble-sort'));
    demo.rootEntity = new Background('#fff');
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

