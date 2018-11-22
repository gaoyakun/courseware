import $ from 'jquery';
import * as lib from '../lib';
import { DemoBase } from './demobase';

export class CourseSort extends lib.CousewareFramework {
    private graphRandUnsort: lib.Graph;
    private graphRandSorted: lib.Graph;
    private bubbleDemo: DemoBase;

    constructor () {
        super();
        this.setup ($('#page-main'));

        let values = [];
        for (var i = 0; i < 60; i++) {
            values.push (Math.round(Math.random()*100));
        }
        this.graphRandUnsort = new lib.Graph($('#fig-rand-unsort'));
        this.graphRandUnsort.histogram ({
            values:values,
            paddingH:5
        });
        values.sort(function(a,b){
            return a - b;
        });
        this.graphRandSorted = new lib.Graph($('#fig-rand-sorted'));
        this.graphRandSorted.histogram ({
            values:values,
            paddingH:5
        });

        this.bubbleDemo = new DemoBase(document.querySelector('#demo-bubble-sort'));
        window.addEventListener ('pageIn', (evt:any)=>{
            if (evt.id == 'page-bubble-sort') {
                lib.cwScene.init ();
                lib.cwApp.run ();
                let numbers = [];
                for (let i = 0; i < 12; i++) {
                    numbers.push (Math.floor(Math.random()*10));
                }
                this.bubbleDemo.start (numbers,{
                    margin_h: 10,
                    margin_v: 60,
                    padding: 0
                });
                const pagefoot:HTMLDivElement = document.querySelector ('.page-foot');
                const refresh:HTMLAnchorElement = document.createElement ('a');
                const refreshImg:HTMLImageElement = document.createElement ('img');
                refreshImg.src = 'images/refresh.png';
                refresh.appendChild (refreshImg);
                refresh.style.marginLeft = '10px';
                refresh.style.cursor = 'pointer';
                refresh.addEventListener ('click', ev=>{
                    this.bubbleDemo.playShuffleDemo ();
                });
                pagefoot.insertBefore(refresh, pagefoot.firstChild);

                const sort:HTMLAnchorElement = document.createElement ('a');
                const sortImg:HTMLImageElement = document.createElement ('img');
                sortImg.src = 'images/arrow_r.png';
                sort.appendChild (sortImg);
                sort.style.marginLeft = '60px';
                sort.style.cursor = 'pointer';
                sort.addEventListener ('click', ev=>{
                    this.bubbleDemo.playBubbleSortDemo ();
                });
                pagefoot.insertBefore(sort, pagefoot.firstChild);
            }
        });        
        window.addEventListener ('pageOut', (evt:any)=>{
            if (evt.id == 'page-bubble-sort') {
                this.bubbleDemo.end ();
                lib.cwScene.done ();
                lib.cwApp.stop ();
                const pagefoot:HTMLDivElement = document.querySelector ('.page-foot');
                pagefoot.removeChild (pagefoot.firstChild);
                pagefoot.removeChild (pagefoot.firstChild);
            }
        });     
    }
}

