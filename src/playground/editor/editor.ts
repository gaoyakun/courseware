import * as lib from '../../lib';
import * as playground from '../playground';
import * as commands from '../commands';

interface ITool {
    command: {
        command: string|Function;
        [prop: string]: any;
    }
    iconClass: string|Function;
    elementId?: string;
}

interface IToolPalette {
    [name: string]: {
        iconClass: string|Function;
        command?: string|Function;
        args?: {
            [name: string]: any;
        }
    }
}

interface IToolSet {
    tools: IToolPalette;
    operations: IToolPalette;
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
    private getOpTool (tool: IToolPalette, name: string): ITool {
        const tooldef: ITool = {
            command: {
                command: name
            },
            iconClass: tool[name].iconClass
        }
        if (tool[name].command) {
            tooldef.command.command = tool[name].command;
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
        const buttonSize = this._editor.toolFontSize + 6; 
        let toolButton: HTMLElement = null;
        if (typeof tooldef.iconClass === 'function') {
            toolButton = (tooldef.iconClass as Function)(this._editor);
            toolButton.classList.add ('toolbutton');
        } else {
            toolButton = document.createElement ('div');
            toolButton.classList.add ('flex-h', 'flex-align-x-center', 'flex-align-y-center');
            toolButton.classList.add ('toolbutton');
            const toolIcon: HTMLElement = document.createElement ('i');
            toolIcon.style.fontSize = `${this._editor.toolFontSize}px`;
            toolIcon.style.color = '#fff';
            tooldef.iconClass.split (' ').forEach ((cls: string) => {
                toolIcon.classList.add (cls);
            });
            toolButton.appendChild (toolIcon);
        }
        tooldef.elementId = `toolbutton-${cwPGToolPalette.uniqueId++}`;
        toolButton.setAttribute ('id', tooldef.elementId);
        toolButton.style.width = `${buttonSize}px`;
        toolButton.style.height = `${buttonSize}px`;
        toolButton.setAttribute ('toolIndex', String(this._tools.length-1));
        this._container.appendChild (toolButton);
        return toolButton;
    }
    unload () {
        while (this._container.hasChildNodes()) {
            this._container.removeChild(this._container.firstChild);
        }
        this._tools = [];
    }
    loadToolPalette (toolPalette: IToolPalette) {
        for (const toolname in toolPalette) {
            const tooldef = this.getOpTool (toolPalette, toolname);
            const toolButton = this.createToolButton (tooldef);
            toolButton.addEventListener ('click', () => {
                const toolIndex = Number(toolButton.getAttribute ('toolIndex'));
                const tool = this._tools[toolIndex];
                if (tool !== this._curTool) {
                    if (this._curTool) {
                        const curToolButton = document.querySelector(`#${this._curTool.elementId}`);
                        curToolButton.classList.remove ('active');
                        this._editor.executeCommand ({ command: 'UseTool' });
                        this._curTool = null;
                    }
                }
                if (tool) {
                    const button = document.querySelector(`#${tool.elementId}`);
                    button.classList.add ('active');
                    this._editor.executeCommand (tool.command);
                    this._curTool = tool;
                }
            });
        }
    }
    loadOpPalette (opPalette: IToolPalette) {
        for (const op in opPalette) {
            const tooldef = this.getOpTool (opPalette, op);
            const toolButton = this.createToolButton (tooldef);
            toolButton.addEventListener ('click', () => {
                const toolIndex = Number(toolButton.getAttribute ('toolIndex'));
                const tool = this._tools[toolIndex];
                this._editor.executeCommand (tool.command);
            });
        }
    }
}

export class cwPGPropertyGrid {
    private _container: HTMLElement;
    private _tableId: string;
    private _object: lib.cwEventObserver;
    private _editor: cwPGEditor;
    constructor (editor: cwPGEditor, container: HTMLElement, id: string) {
        this._editor = editor;
        this._container = container;
        this._tableId = id;
        this._object = null;
        const table = document.createElement ('table');
        table.style.border = 'solid 1px #95B8E7';
        table.style.borderSpacing = '0px';
        table.style.margin = '0px';
        table.style.fontSize = '12px';
        table.style.fontFamily = 'verdana';
        table.style.width = '100%';
        table.style.tableLayout = 'fixed';
        table.style.backgroundColor = '#fff';
        table.setAttribute ('id', this._tableId);
        const tbody = document.createElement ('tbody');
        table.appendChild (tbody);
        this._container.appendChild (table);
    }
    private createRow (): HTMLTableRowElement {
        const tbody = document.querySelector (`#${this._tableId} tbody`);
        const tr: HTMLTableRowElement = document.createElement ('tr');
        tbody.appendChild (tr);
        return tr;
    }
    private createCell (tr: HTMLTableRowElement): HTMLElement {
        const td = document.createElement ('td');
        td.style.color = '#000';
        td.style.fontWeight = 'bold';
        td.style.overflow = 'hidden';
        td.style.whiteSpace = 'nowrap';
        td.style.textOverflow = 'ellipsis';
        td.style.height = '24px';
        tr.appendChild (td);
        return td;
    }
    private createGroupCell (tr: HTMLTableRowElement, name: string): HTMLElement {
        const td = this.createCell (tr);
        td.style.paddingLeft = '5px';
        td.setAttribute ('colspan', '2');
        td.innerText = name;
        return td;
    }
    private createPropCell (tr: HTMLTableRowElement): HTMLElement {
        const td = this.createCell (tr);
        td.style.paddingLeft = '5px';
        td.style.border = 'dotted 1px #ccc';
        td.style.color = '#000';
        return td;
    }
    addGroup (name: string) {
        const tr = this.createRow ();
        tr.style.backgroundColor = '#E0ECFF';
        tr.style.fontWeight = 'bold';
        this.createGroupCell (tr, name);
    }
    addTextAttribute (name: string, value: string, readonly: boolean, changeCallback: (value: string) => any) {
        const tr = this.createRow ();
        this.createPropCell (tr).innerText = name;
        const input: HTMLInputElement = document.createElement ('input');
        input.type = 'text';
        input.value = value;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.readOnly = readonly;
        input.disabled = readonly;
        if (changeCallback) {
            input.oninput = () => {
                input.value = String(changeCallback (input.value));
            }
        }
        this.createPropCell (tr).appendChild (input);
    }
    addToggleAttribute (name: string, value: boolean, readonly: boolean, changeCallback: (value: boolean) => any) {
        const tr = this.createRow ();
        this.createPropCell (tr).innerText = name;
        const input: HTMLInputElement = document.createElement ('input');
        input.type = 'checkbox';
        input.checked = value;
        input.readOnly = readonly;
        input.disabled = readonly;
        if (changeCallback) {
            input.onchange = () => {
                input.checked = Boolean (changeCallback (input.checked));
            }
        }
        this.createPropCell (tr).appendChild (input);
    }
    addNumberAttribute (name: string, value: number, readonly: boolean, changeCallback: (value: number) => any) {
        const tr = this.createRow ();
        this.createPropCell (tr).innerText = name;
        const input: HTMLInputElement = document.createElement ('input');
        input.type = 'number';
        input.value = String(value);
        input.readOnly = readonly;
        input.disabled = readonly;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        if (changeCallback) {
            input.oninput = () => {
                input.value = String(changeCallback (Number(input.value)));
            }
        }
        this.createPropCell (tr).appendChild (input);
    }
    addChoiceAttribute (name: string, values: any[], value: string, readonly: boolean, changeCallback: (value: string) => any) {
        const tr = this.createRow ();
        this.createPropCell (tr).innerText = name;
        const input: HTMLSelectElement = document.createElement ('select');
        values.forEach (opt => {
            const option = document.createElement ('option');
            option.value = String(opt.value);
            option.innerText = String(opt.desc);
            input.add (option);
        });
        input.value = String(value);
        input.disabled = readonly;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        if (changeCallback) {
            input.onchange = () => {
                input.value = String(changeCallback (input.value));
            }
        }
        this.createPropCell (tr).appendChild (input);
    }
    addColorAttribute (name: string, value: string, readonly: boolean, changeCallback: (value: string) => any) {
        const tr = this.createRow ();
        this.createPropCell (tr).innerText = name;
        const input: HTMLInputElement = document.createElement ('input');
        input.type = 'color';
        input.value = value;
        input.readOnly = readonly;
        input.disabled = readonly;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        if (changeCallback) {
            input.onchange = () => {
                input.value = String(changeCallback (input.value));
            }
        }
        this.createPropCell (tr).appendChild (input);
    }
    getToolProperty (name: string): any {
        if (this._object) {
            const ev = new playground.cwPGGetPropertyEvent (name);
            this._object.triggerEx (ev);
            return ev.value;
        }
    }
    setToolProperty (name: string, value: any): void {
        if (this._object) {
            const ev = new playground.cwPGSetPropertyEvent(name, value);
            this._object.triggerEx (ev);
        }
    }
    addToolProperty (prop: playground.IProperty) {
        const propName = prop.name;
        const propType = prop.type;
        const propReadonly = prop.readonly;
        if (prop.enum) {
            this.addChoiceAttribute (prop.desc, prop.enum, this.getToolProperty(propName), propReadonly, (value:string) => {
                switch (propType) {
                case 'string': 
                    this.setToolProperty (propName, value);
                    return this.getToolProperty (propName);
                case 'number':
                    this.setToolProperty (propName, Number(value));
                    return this.getToolProperty (propName);
                case 'boolean':
                    this.setToolProperty (propName, Boolean(value));
                    return this.getObjectProperty (propName);
                case 'color':
                    this.setToolProperty (propName, value);
                    return this.getToolProperty (propName);
                }
            });
        } else {
            switch (propType) {
            case 'string':
                this.addTextAttribute (prop.desc, this.getToolProperty(propName), propReadonly, (value:string) => {
                    this.setToolProperty (propName, value);
                    return this.getToolProperty (propName);
                });
                break;
            case 'number':
                this.addNumberAttribute (prop.desc, this.getToolProperty(propName), propReadonly, (value:number) => {
                    this.setToolProperty (propName, value);
                    return this.getToolProperty (propName);
                });
                break;
            case 'boolean':
                this.addToggleAttribute (prop.desc, this.getToolProperty(propName), propReadonly, (value:boolean) => {
                    this.setToolProperty (propName, value);
                    return this.getToolProperty (propName);
                });
                break;
            case 'color':
                this.addColorAttribute (prop.desc, this.getToolProperty(propName), propReadonly, (value:string) => {
                    this.setToolProperty (propName, value);
                    return this.getToolProperty (propName);
                });
                break;
            }
        }
    }
    getObjectProperty (name: string): any {
        if (this._object) {
            const cmd: commands.IPGCommand = {
                command: 'GetObjectProperty',
                objectName: (this._object as lib.cwSceneObject).entityName,
                propName: name
            }
            this._editor.playground.executeCommand (cmd);
            return cmd.propValue;
        }
    }
    setObjectProperty (name: string, value: any): void {
        if (this._object) {
            this._editor.playground.executeCommand ({
                command: 'SetObjectProperty',
                objectName: (this._object as lib.cwSceneObject).entityName,
                propName: name,
                propValue: value
            });
        }
    }
    addObjectProperty (prop: playground.IProperty) {
        const propName = prop.name;
        const propType = prop.type;
        const propReadonly = prop.readonly;
        if (prop.enum) {
            this.addChoiceAttribute (prop.desc, prop.enum, this.getObjectProperty(propName), propReadonly, (value:string) => {
                switch (propType) {
                case 'string': 
                    this.setObjectProperty (propName, value);
                    return this.getObjectProperty (propName);
                case 'number':
                    this.setObjectProperty (propName, Number(value));
                    return this.getObjectProperty (propName);
                case 'boolean':
                    this.setObjectProperty (propName, Boolean(value));
                    return this.getObjectProperty (propName);
                case 'color':
                    this.setObjectProperty (propName, value);
                    return this.getObjectProperty (propName);
                }
            });
        } else {
            switch (propType) {
            case 'string':
                this.addTextAttribute (prop.desc, this.getObjectProperty(propName), propReadonly, (value:string) => {
                    this.setObjectProperty (propName, value);
                    return this.getObjectProperty (propName);
                });
                break;
            case 'number':
                this.addNumberAttribute (prop.desc, this.getObjectProperty(propName), propReadonly, (value:number) => {
                    this.setObjectProperty (propName, value);
                    return this.getObjectProperty (propName);
                });
                break;
            case 'boolean':
                this.addToggleAttribute (prop.desc, this.getObjectProperty(propName), propReadonly, (value:boolean) => {
                    this.setObjectProperty (propName, value);
                    return this.getObjectProperty (propName);
                });
                break;
            case 'color':
                this.addColorAttribute (prop.desc, this.getObjectProperty(propName), propReadonly, (value:string) => {
                    this.setObjectProperty (propName, value);
                    return this.getObjectProperty (propName);
                });
                break;
            }
        }
    }
    clear () {
        const inputs = document.querySelectorAll (`table#${this._tableId} input`);
        inputs.forEach ((value: Element) => {
            (value as HTMLInputElement).onchange = null;
        });
        const selects = document.querySelectorAll (`table#${this._tableId} select`);
        selects.forEach ((value: Element) => {
            (value as HTMLSelectElement).onchange = null;
        });
        const tbody = document.querySelector (`table#${this._tableId} tbody`);
        while (tbody.hasChildNodes()) {
            tbody.removeChild (tbody.firstChild);
        }
        this._object = null;
    }
    reloadToolProperties () {
        const obj = this._object;
        this.clear ();
        this.loadToolProperties (obj);
    }
    loadToolProperties (object: lib.cwEventObserver) {
        if (this._object !== object) {
            this.clear ();
            this._object = object;
            if (this._object) {
                const ev = new playground.cwPGGetPropertyListEvent ();
                this._object.triggerEx (ev);
                if (ev.properties) {
                    for (const groupName in ev.properties) {
                        const group = ev.properties[groupName];
                        this.addGroup (group.desc);
                        group.properties.forEach ((value: playground.IProperty) => {
                            this.addToolProperty (value);
                        });
                    }
                }
            }
        }
    }
    reloadObjectProperties () {
        const obj = this._object;
        this.clear ();
        this.loadObjectProperties (obj);
    }
    loadObjectProperties (object: lib.cwEventObserver) {
        if (this._object !== object) {
            this.clear ();
            this._object = object;
            if (this._object) {
                const ev = new playground.cwPGGetPropertyListEvent ();
                this._object.triggerEx (ev);
                if (ev.properties) {
                    for (const groupName in ev.properties) {
                        const group = ev.properties[groupName];
                        this.addGroup (group.desc);
                        group.properties.forEach ((value: playground.IProperty) => {
                            this.addObjectProperty (value);
                        });
                    }
                }
            }
        }
    }
    loadPageProperties () {
        this.clear ();
        const pageList: any[] = [];
        this._editor.playground.view.forEachPage (page => {
            pageList.push ({
                value: page.name,
                desc: page.name
            });
        });
        this.addChoiceAttribute ('页面列表', pageList, this._editor.playground.view.currentPage, false, (value:string) => {
            this._editor.playground.view.selectPage (value);
            return value;
        });
        this.addTextAttribute ('页面背景图像', this._editor.playground.view.pageImage||'', false, value => {
            this._editor.playground.view.pageImage = (value === '') ? null : value;
            return value;
        });
        this.addChoiceAttribute ('页面背景重复', [{
            value: 'repeat',
            desc: '重复'
        }, {
            value: 'repeat-x',
            desc: '横向重复'
        }, {
            value: 'repeat-y',
            desc: '纵向重复'
        }, {
            value: 'no-repeat',
            desc: '不重复'
        }], this._editor.playground.view.pageImageRepeat, false, value => {
            this._editor.playground.view.pageImageRepeat = value;
            return value;
        });
        this.addToggleAttribute ('页面背景固定', this._editor.playground.view.pageImageAttachment === 'fixed', false, value => {
            this._editor.playground.view.pageImageAttachment = value ? 'fixed' : 'scroll';
            return value;
        });
        this.addTextAttribute ('页面背景大小', this._editor.playground.view.pageImageSize, false, value => {
            this._editor.playground.view.pageImageSize = value;
            return value;
        });
        this.addColorAttribute ('页面背景颜色', this._editor.playground.view.pageColor||'', false, value => {
            this._editor.playground.view.pageColor = (value === '') ? null : value;
            return value;
        });
    }
}

export class cwPGEditor {
    private _strokeColor: string;
    private _fillColor: string;
    private _toolFontSize: number;
    private _pg: playground.cwPlayground;
    private _toolset: IToolSet;
    private _toolPalette: cwPGToolPalette;
    private _opPalette: cwPGToolPalette;
    private _objectPropGrid: cwPGPropertyGrid;
    private _toolPropGrid: cwPGPropertyGrid;
    constructor (pg: playground.cwPlayground, toolset: IToolSet, toolPaletteElement:HTMLElement, opPaletteElement:HTMLElement, objectPropGridElement:HTMLElement, toolPropGridElement:HTMLElement) {
        this._strokeColor = '#00000000';
        this._fillColor = 'red';
        this._toolFontSize = 14;
        this._pg = pg;
        this._toolset = toolset;
        this._toolPalette = new cwPGToolPalette (this, toolPaletteElement);
        this._toolPalette.loadToolPalette (toolset.tools);
        this._opPalette = new cwPGToolPalette (this, opPaletteElement);
        this._opPalette.loadOpPalette (toolset.operations);
        this._objectPropGrid = new cwPGPropertyGrid (this, objectPropGridElement, 'pg-object');
        this._toolPropGrid = new cwPGPropertyGrid (this, toolPropGridElement, 'pg-tool');
        this._objectPropGrid.loadPageProperties ();
    }
    get toolSet () {
        return this._toolset;
    }
    get opPalette () {
        return this._opPalette;
    }
    get toolPalette () {
        return this._toolPalette;
    }
    get objectPropertyGrid () {
        return this._objectPropGrid;
    }
    get toolPropertyGrid () {
        return this._toolPropGrid;
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
    executeCommand (cmd: {
        command: string|Function,
        [prop: string]: any
    }) {
        if (typeof cmd.command === 'function') {
            (cmd.command as Function) (this);
        } else if (cmd.command.length > 0 && cmd.command.charAt(0) !== '$') {
            const realCommand: any = {};
            for (const name in cmd) {
                const value = cmd[name];
                realCommand[name] = (typeof value === 'function') ? (value as Function) (this) : value;
            }
            this._pg.executeCommand (realCommand);
        }
    }
}
