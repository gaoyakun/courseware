import { cwApp, cwScene } from './lib/core';
import * as playground from './playground/playground';
import * as tools from './playground/tools';
import * as objects from './playground/objects';
import * as pgeditor from './playground/editor';

cwScene.init ();

const PG = new playground.cwPlayground (document.querySelector('#playground-canvas'), true);
tools.installTools (PG);
objects.installFactories (PG);

const toolToolboxDiv: HTMLDivElement = document.querySelector('#tool-toolbox');
const objectToolboxDiv: HTMLDivElement = document.querySelector('#object-toolbox');
const opToolboxDiv: HTMLDivElement = document.querySelector('#op-toolbox');
const propGridDiv: HTMLDivElement = document.querySelector('#object-propgrid');
const g_editor = new pgeditor.cwPGEditor (PG, pgeditor.cwPGDefaultToolSet, objectToolboxDiv, toolToolboxDiv, opToolboxDiv, propGridDiv);

/*
const toolbox = new pgeditor.cwPGEditorToolbox (toolboxDiv, PG, 'column');
const defaultTools = [
    {
        activeCommand: 'UseTool name=Select',
        deactiveCommand: 'UseTool',
        iconClass: 'fas fa-mouse-pointer fa-fw',
        fontSize: toolFontSize
    }, {
        activeCommand: 'UseTool name=Swap',
        deactiveCommand: 'UseTool',
        iconClass: 'fas fa-exchange-alt fa-fw',
        fontSize: toolFontSize
    }
];
toolbox.loadTools (defaultTools);
*/
PG.on (tools.cwPGObjectSelectedEvent.type, (ev: tools.cwPGObjectSelectedEvent) => {
    g_editor.opPalette.unload ();
    g_editor.opPalette.loadOpPalette (g_editor.toolSet.operations);
    g_editor.opPalette.loadObjectTools (g_editor.toolSet.objects[ev.objects[ev.objects.length-1].entityType]);
    if (ev.objects.length == 1) {
        g_editor.objectPropertyGrid.loadObjectProperties (ev.objects[0]);
    } else {
        g_editor.objectPropertyGrid.clear ();
    }
});
PG.on (tools.cwPGObjectDeselectedEvent.type, (ev: tools.cwPGObjectDeselectedEvent) => {
    g_editor.opPalette.unload ();
    g_editor.opPalette.loadOpPalette (g_editor.toolSet.operations);
    g_editor.objectPropertyGrid.clear ();
});
PG.on (tools.cwPGObjectMovedEvent.type, (ev: tools.cwPGObjectMovedEvent) => {
    g_editor.objectPropertyGrid.reloadObjectProperties ();
});
/*
const objectToolbox = new pgeditor.cwPGEditorToolbox (objectToolboxDiv, PG, 'row');
objectToolbox.loadTools ([{
    activeCommand: 'CreateObject type=Label text=标签',
    iconClass: 'fas fa-font fa-fw',
    fontSize: toolFontSize
}]);

const commonToolboxDiv: HTMLDivElement = document.querySelector('#common-toolbox');
const commonToolbox = new pgeditor.cwPGEditorToolbox (commonToolboxDiv, PG, 'column');
commonToolbox.loadTools ([{
    activeCommand: '$StrokeColor',
    iconClass: '',
    fontSize: toolFontSize
},{
    activeCommand: '$FillColor',
    iconClass: '',
    fontSize: toolFontSize
}]);
*/

cwApp.run ();


