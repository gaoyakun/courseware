(function setupPages(){
    Presentation.setup ($('#page-main'));
})();

(function createRandFig(){
    var values = [];
    for (var i = 0; i < 60; i++) {
        values.push (parseInt(Math.random()*100));
    }
    Graph.histogram ($('#fig-rand-unsort'), {
        values:values,
        paddingH:5
    });
    values.sort(function(a,b){
        return a - b;
    });
    Graph.histogram ($('#fig-rand-sorted'), {
        values:values,
        paddingH:5
    });
})();

