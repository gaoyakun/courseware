import $ from 'jquery';
import { CousewareFramework } from '../lib/presentation';
import { Graph } from '../lib/graph';
import { DemoBase } from './demobase';
import { cwScene, cwApp } from '../lib/core';
import { cwClickEvent } from '../lib/events';

export class CourseSort extends CousewareFramework {
    private graphRandUnsort: Graph;
    private graphRandSorted: Graph;
    private bubbleDemo: DemoBase;

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

        this.bubbleDemo = new DemoBase(document.querySelector('#demo-bubble-sort'));
        this.bubbleDemo.view.on (cwClickEvent.type, (ev:cwClickEvent)=>{
            this.bubbleDemo.playBubbleSortDemo ();
        });
        window.addEventListener ('pageIn', (evt:any)=>{
            if (evt.id == 'page-bubble-sort') {
                cwScene.init ();
                cwApp.run ();
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
                cwScene.done ();
                cwApp.stop ();
                const pagefoot:HTMLDivElement = document.querySelector ('.page-foot');
                pagefoot.removeChild (pagefoot.firstChild);
                pagefoot.removeChild (pagefoot.firstChild);
            }
        });     
    }
}

