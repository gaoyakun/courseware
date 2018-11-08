import { cwApp, cwScene } from './lib/core';
import * as playground from './playground/playground';
import { cwPGCommandParser } from './playground/commands';
import * as pgeditor from './playground/editor';

cwScene.init ();

const PG = new playground.cwPlayground (document.querySelector('#playground-canvas'), true);
const toolboxDiv: HTMLDivElement = document.querySelector('#toolbox');
const toolbox = new pgeditor.cwPGEditorToolbox (toolboxDiv, PG);
toolbox.loadTools ([
    {
        states: [{
            command: 'UseTool',
            iconClass: 'fas fa-mouse-pointer fa-fw',
            color: '#888'
        },{
            command: 'UseTool name=PGTool_Select',
            iconClass: 'fas fa-home fa-fw',
            color: '#00f'
        }],
        fontSize: '24px'
    }, {
        states: [{
            command: 'CreateObject type=Label text=标签',
            iconClass: 'fas fa-font fa-fw'
        }],
        fontSize: '24px'
    }
]);


cwApp.run ();


