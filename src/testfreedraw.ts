import * as lib from 'libcatk'
import * as pg from './playground'

lib.ready (() => {
    const view = lib.App.addCanvas (document.querySelector('#test-canvas'), true);
    new pg.cwPGFreeDraw (view.rootNode, {
        lineWidth: 10,
        color: '#ff0000',
        mode: 'draw',
        curveMode: 1
    }).setCapture ();
});


