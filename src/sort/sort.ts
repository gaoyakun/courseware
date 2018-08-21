import $ from 'jquery';
import {CousewareFramework} from '../lib/presentation';
import {DemoGraph,GraphEntity,Graph} from '../lib/graph';
import {Bkground,Number} from '../lib/demo';

export class CourseSort extends CousewareFramework {
    private graphRandUnsort: Graph;
    private graphRandSorted: Graph;
    private bubbleDemo: DemoGraph;

    constructor () {
        super();
        this.setup ($('#page-main'));

        let values = [];
        for (var i = 0; i < 60; i++) {
            values.push (Math.round(Math.random()*100));
        }
        this.graphRandUnsort = new Graph($('#fig-rand-unsort'));
        this.graphRandUnsort.histogram ({
            values:values,
            paddingH:5
        });
        values.sort(function(a,b){
            return a - b;
        });
        this.graphRandSorted = new Graph($('#fig-rand-sorted'));
        this.graphRandSorted.histogram ({
            values:values,
            paddingH:5
        });

        this.bubbleDemo = new DemoGraph($('#demo-bubble-sort'));

        window.addEventListener ('pageIn', (evt:any)=>{
            if (evt.id == 'page-bubble-sort') {
                this.startBubbleSortDemo ();
            }
        });        

        window.addEventListener ('pageOut', (evt:any)=>{
            if (evt.id == 'page-bubble-sort') {
                this.stopBubbleSortDemo ();
            }
        });        
    }

    startBubbleSortDemo () {
        this.bubbleDemo.rootEntity = new Bkground('#fff');
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-0.png', 64, 64, 40, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-1.png', 64, 64, 110, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-2.png', 64, 64, 180, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-3.png', 64, 64, 250, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-4.png', 64, 64, 320, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-5.png', 64, 64, 390, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-6.png', 64, 64, 460, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-7.png', 64, 64, 530, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-8.png', 64, 64, 600, 80));
        this.bubbleDemo.rootEntity.addChild(new Number('images/number-9.png', 64, 64, 670, 80));
        this.bubbleDemo.run ();
    }

    stopBubbleSortDemo () {
        this.bubbleDemo.stop ();
        this.bubbleDemo.rootEntity = null;
    }
}

