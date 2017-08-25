"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const util_1 = require("../../util");
const MARGIN = 10;
const SUB_MARGIN = 5;
const HIGHLIGHT_COLOR = '#FF9800';
const ADD_ICON = '+';
class SectionHeadingCell extends tabris_1.Composite {
    constructor() {
        super();
        this.textView = new tabris_1.TextView().appendTo(this);
        this.addButton = new tabris_1.TextView({
            layoutData: { centerY: 0, left: [this.textView, SUB_MARGIN] },
            text: `  ${ADD_ICON}  `, textColor: HIGHLIGHT_COLOR, font: 'bold 24px', highlightOnTouch: true, alignment: 'left'
        }).on({
            tap: () => this.callback(this.section)
        }).appendTo(this);
    }
    set(arg1, value) {
        if (typeof arg1 === 'string') {
            this.textView.set(arg1, value);
        }
        else {
            let descriptor = arg1.descriptor;
            this.section = descriptor.abedlIndex;
            arg1.text = this.section.type === 'problems' ? 'Probleme' : 'Ressourcen';
            this.textView.set(util_1.omit(arg1, "descriptor"));
        }
        return this;
    }
    onAddButton(callback) {
        this.callback = callback;
        return this;
    }
}
exports.default = SectionHeadingCell;
