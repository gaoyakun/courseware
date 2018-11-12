import * as playground from '../playground';
import * as commands from '../commands';

export interface IToolDef {
    states: Array<{
        command: string;
        iconClass: string;
        color?: string;
    }>;
    fontSize: string;
}

export class cwPGEditorToolbox {
    private _container: HTMLDivElement;
    private _pg: playground.cwPlayground;
    private _tools: Array<IToolDef>;
    constructor (container: HTMLDivElement, pg: playground.cwPlayground) {
        this._container = container;
        this._pg = pg;
        this._tools = [];
        this.create (this._container);
    }
    create (container: HTMLDivElement) {
        this._container = container;
        // container.style.display = 'flex';
        // container.style.flexDirection = 'row';
        // container.style.flexWrap = 'wrap';
        // container.style.justifyContent = 'flex-start';
        // container.style.alignItems = 'flex-start';
        // container.style.alignContent = 'flex-start';
    }
    loadTools (tools: Array<IToolDef>) {
        tools.forEach ((tool: IToolDef) => {
            this._tools.push (tool);
            const toolIcon: HTMLElement = document.createElement ('i');
            toolIcon.classList.add ()

            toolIcon.style.fontSize = tool.fontSize || '60px';
            toolIcon.style.lineHeight = tool.fontSize || '60px';
            toolIcon.setAttribute ('toolIndex', String(this._tools.length-1));
            toolIcon.setAttribute ('togglable', tool.states.length > 1 ? 'true' : 'false');
            toolIcon.setAttribute ('toggleState', '0');
            this.applyToolStyles (toolIcon);

            this._container.appendChild (toolIcon);
            toolIcon.addEventListener ('click', () => {
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
        this._tools[toolIndex].states[index].iconClass.split (' ').forEach ((token: string) => {
            toolIcon.classList.add (token);
        });
        toolIcon.style.color = this._tools[toolIndex].states[index].color || '#888';
    }
}