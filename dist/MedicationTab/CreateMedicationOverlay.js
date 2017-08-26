"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FloatingWindow_1 = require("../FloatingWindow");
const tabris_1 = require("tabris/tabris");
const constants_1 = require("../constants");
const app_1 = require("../app");
const util_1 = require("../util");
const BIG_MARGIN = 20;
const MARGIN = 10;
const SMALL_MARGIN = 10;
const LABEL_FONT = 'bold 18px';
const ADD_FONT = 'bold 28px';
const SELECTED_BUTTON_BACKGROUND = '#ffbb56';
const WINDOWS_MARGIN = tabris_1.device.platform === 'windows' ? 10 : 0;
class CreateMedicationOverlay extends FloatingWindow_1.default {
    constructor(medication) {
        super({ windowHeight: 0.85, windowWidth: 0.9, centerX: 0, top: MARGIN });
        this.medUsages = medication ? medication.usages : [];
        this.medAvailableDosages = medication ? medication.availableDosages : [];
        this.medSideEffects = medication ? medication.sideEffects : '';
        this.medCounterSigns = medication ? medication.counterSigns : '';
        this.medAgent = medication ? medication.agent : '';
        this.medName = medication ? medication.name : '';
        this.scrollView = new tabris_1.ScrollView({ left: 0, right: 0, top: 0, bottom: 80 }).appendTo(this);
        new tabris_1.Button({
            right: MARGIN, bottom: MARGIN, top: [this.scrollView, SMALL_MARGIN],
            text: SEND_ICON, font: 'bold 30px', width: 100, textColor: constants_1.HIGHLIGHT_COLOR
        }).on({
            select: () => this._onAccept()
        }).appendTo(this);
        this.createUI();
        this.applyContent();
        this.applyStyle();
        this.applyLayout();
        this.registerEvents();
    }
    onAccept(callback) {
        this.callback = callback;
    }
    _onAccept() {
        if (this.verify()) {
            let med = {};
            med.name = this.find(tabris_1.TextInput).filter('#titleInput').first().text;
            med.agent = this.find(tabris_1.TextInput).filter('#agentInput').first().text;
            med.counterSigns = this.find(tabris_1.TextInput).filter('#counterSignsInput').first().text;
            med.sideEffects = this.find(tabris_1.TextInput).filter('#sideEffectsInput').first().text;
            med.form = app_1.globalDataObject.dosageForms[this.find(tabris_1.Picker).first().selectionIndex];
            med.availableDosages = [];
            this.dosages.forEach(doseage => med.availableDosages.push(doseage.text));
            med.usages = [];
            this.usages.forEach(usage => med.usages.push(usage.text));
            let medication = app_1.createMedication(med);
            this.callback(medication);
            this.dispose();
        }
    }
    verify() {
        let isOkay = true;
        if (!this.find(tabris_1.TextInput).filter('#titleInput').first().text) {
            console.error('Name fehlt!');
            isOkay = false;
        }
        if (!this.find(tabris_1.TextInput).filter('#agentInput').first().text) {
            console.error('Wirkstoff fehlt!');
            isOkay = false;
        }
        if (!this.dosages || this.dosages.length === 0) {
            console.error('Keine Dosierungen angegeben!');
            isOkay = false;
        }
        if (!this.usages || this.usages.length === 0) {
            console.error('Kein Anwendungen angegeben!');
            isOkay = false;
        }
        return isOkay;
    }
    createUI() {
        this.scrollView.append(new tabris_1.TextView({ id: 'title' }), new tabris_1.TextView({ id: 'titleLabel' }), new tabris_1.TextInput({ id: 'titleInput' }), new tabris_1.TextView({ id: 'agentLabel' }), new tabris_1.TextInput({ id: 'agentInput' }), new tabris_1.TextView({ id: 'dosageLabel' }), new tabris_1.Button({ id: 'dosageAnker' }), new tabris_1.Button({ id: 'addDosageButton' }), new tabris_1.TextView({ id: 'formLabel' }), new tabris_1.Picker({ id: 'formPicker' }), new tabris_1.Button({ id: 'addFormButton' }), new tabris_1.TextView({ id: 'usageLable' }), new tabris_1.Button({ id: 'addUsageButton' }), new tabris_1.TextView({ id: 'sideEffectsLabel' }), new tabris_1.TextInput({ id: 'sideEffectsInput', type: 'multiline' }), new tabris_1.TextView({ id: 'counterSignsLabel' }), new tabris_1.TextInput({ id: 'counterSignsInput', type: 'multiline' }), new tabris_1.Composite({ id: 'filler' }));
        this.createDosageButtons();
        this.createUsageButtons();
    }
    applyContent() {
        this.apply({
            '#title': { text: 'Medikament erstellen' },
            '#titleLabel': { text: 'Name:' },
            '#titleInput': { text: this.medName },
            '#agentLabel': { text: 'Wirkstoff:' },
            '#agentInput': { text: this.medAgent },
            '#counterSignsLabel': { text: 'Gegenanzeichen:' },
            '#counterSignsInput': { text: this.medCounterSigns },
            '#sideEffectsLabel': { text: 'Nebenwirkungen:' },
            '#sideEffectsInput': { text: this.medSideEffects },
            '#dosageLabel': { text: 'Dosis:' },
            '#addDosageButton': { text: '+' },
            '#formLabel': { text: 'Art: ' },
            '#addFormButton': { text: '+' },
            '#usageLable': { text: 'Anwendung:' },
            '#addUsageButton': { text: '+' },
        });
        this.updateFormPicker();
    }
    applyStyle() {
        this.apply({
            '#title': { font: 'bold 22px', textColor: constants_1.HIGHLIGHT_COLOR },
            '#titleLabel': { font: LABEL_FONT },
            '#titleInput': {},
            '#agentLabel': { font: LABEL_FONT },
            '#agentInput': {},
            '#counterSignsLabel': { font: LABEL_FONT },
            '#counterSignsInput': {},
            '#sideEffectsLabel': { font: LABEL_FONT },
            '#sideEffectsInput': {},
            '#dosageLabel': { font: LABEL_FONT },
            '.dosageButton': {},
            '#addDosageButton': { font: LABEL_FONT, textColor: constants_1.HIGHLIGHT_COLOR },
            '#formLabel': { font: LABEL_FONT },
            '#formPicker': {},
            '#addFormButton': { font: LABEL_FONT, textColor: constants_1.HIGHLIGHT_COLOR },
            '#usageLable': { font: LABEL_FONT },
            '.usageButton': {},
            '#addUsageButton': { font: ADD_FONT, textColor: constants_1.HIGHLIGHT_COLOR },
        });
    }
    applyLayout() {
        let d = this.dosages.length;
        this.apply({
            '#title': { left: BIG_MARGIN, top: MARGIN },
            '#titleLabel': { left: BIG_MARGIN, top: ['prev()', MARGIN] },
            '#titleInput': { left: ['prev()', SMALL_MARGIN], baseline: 'prev()', right: BIG_MARGIN },
            '#agentLabel': { left: BIG_MARGIN, top: ['prev()', WINDOWS_MARGIN] },
            '#agentInput': { left: ['prev()', SMALL_MARGIN], baseline: 'prev()', right: BIG_MARGIN },
            '#counterSignsLabel': { left: BIG_MARGIN, top: ['prev()', WINDOWS_MARGIN], right: BIG_MARGIN },
            '#counterSignsInput': { left: BIG_MARGIN, top: ['prev()', WINDOWS_MARGIN], right: BIG_MARGIN },
            '#sideEffectsLabel': { left: BIG_MARGIN, top: ['prev()', WINDOWS_MARGIN], right: BIG_MARGIN },
            '#sideEffectsInput': { left: BIG_MARGIN, top: ['prev()', WINDOWS_MARGIN], right: BIG_MARGIN },
            '#dosageLabel': { left: BIG_MARGIN, top: ['prev()', WINDOWS_MARGIN] },
            '#dosageAnker': { left: 0, width: SMALL_MARGIN, top: ['prev()', WINDOWS_MARGIN], height: 2 },
            '.dosageButton': { left: ['prev()', SMALL_MARGIN], top: ['#dosageLabel', MARGIN], height: 30 },
            '#addDosageButton': { left: d > 0 ? ['prev()', SMALL_MARGIN] : BIG_MARGIN, top: '#dosageLabel', height: 45, width: 40 },
            '#formLabel': { left: BIG_MARGIN, top: ['#addDosageButton', SMALL_MARGIN] },
            '#formPicker': { left: ['#formLabel', SMALL_MARGIN], top: ['#addDosageButton', 7], right: 60 },
            '#addFormButton': { left: ['#formPicker', SMALL_MARGIN], baseline: '#formLabel', right: SMALL_MARGIN },
            '#usageLable': { left: BIG_MARGIN, top: '#formPicker', right: BIG_MARGIN },
            '.usageButton': { left: BIG_MARGIN, top: ['prev()', SMALL_MARGIN], right: BIG_MARGIN },
            '#addUsageButton': { left: BIG_MARGIN, top: ['prev()', MARGIN], right: BIG_MARGIN, height: 60 },
            '#filler': { left: BIG_MARGIN, top: ['prev()', MARGIN], right: BIG_MARGIN, height: tabris_1.device.screenHeight * 0.35 },
        });
    }
    updateFormPicker() {
        this.find(tabris_1.Picker).first().set({
            itemCount: app_1.globalDataObject.dosageForms.length,
            itemText: (index) => app_1.globalDataObject.dosageForms[index]
        });
    }
    registerEvents() {
        this.find('#addDosageButton').first().on({ select: () => this.promptDosageText() });
        this.find('#addFormButton').first().on({
            select: () => this.promptFormText(),
            longpress: ({ state }) => {
                if (state !== 'end') {
                    this.promptRemoveFormText();
                }
            }
        });
        this.find('#addUsageButton').first().on({ select: () => this.promptUsageText() });
    }
    promptRemoveFormText() {
        let index = this.find(tabris_1.Picker).first().selectionIndex;
        let message = app_1.globalDataObject.dosageForms[index];
        new tabris_1.AlertDialog({
            title: 'Dareichungsform löschen?',
            message,
            buttons: {
                ok: 'Ja',
                cancel: 'Nein'
            }
        }).on({
            closeOk: () => {
                app_1.globalDataObject.dosageForms.splice(index, 1);
                app_1.storeData();
                this.updateFormPicker();
            }
        }).open();
    }
    promptUsageText() {
        new AddTextWindow().onComplete((text) => this.addUsage(text));
    }
    promptFormText() {
        new AddTextWindow().onComplete((text) => this.addForm(text));
    }
    promptDosageText() {
        new AddDosageWindow().onComplete((text) => this.addDosage(text));
    }
    createDosageButtons() {
        this.dosages = [];
        this.medAvailableDosages.forEach(dosage => {
            this.addDosage(dosage);
        });
    }
    createUsageButtons() {
        this.usages = [];
        this.medUsages.forEach((usage) => {
            this.addUsage(usage);
        });
    }
    addDosage(text) {
        let newDosage = new TextButton({ class: 'dosageButton' });
        newDosage.text = text;
        newDosage.on({
            longpress: ({ state }) => {
                if (state !== 'end') {
                    this.promptDeleteElement(this.medAvailableDosages, this.dosages, newDosage);
                }
            }
        });
        newDosage.insertBefore(this.find('#addDosageButton').first());
        this.dosages.push(newDosage);
        this.applyStyle();
        this.applyLayout();
    }
    promptDeleteElement(globalData, widgets, element) {
        new tabris_1.AlertDialog({
            title: 'Eintrag löschen?',
            message: element.text,
            buttons: { ok: 'ja', cancel: 'nein' }
        }).on({
            closeOk: () => {
                let index = globalData.indexOf(element.text);
                if (index !== -1) {
                    globalData.splice(index, 1);
                }
                widgets.splice(widgets.indexOf(element), 1);
                element.dispose();
                this.applyLayout();
                app_1.storeData();
            }
        }).open();
    }
    addUsage(text) {
        let newUsage = new TextButton({ class: 'usageButton' }).on({ select: () => console.error(newUsage.text) });
        newUsage.text = text;
        newUsage.on({
            longpress: ({ state }) => {
                if (state !== 'end') {
                    this.promptDeleteElement(this.medUsages, this.usages, newUsage);
                }
            }
        });
        newUsage.insertBefore(this.find('#addUsageButton').first());
        this.usages.push(newUsage);
        this.applyStyle();
        this.applyLayout();
    }
    addForm(text) {
        app_1.globalDataObject.dosageForms.push(text);
        app_1.storeData();
        this.updateFormPicker();
    }
}
exports.default = CreateMedicationOverlay;
const SEND_ICON = '✔️';
class AddTextWindow extends FloatingWindow_1.default {
    constructor(message) {
        super({ centerX: 0, centerY: 0, windowWidth: 0.9 });
        this.append(new tabris_1.TextInput({
            left: SMALL_MARGIN, right: 70, top: SMALL_MARGIN, type: 'multiline'
        }).on({
            accept: () => this.onSelect()
        }), new tabris_1.Button({
            left: ['prev()', SMALL_MARGIN], top: SMALL_MARGIN, bottom: SMALL_MARGIN, right: SMALL_MARGIN,
            text: SEND_ICON, textColor: constants_1.HIGHLIGHT_COLOR
        }).on({
            select: () => this.onSelect()
        }));
        if (message)
            this.find(tabris_1.TextInput).first().message = message;
        this.once({ resize: () => this.find(tabris_1.TextInput).first().focused = true });
    }
    onComplete(callback) {
        this.callback = callback;
        return this;
    }
    onSelect() {
        this.callback(this.find(tabris_1.TextInput).first().text);
        this.dispose();
    }
}
class AddDosageWindow extends FloatingWindow_1.default {
    constructor() {
        super({ centerX: 0, centerY: 0, windowWidth: 0.4 });
        this.buttonWidth = 60;
        this.buttonHeight = 40;
        this.append(new tabris_1.Button({ id: 'addUnitButton', text: '+', textColor: constants_1.HIGHLIGHT_COLOR }).on({
            select: () => this.promptUnitAdd()
        }), new tabris_1.TextInput({ id: 'input', keyboard: 'number' }));
        this.once({ resize: () => this.find(tabris_1.TextInput).first().focused = true });
        this.applyLayout();
        this.createUnitButtons();
    }
    applyLayout() {
        this.apply({
            '.unitButton': { right: MARGIN, top: ['prev()', SMALL_MARGIN], width: this.buttonWidth, height: this.buttonHeight },
            '#addUnitButton': { right: MARGIN, top: ['prev()', SMALL_MARGIN], width: this.buttonWidth, height: this.buttonHeight },
            '#input': { centerY: 0, right: ['#addUnitButton', MARGIN], left: MARGIN },
        });
    }
    createUnitButtons() {
        this.units = [];
        app_1.globalDataObject.dosageUnits.forEach(unit => {
            this.addUnit(unit);
        });
    }
    promptUnitAdd() {
        new AddTextWindow('neue einheit').onComplete((text) => {
            app_1.globalDataObject.dosageUnits.push(text);
            app_1.storeData();
            this.addUnit(text);
        });
    }
    addUnit(text) {
        let newUnit = new TextButton({ class: 'unitButton' });
        newUnit.text = text;
        newUnit.on({
            tap: () => this.onUnitSelected(text),
            longpress: ({ state }) => {
                if (state !== 'end') {
                    this.promptDeleteElement(app_1.globalDataObject.dosageUnits, this.units, newUnit);
                }
            }
        });
        newUnit.insertBefore(this.find('#addUnitButton').first());
        this.units.push(newUnit);
        this.applyLayout();
        app_1.storeData();
    }
    onUnitSelected(unit) {
        this.callback(this.find(tabris_1.TextInput).first().text + unit);
        setTimeout(() => this.dispose(), 20); // because crash idk
    }
    onComplete(callback) {
        this.callback = callback;
        return this;
    }
    promptDeleteElement(globalData, widgets, element) {
        new tabris_1.AlertDialog({
            title: 'Eintrag löschen?',
            message: element.text,
            buttons: { ok: 'ja', cancel: 'nein' }
        }).on({
            closeOk: () => {
                let index = globalData.indexOf(element.text);
                if (index !== -1) {
                    globalData.splice(index, 1);
                }
                widgets.splice(widgets.indexOf(element), 1);
                element.dispose();
                this.applyLayout();
                app_1.storeData();
            }
        }).open();
    }
}
class TextToggleButton extends tabris_1.Composite {
    constructor(properties) {
        properties.cornerRadius = 3;
        properties.background = constants_1.TEXT_BUTTON_BACKGROUND;
        properties.highlightOnTouch = true;
        let text = properties.text || '';
        super(util_1.omit(properties, 'text'));
        this.selected = false;
        this.group = [];
        let padding = 5;
        this.textView = new tabris_1.TextView({
            left: padding, right: padding, top: padding, bottom: padding, alignment: 'center', text
        }).appendTo(this);
        this.on({ tap: () => this.selected = !this.selected });
    }
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (value) {
            this._selected = true;
            this.background = SELECTED_BUTTON_BACKGROUND;
            this.group.forEach(button => {
                if (button.text !== this.text) {
                    button.selected = false;
                }
            });
        }
        else {
            this._selected = false;
            this.background = constants_1.TEXT_BUTTON_BACKGROUND;
        }
    }
    get text() {
        return this.textView.text;
    }
    set text(value) {
        this.textView.text = value;
    }
}
class TextButton extends tabris_1.Composite {
    constructor(properties) {
        properties = properties || {};
        properties.cornerRadius = 3;
        properties.background = constants_1.TEXT_BUTTON_BACKGROUND;
        properties.highlightOnTouch = true;
        let text = properties.text || '';
        super(util_1.omit(properties, 'text'));
        let padding = properties.pad || 5;
        this.textView = new tabris_1.TextView({
            left: padding, right: padding, top: padding, bottom: padding, alignment: 'center', text
        }).appendTo(this);
    }
    get text() {
        return this.textView.text;
    }
    set text(value) {
        this.textView.text = value;
    }
}
