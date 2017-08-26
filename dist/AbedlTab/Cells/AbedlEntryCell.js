"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const util_1 = require("../../util");
const SAVE_ICON = '💾';
const SUB_MARGIN = 5;
class AbedlEntryCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.textView = new tabris_1.TextView().appendTo(this);
        if (tabris_1.device.platform === 'windows') {
            this.on({
                tap: () => {
                    this.callback(this.section, this.contentIndex);
                }
            });
        }
        else {
            this.on({
                tap: () => {
                    this.callback(this.section, this.contentIndex);
                }
            });
        }
        this.saveButton = new tabris_1.TextView({
            layoutData: { centerY: 0, left: [this.textView, SUB_MARGIN], right: 0 },
            text: SAVE_ICON, font: '20px', highlightOnTouch: true, alignment: 'left'
        }).on({
            tap: () => {
                this.saveCallback(this.section, this.contentIndex);
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
            this.contentIndex = descriptor.contentIndex || 0;
            this.textView.set(util_1.omit(arg1, 'descriptor'));
            this.saveButton.visible = !!arg1.buttonVisible;
        }
        return this;
    }
    onTapped(callback) {
        this.callback = callback;
        return this;
    }
    onSavePressed(callback) {
        this.saveCallback = callback;
        return this;
    }
}
exports.default = AbedlEntryCell;
