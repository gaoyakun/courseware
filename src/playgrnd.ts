import { cwApp, cwScene } from './lib/core';
import * as playground from './playground/playground';
import * as tools from './playground/tools';
import * as pgeditor from './playground/editor';

cwScene.init ();

const toolFontSize = '18px';
const PG = new playground.cwPlayground (document.querySelector('#playground-canvas'), true);
const toolboxDiv: HTMLDivElement = document.querySelector('#toolbox');
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

PG.on (tools.cwPGObjectSelectedEvent.type, (ev: tools.cwPGObjectSelectedEvent) => {
    switch (ev.object.entityType) {
    case 'Label':
        toolbox.unloadTools ();
        toolbox.loadTools (defaultTools);
        toolbox.loadTools ([{
            activeCommand: 'beginEdit',
            deactiveCommand: 'endEdit',
            iconClass: 'fas fa-edit fa-fw',
            fontSize: toolFontSize
        },{
            activeCommand: 'fontScaleUp step=2',
            iconClass: 'fas fa-plus fa-fw',
            fontSize: toolFontSize
        },{
            activeCommand: 'fontScaleDown step=2',
            iconClass: 'fas fa-minus fa-fw',
            fontSize: toolFontSize
        }]);
        break;
    }
});
PG.on (tools.cwPGObjectDeselectedEvent.type, (ev: tools.cwPGObjectDeselectedEvent) => {
    toolbox.unloadTools ();
    toolbox.loadTools (defaultTools);
});

const objectToolboxDiv: HTMLDivElement = document.querySelector('#object-toolbox');
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
cwApp.run ();


