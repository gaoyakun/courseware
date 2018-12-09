import * as lib from 'libcatk';
import * as playground from './playground';

lib.ready (() => {
    const cv = new lib.BoundingHull ();
    console.log (cv.length);

    if (!(window as any).cw) {
        (window as any).cw = {
            rand: (minval:number,maxval:number) => {
                return minval + Math.random() * (maxval - minval);
            },
            randi: (minval:number,maxval:number) => {
                const m1 = Math.ceil(minval);
                const m2 = Math.floor(maxval);
                return  Math.round(m1 + Math.random() * (m2 - m1));
            }
        }
    }
    (window as any).cwRandom = (function (f) {
        if (!f) {
            f = function (minval:number, maxval:number): number {
                return minval + Math.random() * (maxval - minval);
            }
        }
    })((window as any).cwRandom);

    const PG = new playground.cwPlayground (document.querySelector('#playground-canvas'), true);
    playground.installTools (PG);
    playground.installFactories (PG);

    const toolToolboxDiv: HTMLDivElement = document.querySelector('#tool-toolbox');
    const opToolboxDiv: HTMLDivElement = document.querySelector('#op-toolbox');
    const objPropGridDiv: HTMLDivElement = document.querySelector('#object-propgrid');
    const toolPropGridDiv: HTMLDivElement = document.querySelector('#tool-propgrid');
    const g_editor = new playground.cwPGEditor (PG, playground.cwPGDefaultToolSet, toolToolboxDiv, opToolboxDiv, objPropGridDiv, toolPropGridDiv);

    PG.on (playground.cwPGObjectSelectedEvent.type, (ev: playground.cwPGObjectSelectedEvent) => {
        if (ev.objects.length == 1) {
            g_editor.objectPropertyGrid.loadObjectProperties (ev.objects[0]);
        } else {
            g_editor.objectPropertyGrid.loadPageProperties ();
        }
    });
    PG.on (playground.cwPGObjectDeselectedEvent.type, (ev: playground.cwPGObjectDeselectedEvent) => {
        if (ev.objects.length == 1) {
            g_editor.objectPropertyGrid.loadObjectProperties (ev.objects[0]);
        } else {
            g_editor.objectPropertyGrid.loadPageProperties ();
        }
    });
    PG.on (playground.cwPGObjectMovedEvent.type, (ev: playground.cwPGObjectMovedEvent) => {
        g_editor.objectPropertyGrid.reloadObjectProperties ();
    });
    PG.on (playground.cwPGToolActivateEvent.type, (ev: playground.cwPGToolActivateEvent) => {
        g_editor.toolPropertyGrid.loadToolProperties (ev.tool);
        if (ev.tool.name === playground.cwPGSelectTool.toolname) {
            g_editor.objectPropertyGrid.loadPageProperties ();
        }
    });
    PG.on (playground.cwPGToolDeactivateEvent.type, (ev: playground.cwPGToolDeactivateEvent) => {
        g_editor.toolPropertyGrid.clear ();
        if (ev.tool.name === playground.cwPGSelectTool.toolname) {
            g_editor.objectPropertyGrid.loadPageProperties ();
        }
    });
});


