import { cwApp, cwScene, cwSceneObject } from './lib/core';
import { cwcKeyframeAnimation, cwcImage } from './lib/components';
import { cwSplineType } from './lib/curve';

cwScene.init ();
let view = cwScene.addView (document.querySelector('#test-canvas'), true);

const testNode = new cwSceneObject(view.rootNode);
testNode.addComponent(new cwcImage('images/return.png', 60, 60));
testNode.addComponent(new cwcKeyframeAnimation({
    repeat:0,
    autoRemove:true,
    tracks:{
        translation: {
            type:cwSplineType.POLY,
            cp:[{x:0,y:[0,300]},{x:1000,y:[100,200]},{x:2000,y:[200,300]},{x:3000,y:[300,400]},{x:4000,y:[400,300]}]
        },
        rotation: {
            type:cwSplineType.LINEAR,
            cp:[{x:0,y:0}, {x:4000,y:Math.PI*32}]            
        },
        scale: {
            type:cwSplineType.POLY,
            cp:[{x:0,y:[1,1]},{x:2000,y:[3,3]},{x:4000,y:[1,1]}]
        }
    }
}));
cwApp.run ();


