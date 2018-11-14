import * as playground from '../playground';
import * as commands from '../commands';

interface ITool {
    command: commands.IPGCommand;
    iconClass: string;
    elementId?: string;
}

interface IObjectPaletteEntry {
    iconClass: string;
    createArgs?: {
        [arg: string]: any
    };
    commands?: {
        [cmd: string]: {
            iconClass: string;
            args?: {
                [arg: string]: any;
            }
        }
    }
}

interface IObjectPalette {
    [type: string]: IObjectPaletteEntry;
}

interface IToolPalette {
    [name: string]: {
        iconClass: string;
        args?: {
            [name: string]: any;
        }
    }
}

interface IToolSet {
    tools: IToolPalette;
    operations: IToolPalette;
    objects: IObjectPalette;
}

export class cwPGToolPalette {
    private static uniqueId: number = 1;
    private _editor: cwPGEditor;
    private _container: HTMLElement;
    private _tools: ITool[];
    private _curTool: ITool;
    constructor (editor: cwPGEditor, container: HTMLElement) {
        this._editor = editor;
        this._container = container;
        this._tools = [];
        this._curTool = null;
    }
    private getCreateObjectTool (tool: IObjectPaletteEntry): ITool {
        const tooldef: ITool = {
            command: {
                command: 'CreateObject'
            },
            iconClass: tool.iconClass
        }
        if (tool.createArgs) {
            for (const name in tool.createArgs) {
                tooldef.command[name] = tool.createArgs[name];
            }
        }
        return tooldef;
    }
    private getObjectCommandTool (tool: IObjectPaletteEntry, cmd: string): ITool {
        const tooldef: ITool = {
            command: {
                command: cmd
            },
            iconClass: tool.commands[cmd].iconClass
        }
        if (tool.commands[cmd].args) {
            for (const name in tool.commands[cmd].args) {
                tooldef.command[name] = tool.commands[cmd].args[name];
            }
        }
        return tooldef;
    }
    private getCommandTool (tool: IToolPalette, name: string): ITool {
        const tooldef: ITool = {
            command: {
                command: 'UseTool',
                name: name
            },
            iconClass: tool[name].iconClass
        }
        if (tool[name].args) {
            for (const argname in tool[name].args) {
                tooldef.command[argname] = tool[name].args[argname];
            }
        }
        return tooldef;
    }
    private createToolButton (tooldef: ITool): HTMLElement {
        this._tools.push (tooldef);
        const buttonSize = this._editor.toolFontSize + 10; 
        const toolButton: HTMLElement = document.createElement ('div');
        toolButton.classList.add ('flex-h', 'flex-align-x-center', 'flex-align-y-center');
        tooldef.elementId = `toolbutton-${cwPGToolPalette.uniqueId++}`;
        toolButton.classList.add ('toolbutton');
        toolButton.id = tooldef.elementId;
        toolButton.style.width = `${buttonSize}px`;
        toolButton.style.height = `${buttonSize}px`;
        toolButton.setAttribute ('toolIndex', String(this._tools.length-1));
        const toolIcon: HTMLElement = document.createElement ('i');
        toolIcon.style.fontSize = `${this._editor.toolFontSize}px`;
        toolIcon.style.color = '#fff';
        tooldef.iconClass.split (' ').forEach ((cls: string) => {
            toolIcon.classList.add (cls);
        });
        toolButton.appendChild (toolIcon);
        this._container.appendChild (toolButton);
        return toolButton;
    }
    unload () {
        while (this._container.hasChildNodes()) {
            this._container.removeChild(this._container.firstChild);
        }
        this._tools = [];
        this._editor.objectToolPalette.unload ();
    }
    loadObjectTools (objectTools: IObjectPaletteEntry) {
        if (objectTools.commands) {
            for (const cmd in objectTools.commands) {
                const tooldef = this.getObjectCommandTool (objectTools, cmd);
                const toolButton = this.createToolButton (tooldef);
                toolButton.addEventListener ('click', () => {
                    const toolIndex = Number(toolButton.getAttribute ('toolIndex'));
                    const tool = this._tools[toolIndex];
                    this._editor.executeCommand (tool.command);
                });
            }        
        }
    }
    loadObjectPalette (objectPalette: IObjectPalette) {
        for (const objectType in objectPalette) {
            const tool = objectPalette[objectType];
            const tooldef = this.getCreateObjectTool (tool);
            const toolButton = this.createToolButton (tooldef);
            toolButton.addEventListener ('click', () => {
                const toolIndex = Number(toolButton.getAttribute ('toolIndex'));
                const tool = this._tools[toolIndex];
                this._editor.executeCommand (tool.command);
            });
        };
    }
    loadToolPalette (toolPalette: IToolPalette) {
        for (const toolname in toolPalette) {
            const tooldef = this.getCommandTool (toolPalette, toolname);
            const toolButton = this.createToolButton (tooldef);
            toolButton.addEventListener ('click', () => {
                const toolIndex = Number(toolButton.getAttribute ('toolIndex'));
                const tool = this._tools[toolIndex];
                this._editor.executeCommand (tool.command);
            });
        }
    }
}

export class cwPGEditor {
    private _strokeColor: string;
    private _fillColor: string;
    private _toolFontSize: number;
    private _pg: playground.cwPlayground;
    private _toolset: IToolSet;
    private _objectPalette: cwPGToolPalette;
    private _objectToolPalette: cwPGToolPalette;
    private _toolPalette: cwPGToolPalette;
    private _opPalette: cwPGToolPalette;
    constructor (pg: playground.cwPlayground, toolset: IToolSet, objectPaletteElement:HTMLElement, objectToolPaletteElement:HTMLElement, toolPaletteElement:HTMLElement, opPaletteElement:HTMLElement) {
        this._strokeColor = '#000000';
        this._fillColor = '#ffffff';
        this._toolFontSize = 16;
        this._pg = pg;
        this._toolset = toolset;
        this._objectPalette = new cwPGToolPalette (this, objectPaletteElement);
        this._objectPalette.loadObjectPalette (toolset.objects);
        this._objectToolPalette = new cwPGToolPalette (this, objectToolPaletteElement);
        this._toolPalette = new cwPGToolPalette (this, toolPaletteElement);
        this._opPalette = new cwPGToolPalette (this, opPaletteElement);
    }
    get objectPalette () {
        return this._objectPalette;
    }
    get objectToolPalette () {
        return this._objectToolPalette;
    }
    get playground () {
        return this._pg;
    }
    get strokeColor () {
        return this._strokeColor;
    }
    set strokeColor (value: string) {
        this._strokeColor = value;
    }
    get fillColor () {
        return this._fillColor;
    }
    set fillColor (value: string) {
        this._fillColor = value;
    }
    get toolFontSize () {
        return this._toolFontSize;
    }
    set toolFontSize (value: number) {
        this._toolFontSize = value;
    }
    executeCommand (cmd: commands.IPGCommand) {
        const realCommand: any = {};
        for (const name in cmd) {
            const value = cmd[name];
            realCommand[name] = (typeof value === 'function') ? (value as Function) (this) : value;
        }
        this._pg.executeCommand (realCommand);
    }
}
