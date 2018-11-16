import * as core from '../../lib/core';
import * as playground from '../playground';

export class cwPGPropertyGrid {
    private _container: HTMLElement;
    private _tableId: string;
    private _object: core.cwSceneObject;
    constructor (container: HTMLElement, id: string) {
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
        td.style.padding = '5px';
        td.style.color = '#000';
        td.style.fontWeight = 'bold';
        td.style.overflow = 'hidden';
        td.style.whiteSpace = 'nowrap';
        td.style.textOverflow = 'ellipsis';
        tr.appendChild (td);
        return td;
    }
    private createGroupCell (tr: HTMLTableRowElement, name: string): HTMLElement {
        const td = this.createCell (tr);
        td.setAttribute ('colspan', '2');
        td.innerText = name;
        return td;
    }
    private createPropCell (tr: HTMLTableRowElement): HTMLElement {
        const td = this.createCell (tr);
        td.style.border = 'dotted 1px #ccc';
        td.style.color = '#fff';
        return td;
    }
    addGroup (name: string) {
        const tr = this.createRow ();
        tr.style.backgroundColor = '#E0ECFF';
        tr.style.fontWeight = 'bold';
        this.createGroupCell (tr, name);
    }
    addTextAttribute (name: string, value: string, readonly: boolean, changeCallback: (value: string) => void) {
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
            input.onchange = () => {
                input.value = String(changeCallback (input.value));
            }
        }
        this.createPropCell (tr).appendChild (input);
    }
    addToggleAttribute (name: string, value: boolean, readonly: boolean, changeCallback: (value: boolean) => void) {
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
    addNumberAttribute (name: string, value: number, readonly: boolean, changeCallback: (value: number) => void) {
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
            input.onchange = () => {
                input.value = String(changeCallback (Number(input.value)));
            }
        }
        this.createPropCell (tr).appendChild (input);
    }
    addChoiceAttribute (name: string, values: any[], value: string, readonly: boolean, changeCallback: (value: string) => void) {
        const tr = this.createRow ();
        this.createPropCell (tr).innerText = name;
        const input: HTMLSelectElement = document.createElement ('select');
        input.value = String(value);
        values.forEach (name => {
            const option = document.createElement ('option');
            option.value = String(name);
            option.innerText = String(name);
            input.add (option);
        });
        input.value = value;
        input.disabled = readonly;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        if (changeCallback) {
            input.value = String(changeCallback (input.value));
        }
        this.createPropCell (tr).appendChild (input);
    }
    getObjectProperty (name: string): any {
        if (this._object) {
            const ev = new playground.cwPGGetObjectPropertyEvent (name);
            this._object.triggerEx (ev);
            return ev.value;
        }
    }
    setObjectProperty (name: string, value: any): any {
        if (this._object) {
            const ev = new playground.cwPGSetObjectPropertyEvent (name, value);
            this._object.triggerEx (ev);
            return ev.value;
        }
    }
    addObjectProperty (prop: playground.IObjectProperty) {
        const propName = prop.name;
        const propType = prop.type;
        const propReadonly = prop.readonly;
        if (prop.enum) {
            this.addChoiceAttribute (prop.desc, prop.enum, this.getObjectProperty(propName), propReadonly, (value:string) => {
                switch (propType) {
                case 'string': 
                    return this.setObjectProperty (propName, value);
                case 'number':
                    return this.setObjectProperty (propName, Number(value));
                case 'boolean':
                    return this.setObjectProperty (propName, Boolean(value));
                }
            });
        } else {
            switch (propType) {
            case 'string':
                this.addTextAttribute (prop.desc, this.getObjectProperty(propName), propReadonly, (value:string) => {
                    return this.setObjectProperty (propName, value);
                });
                break;
            case 'number':
                this.addNumberAttribute (prop.desc, this.getObjectProperty(propName), propReadonly, (value:number) => {
                    return this.setObjectProperty (propName, value);
                });
                break;
            case 'boolean':
                this.addToggleAttribute (prop.desc, this.getObjectProperty(propName), propReadonly, (value:boolean) => {
                    return this.setObjectProperty (propName, value);
                });
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
    loadObjectProperties (object: core.cwSceneObject) {
        if (this._object !== object) {
            this.clear ();
            this._object = object;
            if (this._object) {
                const ev = new playground.cwPGGetObjectPropertyListEvent ();
                this._object.triggerEx (ev);
                if (ev.properties) {
                    for (const groupName in ev.properties) {
                        const group = ev.properties[groupName];
                        this.addGroup (group.desc);
                        group.properties.forEach ((value: playground.IObjectProperty) => {
                            this.addObjectProperty (value);
                        });
                    }
                }
            }
        }
    }
}