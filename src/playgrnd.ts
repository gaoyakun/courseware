import { cwApp, cwScene } from './lib/core';
import * as playground from './playground/playground';
import { cwPGCommandParser } from './playground/commands';
import * as pgeditor from './playground/editor';

cwScene.init ();

const PG = new playground.cwPlayground (document.querySelector('#playground-canvas'), true);
const cmdInput:HTMLInputElement = document.querySelector('#command');
cmdInput.addEventListener ('keypress', (ev) => {
    const e = ev as KeyboardEvent;
    if (e.keyCode == 13) {
        PG.executeCommand (cwPGCommandParser.parse(cmdInput.value));
    }
});
const toolboxDiv: HTMLDivElement = document.querySelector('#toolbox');
const toolbox = new pgeditor.cwPGEditorToolbox (toolboxDiv, PG);
toolbox.loadTools ([
    {
        states: [{
            command: 'UseTool',
            label: '选'
        },{
            command: 'UseTool name=PGTool_Select',
            label: '选'
        }],
        width: 30,
        height: 30
    }, {
        states: [{
            command: 'CreateObject type=Label text=标签',
            label: 'L'
        }],
        width: 30,
        height: 30
    }
]);

cwApp.run ();


