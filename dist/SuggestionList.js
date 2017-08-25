"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const util_1 = require("./util");
const MARGIN = 10;
class SuggestionList extends tabris_1.CollectionView {
    constructor(properties) {
        properties.itemCount = properties.suggestionSource.length;
        properties.updateCell = (cell, index) => this._updateCell(cell, index);
        properties.createCell = (type) => this._createCell(type);
        properties.cellType = 'textCell';
        super(util_1.omit(properties, 'suggestionSource'));
        this.suggestionSource = properties.suggestionSource;
    }
    _createCell(type) {
        return new TextCell();
    }
    _updateCell(cell, index) {
        if (cell instanceof TextCell) {
            cell.set({
                layoutData: { left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN },
                text: this.suggestionSource[index],
                highlightOnTouch: true
            });
        }
    }
}
exports.default = SuggestionList;
class TextCell extends tabris_1.Composite {
    constructor() {
        super();
        this.textView = new tabris_1.TextView().appendTo(this);
    }
    set(arg1, value) {
        if (typeof arg1 === 'string') {
            this.textView.set(arg1, value);
        }
        else {
            if (arg1.highlightOnTouch) {
                this.highlightOnTouch = arg1.highlightOnTouch;
            }
            this.textView.set(util_1.omit(arg1, 'highlightOnTouch'));
        }
        return this;
    }
}
