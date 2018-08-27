import $ from 'jquery';
import {CousewareFramework} from '../lib/presentation';
import {Graph} from '../lib/graph';
import {NumberSequenceScene} from '../lib/demo';

export class CourseSort extends CousewareFramework {
    private graphRandUnsort: Graph;
    private graphRandSorted: Graph;
    private bubbleDemo: NumberSequenceScene;

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

        this.bubbleDemo = new NumberSequenceScene($('#demo-bubble-sort'));

        window.addEventListener ('pageIn', (evt:any)=>{
            if (evt.id == 'page-bubble-sort') {
                this.bubbleDemo.start ('rgba(0,0,0,255)',[3,2,8,4,8,6,9,1,0],{
                    margin_h: 50,
                    margin_v: 50,
                    padding: 0
                });
            }
        });        

        window.addEventListener ('pageOut', (evt:any)=>{
            if (evt.id == 'page-bubble-sort') {
                this.bubbleDemo.end ();
            }
        });        
    }

}

