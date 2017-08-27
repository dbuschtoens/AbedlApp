import FloatingWindow from "../FloatingWindow";
import { Medication, Perscription, PerscriptionTimes } from "../PatientData";
import { Composite, CompositeProperties, TextView, TextInput, ToggleButton, Picker, Button, ScrollView, device } from "tabris/tabris";
import { LIST_ELEMENT_COLOR, LIST_SUBELEMENT_COLOR, HIGHLIGHT_COLOR, LIST_ELEMENT_FONT, LIST_SUBELEMENT_FONT, FADED_HIGHLIGHT_COLOR, LIGHT_GRAY_COLOR } from "../constants";
import { globalDataObject, storeData, getMedication } from "../app";
import { omit } from "../util";
import CreateMedicationOverlay from "./CreateMedicationOverlay";

const BIG_MARGIN = 20;
const MARGIN = 12;
const SMALL_MARGIN = 10;
const LABEL_FONT = 'bold 18px';
const ADD_FONT = 'bold 28px';
const TEXT_BUTTON_BACKGROUND = '#f7f7f7'
const SELECTED_BUTTON_BACKGROUND = '#ffbb56'

export default class CreatePerscriptionOverlay extends FloatingWindow {

  private callback: (perscription: Perscription) => void;

  private scrollView: ScrollView;
  private medication: Medication;
  private dosagesContainer: Composite;
  private dosages: TextToggleButton[];
  private usages: TextToggleButton[];

  constructor(medOrPerscription: Medication | Perscription) {
    console.log('constructor argument: ' + JSON.stringify(medOrPerscription));
    super({ windowWidth: 0.9, windowHeight: 0.7, centerX: 0, top: 2 * BIG_MARGIN });
    if (medOrPerscription.hasOwnProperty('medId')) {
      this.medication = getMedication((<Perscription>medOrPerscription).medId)!;
    } else {
      this.medication = <Medication>medOrPerscription;
    }
    console.log('medication: ' + this.medication.name);
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
    if (this.dosages.length === 1) this.dosages[0].selected = true;
    if (this.usages.length === 1) this.usages[0].selected = true;
    if (medOrPerscription.hasOwnProperty('medIndex')) {
      this.applyPerscriptionData(<Perscription>medOrPerscription);
    }
  }

  public onAccept(callback: (perscription: Perscription) => void) {
    this.callback = callback;
  }

  private applyPerscriptionData(data: Perscription) {
    let dosage = this.dosages.find(d => d.text === data.dosage);
    let usages = this.usages.filter(u => data.usage.some(usage => u.text === usage));
    if (dosage) dosage.selected = true;
    usages.forEach(usage => usage.selected = true);
    this.find(TimesDisplay).first().applyTimes(data.times);
  }

  private _onAccept() {
    if (this.verify()) {
      let medId = globalDataObject.medications.indexOf(this.medication);
      let usage = this.usages.filter(u => u.selected).map(u => u.text);
      let dosage = this.dosages.find(d => d.selected)!.text;

      let times = this.find(TimesDisplay).first().getTimes();
      this.callback({ medId, dosage, usage, times });
      this.dispose();
    }
  }

  private verify() {
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
    if (
      times.evening === 0 &&
      times.morning === 0 &&
      times.night === 0 &&
      times.noon === 0 &&
      times.adLib === false
    ) {
      console.error('Keine Einnahmezeiten gewählt!');
      return false;
    }
    return true;
  }

  private createUI() {
    this.createDosageButtons();
    this.createUsageButtons();
    this.scrollView.append(
      new Composite({ id: 'medContainer' }).append(
        new TextView({ id: 'titleLabel' }),
        new TextView({ id: 'agentLabel' }),
        new Button({ id: 'modifyMedButton' })
      ),
      new Composite({id: 'dosageAnker'}),
      ...this.dosages,
      new TimesDisplay({ id: 'times' }),
      new TextView({ id: 'usageLable' }),
      ...this.usages,
    );
  }

