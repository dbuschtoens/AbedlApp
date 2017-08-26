"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FloatingWindow_1 = require("../FloatingWindow");
const tabris_1 = require("tabris/tabris");
const constants_1 = require("../constants");
const app_1 = require("../app");
const util_1 = require("../util");
const CreateMedicationOverlay_1 = require("./CreateMedicationOverlay");
const BIG_MARGIN = 20;
const MARGIN = 12;
const SMALL_MARGIN = 10;
const LABEL_FONT = 'bold 18px';
const ADD_FONT = 'bold 28px';
const TEXT_BUTTON_BACKGROUND = '#f7f7f7';
const SELECTED_BUTTON_BACKGROUND = '#ffbb56';
class CreatePerscriptionOverlay extends FloatingWindow_1.default {
    constructor(medOrPerscription) {
        console.log('constructor argument: ' + JSON.stringify(medOrPerscription));
        super({ windowWidth: 0.9, windowHeight: 0.7, centerX: 0, top: 2 * BIG_MARGIN });
        if (medOrPerscription.hasOwnProperty('medId')) {
            this.medication = app_1.getMedication(medOrPerscription.medId);
        }
        else {
            this.medication = medOrPerscription;
        }
        console.log('medication: ' + this.medication.name);
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
        if (this.dosages.length === 1)
            this.dosages[0].selected = true;
        if (this.usages.length === 1)
            this.usages[0].selected = true;
        if (medOrPerscription.hasOwnProperty('medIndex')) {
            this.applyPerscriptionData(medOrPerscription);
        }
    }
    onAccept(callback) {
        this.callback = callback;
    }
    applyPerscriptionData(data) {
        let dosage = this.dosages.find(d => d.text === data.dosage);
        let usage = this.usages.find(u => u.text === data.usage);
        if (dosage)
            dosage.selected = true;
        if (usage)
            usage.selected = true;
        this.find(TimesDisplay).first().applyTimes(data.times);
    }
    _onAccept() {
        if (this.verify()) {
            let medId = app_1.globalDataObject.medications.indexOf(this.medication);
            let selectedDoseage = this.dosages.find(d => d.selected);
            let selectedUsage = this.usages.find(u => u.selected);
            let dosage = '';
            let usage = '';
            if (selectedDoseage)
                dosage = selectedDoseage.text;
            if (selectedUsage)
                usage = selectedUsage.text;
            let times = this.find(TimesDisplay).first().getTimes();
            this.callback({ medId, dosage, usage, times });
            this.dispose();
        }
    }
    verify() {
        let selectedDoseage = this.dosages.find(d => d.selected);
        let selectedUsage = this.usages.find(u => u.selected);
        let times = this.find(TimesDisplay).first().getTimes();
        if (!selectedDoseage) {
            console.error('Keine Dosierung gewählt!');
            return false;
        }
        if (!selectedUsage) {
            console.error('Keine Anwendung gewählt!');
            return false;
        }
        if (times.evening === 0 &&
            times.morning === 0 &&
            times.night === 0 &&
            times.noon === 0 &&
            times.adLib === false) {
            console.error('Keine Einnahmezeiten gewählt!');
            return false;
        }
        return true;
    }
    createUI() {
        this.createDosageButtons();
        this.createUsageButtons();
        this.scrollView.append(new tabris_1.Composite({ id: 'medContainer' }).append(new tabris_1.TextView({ id: 'titleLabel' }), new tabris_1.TextView({ id: 'agentLabel' }), new tabris_1.Button({ id: 'modifyMedButton' })), new tabris_1.Composite({ id: 'dosageAnker' }), ...this.dosages, new TimesDisplay({ id: 'times' }), new tabris_1.TextView({ id: 'usageLable' }), ...this.usages);
    }
    applyContent() {
        this.apply({
            '#titleLabel': { text: this.medication.name },
            '#agentLabel': { text: this.medication.agent },
            '#usageLable': { text: 'Anwendung:' },
            '#modifyMedButton': { text: 'Bearbeiten' },
        });
        for (let i = 0; i < this.dosages.length; i++) {
            this.dosages[i].text = this.medication.availableDosages[i];
            this.dosages[i].group = this.dosages;
        }
        for (let i = 0; i < this.usages.length; i++) {
            this.usages[i].text = this.medication.usages[i];
            this.usages[i].group = this.usages;
        }
    }
    applyStyle() {
        this.apply({
            '#titleLabel': { font: 'bold 24px', textColor: constants_1.LIST_ELEMENT_COLOR },
            '#agentLabel': { font: 'bold 20px', textColor: constants_1.LIST_SUBELEMENT_COLOR },
            '.dosageButton': {},
            '#modifyMedButton': { font: constants_1.LIST_SUBELEMENT_FONT, background: constants_1.LIGHT_GRAY_COLOR },
            '#times': {},
            '#usageLable': { font: LABEL_FONT },
            '.usageButton': {},
            '#addUsageButton': { font: ADD_FONT, textColor: constants_1.HIGHLIGHT_COLOR }
        });
    }
    applyLayout() {
        this.apply({
            '#medContainer': { left: BIG_MARGIN, top: MARGIN, right: BIG_MARGIN, height: 60 },
            '#titleLabel': { left: 0, top: 0 },
            '#agentLabel': { left: 0, top: 'prev()' },
            '#modifyMedButton': { right: 0, top: 0, bottom: 0 },
            '#dosageAnker': { left: SMALL_MARGIN },
            '.dosageButton': { left: ['prev()', SMALL_MARGIN], top: ['#medContainer', MARGIN], height: 30 },
            '#times': { left: BIG_MARGIN - SMALL_MARGIN, top: ['prev()', MARGIN], right: BIG_MARGIN, height: 40 },
            '#usageLable': { left: BIG_MARGIN, top: ['prev()', MARGIN], right: BIG_MARGIN },
            '.usageButton': { left: BIG_MARGIN, top: ['prev()', SMALL_MARGIN], right: BIG_MARGIN },
        });
    }
    registerEvents() {
        this.find('#modifyMedButton').first().on({ select: () => this.modifyMedication() });
    }
    modifyMedication() {
        new CreateMedicationOverlay_1.default(this.medication).onAccept(() => {
            app_1.storeData();
            this.scrollView.find().dispose();
            this.createUI();
            this.applyContent();
            this.applyStyle();
            this.applyLayout();
            this.registerEvents();
        });
    }
    createDosageButtons() {
        this.dosages = [];
        for (let dosage in this.medication.availableDosages) {
            this.dosages.push(new TextToggleButton({ class: 'dosageButton' }));
        }
    }
    createUsageButtons() {
        this.usages = [];
        for (let usage in this.medication.usages) {
            let button = new TextToggleButton({ class: 'usageButton' });
            this.usages.push(button);
        }
    }
}
exports.default = CreatePerscriptionOverlay;
const SEND_ICON = '✔️';
class AddTextWindow extends FloatingWindow_1.default {
    constructor() {
        super({ centerX: 0, centerY: 0, windowWidth: 0.9 });
        this.append(new tabris_1.TextInput({
            left: SMALL_MARGIN, right: 70, top: SMALL_MARGIN, type: 'multiline'
        }).on({
            accept: () => this.onSelect()
        }), new tabris_1.Button({
            left: ['prev()', SMALL_MARGIN], top: SMALL_MARGIN, bottom: SMALL_MARGIN, right: SMALL_MARGIN,
            text: SEND_ICON,
        }).on({
            select: () => this.onSelect()
        }));
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
class TextButton extends tabris_1.Composite {
    constructor(properties) {
        properties = properties || {};
        properties.cornerRadius = 3;
        properties.background = TEXT_BUTTON_BACKGROUND;
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
class TextToggleButton extends tabris_1.Composite {
    constructor(properties) {
        properties.cornerRadius = 3;
        properties.background = TEXT_BUTTON_BACKGROUND;
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
            this.background = TEXT_BUTTON_BACKGROUND;
        }
    }
    get text() {
        return this.textView.text;
    }
    set text(value) {
        this.textView.text = value;
    }
}
class TimesDisplay extends tabris_1.Composite {
    constructor(properties) {
        properties = properties;
        super(properties);
        this.append(new TextButton({ id: 'morning', text: '0' }), new tabris_1.TextView({ text: '-' }), new TextButton({ id: 'noon', text: '0' }), new tabris_1.TextView({ text: '-' }), new TextButton({ id: 'evening', text: '0' }), new tabris_1.TextView({ text: '-' }), new TextButton({ id: 'night', text: '0' }), new TextToggleButton({ id: 'adLib', text: 'n.Bed.' }));
        this.apply({
            'TextButton': { left: ['prev()', SMALL_MARGIN], top: 5, bottom: 5, pad: 5 },
            'TextView': { left: ['prev()', SMALL_MARGIN], top: 5, bottom: 5 },
            'TextToggleButton': { left: ['prev()', MARGIN], top: 5, bottom: 5, right: 5 }
        });
        this.find(TextButton).forEach(button => button.on({
            tap: ({ target }) => this.increment(target),
            longpress: ({ target, state }) => { if (state !== 'end')
                this.showInput(target); }
        }));
    }
    increment(target) {
        target.text = '' + (parseInt(target.text) + 1);
    }
    showInput(target) {
        let padding = 5;
        let inputWindow = new FloatingWindow_1.default({ windowWidth: 0.5, centerX: 0, top: 50 }).append(new tabris_1.TextInput({
            left: padding, bottom: padding, top: padding, right: 80,
            keyboard: 'number', text: '0'
        }).on({
            focus: ({ target }) => target.text = '',
            accept: () => {
                target.text = inputWindow.find(tabris_1.TextInput).first().text;
                inputWindow.dispose();
            }
        }), new tabris_1.Button({
            left: ['prev()', padding], top: padding, bottom: padding, right: padding,
            text: SEND_ICON, textColor: constants_1.HIGHLIGHT_COLOR
        }).on({
            select: () => {
                target.text = inputWindow.find(tabris_1.TextInput).first().text;
                inputWindow.dispose();
            }
        }));
    }
    applyTimes(times) {
        this.apply({
            '#morning': { text: times.morning },
            '#noon': { text: times.noon },
            '#evening': { text: times.evening },
            '#night': { text: times.night },
        });
        this.find(TextToggleButton).first().selected = times.adLib;
    }
    getTimes() {
        return {
            adLib: this.find(TextToggleButton).first().selected,
            evening: parseInt(this.find(TextButton).filter('#evening').first().text),
            morning: parseInt(this.find(TextButton).filter('#morning').first().text),
            night: parseInt(this.find(TextButton).filter('#night').first().text),
            noon: parseInt(this.find(TextButton).filter('#noon').first().text),
        };
    }
}
