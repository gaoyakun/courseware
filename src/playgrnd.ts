import * as lib from './lib';
import * as playground from './playground';

const cv = new lib.cwBoundingHull ();
console.log (cv.length);

lib.cwScene.init ();

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
        g_editor.objectPropertyGrid.clear ();
    }
});
PG.on (playground.cwPGObjectDeselectedEvent.type, (ev: playground.cwPGObjectDeselectedEvent) => {
    g_editor.objectPropertyGrid.clear ();
});
PG.on (playground.cwPGObjectMovedEvent.type, (ev: playground.cwPGObjectMovedEvent) => {
    g_editor.objectPropertyGrid.reloadObjectProperties ();
});
PG.on (playground.cwPGToolActivateEvent.type, (ev: playground.cwPGToolActivateEvent) => {
    g_editor.toolPropertyGrid.loadToolProperties (ev.tool);
});
PG.on (playground.cwPGToolDeactivateEvent.type, (ev: playground.cwPGToolDeactivateEvent) => {
    g_editor.toolPropertyGrid.clear ();
});
lib.cwApp.run ();