  private applyContent() {
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
    }
  }

  private applyStyle() {
    this.apply({
      '#titleLabel': { font: 'bold 24px', textColor: LIST_ELEMENT_COLOR },
      '#agentLabel': { font: 'bold 20px', textColor: LIST_SUBELEMENT_COLOR },
      '.dosageButton': {},
      '#modifyMedButton': { font: LIST_SUBELEMENT_FONT, background: LIGHT_GRAY_COLOR },
      '#times': {},
      '#usageLable': { font: LABEL_FONT },
      '.usageButton': {},
      '#addUsageButton': { font: ADD_FONT, textColor: HIGHLIGHT_COLOR }
    });
  }

  private applyLayout() {
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

  private registerEvents() {
    this.find('#modifyMedButton').first().on({ select: () => this.modifyMedication() });
  }

  private modifyMedication() {
    new CreateMedicationOverlay(this.medication).onAccept(() => {
      storeData();
      this.scrollView.find().dispose();
      this.createUI();
      this.applyContent();
      this.applyStyle();
      this.applyLayout();
      this.registerEvents();
    });
  }

  private createDosageButtons() {
    this.dosages = [];
    for (let dosage in this.medication.availableDosages) {
      this.dosages.push(new TextToggleButton({ class: 'dosageButton' }));
    }
  }

  private createUsageButtons() {
    this.usages = [];
    for (let usage in this.medication.usages) {
      let button = new TextToggleButton({ class: 'usageButton' });
      this.usages.push(button);
    }
  }

}

const SEND_ICON = '✔️';

class AddTextWindow extends FloatingWindow {

  private callback: (text: string) => void;

  constructor() {
    super({ centerX: 0, centerY: 0, windowWidth: 0.9 });
    this.append(
      new TextInput({
        left: SMALL_MARGIN, right: 70, top: SMALL_MARGIN, type: 'multiline'
      }).on({
        accept: () => this.onSelect()
      }),
      new Button({
        left: ['prev()', SMALL_MARGIN], top: SMALL_MARGIN, bottom: SMALL_MARGIN, right: SMALL_MARGIN,
        text: SEND_ICON,
      }).on({
        select: () => this.onSelect()
      })
    )
    this.once({ resize: () => this.find(TextInput).first().focused = true });
  }

  public onComplete(callback: (text: string) => void) {
    this.callback = callback;
    return this;
  }

  private onSelect() {
    this.callback(this.find(TextInput).first().text);
    this.dispose();
  }


}

interface TextButtonProperties extends CompositeProperties {
  text?: string
  pad?: number
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

class TimesDisplay extends Composite {

  constructor(properties?: CompositeProperties) {
    properties = properties;
    super(properties);
    this.append(
      new TextButton({ id: 'morning', text: '0' }),
      new TextView({ text: '-' }),
      new TextButton({ id: 'noon', text: '0' }),
      new TextView({ text: '-' }),
      new TextButton({ id: 'evening', text: '0' }),
      new TextView({ text: '-' }),
      new TextButton({ id: 'night', text: '0' }),
      new TextToggleButton({ id: 'adLib', text: 'n.Bed.' }),
    );
    this.apply({
      'TextButton': { left: ['prev()', SMALL_MARGIN], top: 5, bottom: 5, pad: 5 },
      'TextView': { left: ['prev()', SMALL_MARGIN], top: 5, bottom: 5 },
      'TextToggleButton': { left: ['prev()', MARGIN], top: 5, bottom: 5, right: 5 }
    })
    this.find(TextButton).forEach(button => button.on({
      tap: ({ target }) => this.increment(target),
      longpress: ({ target, state }) => { if (state !== 'end') this.showInput(target); }
    }));
  }

  private increment(target: TextButton) {
    target.text = '' + (parseInt(target.text) + 1);
  }

  private showInput(target: TextButton) {
    let padding = 5;
    let inputWindow = new FloatingWindow({ windowWidth: 0.5, centerX: 0, top: 50 }).append(
      new TextInput({
        left: padding, bottom: padding, top: padding, right: 80,
        keyboard: 'number', text: '0'
      }).on({
        focus: ({ target }) => target.text = '',
        accept: () => {
          target.text = inputWindow.find(TextInput).first().text;
          inputWindow.dispose();
        }
      }),
      new Button({
        left: ['prev()', padding], top: padding, bottom: padding, right: padding,
        text: SEND_ICON, textColor: HIGHLIGHT_COLOR
      }).on({
        select: () => {
          target.text = inputWindow.find(TextInput).first().text;
          inputWindow.dispose();
        }
      })
    )
  }

  public applyTimes(times: PerscriptionTimes) {
    this.apply({
      '#morning': { text: times.morning },
      '#noon': { text: times.noon },
      '#evening': { text: times.evening },
      '#night': { text: times.night },
    });
    this.find(TextToggleButton).first().selected = times.adLib;
  }

  public getTimes(): PerscriptionTimes {
    return {
      adLib: this.find(TextToggleButton).first().selected,
      evening: parseInt(this.find(TextButton).filter('#evening').first().text),
      morning: parseInt(this.find(TextButton).filter('#morning').first().text),
      night: parseInt(this.find(TextButton).filter('#night').first().text),
      noon: parseInt(this.find(TextButton).filter('#noon').first().text),
    }
  }

}
