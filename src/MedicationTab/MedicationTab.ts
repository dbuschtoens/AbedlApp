import { Tab, CollectionView, Widget, Composite, TextView, AlertDialog } from "tabris/tabris";
import { PatientData, Perscription } from "../PatientData";
import MedicationCell from "./MedicationCell";
import { FADED_HIGHLIGHT_COLOR, HIGHLIGHT_COLOR } from "../constants";
import AddPerscriptionOverlay from "./AddPerscriptionOverlay";
import { globalDataObject, storeData } from "../app";
import CreatePerscriptionOverlay from "./CreatePerscriptionOverlay";

const DIVIDER = 'divider';

interface CellDescriptor {
  type: ''
}

export default class MedicationTab extends Tab {

  private collectionView: CollectionView;
  private perscriptions: Perscription[];
  private cellDescriptors: CellDescriptor[];

  constructor(perscriptions: Perscription[]) {
    super({ title: 'Medikamente' });
    this.perscriptions = perscriptions;
    let itemCount = 2 * (this.perscriptions.length + 1) - 1;
    this.collectionView = new CollectionView({
      layoutData: { left: 0, top: 0, bottom: 0, right: 0 },
      createCell: (type) => this.createCell(type),
      updateCell: (cell, cellIndex) => this.updateCell(cell, cellIndex),
      itemCount,
      cellHeight: (index, type) => type === 'divider' ? 6 : 'auto',
      cellType: (index) => this.cellType(index)
    }).appendTo(this);

  }

  private cellType(index: number): string {
    return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'medCell' : 'divider')
  }

  private updateCell(cell: Widget, index: number) {
    if (cell instanceof MedicationCell) {
      let perscriptionIndex = Math.floor(index / 2);
      cell.applyContent(this.perscriptions[perscriptionIndex], perscriptionIndex)
    }
  }


  private createCell(type: string) {
    console.warn('Medication Tab Cell: ' + type);
    if (type === 'divider') {
      return new Divider();
    } else if (type === 'medCell') {
      return new MedicationCell().on({
        tap: ({ target }) => this.modifyPerscription(target.index),
        longpress: ({ target, state }) => {
          if (state !== 'end') {
            this.promptDeletePerscription(target.index)
          }
        }
      })
    } else {
      return new AddButtonCell().on({
        tap: () => this.showAddPerscriptionOverlay()
      });
    }
  }

  private modifyPerscription(index: number) {
    new CreatePerscriptionOverlay(this.perscriptions[index]).onAccept(result => {
      this.perscriptions[index] = result;
      storeData();
      let itemCount = 2 * (this.perscriptions.length + 1) - 1;
      this.collectionView.load(itemCount);
    });
  }

  private promptDeletePerscription(index: number) {
    new AlertDialog({
      title: 'Medikament entfernen?',
      message: globalDataObject.medications[this.perscriptions[index].medId].name + ' ' + this.perscriptions[index].dosage,
      buttons: { ok: 'Ja', cancel: 'Nein' }
    }).on({
      closeOk: () => {
        this.perscriptions.splice(index, 1);
        storeData();
        let itemCount = 2 * (this.perscriptions.length + 1) - 1;
        this.collectionView.load(itemCount);
      }
    }).open();
  }

  private showAddPerscriptionOverlay() {
    new AddPerscriptionOverlay().onAccept(perscription => {
      this.perscriptions.push(perscription);
      storeData();
      let itemCount = 2 * (this.perscriptions.length + 1) - 1;
      this.collectionView.load(itemCount);
    });
  }

}

class Divider extends Composite {
  constructor() {
    super();
    this.append(new Composite({ left: 20, right: 40, top: 2, bottom: 2, background: FADED_HIGHLIGHT_COLOR }))
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
