"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris/tabris");
const constants_1 = require("../constants");
const AddDiagnosisOverlay_1 = require("./AddDiagnosisOverlay");
const app_1 = require("../app");
const DIVIDER = 'divider';
const UP = '🔼';
const DOWN = '🔽';
const TOP = '⏫';
const BOTTOM = '⏬';
class DiagnosesTab extends tabris_1.Tab {
    constructor(diagnoses) {
        super({ title: 'Diagnosen' });
        this.diagnosisIds = diagnoses || [];
        let itemCount = 2 * (this.diagnosisIds.length + 1) - 1;
        this.collectionView = new tabris_1.CollectionView({
            layoutData: { left: 0, top: 20, bottom: 20, right: 0 },
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
        if (cell instanceof DiagCell) {
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
            let result = new DiagCell().on({
                // tap: ({ target }) => this.modifyPerscription(target.index),
                longpress: ({ target, state }) => {
                    if (state !== 'end') {
                        this.promptDeleteDiagnosis(target);
                    }
                }
            }).onMove(dir => this.moveDiagnosis(result, dir));
            return result;
        }
        else {
            return new AddButtonCell().on({
                tap: () => this.showAddDiagnosisOverlay()
            });
        }
    }
    moveDiagnosis(diagCell, dir) {
        let swapDiags = (a, b) => {
            let temp = this.diagnosisIds[b];
            this.diagnosisIds[b] = this.diagnosisIds[a];
            this.diagnosisIds[a] = temp;
        };
        let diagIndex = parseInt(diagCell.id);
        switch (dir) {
            case 'up':
                if (diagIndex > 0)
                    swapDiags(diagIndex, diagIndex - 1);
                break;
            case 'down':
                if (diagIndex < this.diagnosisIds.length - 1)
                    swapDiags(diagIndex, diagIndex + 1);
                break;
            case 'top':
                for (let i = diagIndex; i > 0; i--) {
                    swapDiags(i, i - 1);
                }
                break;
            case 'bottom':
                for (let i = diagIndex; i < this.diagnosisIds.length - 1; i++) {
                    swapDiags(i, i - 1);
                }
                break;
        }
        this.collectionView.refresh();
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
const BUTTON_WIDTH = 30;
const BUTTON_MARGIN = 10;
const BUTTON_TOP_MARGIN = 2;
const BUTTON_FONT = '18px';
const BUTTON_BACKGROUND = '#99c0ff';
class DiagCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(this.diagText = new tabris_1.TextView({
            left: 20, right: 20, top: 5, font: 'bold 20px', textColor: constants_1.LIST_ELEMENT_COLOR
        }), this.topButton = new tabris_1.TextView({
            highlightOnTouch: true,
            left: BUTTON_MARGIN, top: [this.diagText, BUTTON_TOP_MARGIN], text: TOP, font: BUTTON_FONT,
            background: constants_1.LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
        }).on({ tap: () => this.callback('top') }), this.upButton = new tabris_1.TextView({
            highlightOnTouch: true,
            left: ['prev()', BUTTON_MARGIN], top: [this.diagText, BUTTON_TOP_MARGIN], text: UP, font: BUTTON_FONT,
            background: constants_1.LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
        }).on({ tap: () => this.callback('up') }), this.downButton = new tabris_1.TextView({
            highlightOnTouch: true,
            left: ['prev()', BUTTON_MARGIN], top: [this.diagText, BUTTON_TOP_MARGIN], text: DOWN, font: BUTTON_FONT,
            background: constants_1.LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
        }).on({ tap: () => this.callback('down') }), this.bottomButton = new tabris_1.TextView({
            highlightOnTouch: true,
            left: ['prev()', BUTTON_MARGIN], top: [this.diagText, BUTTON_TOP_MARGIN], text: BOTTOM, font: BUTTON_FONT,
            background: constants_1.LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
        }).on({ tap: () => this.callback('bottom') }));
    }
    onMove(callback) {
        this.callback = callback;
        return this;
    }
    get text() {
        return this.diagText.text;
    }
    set text(val) {
        this.diagText.text = val;
    }
}
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
