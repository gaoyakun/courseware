(function setupTransition(){
    Transition.setup ();
    Transition.setActivePage ($('#page-main'), 48);
    $('#to-what-is-sort').on ('click', function(){
        Transition.setActivePage ($('#page-what-is-sort'), 48);
        $('#page-title').html('何为排序');
    });
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

