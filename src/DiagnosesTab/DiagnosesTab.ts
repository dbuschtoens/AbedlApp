import { Tab, CollectionView, Widget, Composite, TextView, AlertDialog } from "tabris/tabris";
import { PatientData, Perscription, Diagnosis } from "../PatientData";
import { FADED_HIGHLIGHT_COLOR, HIGHLIGHT_COLOR, LIST_ELEMENT_COLOR, LIGHT_GRAY_COLOR } from "../constants";
import AddDiagnosisOverlay from "./AddDiagnosisOverlay";
import { globalDataObject, storeData, getDiagnosis } from "../app";
import CreateDiagnosisOverlay from "./CreateDiagnosisOverlay";

const DIVIDER = 'divider';
const UP = '🔼';
const DOWN = '🔽';
const TOP = '⏫';
const BOTTOM = '⏬';

interface CellDescriptor {
  type: ''
}

export default class DiagnosesTab extends Tab {

  private collectionView: CollectionView;
  private diagnosisIds: number[];
  private cellDescriptors: CellDescriptor[];

  constructor(diagnoses: number[]) {
    super({ title: 'Diagnosen' });
    this.diagnosisIds = diagnoses || [];
    let itemCount = 2 * (this.diagnosisIds.length + 1) - 1;
    this.collectionView = new CollectionView({
      layoutData: { left: 0, top: 20, bottom: 20, right: 0 },
      createCell: (type) => this.createCell(type),
      updateCell: (cell, cellIndex) => this.updateCell(cell, cellIndex),
      itemCount,
      cellHeight: (index, type) => type === 'divider' ? 10 : 'auto',
      cellType: (index) => this.cellType(index)
    }).appendTo(this);

  }

  private cellType(index: number): string {
    return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'diagCell' : 'divider')
  }

  private updateCell(cell: Widget, index: number) {
    if (cell instanceof DiagCell) {
      let diagnosisIndex = Math.floor(index / 2);
      let id = this.diagnosisIds[diagnosisIndex];
      let diagnosis = getDiagnosis(id);
      if (diagnosis) {
        cell.text = diagnosis.name;
        cell.id = diagnosisIndex.toString();
      } else {
        setTimeout(() => this.deleteDiagId(diagnosisIndex), 20); // again, crashtime....
      }
    }
  }


  private createCell(type: string) {
    if (type === 'divider') {
      return new Divider();
    } else if (type === 'diagCell') {
      let result = new DiagCell().on({
        // tap: ({ target }) => this.modifyPerscription(target.index),
        longpress: ({ target, state }) => {
          if (state !== 'end') {
            this.promptDeleteDiagnosis(target);
          }
        }
      }).onMove(dir => this.moveDiagnosis(result, dir));
      return result;
    } else {
      return new AddButtonCell().on({
        tap: () => this.showAddDiagnosisOverlay()
      });
    }
  }

  private moveDiagnosis(diagCell: DiagCell, dir: 'up' | 'down' | 'top' | 'bottom') {
    let swapDiags = (a: number, b: number) => {
      let temp = this.diagnosisIds[b];
      this.diagnosisIds[b] = this.diagnosisIds[a];
      this.diagnosisIds[a] = temp;
    }
    let diagIndex = parseInt(diagCell.id);
    switch (dir) {
      case 'up':
        if (diagIndex > 0) swapDiags(diagIndex, diagIndex - 1);
        break;
      case 'down':
        if (diagIndex < this.diagnosisIds.length - 1) swapDiags(diagIndex, diagIndex + 1);
        break;
      case 'top':
        for (let i = diagIndex; i > 0; i--) {
          swapDiags(i, i - 1);
        }
        break;
      case 'bottom':
        for (let i = diagIndex; i < this.diagnosisIds.length - 1; i++) {
          swapDiags(i, i - 1);
        }
        break;
    }
      this.collectionView.refresh();

  }

  private promptDeleteDiagnosis(diagnosis: DiagCell) {
    new AlertDialog({
      title: 'Diagnose entfernen?',
      message: diagnosis.text,
      buttons: { ok: 'Ja', cancel: 'Nein' }
    }).on({
      closeOk: () => this.deleteDiagId(parseInt(diagnosis.id))
    }).open();
  }

  private deleteDiagId(index: number) {
    this.diagnosisIds.splice(index, 1);
    storeData();
    let itemCount = 2 * (this.diagnosisIds.length + 1) - 1;
    this.collectionView.load(itemCount);
  }

  private showAddDiagnosisOverlay() {
    new AddDiagnosisOverlay().onAccept(id => {
      this.diagnosisIds.push(id);
      storeData();
      let itemCount = 2 * (this.diagnosisIds.length + 1) - 1;
      this.collectionView.load(itemCount);
    });
  }

}

const BUTTON_WIDTH = 30;
const BUTTON_MARGIN = 10;
const BUTTON_TOP_MARGIN = 2;
const BUTTON_FONT = '18px';
const BUTTON_BACKGROUND = '#99c0ff';

class DiagCell extends Composite {

  private diagText: TextView;
  private upButton: TextView;
  private downButton: TextView;
  private topButton: TextView;
  private bottomButton: TextView;

  private callback: (dir: 'up' | 'down' | 'top' | 'bottom') => void;

  constructor() {
    super({ highlightOnTouch: true });
    this.append(
      this.diagText = new TextView({
        left: 20, right: 20, top: 5, font: 'bold 20px', textColor: LIST_ELEMENT_COLOR
      }),
      this.topButton = new TextView({
        highlightOnTouch: true,
        left: BUTTON_MARGIN, top: [this.diagText, BUTTON_TOP_MARGIN], text: TOP, font: BUTTON_FONT,
        background: LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
      }).on({ tap: () => this.callback('top') }),
      this.upButton = new TextView({
        highlightOnTouch: true,
        left: ['prev()', BUTTON_MARGIN], top: [this.diagText, BUTTON_TOP_MARGIN], text: UP, font: BUTTON_FONT,
        background: LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
      }).on({ tap: () => this.callback('up') }),
      this.downButton = new TextView({
        highlightOnTouch: true,
        left: ['prev()', BUTTON_MARGIN], top: [this.diagText, BUTTON_TOP_MARGIN], text: DOWN, font: BUTTON_FONT,
        background: LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
      }).on({ tap: () => this.callback('down') }),
      this.bottomButton = new TextView({
        highlightOnTouch: true,
        left: ['prev()', BUTTON_MARGIN], top: [this.diagText, BUTTON_TOP_MARGIN], text: BOTTOM, font: BUTTON_FONT,
        background: LIGHT_GRAY_COLOR, textColor: 'red', width: BUTTON_WIDTH, height: BUTTON_WIDTH, alignment: 'center'
      }).on({ tap: () => this.callback('bottom') }),
      // new Composite({ top: 'prev()', left: 0, right: 0, height: 5 }) // spacer
    )
  }

  public onMove(callback: (dir: 'up' | 'down' | 'top' | 'bottom') => void) {
    this.callback = callback;
    return this;
  }

  get text() {
    return this.diagText.text;
  }

  set text(val) {
    this.diagText.text = val;
  }

}

class Divider extends Composite {
  constructor() {
    super();
    this.append(new Composite({ left: 0, right: 40, top: 4, bottom: 4, background: LIGHT_GRAY_COLOR }))
  }
}

class AddButtonCell extends Composite {

  constructor() {
    super({ highlightOnTouch: true });
    this.append(
      new TextView({ centerX: 0, centerY: 0, text: '+', font: 'bold 30px', textColor: HIGHLIGHT_COLOR })
    );
  }

}
