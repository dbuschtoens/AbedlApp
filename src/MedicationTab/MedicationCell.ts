import { Composite, TextView, CompositeProperties } from "tabris/tabris";
import { Perscription, PerscriptionTimes, Medication } from "../PatientData";
import { LIST_SUBELEMENT_COLOR, LIST_ELEMENT_COLOR, TEXT_BUTTON_BACKGROUND } from "../constants";
import { globalDataObject, getMedication } from "../app";

const MARGIN = 20;
const INNER_MARGIN = 3;
const PADDING = 6;

export default class MedicationCell extends Composite {

  private _index: number;
  public get index() {
    return this._index
  }

  constructor() {
    super({ highlightOnTouch: true });
    this.createUI();
    this.applyLayout();
  }

  public applyContent(perscription: Perscription, index: number) {
    this._index = index;
    let med = getMedication(perscription.medId);
    if (med) {
      this.apply({
        '#title': { text: med.name },
        '#dosage': { text: perscription.dosage },
        '#agent': { text: med.agent },
        '#times': { text: this.createTimeText(perscription.times) },
        '#usage': { text: perscription.usage }
      });
    } else {
      console.error('perscription has invalid medId');
    }
  }

  private createTimeText(time: PerscriptionTimes) {
    if (time.adLib) return 'nach Bedarf';
    else return time.morning + ' - ' + time.noon + ' - ' + time.evening + ' - ' + time.night;
  }

  private createUI() {
    this.append(
      new TextView({ id: 'title' }),
      new TextView({ id: 'dosage' }),
      new TextView({ id: 'times' }),
      new TextView({ id: 'agent' }),
      new Composite({ id: 'usageContainer' }).append(
        new TextView({ id: 'usage' })
      )
    );
  }

  private applyLayout() {
    this.apply({
      '#title': {
        layoutData: { left: MARGIN, top: MARGIN },
        font: 'bold 20px',
        textColor: LIST_ELEMENT_COLOR
      },
      '#dosage': {
        layoutData: { left: ['prev()', 10], baseline: 'prev()' },
        font: 'bold 20px',
        textColor: LIST_SUBELEMENT_COLOR
      },
      '#times': {
        layoutData: { baseline: 'prev()', right: 2 * MARGIN },
        font: '18px',
        textColor: LIST_ELEMENT_COLOR
      },
      '#agent': {
        layoutData: { left: MARGIN, top: ['prev()', INNER_MARGIN] },
        font: 'bold 18px',
        textColor: LIST_SUBELEMENT_COLOR
      },
      '#usageContainer': {
        layoutData: { left: ['prev()', MARGIN], top: ['#times', INNER_MARGIN], right: MARGIN },
        cornerRadius: 3, background: TEXT_BUTTON_BACKGROUND
      },
      '#usage': {
        left: PADDING, right: PADDING, top: PADDING, bottom: PADDING,
        font: '15px',
      }

    });
  }

}
