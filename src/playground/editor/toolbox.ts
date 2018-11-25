import * as playground from '../playground';
import * as commands from '../commands';
import * as editor from './editor';

export interface IToolDef {
    activeCommand: string;
    deactiveCommand?: string;
    iconClass?: string;
    fontSize: string;
    elementId?: string;
}

export class cwPGEditorToolbox {
    private static uniqueId: number = 1;
    private _container: HTMLDivElement;
    private _pg: playground.cwPlayground;
    private _tools: IToolDef[];
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
    loadTools (tools: IToolDef[]) {
        tools.forEach ((tool: IToolDef) => {
            this._tools.push (tool);
            const buttonSize = parseInt(tool.fontSize || '60') + 10; 
            if (tool.activeCommand === '$StrokeColor') {
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
            } else if (tool.activeCommand === '$FillColor') {
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
                tool.elementId = `toolbutton-${cwPGEditorToolbox.uniqueId++}`;
                toolButton.classList.add ('toolbutton');
                toolButton.id = tool.elementId;
                toolButton.style.width = `${buttonSize}px`;
                toolButton.style.height = `${buttonSize}px`;
                toolButton.setAttribute ('toolIndex', String(this._tools.length-1));
                const toolIcon: HTMLElement = document.createElement ('i');
                toolIcon.style.fontSize = tool.fontSize || '60px';
                toolIcon.style.color = '#fff';
                toolIcon.style.lineHeight = tool.fontSize || '60px';
                tool.iconClass.split (' ').forEach ((cls: string) => {
                    toolIcon.classList.add (cls);
                });

                toolButton.appendChild (toolIcon);
                this._container.appendChild (toolButton);

                toolButton.addEventListener ('click', () => {
                    const toolIndex = Number(toolButton.getAttribute ('toolIndex'));
                    const tool = this._tools[toolIndex];
                    if (tool !== this._curTool) {
                        if (this._curTool) {
                            const curToolButton = document.querySelector(`#${this._curTool.elementId}`);
                            curToolButton.classList.remove ('active');
                            if (this._curTool.deactiveCommand) {
                                this._pg.executeCommand (commands.cwPGCommandParser.parse(this._curTool.deactiveCommand));
                            }
                            this._curTool = null;
                        }
                    }
                    if (tool) {
                        const button = document.querySelector(`#${tool.elementId}`);
                        button.classList.add ('active');
                        this._pg.executeCommand (commands.cwPGCommandParser.parse(tool.activeCommand));
                        this._curTool = tool;
                    }
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
}