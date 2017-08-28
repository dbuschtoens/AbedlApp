import FloatingWindow from "../FloatingWindow";
import { Medication, Perscription, PerscriptionTimes, Diagnosis } from "../PatientData";
import { Composite, CompositeProperties, TextView, TextInput, ToggleButton, Picker, Button, ScrollView, device, AlertDialog } from "tabris/tabris";
import { LIST_ELEMENT_COLOR, LIST_SUBELEMENT_COLOR, HIGHLIGHT_COLOR, TEXT_BUTTON_BACKGROUND } from "../constants";
import { globalDataObject, storeData, createDiagnosis } from "../app";
import { omit } from "../util";

const BIG_MARGIN = 20;
const MARGIN = 10;
const SMALL_MARGIN = 10;
const LABEL_FONT = 'bold 18px';
const ADD_FONT = 'bold 28px';
const SELECTED_BUTTON_BACKGROUND = '#ffbb56'
const SEND_ICON = '✔️'


export default class CreateDiagnosisOverlay extends FloatingWindow {

  private callback: (id: number) => void;
  private diagnosis?: Diagnosis;

  constructor(diagnosis?: Diagnosis) {
    super({centerX: 0, centerY: 0, windowWidth: 0.9});
    this.diagnosis = diagnosis;
    this.createUI();
    this.applyLayout();
  }

  public onAccept(callback: (id: number) => void) {
    this.callback = callback;
  }

  private createUI() {
    this.append(
      new TextInput({id: 'nameInput', message: 'Diagnose'}),
      new TextInput({id: 'explanationInput', type: 'multiline', message: 'Erklärung'}),
      new Button({text: SEND_ICON, textColor: HIGHLIGHT_COLOR, font: 'bold 28px'}).on({select: () => {
        let name = this.find(TextInput).filter('#nameInput').first().text;
        let explanation = this.find(TextInput).filter('#explanationInput').first().text;
        if (name !== '') {
          if (this.diagnosis) {
            this.diagnosis.name = name;
            this.diagnosis.explanation = explanation;
          }
          let diag = this.diagnosis || createDiagnosis({name, explanation});
          if (diag) {
            this.callback(diag.id);
            this.dispose();
          }
        }
      }})
    );
    if (this.diagnosis) {
      this.find(TextInput).filter('#nameInput').first().text = this.diagnosis.name;
      this.find(TextInput).filter('#explanationInput').first().text = this.diagnosis.explanation;
    }
  }

  private applyLayout() {
    this.apply({
      '#nameInput': {left: MARGIN, top: MARGIN, right: MARGIN},
      '#explanationInput': {left: MARGIN, top: ['prev()', MARGIN], right: MARGIN},
      'Button': {top: ['prev()', MARGIN], right: MARGIN}
    })
  }


}
