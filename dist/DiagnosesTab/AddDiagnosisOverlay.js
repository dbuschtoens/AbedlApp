"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const FloatingWindow_1 = require("../FloatingWindow");
const constants_1 = require("../constants");
const app_1 = require("../app");
const CreateDiagnosisOverlay_1 = require("./CreateDiagnosisOverlay");
const MARGIN = 20;
const SMALL_MARGIN = 10;
const SEND_ICON = '✔️';
class AddDiagnosisOverlay extends FloatingWindow_1.default {
    constructor() {
        super({ windowWidth: 0.8, windowHeight: 0.8, centerX: 0, top: MARGIN });
        this.filteredSuggestions = app_1.globalDataObject.diagnoses.sort(function (a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        let itemCount = 2 * (1 + this.filteredSuggestions.length) - 1;
        this.append(this.textInput = new tabris_1.TextInput({
            left: MARGIN, right: MARGIN, top: MARGIN,
            background: constants_1.HIGHLIGHT_COLOR, message: 'Filter'
        }).on({
            textChanged: ({ value }) => this.filterSuggestions(value)
        }), this.collectionView = new tabris_1.CollectionView({
            layoutData: { left: MARGIN, right: 0, top: [this.textInput, MARGIN], bottom: SMALL_MARGIN },
            updateCell: (cell, index) => this.updateCell(cell, index),
            createCell: (type) => this.createCell(type),
            itemCount,
            cellHeight: (index, type) => type === 'divider' ? 6 : 'auto',
            cellType: (index) => this.cellType(index)
        }).on({
            select: ({ index }) => this.onSelect(index)
        }));
    }
    cellType(index) {
        return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'diagCell' : 'divider');
    }
    onSelect(index) {
        if (index === this.collectionView.itemCount - 1) {
            new CreateDiagnosisOverlay_1.default().onAccept(() => {
                this.filteredSuggestions = app_1.globalDataObject.diagnoses;
                this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
            });
        }
        else if (index % 2 === 0) {
            let suggestion = this.filteredSuggestions[Math.floor(index / 2)];
            this.callback(suggestion.id);
            this.dispose();
        }
    }
    onAccept(callback) {
        this.callback = callback;
    }
    filterSuggestions(text) {
        this.filteredSuggestions = app_1.globalDataObject.diagnoses.filter(entry => entry.name.toLowerCase().includes(text.toLowerCase()));
        this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
    }
    updateCell(cell, index) {
        if (cell instanceof tabris_1.TextView) {
            let diagnosisIndex = Math.floor(index / 2);
            let diag = this.filteredSuggestions[diagnosisIndex];
            cell.text = diag.name;
            cell.id = diag.id.toString();
        }
    }
    createCell(type) {
        if (type === 'divider') {
            return new Divider();
        }
        else if (type === 'diagCell') {
            return new tabris_1.TextView({
                font: 'bold 20px', textColor: constants_1.LIST_ELEMENT_COLOR
            }).on({
                // tap: ({ target }) => this.modifyPerscription(target.index),
                longpress: ({ target, state }) => {
                    if (state !== 'end') {
                        this.promptModifyDiagnosis(target);
                    }
                }
            });
        }
        else {
            return new AddButtonCell();
        }
    }
    promptModifyDiagnosis(diagnosis) {
        new tabris_1.AlertDialog({
            title: 'Bearbeiten',
            message: diagnosis.text,
            buttons: {
                ok: 'abbrechen',
                cancel: 'bearbeiten',
                neutral: 'löschen'
            }
        }).on({
            closeCancel: () => this.modifyEntry(parseInt(diagnosis.id)),
            closeNeutral: () => this.deleteEntry(parseInt(diagnosis.id))
        }).open();
    }
    deleteEntry(id) {
        let index = app_1.globalDataObject.diagnoses.findIndex(entry => entry.id === id);
        app_1.globalDataObject.diagnoses.splice(index, 1);
        this.filterSuggestions(this.textInput.text);
    }
    modifyEntry(id) {
        new CreateDiagnosisOverlay_1.default(app_1.getDiagnosis(id)).onAccept(() => {
            app_1.storeData();
            this.collectionView.refresh();
        });
    }
}
exports.default = AddDiagnosisOverlay;
class Divider extends tabris_1.Composite {
    constructor() {
        super();
        this.append(new tabris_1.Composite({ left: 0, right: 100, top: 2, bottom: 2, background: constants_1.FADED_HIGHLIGHT_COLOR }));
    }
}
class AddButtonCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(new tabris_1.TextView({ centerX: 0, centerY: 0, text: '+', font: 'bold 30px', textColor: constants_1.HIGHLIGHT_COLOR }));
    }
}
