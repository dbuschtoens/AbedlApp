"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
class HeadingCell extends tabris_1.Composite {
    constructor() {
        super({ width: tabris_1.device.screenWidth });
        this.textView = new tabris_1.TextView({ left: 0, right: 0 }).appendTo(this);
    }
    set(arg1, value) {
        if (typeof arg1 === 'string') {
            this.textView.set(arg1, value);
        }
        else {
            this.textView.set(arg1);
        }
        return this;
    }
}
exports.default = HeadingCell;
