import FloatingWindow from "../FloatingWindow";
import { Medication, Perscription, PerscriptionTimes } from "../PatientData";
import { Composite, CompositeProperties, TextView, TextInput, ToggleButton, Picker, Button, ScrollView, device, AlertDialog } from "tabris/tabris";
import { LIST_ELEMENT_COLOR, LIST_SUBELEMENT_COLOR, HIGHLIGHT_COLOR, TEXT_BUTTON_BACKGROUND } from "../constants";
import { globalDataObject, storeData, createMedication } from "../app";
import { omit } from "../util";

const BIG_MARGIN = 20;
const MARGIN = 10;
const SMALL_MARGIN = 10;
const SEND_ICON = '✔️'
const DELETE_ICON = '❌'

const LABEL_FONT = 'bold 18px';
const ADD_FONT = 'bold 28px';
const SELECTED_BUTTON_BACKGROUND = '#ffbb56'
const WINDOWS_MARGIN = device.platform === 'windows' ? 10 : 0;

export default class CreateMedicationOverlay extends FloatingWindow {

  private medUsages: string[];
  private medAvailableDosages: string[];
  private medSideEffects: string;
  private medCounterSigns: string;
  private medAgent: string;
  private medName: string;

  private callback: (medication: Medication) => void;

  private scrollView: ScrollView;
  private dosagesContainer: Composite;
  private dosages: TextButton[];
  private usages: TextButton[];

  constructor(medication?: Medication) {
    super({ windowHeight: 0.85, windowWidth: 0.9, centerX: 0, top: MARGIN });
    this.medUsages = medication ? medication.usages : [];
    this.medAvailableDosages = medication ? medication.availableDosages : [];
    this.medSideEffects = medication ? medication.sideEffects : '';
    this.medCounterSigns = medication ? medication.counterSigns : '';
    this.medAgent = medication ? medication.agent : '';
    this.medName = medication ? medication.name : '';
    this.scrollView = new ScrollView({ left: 0, right: 0, top: 0, bottom: 80 }).appendTo(this);
    new Button({
      right: MARGIN, bottom: MARGIN, top: [this.scrollView, SMALL_MARGIN],
      text: SEND_ICON, font: 'bold 30px', width: 100, textColor: HIGHLIGHT_COLOR
    }).on({
      select: () => this._onAccept()
    }).appendTo(this);
    this.createUI();
    this.applyContent();
    this.applyStyle();
    this.applyLayout();
    this.registerEvents();
  }


  public onAccept(callback: (medication: Medication) => void) {
    this.callback = callback;
  }

  private _onAccept() {
    if (this.verify()) {
      let med: any = {};
      med.name = this.find(TextInput).filter('#titleInput').first().text;
      med.agent = this.find(TextInput).filter('#agentInput').first().text;
      med.counterSigns = this.find(TextInput).filter('#counterSignsInput').first().text;
      med.sideEffects = this.find(TextInput).filter('#sideEffectsInput').first().text;
      med.form = globalDataObject.dosageForms[this.find(Picker).first().selectionIndex];
      med.availableDosages = [];
      this.dosages.forEach(doseage => med.availableDosages.push(doseage.text));
      med.usages = [];
      this.usages.forEach(usage => med.usages.push(usage.text));
      let medication = createMedication(med);
      this.callback(medication);
      this.dispose();
    }
  }

