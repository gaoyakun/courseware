import * as core from '../../lib/core';
import * as editor from './editor';
import * as commands from '../commands';
import { CousewareFramework } from '../../lib/presentation';

export const cwPGDefaultToolSet = {
    tools: {
        Select: {
            iconClass: 'fas fa-mouse-pointer fa-fw'
        },
        Swap: {
            iconClass: 'fas fa-exchange-alt fa-fw'
        }
    },
    operations: {
        Delete: {
            iconClass: 'fas fa-trash-alt fa-fw',
            command: function(editor: editor.cwPGEditor) {
                const cmd: commands.IPGCommand = { command: 'GetSelected' };
                editor.playground.executeCommand (cmd);
                if (cmd.selectedObjects && cmd.selectedObjects.length > 0) {
                    editor.playground.executeCommand ({
                        command: 'DeleteObjects',
                        objects: cmd.selectedObjects.map((obj:core.cwSceneObject) => obj.entityName)
                    });
                }
            }
        },
        Clone: {
            iconClass: 'fas fa-clone fa-fw'
        },
        AlignLeft: {
            iconClass: 'fas fa-align-left fa-fw',
            command: function(editor: editor.cwPGEditor) {
                const cmd: commands.IPGCommand = { command: 'GetSelected' };
                editor.playground.executeCommand (cmd);
                if (cmd.selectedObjects && cmd.selectedObjects.length > 0) {
                    editor.playground.executeCommand ({
                        command: 'AlignObjectsLeft',
                        objects: cmd.selectedObjects.map((obj:core.cwSceneObject) => obj.entityName)
                    });
                }
            }
        },
        AlignRight: {
            iconClass: 'fas fa-align-right fa-fw',
            command: function(editor: editor.cwPGEditor) {
                const cmd: commands.IPGCommand = { command: 'GetSelected' };
                editor.playground.executeCommand (cmd);
                if (cmd.selectedObjects && cmd.selectedObjects.length > 0) {
                    editor.playground.executeCommand ({
                        command: 'AlignObjectsRight',
                        objects: cmd.selectedObjects.map((obj:core.cwSceneObject) => obj.entityName)
                    });
                }
            }
        },
        AlignTop: {
            iconClass: 'fas fa-align-right fa-rotate-270 fa-fw',
            command: function(editor: editor.cwPGEditor) {
                const cmd: commands.IPGCommand = { command: 'GetSelected' };
                editor.playground.executeCommand (cmd);
                if (cmd.selectedObjects && cmd.selectedObjects.length > 0) {
                    editor.playground.executeCommand ({
                        command: 'AlignObjectsTop',
                        objects: cmd.selectedObjects.map((obj:core.cwSceneObject) => obj.entityName)
                    });
                }
            }
        },
        AlignBottom: {
            iconClass: 'fas fa-align-right fa-rotate-90 fa-fw',
            command: function(editor: editor.cwPGEditor) {
                const cmd: commands.IPGCommand = { command: 'GetSelected' };
                editor.playground.executeCommand (cmd);
                if (cmd.selectedObjects && cmd.selectedObjects.length > 0) {
                    editor.playground.executeCommand ({
                        command: 'AlignObjectsBottom',
                        objects: cmd.selectedObjects.map((obj:core.cwSceneObject) => obj.entityName)
                    });
                }
            }
        },
        ArrangeH: {
            iconClass: 'fas fa-arrows-alt-h fa-fw'
        },
        ArrangeV: {
            iconClass: 'fas fa-arrows-alt-v fa-fw'
        },
        $StrokeColor: {
            iconClass: function (editor: editor.cwPGEditor) {
                const inputBox: HTMLInputElement = document.createElement ('input');
                inputBox.type = 'color';
                inputBox.value = editor.strokeColor;
                inputBox.style.padding = '0px';
                inputBox.onchange = () => {
                    editor.strokeColor = inputBox.value;
                }
                return inputBox;
            }
        },
        $FillColor: {
            iconClass: function (editor: editor.cwPGEditor) {
                const inputBox: HTMLInputElement = document.createElement ('input');
                inputBox.type = 'color';
                inputBox.value = editor.fillColor;
                inputBox.style.padding = '0px';
                inputBox.onchange = () => {
                    editor.fillColor = inputBox.value;
                }
                return inputBox;
            }
        }
    },
    objects: {
        Label: {
            iconClass: 'fas fa-font fa-fw',
            createArgs: {
                text: '标签',
                textColor: '#000000'
            }
        }
    }
};
