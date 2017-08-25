"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const FloatingWindow_1 = require("./FloatingWindow");
const app_1 = require("./app");
const MARGIN = 20;
const INNER_MARGIN = 10;
class PatientOverlay extends FloatingWindow_1.default {
    constructor(name = '', date = '') {
        super({ width: tabris_1.device.screenWidth * 0.8 });
        this.append(new tabris_1.TextView({
            left: MARGIN, top: MARGIN,
            text: 'Name:'
        }), new tabris_1.TextInput({
            left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()',
            id: 'nameInput'
        }), new tabris_1.TextView({
            left: MARGIN, top: ['prev()', INNER_MARGIN],
            text: 'Geburtsdatum:'
        }), new tabris_1.TextInput({
            left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()', keyboard: 'numbersAndPunctuation',
            id: 'dateInput'
        }));
    }
}
class CreatePatientOverlay extends PatientOverlay {
    constructor(index) {
        super(app_1.data.patients[index].name, app_1.data.patients[index].date);
        this.append(new tabris_1.Button({
            right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
            text: 'Erstellen'
        }).on({
            select: () => {
                app_1.modifyPatient(index, this.find(tabris_1.TextInput).filter('#nameInput').first().text, this.find(tabris_1.TextInput).filter('#dateInput').first().text);
                this.callback();
                this.dispose();
            }
        }));
        this.apply({
            'TextView': { font: 'bold 18px' }
        });
    }
    onCreationComplete(callback) {
        this.callback = callback;
    }
}
exports.CreatePatientOverlay = CreatePatientOverlay;
class ModifyPatientOverlay extends PatientOverlay {
    constructor(index) {
        super();
        this.append(new tabris_1.Button({
            right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
            text: 'Erstellen'
        }).on({
            select: () => {
                app_1.createPatient(this.find(tabris_1.TextInput).filter('#nameInput').first().text, this.find(tabris_1.TextInput).filter('#dateInput').first().text);
                this.callback();
                this.dispose();
            }
        }));
        this.apply({
            'TextView': { font: 'bold 18px' }
        });
    }
    onCreationComplete(callback) {
        this.callback = callback;
    }
}
exports.ModifyPatientOverlay = ModifyPatientOverlay;