  private verify() {
    let isOkay = true;
    if (!this.find(TextInput).filter('#titleInput').first().text) {
      console.error('Name fehlt!');
      isOkay = false;
    }
    if (!this.find(TextInput).filter('#agentInput').first().text) {
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

  private createUI() {
    this.scrollView.append(
      new TextView({ id: 'title' }),
      new TextView({ id: 'titleLabel' }),
      new TextInput({ id: 'titleInput' }),
      new TextView({ id: 'agentLabel' }),
      new TextInput({ id: 'agentInput' }),
      new TextView({ id: 'dosageLabel' }),
      new Button({ id: 'dosageAnker' }),
      new Button({ id: 'addDosageButton' }),
      new TextView({ id: 'formLabel' }),
      new Picker({ id: 'formPicker' }),
      new Button({ id: 'addFormButton' }),
      new TextView({ id: 'usageLable' }),
      new Button({ id: 'addUsageButton' }),
      new TextView({ id: 'sideEffectsLabel' }),
      new TextInput({ id: 'sideEffectsInput', type: 'multiline' }),
      new TextView({ id: 'counterSignsLabel' }),
      new TextInput({ id: 'counterSignsInput', type: 'multiline' }),
      new Composite({ id: 'filler' })
    );
    this.createDosageButtons();
    this.createUsageButtons();
  }

  private applyContent() {
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

  private applyStyle() {
    this.apply({
      '#title': { font: 'bold 22px', textColor: HIGHLIGHT_COLOR },
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
      '#addDosageButton': { font: LABEL_FONT, textColor: HIGHLIGHT_COLOR },
      '#formLabel': { font: LABEL_FONT },
      '#formPicker': {},
      '#addFormButton': { font: LABEL_FONT, textColor: HIGHLIGHT_COLOR },
      '#usageLable': { font: LABEL_FONT },
      '.usageButton': {},
      '#addUsageButton': { font: ADD_FONT, textColor: HIGHLIGHT_COLOR },
    });
  }

  private applyLayout() {
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
      '.dosageButton': { left: ['prev()', SMALL_MARGIN], top: ['#dosageLabel', MARGIN], height: 30 }, //
      '#addDosageButton': { left: d > 0 ? ['prev()', SMALL_MARGIN] : BIG_MARGIN, top: '#dosageLabel', height: 45, width: 40 },
      '#formLabel': { left: BIG_MARGIN, top: ['#addDosageButton', SMALL_MARGIN] },
      '#formPicker': { left: ['#formLabel', SMALL_MARGIN], top: ['#addDosageButton', 7], right: 60 },
      '#addFormButton': { left: ['#formPicker', SMALL_MARGIN], baseline: '#formLabel', right: SMALL_MARGIN },
      '#usageLable': { left: BIG_MARGIN, top: '#formPicker', right: BIG_MARGIN },
      '.usageButton': { left: BIG_MARGIN, top: ['prev()', SMALL_MARGIN], right: BIG_MARGIN },
      '#addUsageButton': { left: BIG_MARGIN, top: ['prev()', MARGIN], right: BIG_MARGIN, height: 60 },
      '#filler': { left: BIG_MARGIN, top: ['prev()', MARGIN], right: BIG_MARGIN, height: device.screenHeight * 0.35 },
    });
  }

  private updateFormPicker() {
    this.find(Picker).first().set({
      itemCount: globalDataObject.dosageForms.length,
      itemText: (index) => globalDataObject.dosageForms[index]
    });
  }

  private registerEvents() {
    this.find('#addDosageButton').first().on({ select: () => this.promptDosageText('') });
    this.find('#addFormButton').first().on({
      select: () => this.promptFormText(''),
      longpress: ({ state }) => {
        if (state !== 'end') {
          this.promptRemoveFormText();
        }
      }
    });
    this.find('#addUsageButton').first().on({ select: () => this.promptUsageText('') });
  }

  private promptUsageText(text: string) {
    new AddTextWindow(text)
      .onComplete((t) => {
        if (text) {
          this.modifyUsage(text, t);
        } else {
          this.addUsage(t)
        }
      }).onDelete((t) => this.findAndDeleteUsage(t));
  }

  private promptFormText(text: string) {
    new AddTextWindow(text)
      .onComplete((t) => {
        if (text) {

        } else {
          this.addForm(t);
        }
      })
      .onDelete((t) => this.promptRemoveFormText());
  }

  private promptRemoveFormText() {
    let index = this.find(Picker).first().selectionIndex;
    let message = globalDataObject.dosageForms[index];
    new AlertDialog({
      title: 'Dareichungsform löschen?',
      message,
      buttons: {
        ok: 'Ja',
        cancel: 'Nein'
      }
    }).on({
      closeOk: () => {
        globalDataObject.dosageForms.splice(index, 1);
        storeData();
        this.updateFormPicker();
      }
    }).open();
  }

  private promptDosageText(text: string) {
    new AddDosageWindow().onComplete((text) => this.addDosage(text));
  }

  private createDosageButtons() {
    this.dosages = [];
    this.medAvailableDosages.forEach(dosage => {
      this.addDosage(dosage);
    });
  }

  private createUsageButtons() {
    this.usages = [];
    this.medUsages.forEach((usage) => {
      this.addUsage(usage);
    });
  }

  private addDosage(text: string) {
    let newDosage = new TextButton({ class: 'dosageButton' });
    newDosage.text = text;
    newDosage.on({
      longpress: ({ state }) => {
        if (state !== 'end') {
          this.promptDeleteElement(this.medAvailableDosages, this.dosages, newDosage)
        }
      }
    })
    newDosage.insertBefore(this.find('#addDosageButton').first());
    this.dosages.push(newDosage);
    this.applyStyle();
    this.applyLayout();
  }

  private findAndDeleteUsage(text: string) {
    let widget = this.usages.find(u => u.text === text);
    if (widget) {
      this.deleteElement(this.medUsages, this.usages, widget);
    } else {
      console.error(text + ' wurde nicht gefunden, nichts wurde gelöscht');
    }
  }

  private modifyUsage(old: string, notOld: string) {
    let widget = this.usages.find(u => u.text === old);
    if (widget) {
      this.medUsages[this.medUsages.indexOf(old)] = notOld;
      widget.text = notOld;
      storeData();
    } else {
      console.error(old + ' wurde nicht gefunden, nichts wurde gelöscht');
    }
  }

  private promptDeleteElement(globalData: string[], widgets: TextButton[], element: TextButton) {
    new AlertDialog({
      title: 'Eintrag löschen?',
      message: element.text,
      buttons: { ok: 'ja', cancel: 'nein' }
    }).on({
      closeOk: () => this.deleteElement(globalData, widgets, element)
    }).open();
  }

  private deleteElement(globalData: string[], widgets: TextButton[], element: TextButton) {
    let index = globalData.indexOf(element.text);
    if (index !== -1) {
      globalData.splice(index, 1);
    }
    widgets.splice(widgets.indexOf(element), 1);
    element.dispose();
    this.applyLayout();
    storeData();
  }

  private addUsage(text: string) {
    let newUsage: TextButton = new TextButton({ class: 'usageButton' }).on({ select: () => console.error(newUsage.text) });
    newUsage.text = text;
    newUsage.on({
      tap: () => {
        this.promptUsageText(text)
      }
    })
    newUsage.insertBefore(this.find('#addUsageButton').first());
    this.usages.push(newUsage);
    this.applyStyle();
    this.applyLayout();
  }

  private addForm(text: string) {
    globalDataObject.dosageForms.push(text);
    storeData();
    this.updateFormPicker();
  }

}


class AddTextWindow extends FloatingWindow {

