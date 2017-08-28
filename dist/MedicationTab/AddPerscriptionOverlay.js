"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const FloatingWindow_1 = require("../FloatingWindow");
const constants_1 = require("../constants");
const app_1 = require("../app");
const CreatePerscriptionOverlay_1 = require("./CreatePerscriptionOverlay");
const CreateMedicationOverlay_1 = require("./CreateMedicationOverlay");
const MARGIN = 20;
const SMALL_MARGIN = 10;
const SEND_ICON = '✔️';
class AddPerscriptionOverlay extends FloatingWindow_1.default {
    constructor() {
        super({ windowWidth: 0.8, windowHeight: 0.8, centerX: 0, top: MARGIN });
        this.filteredSuggestions = app_1.globalDataObject.medications.sort(function (a, b) {
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
            layoutData: { left: 0, right: 0, top: [this.textInput, MARGIN], bottom: SMALL_MARGIN },
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
        return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'medCell' : 'divider');
    }
    onSelect(index) {
        if (index === this.collectionView.itemCount - 1) {
            new CreateMedicationOverlay_1.default().onAccept((medication) => {
                this.textInput.text = '';
                this.filteredSuggestions = app_1.globalDataObject.medications;
                this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
            });
        }
        else if (index % 2 === 0) {
            let suggestion = this.filteredSuggestions[Math.floor(index / 2)];
            new CreatePerscriptionOverlay_1.default(suggestion).onAccept(perscription => {
                this.callback(perscription);
                this.dispose();
            });
        }
    }
    onAccept(callback) {
        this.callback = callback;
    }
    filterSuggestions(text) {
        this.filteredSuggestions = app_1.globalDataObject.medications.filter(entry => entry.name.toLowerCase().includes(text.toLowerCase()) || entry.agent.toLowerCase().includes(text.toLowerCase()));
        console.log('filtered suggestions: ' + this.filteredSuggestions.length);
        this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
        console.log('CVLength: ' + this.collectionView.itemCount);
    }
    createCell(type) {
        if (type === 'divider') {
            return new Divider();
        }
        else if (type === 'medCell') {
            return new MedCell().on({
                longpress: ({ target, state }) => {
                    if (state !== 'end') {
                        this.onCellLongpress(target.medication);
                    }
                }
            });
        }
        else {
            return new AddButtonCell();
        }
    }
    updateCell(cell, index) {
        if (cell instanceof MedCell) {
            cell.update(this.filteredSuggestions[Math.floor(index / 2)]);
        }
    }
    onCellLongpress(medication) {
        new tabris_1.AlertDialog({
            title: 'Bearbeiten',
            message: medication.name,
            buttons: {
                ok: 'abbrechen',
                cancel: 'bearbeiten',
                neutral: 'löschen'
            }
        }).on({
            closeCancel: () => this.modifyEntry(medication),
            closeNeutral: () => this.deleteEntry(medication)
        }).open();
    }
    deleteEntry(medication) {
        let index = app_1.globalDataObject.medications.findIndex(entry => entry.name === medication.name);
        app_1.globalDataObject.medications.splice(index, 1);
        this.filterSuggestions(this.textInput.text);
    }
    modifyEntry(medication) {
        new CreateMedicationOverlay_1.default(medication).onAccept(() => {
            app_1.storeData();
            this.collectionView.refresh();
        });
    }
}
exports.default = AddPerscriptionOverlay;
class MedCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(new tabris_1.TextView({ left: SMALL_MARGIN, top: 0, font: 'bold 20px', textColor: constants_1.LIST_ELEMENT_COLOR, id: 'name' }), new tabris_1.TextView({ left: SMALL_MARGIN, top: ['prev()', 0], font: 'bold 17 px', textColor: constants_1.LIST_SUBELEMENT_COLOR, id: 'agent' }));
    }
    update(medication) {
        this.medication = medication;
        this.find(tabris_1.TextView).filter('#name').first().text = medication.name;
        this.find(tabris_1.TextView).filter('#agent').first().text = medication.agent;
    }
}
class Divider extends tabris_1.Composite {
    constructor() {
        super();
        this.append(new tabris_1.Composite({ left: SMALL_MARGIN, right: 100, top: 2, bottom: 2, background: constants_1.FADED_HIGHLIGHT_COLOR }));
    }
}
class AddButtonCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(new tabris_1.TextView({ centerX: 0, centerY: 0, text: '+', font: 'bold 30px', textColor: constants_1.HIGHLIGHT_COLOR }));
    }
}
