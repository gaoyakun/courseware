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
        states: [{
            command: 'UseTool',
            iconClass: 'fas fa-mouse-pointer fa-fw',
            color: '#fff'
        },{
            command: 'UseTool name=PGTool_Select',
            iconClass: 'fas fa-mouse-pointer fa-fw',
            color: '#fff'
        }],
        fontSize: toolFontSize
    }, {
        states: [{
            command: 'UseTool',
            iconClass: 'fas fa-exchange-alt fa-fw',
            color: '#fff'
        }, {
            command: 'UseTool name=PGTool_Swap',
            iconClass: 'fas fa-exchange-alt fa-fw',
            color: '#fff'
        }],
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
            states: [{
                command: 'beginEdit',
                iconClass: 'fas fa-edit fa-fw',
                color: '#fff'
            }],
            fontSize: toolFontSize
        },{
            states: [{
                command: 'fontScaleUp step=2',
                iconClass: 'fas fa-plus fa-fw',
                color: '#fff'
            }],
            fontSize: toolFontSize
        },{
            states: [{
                command: 'fontScaleDown step=2',
                iconClass: 'fas fa-minus fa-fw',
                color: '#fff'
            }],
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
    states: [{
        command: 'CreateObject type=Label text=标签',
        iconClass: 'fas fa-font fa-fw',
        color: '#fff'
    }],
    fontSize: toolFontSize
}]);

const commonToolboxDiv: HTMLDivElement = document.querySelector('#common-toolbox');
const commonToolbox = new pgeditor.cwPGEditorToolbox (commonToolboxDiv, PG, 'column');
commonToolbox.loadTools ([{
    states: [{
        command: '$StrokeColor',
        iconClass: ''
    }],
    fontSize: toolFontSize
},{
    states: [{
        command: '$FillColor',
        iconClass: ''
    }],
    fontSize: toolFontSize
}]);
cwApp.run ();


