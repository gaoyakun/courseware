import * as playground from '../playground';
import * as commands from '../commands';

export interface IToolDef {
    states: Array<{
        command: string;
        label: string;
        labelColor: string;
        labelFontSize: number;
        labelFontStyle: string;
        labelFontWeight: string;
        labelFontFamily: string;
        background: string;
    }>;
    width: number;
    height: number;
}

export class cwPGEditorToolbox {
    private _container: HTMLDivElement;
    private _pg: playground.cwPlayground;
    private _tools: Array<IToolDef>;
    constructor (container: HTMLDivElement, pg: playground.cwPlayground) {
        this._container = container;
        this._pg = pg;
        this._tools = null;
        this.create (this._container);
    }
    create (container: HTMLDivElement) {
        this._container = container;
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'flex-start';
        container.style.alignItems = 'flex-start';
        container.style.alignContent = 'flex-start';
    }
    loadTools (tools: Array<IToolDef>) {
        tools.forEach ((tool: IToolDef) => {
            this._tools.push (tool);
            const toolDiv: HTMLDivElement = document.createElement ('div');
            toolDiv.style.width = tool.width == undefined ? '60px' : `${tool.width}px`;
            toolDiv.style.height = tool.height == undefined ? '60px' : `${tool.height}px`;
            toolDiv.style.textAlign = 'center';
            toolDiv.style.lineHeight = toolDiv.style.height;
            toolDiv.setAttribute ('toolIndex', String(this._tools.length-1));
            toolDiv.setAttribute ('togglable', tool.states.length > 1 ? 'true' : 'false');
            toolDiv.setAttribute ('toggleState', '0');
            this.applyToolStyles (toolDiv);

            this._container.appendChild (toolDiv);
            toolDiv.addEventListener ('click', () => {
                const togglable = toolDiv.getAttribute ('togglable');
                if (togglable == 'true') {
                    const toggleState = 1 - Number(toolDiv.getAttribute ('toggleState'));
                    const toolIndex = Number(toolDiv.getAttribute ('toolIndex'));
                    toolDiv.setAttribute ('toggleState', String(toggleState));
                    this.applyToolStyles (toolDiv);
                    this._pg.executeCommand (commands.cwPGCommandParser.parse(this._tools[toolIndex].states[toggleState].command));
                }
            });
        });
    }
    private applyToolStyles (toolDiv: HTMLDivElement) {
        const index = Number(toolDiv.getAttribute ('toggleState'));
        const toolIndex = Number(toolDiv.getAttribute ('toolIndex'));
        toolDiv.style.fontSize = this._tools[toolIndex].states[index].labelFontSize == undefined ? '16px' : `${this._tools[toolIndex].states[index].labelFontSize}px`;
        toolDiv.style.fontStyle = this._tools[toolIndex].states[index].labelFontStyle || 'normal';
        toolDiv.style.fontWeight = this._tools[toolIndex].states[index].labelFontWeight || 'normal';
        toolDiv.style.fontFamily = this._tools[toolIndex].states[index].labelFontFamily || '微软雅黑';
        toolDiv.style.color = this._tools[toolIndex].states[index].labelColor || '#000';
        toolDiv.style.backgroundColor = this._tools[toolIndex].states[index].background || '#fff';
        toolDiv.innerText = this._tools[toolIndex].states[index].label;
    }
}