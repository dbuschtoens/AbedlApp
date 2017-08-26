"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const FloatingWindow_1 = require("./FloatingWindow");
const app_1 = require("./app");
const MARGIN = 20;
const INNER_MARGIN = 10;
class PatientOverlay extends FloatingWindow_1.default {
    constructor(name = '', date = '') {
        super({ windowWidth: 0.8, centerX: 0, centerY: 0 });
        this.append(new tabris_1.TextView({
            left: MARGIN, top: MARGIN,
            text: 'Name:'
        }), new tabris_1.TextInput({
            left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()', text: name,
            id: 'nameInput'
        }).on({
            accept: () => {
                this.find(tabris_1.TextInput).filter('#dateInput').first().focused = true;
            }
        }), new tabris_1.TextView({
            left: MARGIN, top: ['prev()', INNER_MARGIN],
            text: 'Geburtsdatum:'
        }), new tabris_1.TextInput({
            left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()', text: date, keyboard: 'numbersAndPunctuation',
            id: 'dateInput'
        }).on({
            accept: () => {
                this.onAccept();
            }
        }));
    }
    onCreationComplete(callback) {
        this.callback = callback;
    }
    onAccept() { }
    ;
}
class CreatePatientOverlay extends PatientOverlay {
    constructor() {
        super();
        this.append(new tabris_1.Button({
            right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
            text: 'Erstellen'
        }).on({
            select: () => this.onAccept()
        }));
        this.apply({
            TextView: { font: 'bold 18px' }
        });
    }
    onAccept() {
        app_1.createPatient(this.find(tabris_1.TextInput).filter('#nameInput').first().text, this.find(tabris_1.TextInput).filter('#dateInput').first().text);
        this.callback();
        this.dispose();
    }
}
exports.CreatePatientOverlay = CreatePatientOverlay;
class ModifyPatientOverlay extends PatientOverlay {
    constructor(index) {
        let patient = app_1.globalDataObject.patients[index];
        super(patient.name, patient.date);
        this.index = index;
        this.append(new tabris_1.Button({
            right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
            text: 'Ändern'
        }).on({
            select: () => this.onAccept()
        }), new tabris_1.Button({
            left: MARGIN, bottom: MARGIN,
            text: 'Löschen'
        }).on({
            select: () => {
                new tabris_1.AlertDialog({
                    title: `Alle daten für ${patient.name} löschen?`,
                    buttons: {
                        cancel: 'nein',
                        ok: 'ja'
                    }
                }).on({
                    closeOk: () => {
                        app_1.deletePatient(index);
                        this.callback();
                        this.dispose();
                    }
                }).open();
            }
        }));
        this.apply({
            TextView: { font: 'bold 18px' }
        });
    }
    onAccept() {
        app_1.modifyPatient(this.index, this.find(tabris_1.TextInput).filter('#nameInput').first().text, this.find(tabris_1.TextInput).filter('#dateInput').first().text);
        this.callback();
        this.dispose();
    }
}
exports.ModifyPatientOverlay = ModifyPatientOverlay;
