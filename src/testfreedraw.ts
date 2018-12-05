import * as lib from './lib'
import * as pg from './playground'

const view = lib.cwScene.addCanvas (document.querySelector('#test-canvas'), true);
new pg.cwPGFreeDraw (view.rootNode, {
    lineWidth: 10,
    color: '#ff0000',
    mode: 'draw',
    curveMode: 1
}).setCapture ();
lib.cwScene.init ();
lib.cwApp.run ();


