"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FloatingWindow_1 = require("../FloatingWindow");
const tabris_1 = require("tabris/tabris");
const constants_1 = require("../constants");
const app_1 = require("../app");
const BIG_MARGIN = 20;
const MARGIN = 10;
const SMALL_MARGIN = 10;
const LABEL_FONT = 'bold 18px';
const ADD_FONT = 'bold 28px';
const SELECTED_BUTTON_BACKGROUND = '#ffbb56';
const SEND_ICON = '✔️';
class CreateDiagnosisOverlay extends FloatingWindow_1.default {
    constructor(diagnosis) {
        super({ centerX: 0, centerY: 0, windowWidth: 0.9 });
        this.diagnosis = diagnosis;
        this.createUI();
        this.applyLayout();
    }
    onAccept(callback) {
        this.callback = callback;
    }
    createUI() {
        this.append(new tabris_1.TextInput({ id: 'nameInput', message: 'Diagnose' }), new tabris_1.TextInput({ id: 'explanationInput', type: 'multiline', message: 'Erklärung' }), new tabris_1.Button({ text: SEND_ICON, textColor: constants_1.HIGHLIGHT_COLOR, font: 'bold 28px' }).on({ select: () => {
                let name = this.find(tabris_1.TextInput).filter('#nameInput').first().text;
                let explanation = this.find(tabris_1.TextInput).filter('#explanationInput').first().text;
                if (name !== '') {
                    let diag = this.diagnosis || app_1.createDiagnosis({ name, explanation });
                    if (diag) {
                        this.callback(diag.id);
                        this.dispose();
                    }
                }
            } }));
        if (this.diagnosis) {
            this.find(tabris_1.TextInput).filter('#nameInput').first().text = this.diagnosis.name;
            this.find(tabris_1.TextInput).filter('#explanationInput').first().text = this.diagnosis.explanation;
        }
    }
    applyLayout() {
        this.apply({
            '#nameInput': { left: MARGIN, top: MARGIN, right: MARGIN },
            '#explanationInput': { left: MARGIN, top: ['prev()', MARGIN], right: MARGIN },
            'Button': { top: ['prev()', MARGIN], right: MARGIN }
        });
    }
}
exports.default = CreateDiagnosisOverlay;
