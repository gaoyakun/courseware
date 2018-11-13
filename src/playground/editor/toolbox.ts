import * as playground from '../playground';
import * as commands from '../commands';

export interface IToolDef {
    states: Array<{
        command: string;
        iconClass?: string;
        color?: string;
    }>;
    fontSize: string;
}

export class cwPGEditorToolbox {
    private _container: HTMLDivElement;
    private _pg: playground.cwPlayground;
    private _tools: Array<IToolDef>;
    private _curTool: IToolDef;
    private _direction: string;
    private _strokeColor: string;
    private _fillColor: string;
    constructor (container: HTMLDivElement, pg: playground.cwPlayground, direction: string) {
        this._container = container;
        this._pg = pg;
        this._tools = [];
        this._curTool = null;
        this._direction = direction;
        this._strokeColor = '#000000';
        this._fillColor = '#ffffff';
        this.create (this._container);
    }
    create (container: HTMLDivElement) {
        this._container = container;
        container.style.display = 'flex';
        container.style.flexDirection = this._direction;
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'flex-start';
        container.style.alignItems = 'flex-start';
        container.style.alignContent = 'flex-start';
    }
    loadTools (tools: Array<IToolDef>) {
        tools.forEach ((tool: IToolDef) => {
            this._tools.push (tool);
            const buttonSize = parseInt(tool.fontSize || '60') + 10; 
            if (tool.states[0].command === '$StrokeColor') {
                const inputBox: HTMLInputElement = document.createElement ('input');
                inputBox.type = 'color';
                inputBox.value = this._strokeColor;
                inputBox.style.width = `${buttonSize}px`;
                inputBox.style.height = `${buttonSize}px`;
                inputBox.style.margin = '2px';
                inputBox.onchange = () => {
                    this._strokeColor = inputBox.value;
                }
                this._container.appendChild (inputBox);
            } else if (tool.states[0].command === '$FillColor') {
                const inputBox: HTMLInputElement = document.createElement ('input');
                inputBox.type = 'color';
                inputBox.value = this._fillColor;
                inputBox.style.width = `${buttonSize}px`;
                inputBox.style.height = `${buttonSize}px`;
                inputBox.style.margin = '2px';
                inputBox.onchange = () => {
                    this._fillColor = inputBox.value;
                }
                this._container.appendChild (inputBox);
            } else {
                const toolButton: HTMLElement = document.createElement ('div');
                toolButton.classList.add ('flex-h', 'flex-align-x-center', 'flex-align-y-center');
                toolButton.style.backgroundColor = '#444';
                toolButton.style.width = `${buttonSize}px`;
                toolButton.style.height = `${buttonSize}px`;
                toolButton.style.borderRadius = '3px';
                toolButton.style.border = '2px solid #fff';
                toolButton.style.margin = '2px';
                const toolIcon: HTMLElement = document.createElement ('i');
                toolIcon.style.fontSize = tool.fontSize || '60px';
                toolIcon.style.lineHeight = tool.fontSize || '60px';
                toolIcon.setAttribute ('toolIndex', String(this._tools.length-1));
                toolIcon.setAttribute ('togglable', tool.states.length > 1 ? 'true' : 'false');
                toolIcon.setAttribute ('toggleState', '0');
                this.applyToolStyles (toolIcon);

                toolButton.appendChild (toolIcon);
                this._container.appendChild (toolButton);
                toolButton.addEventListener ('click', () => {
                    const togglable = toolIcon.getAttribute ('togglable');
                    let toggleState = Number(toolIcon.getAttribute ('toggleState'));
                    if (togglable == 'true') {
                        toggleState = 1 - Number(toolIcon.getAttribute ('toggleState'));
                    }
                    const toolIndex = Number(toolIcon.getAttribute ('toolIndex'));
                    toolIcon.setAttribute ('toggleState', String(toggleState));
                    this.applyToolStyles (toolIcon);
                    this._pg.executeCommand (commands.cwPGCommandParser.parse(this._tools[toolIndex].states[toggleState].command));
                });
            }
        });
    }
    unloadTools () {
        while (this._container.hasChildNodes()) {
            this._container.removeChild(this._container.firstChild);
        }
        this._tools = [];
    }
    private applyToolStyles (toolIcon: HTMLElement) {
        const index = Number(toolIcon.getAttribute ('toggleState'));
        const toolIndex = Number(toolIcon.getAttribute ('toolIndex'));
        if (this._tools[toolIndex].states[index].iconClass) {
            this._tools[toolIndex].states[index].iconClass.split (' ').forEach ((token: string) => {
                toolIcon.classList.add (token);
            });
        }
        toolIcon.style.color = this._tools[toolIndex].states[index].color || '#888';
    }
}