  private callback: (text: string) => void;
  private delCallback: (test: string) => void;

  constructor(text: string) {
    super({ centerX: 0, centerY: 0, windowWidth: 0.9 });
    this.append(
      new Button({
        right: ['prev()', SMALL_MARGIN], top: SMALL_MARGIN, bottom: SMALL_MARGIN, width: 50,
        text: SEND_ICON, textColor: HIGHLIGHT_COLOR
      }).on({
        select: () => this.onSelect()
      }),
      new Button({
        right: ['prev()', 0], top: SMALL_MARGIN, bottom: SMALL_MARGIN, width: 50,
        text: DELETE_ICON, textColor: HIGHLIGHT_COLOR
      }).on({
        select: () => this._onDelete()
      }),
      new TextInput({
        left: SMALL_MARGIN, top: SMALL_MARGIN, right: ['prev()', SMALL_MARGIN], type: 'multiline', text
      }).on({
        accept: () => this.onSelect()
      }),
    )
    this.once({ resize: () => this.find(TextInput).first().focused = true });
  }

  public onComplete(callback: (text: string) => void) {
    this.callback = callback;
    return this;
  }

  public onDelete(callback: (test: string) => void) {
    this.delCallback = callback;
    return this;
  }

  private onSelect() {
    this.callback(this.find(TextInput).first().text);
    this.dispose();
  }

