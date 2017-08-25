"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const FloatingWindow_1 = require("./FloatingWindow");
const util_1 = require("./util");
const constants_1 = require("./constants");
const MARGIN = 10;
const INNER_MARGIN = 5;
const SEND_ICON = '✔️';
class AddEntryOverlay extends FloatingWindow_1.default {
    constructor(suggestionSource) {
        super({ windowWidth: 0.8, windowHeight: 0.8, centerX: 0, top: MARGIN });
        this.filteredSuggestions = this.suggestionSource = suggestionSource;
        this.append(this.textInput = new tabris_1.TextInput({
            left: MARGIN, right: 50, top: MARGIN,
            type: 'multiline',
            background: constants_1.HIGHLIGHT_COLOR
        }).on({
            accept: () => this.onAccept(),
            textChanged: ({ value }) => this.filterSuggestions(value)
        }), new tabris_1.Button({
            top: MARGIN, right: MARGIN, left: 'prev()',
            text: SEND_ICON,
            textColor: constants_1.HIGHLIGHT_COLOR,
            font: '17px',
            background: 'white'
        }).on({
            select: () => this.onAccept()
        }), this.collectionView = new tabris_1.CollectionView({
            layoutData: { left: MARGIN, right: MARGIN, top: [this.textInput, MARGIN], bottom: INNER_MARGIN },
            updateCell: (cell, index) => this.updateCell(cell, index),
            createCell: (type) => this.createCell(type),
            itemCount: 2 * this.filteredSuggestions.length - 1,
            cellHeight: (index, type) => type === 'divider' ? 2 : 'auto',
            cellType: (index) => index % 2 === 0 ? 'textCell' : 'divider'
        }).on({
            select: ({ index }) => this.onSelect(index)
        }));
        this.once({ resize: () => this.textInput.focused = true });
    }
    onSelect(index) {
        if (index % 2 === 0) {
            let suggestion = this.filteredSuggestions[Math.floor(index / 2)];
            this.textInput.text = suggestion;
            this.textInput.focused = true;
        }
    }
    onCreationComplete(callback) {
        this.callback = callback;
    }
    onAccept() {
        let text = this.find(tabris_1.TextInput).first().text;
        if (text) {
            this.callback(text);
            this.dispose();
        }
    }
    filterSuggestions(text) {
        this.filteredSuggestions = this.suggestionSource.filter(entry => entry.toLowerCase().includes(text.toLowerCase()));
        this.collectionView.load(Math.max(0, 2 * this.filteredSuggestions.length - 1));
    }
    createCell(type) {
        if (type === 'divider') {
            return new Divider();
        }
        else {
            return new TextCell().onLongpress((index) => this.onCellLongpress(index));
        }
    }
    updateCell(cell, index) {
        if (cell instanceof TextCell) {
            cell.set({
                layoutData: { left: 0, right: MARGIN },
                text: this.filteredSuggestions[Math.floor(index / 2)],
                index: Math.floor(index / 2),
                font: '17px',
                highlightOnTouch: true,
            });
        }
    }
    onCellLongpress(index) {
        new tabris_1.AlertDialog({
            title: 'Aus der Datenbank löschen?',
            message: this.filteredSuggestions[index],
            buttons: {
                ok: 'Ja',
                cancel: 'Nein'
            }
        }).on({
            closeOk: () => {
                this.deleteEntry(index);
            }
        }).open();
    }
    deleteEntry(index) {
        let mainIndex = this.suggestionSource.findIndex(entry => entry === this.filteredSuggestions[index]);
        this.suggestionSource.splice(mainIndex, 1);
        this.filterSuggestions(this.textInput.text);
    }
}
exports.default = AddEntryOverlay;
class TextCell extends tabris_1.Composite {
    constructor() {
        super({ width: tabris_1.device.screenWidth });
        this.textView = new tabris_1.TextView().appendTo(this);
        this.on({
            longpress: ({ state }) => {
                if (state !== 'end') {
                    this.callback(this.index);
                }
            }
        });
    }
    set(arg1, value) {
        if (typeof arg1 === 'string') {
            this.textView.set(arg1, value);
        }
        else {
            this.index = arg1.index;
            if (arg1.highlightOnTouch) {
                this.highlightOnTouch = arg1.highlightOnTouch;
            }
            this.textView.set(util_1.omit(arg1, 'highlightOnTouch', 'index'));
        }
        return this;
    }
    onLongpress(callback) {
        this.callback = callback;
        return this;
    }
}
class Divider extends tabris_1.Composite {
    constructor() {
        super();
        this.append(new tabris_1.Composite({ left: MARGIN, right: 80, background: constants_1.FADED_HIGHLIGHT_COLOR }));
    }
}
