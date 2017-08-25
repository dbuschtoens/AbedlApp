"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const app_1 = require("./app");
const PatientOverlays_1 = require("./PatientOverlays");
const constants_1 = require("./constants");
const MARGIN = 20;
const SMALL_MARGIN = 10;
class PatientListPage extends tabris_1.Page {
    constructor() {
        super({ title: 'Bewohner' });
        this.collectionView = new tabris_1.CollectionView({
            left: 0, top: 0, right: 0, bottom: 0,
            createCell: (type) => this.createCell(type),
            updateCell: (cell, index) => this.updateCell(cell, index),
            cellHeight: 'auto',
            itemCount: app_1.globalDataObject.patients.length + 1,
            cellType: (index) => index < app_1.globalDataObject.patients.length ? 'patient' : 'addButton'
        }).on({
            select: ({ index }) => this.onSelect(index)
        }).appendTo(this);
    }
    onSelect(index) {
        if (index < app_1.globalDataObject.patients.length) {
            app_1.openPatientPage(index);
        }
        else {
            new PatientOverlays_1.CreatePatientOverlay().onCreationComplete(() => this.updateCells());
        }
    }
    onLongpress(index) {
        if (index < app_1.globalDataObject.patients.length) {
            new PatientOverlays_1.ModifyPatientOverlay(index).onCreationComplete(() => this.updateCells());
        }
    }
    updateCells() {
        this.collectionView.load(app_1.globalDataObject.patients.length + 1);
    }
    createCell(type) {
        return (type === 'patient') ? new PatientCell().on({
            longpress: (event) => {
                if (event.state !== 'end')
                    return this.onLongpress(event.target.index);
            }
        }) : new AddButtonCell();
    }
    updateCell(cell, index) {
        if (cell instanceof PatientCell) {
            cell.update(index);
        }
    }
}
exports.default = PatientListPage;
class PatientCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(new tabris_1.TextView({ left: MARGIN, top: SMALL_MARGIN, font: constants_1.LIST_ELEMENT_FONT, textColor: constants_1.LIST_ELEMENT_COLOR, id: 'name' }), new tabris_1.TextView({ left: MARGIN, top: ['prev()', 0], font: constants_1.LIST_SUBELEMENT_FONT, textColor: constants_1.LIST_SUBELEMENT_COLOR, id: 'date' }));
    }
    update(index) {
        let patient = app_1.globalDataObject.patients[index];
        this.index = index;
        this.find(tabris_1.TextView).filter('#name').first().text = patient.name;
        this.find(tabris_1.TextView).filter('#date').first().text = patient.date;
    }
}
class AddButtonCell extends tabris_1.Composite {
    constructor() {
        super({ highlightOnTouch: true });
        this.append(new tabris_1.TextView({ centerX: 0, centerY: 0, text: '+', font: 'bold 30px', textColor: constants_1.HIGHLIGHT_COLOR }));
    }
}
