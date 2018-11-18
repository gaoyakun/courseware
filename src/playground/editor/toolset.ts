import * as editor from './editor';

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
            iconClass: 'fas fa-trash-alt fa-fw'
        },
        Clone: {
            iconClass: 'fas fa-clone fa-fw'
        },
        AlignH: {
            iconClass: 'fas fa-align-right fa-rotate-90 fa-fw'
        },
        AlignV: {
            iconClass: 'fas fa-align-left fa-fw'
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
