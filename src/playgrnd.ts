import { cwApp, cwScene } from './lib/core';
import * as playground from './playground/playground';
import { cwPGCommandParser } from './playground/commands';

cwScene.init ();

const PG = new playground.cwPlayground (document.querySelector('#playground-canvas'), true);
const cmdInput:HTMLInputElement = document.querySelector('#command');
cmdInput.addEventListener ('keypress', (ev) => {
    const e = ev as KeyboardEvent;
    if (e.keyCode == 13) {
        PG.executeCommand (cwPGCommandParser.parse(cmdInput.value));
    }
});

cwApp.run ();


