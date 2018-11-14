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
        AlignTop: {
            iconClass: 'fas fa-align-right fa-rotate-left fa-fw'
        },
        AlignBottom: {
            iconClass: 'fas fa-align-right fa-rotate-right fa-fw'
        },
        AlignLeft: {
            iconClass: 'fas fa-align-left fa-fw'
        },
        AlignRight: {
            iconClass: 'fas fa-align-right fa-fw'
        },
        ArrangeH: {
            iconClass: 'fas fa-arrows-alt-h fa-fw'
        },
        ArrangeV: {
            iconClass: 'fas fa-arrows-alt-v fa-fw'
        }
    },
    objects: {
        Label: {
            iconClass: 'fas fa-font fa-fw',
            createArgs: {
                textColor: (editor:editor.cwPGEditor) => {
                    return editor.strokeColor;
                }
            },
            commands: {
                beginEdit: {
                    iconClass: 'fas fa-edit fa-fw'
                },
                fontScaleUp: {
                    iconClass: 'fas fa-plus fa-fw',
                    args: { step: 2 }
                },
                fontScaleDown: {
                    iconClass: 'fas fa-minus fa-fw',
                    args: { step: 2 }
                }
            }
        }
    }
};
