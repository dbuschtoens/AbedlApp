"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris/tabris");
const constants_1 = require("../constants");
const AddDiagnosisOverlay_1 = require("./AddDiagnosisOverlay");
const app_1 = require("../app");
const DIVIDER = 'divider';
class DiagnosesTab extends tabris_1.Tab {
    constructor(diagnoses) {
        super({ title: 'Diagnosen' });
        this.diagnosisIds = diagnoses || [];
        let itemCount = 2 * (this.diagnosisIds.length + 1) - 1;
        this.collectionView = new tabris_1.CollectionView({
            layoutData: { left: 20, top: 20, bottom: 20, right: 20 },
            createCell: (type) => this.createCell(type),
            updateCell: (cell, cellIndex) => this.updateCell(cell, cellIndex),
            itemCount,
            cellHeight: (index, type) => type === 'divider' ? 10 : 'auto',
            cellType: (index) => this.cellType(index)
        }).appendTo(this);
    }
    cellType(index) {
        return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'diagCell' : 'divider');
    }
    updateCell(cell, index) {
        if (cell instanceof tabris_1.TextView) {
            let diagnosisIndex = Math.floor(index / 2);
            let id = this.diagnosisIds[diagnosisIndex];
            let diagnosis = app_1.getDiagnosis(id);
            if (diagnosis) {
                cell.text = diagnosis.name;
                cell.id = diagnosisIndex.toString();
            }
            else {
                setTimeout(() => this.deleteDiagId(diagnosisIndex), 20); // again, crashtime....
            }
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
                        this.promptDeleteDiagnosis(target);
                    }
                }
            });
        }
        else {
            return new AddButtonCell().on({
                tap: () => this.showAddDiagnosisOverlay()
            });
        }
    }
    promptDeleteDiagnosis(diagnosis) {
        new tabris_1.AlertDialog({
            title: 'Diagnose entfernen?',
            message: diagnosis.text,
            buttons: { ok: 'Ja', cancel: 'Nein' }
        }).on({
            closeOk: () => this.deleteDiagId(parseInt(diagnosis.id))
        }).open();
    }
    deleteDiagId(index) {
        this.diagnosisIds.splice(index, 1);
        app_1.storeData();
        let itemCount = 2 * (this.diagnosisIds.length + 1) - 1;
        this.collectionView.load(itemCount);
    }
    showAddDiagnosisOverlay() {
        new AddDiagnosisOverlay_1.default().onAccept(id => {
            this.diagnosisIds.push(id);
            app_1.storeData();
            let itemCount = 2 * (this.diagnosisIds.length + 1) - 1;
            this.collectionView.load(itemCount);
        });
    }
}
exports.default = DiagnosesTab;
class Divider extends tabris_1.Composite {
    constructor() {
        super();
        this.append(new tabris_1.Composite({ left: 0, right: 40, top: 4, bottom: 4, background: constants_1.LIGHT_GRAY_COLOR }));
    }
}
class AddButtonCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(new tabris_1.TextView({ centerX: 0, centerY: 0, text: '+', font: 'bold 30px', textColor: constants_1.HIGHLIGHT_COLOR }));
    }
}
