"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const PatientData_1 = require("../../PatientData");
const app_1 = require("../../app");
const util_1 = require("../../util");
const SAVE_ICON = '💾';
const SUB_MARGIN = 5;
class AbedlEntryCell extends tabris_1.Composite {
    constructor() {
        super();
        this.textView = new tabris_1.TextView().appendTo(this);
        this.saveButton = new tabris_1.TextView({
            layoutData: { centerY: 0, left: [this.textView, SUB_MARGIN], right: 0 },
            text: SAVE_ICON, font: '20px', highlightOnTouch: true, alignment: 'left'
        }).on({
            tap: () => {
                this.callback(this.section, this.contentIndex);
                this.saveButton.visible = false;
            }
        }).appendTo(this);
    }
    set(arg1, value) {
        if (typeof arg1 === 'string') {
            this.textView.set(arg1, value);
        }
        else {
            let descriptor = arg1.descriptor;
            this.section = descriptor.abedlIndex;
            this.contentIndex = descriptor.contentIndex || -1;
            this.saveButton.visible = !!PatientData_1.getEntries(app_1.globalDataObject.abedlEntries, this.section).find(entry => entry === arg1.text);
            this.textView.set(util_1.omit(arg1, 'descriptor'));
        }
        return this;
    }
    onSaveButton(callback) {
        this.callback = callback;
        return this;
    }
}
exports.default = AbedlEntryCell;