  private _onDelete() {
    this.delCallback(this.find(TextInput).first().text);
    this.dispose();
  }

}

class AddDosageWindow extends FloatingWindow {

  private buttonWidth: number = 60;
  private buttonHeight: number = 40;

  private callback: (text: string) => void;
  private units: TextButton[];

  constructor() {
    super({ centerX: 0, centerY: 0, windowWidth: 0.4 });
    this.append(
      new Button({ id: 'addUnitButton', text: '+', textColor: HIGHLIGHT_COLOR }).on({
        select: () => this.promptUnitAdd()
      }),
      new TextInput({ id: 'input', keyboard: 'number' })
    )
    this.once({ resize: () => this.find(TextInput).first().focused = true });
    this.applyLayout();
    this.createUnitButtons();
  }

  private applyLayout() {
    this.apply({
      '.unitButton': { right: MARGIN, top: ['prev()', SMALL_MARGIN], width: this.buttonWidth, height: this.buttonHeight },
      '#addUnitButton': { right: MARGIN, top: ['prev()', SMALL_MARGIN], width: this.buttonWidth, height: this.buttonHeight },
      '#input': { centerY: 0, right: ['#addUnitButton', MARGIN], left: MARGIN },
    })
  }

  private createUnitButtons() {
    this.units = [];
    globalDataObject.dosageUnits.forEach(unit => {
      this.addUnit(unit);
    });
  }

  private promptUnitAdd() {
    new AddTextWindow('neue einheit').onComplete((text) => {
      globalDataObject.dosageUnits.push(text);
      storeData();
      this.addUnit(text)
    });
  }

  private addUnit(text: string) {
    let newUnit = new TextButton({ class: 'unitButton' });
    newUnit.text = text;
    newUnit.on({
      tap: () => this.onUnitSelected(text),
      longpress: ({ state }) => {
        if (state !== 'end') {
          this.promptDeleteElement(globalDataObject.dosageUnits, this.units, newUnit)
        }
      }
    });
    newUnit.insertBefore(this.find('#addUnitButton').first());
    this.units.push(newUnit);
    this.applyLayout();
    storeData();
  }

  private onUnitSelected(unit: string) {
    this.callback(this.find(TextInput).first().text + unit);
    setTimeout(() => this.dispose(), 20); // because crash idk
  }

  public onComplete(callback: (text: string) => void) {
    this.callback = callback;
    return this;
  }

  private promptDeleteElement(globalData: string[], widgets: TextButton[], element: TextButton) {
    new AlertDialog({
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
        storeData();
      }
    }).open();
  }

}

interface TextButtonProperties extends CompositeProperties {
  text?: string
  pad?: number
}

class TextToggleButton extends Composite {

  private textView: TextView;
  public group: TextToggleButton[];
  private _selected: boolean;

  constructor(properties: TextButtonProperties) {
    properties.cornerRadius = 3;
    properties.background = TEXT_BUTTON_BACKGROUND;
    properties.highlightOnTouch = true;
    let text = properties.text || '';
    super(omit(properties, 'text'));
    this.selected = false;
    this.group = [];
    let padding = 5;
    this.textView = new TextView({
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

  set text(value: string) {
    this.textView.text = value;
  }
}

class TextButton extends Composite {

  private textView: TextView;

  constructor(properties?: TextButtonProperties) {
    properties = properties || {};
    properties.cornerRadius = 3;
    properties.background = TEXT_BUTTON_BACKGROUND;
    properties.highlightOnTouch = true;
    let text = properties.text || '';
    super(omit(properties, 'text'));
    let padding = properties.pad || 5;
    this.textView = new TextView({
      left: padding, right: padding, top: padding, bottom: padding, alignment: 'center', text
    }).appendTo(this);
  }

  get text() {
    return this.textView.text;
  }

  set text(value: string) {
    this.textView.text = value;
  }
}
