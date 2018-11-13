import { cwApp, cwScene } from './lib/core';
import * as playground from './playground/playground';
import * as tools from './playground/tools';
import * as pgeditor from './playground/editor';

cwScene.init ();

const toolFontSize = '18px';
const PG = new playground.cwPlayground (document.querySelector('#playground-canvas'), true);
const toolboxDiv: HTMLDivElement = document.querySelector('#toolbox');
const toolbox = new pgeditor.cwPGEditorToolbox (toolboxDiv, PG, 'column');
toolbox.loadTools ([
    {
        states: [{
            command: 'UseTool',
            iconClass: 'fas fa-mouse-pointer fa-fw',
            color: '#888'
        },{
            command: 'UseTool name=PGTool_Select',
            iconClass: 'fas fa-mouse-pointer fa-fw',
            color: '#00f'
        }],
        fontSize: toolFontSize
    }, {
        states: [{
            command: 'UseTool',
            iconClass: 'fas fa-exchange-alt fa-fw',
            color: '#888'
        }, {
            command: 'UseTool name=PGTool_Swap',
            iconClass: 'fas fa-exchange-alt fa-fw',
            color: '#00f'
        }],
        fontSize: toolFontSize
    }, {
        states: [{
            command: 'CreateObject type=Label text=标签',
            iconClass: 'fas fa-font fa-fw'
        }],
        fontSize: toolFontSize
    }
]);
const objectToolboxDiv: HTMLDivElement = document.querySelector('#object-toolbox');
const objectToolbox = new pgeditor.cwPGEditorToolbox (objectToolboxDiv, PG, 'row');
PG.on (tools.cwPGObjectSelectedEvent.type, (ev: tools.cwPGObjectSelectedEvent) => {
    switch (ev.object.entityType) {
    case 'Label':
        objectToolbox.loadTools ([{
            states: [{
                command: 'beginEdit',
                iconClass: 'fas fa-edit fa-fw',
                color: '#00f'
            }],
            fontSize: toolFontSize
        },{
            states: [{
                command: 'fontScaleUp step=2',
                iconClass: 'fas fa-plus fa-fw',
                color: '#00f'
            }],
            fontSize: toolFontSize
        },{
            states: [{
                command: 'fontScaleDown step=2',
                iconClass: 'fas fa-minus fa-fw',
                color: '#00f'
            }],
            fontSize: toolFontSize
        }]);
        break;
    }
});
PG.on (tools.cwPGObjectDeselectedEvent.type, (ev: tools.cwPGObjectDeselectedEvent) => {
    objectToolbox.unloadTools ();
});

cwApp.run ();


