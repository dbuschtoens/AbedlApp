"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris/tabris");
const constants_1 = require("../constants");
const app_1 = require("../app");
const MARGIN = 20;
const INNER_MARGIN = 3;
const PADDING = 6;
class MedicationCell extends tabris_1.Composite {
    get index() {
        return this._index;
    }
    constructor() {
        super({ highlightOnTouch: true });
        this.createUI();
        this.applyLayout();
    }
    applyContent(perscription, index) {
        this._index = index;
        let med = app_1.getMedication(perscription.medId);
        if (med) {
            this.apply({
                '#title': { text: med.name },
                '#dosage': { text: perscription.dosage },
                // '#agent': { text: med.agent },
                '#times': { text: this.createTimeText(perscription.times) },
            });
        }
        else {
            console.error('perscription has invalid medId');
        }
    }
    createTimeText(time) {
        if (time.adLib)
            return 'nach Bedarf';
        else
            return time.morning + ' - ' + time.noon + ' - ' + time.evening + ' - ' + time.night;
    }
    createUI() {
        this.append(new tabris_1.TextView({ id: 'title' }), new tabris_1.TextView({ id: 'dosage' }), new tabris_1.TextView({ id: 'times' }));
    }
    applyLayout() {
        this.apply({
            '#title': {
                layoutData: { left: MARGIN, top: MARGIN },
                font: 'bold 20px',
                textColor: constants_1.LIST_ELEMENT_COLOR
            },
            '#dosage': {
                layoutData: { left: ['prev()', 10], baseline: 'prev()' },
                font: 'bold 20px',
                textColor: constants_1.LIST_SUBELEMENT_COLOR
            },
            '#times': {
                layoutData: { top: 'prev()', left: MARGIN },
                font: '18px',
                textColor: constants_1.LIST_ELEMENT_COLOR
            },
        });
    }
}
exports.default = MedicationCell;
