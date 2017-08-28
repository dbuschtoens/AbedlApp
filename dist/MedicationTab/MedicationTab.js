"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris/tabris");
const MedicationCell_1 = require("./MedicationCell");
const constants_1 = require("../constants");
const AddPerscriptionOverlay_1 = require("./AddPerscriptionOverlay");
const app_1 = require("../app");
const CreatePerscriptionOverlay_1 = require("./CreatePerscriptionOverlay");
const DIVIDER = 'divider';
class MedicationTab extends tabris_1.Tab {
    constructor(perscriptions) {
        super({ title: 'Medikamente' });
        this.perscriptions = perscriptions.sort(function (a, b) {
            let medA = app_1.getMedication(a.medId);
            let medB = app_1.getMedication(b.medId);
            if (medA.name < medB.name)
                return -1;
            if (medA.name > medB.name)
                return 1;
            return 0;
        });
        let itemCount = 2 * (this.perscriptions.length + 1) - 1;
        this.collectionView = new tabris_1.CollectionView({
            layoutData: { left: 0, top: 0, bottom: 0, right: 0 },
            createCell: (type) => this.createCell(type),
            updateCell: (cell, cellIndex) => this.updateCell(cell, cellIndex),
            itemCount,
            cellHeight: (index, type) => type === 'divider' ? 6 : 'auto',
            cellType: (index) => this.cellType(index)
        }).appendTo(this);
    }
    cellType(index) {
        return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'medCell' : 'divider');
    }
    updateCell(cell, index) {
        if (cell instanceof MedicationCell_1.default) {
            let perscriptionIndex = Math.floor(index / 2);
            cell.applyContent(this.perscriptions[perscriptionIndex], perscriptionIndex);
        }
    }
    createCell(type) {
        console.warn('Medication Tab Cell: ' + type);
        if (type === 'divider') {
            return new Divider();
        }
        else if (type === 'medCell') {
            return new MedicationCell_1.default().on({
                tap: ({ target }) => this.modifyPerscription(target.index),
                longpress: ({ target, state }) => {
                    if (state !== 'end') {
                        this.promptDeletePerscription(target.index);
                    }
                }
            });
        }
        else {
            return new AddButtonCell().on({
                tap: () => this.showAddPerscriptionOverlay()
            });
        }
    }
    modifyPerscription(index) {
        new CreatePerscriptionOverlay_1.default(this.perscriptions[index]).onAccept(result => {
            this.perscriptions[index] = result;
            app_1.storeData();
            let itemCount = 2 * (this.perscriptions.length + 1) - 1;
            this.collectionView.load(itemCount);
        });
    }
    promptDeletePerscription(index) {
        let med = app_1.getMedication(this.perscriptions[index].medId);
        new tabris_1.AlertDialog({
            title: 'Medikament entfernen?',
            message: med.name + ' ' + this.perscriptions[index].dosage,
            buttons: { ok: 'Ja', cancel: 'Nein' }
        }).on({
            closeOk: () => {
                this.perscriptions.splice(index, 1);
                app_1.storeData();
                let itemCount = 2 * (this.perscriptions.length + 1) - 1;
                this.collectionView.load(itemCount);
            }
        }).open();
    }
    showAddPerscriptionOverlay() {
        new AddPerscriptionOverlay_1.default().onAccept(perscription => {
            this.perscriptions.push(perscription);
            this.perscriptions.sort(function (a, b) {
                let medA = app_1.getMedication(a.medId);
                let medB = app_1.getMedication(b.medId);
                if (medA.name < medB.name)
                    return -1;
                if (medA.name > medB.name)
                    return 1;
                return 0;
            });
            app_1.storeData();
            let itemCount = 2 * (this.perscriptions.length + 1) - 1;
            this.collectionView.load(itemCount);
        });
    }
}
exports.default = MedicationTab;
class Divider extends tabris_1.Composite {
    constructor() {
        super();
        this.append(new tabris_1.Composite({ left: 20, right: 20, top: 2, bottom: 2, background: constants_1.FADED_HIGHLIGHT_COLOR }));
    }
}
class AddButtonCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(new tabris_1.TextView({ centerX: 0, centerY: 0, text: '+', font: 'bold 30px', textColor: constants_1.HIGHLIGHT_COLOR }));
    }
}
