import { Tab, CollectionView, Widget, Composite, TextView, AlertDialog } from "tabris/tabris";
import { PatientData, Perscription, Diagnosis } from "../PatientData";
import { FADED_HIGHLIGHT_COLOR, HIGHLIGHT_COLOR, LIST_ELEMENT_COLOR, LIGHT_GRAY_COLOR } from "../constants";
import AddDiagnosisOverlay from "./AddDiagnosisOverlay";
import { globalDataObject, storeData, getDiagnosis } from "../app";
import CreateDiagnosisOverlay from "./CreateDiagnosisOverlay";

const DIVIDER = 'divider';

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
      layoutData: { left: 20, top: 20, bottom: 20, right: 20 },
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
    if (cell instanceof TextView) {
      let diagnosisIndex = Math.floor(index / 2);
      let id = this.diagnosisIds[diagnosisIndex];
      let diagnosis = getDiagnosis(id);
      if (diagnosis) {
        cell.text = diagnosis.name;
        cell.id = diagnosisIndex.toString();
      } else {
        setTimeout( () => this.deleteDiagId(diagnosisIndex), 20); // again, crashtime....
      }
    }
  }


  private createCell(type: string) {
    if (type === 'divider') {
      return new Divider();
    } else if (type === 'diagCell') {
      return new TextView({
        font: 'bold 20px', textColor: LIST_ELEMENT_COLOR
      }).on({
        // tap: ({ target }) => this.modifyPerscription(target.index),
        longpress: ({ target, state }) => {
          if (state !== 'end') {
            this.promptDeleteDiagnosis(target);
          }
        }
      })
    } else {
      return new AddButtonCell().on({
        tap: () => this.showAddDiagnosisOverlay()
      });
    }
  }

  private promptDeleteDiagnosis(diagnosis: TextView) {
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
