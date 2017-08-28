import { TextView, TextInput, Button, device, AlertDialog, CollectionView, CollectionViewProperties, Composite, TextViewProperties, Widget, CompositeProperties } from 'tabris';
import FloatingWindow from '../FloatingWindow';
import { omit } from "../util";
import { FADED_HIGHLIGHT_COLOR, LIGHT_GRAY_COLOR, HIGHLIGHT_COLOR, LIST_ELEMENT_COLOR, LIST_SUBELEMENT_COLOR } from "../constants";
import { Medication, Perscription, Diagnosis } from "../PatientData";
import { globalDataObject, storeData, getDiagnosis } from "../app";
import CreateDiagnosisOverlay from "./CreateDiagnosisOverlay";

const MARGIN = 20;
const SMALL_MARGIN = 10;
const SEND_ICON = '✔️'

export default class AddDiagnosisOverlay extends FloatingWindow {

  protected callback: (id: number) => void;
  private filteredSuggestions: Diagnosis[];
  private collectionView: CollectionView;
  private textInput: TextInput;

  constructor() {
    super({ windowWidth: 0.8, windowHeight: 0.8, centerX: 0, top: MARGIN });
    this.filteredSuggestions = globalDataObject.diagnoses.sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    let itemCount = 2 * (1 + this.filteredSuggestions.length) - 1;
    this.append(
      this.textInput = new TextInput({
        left: MARGIN, right: MARGIN, top: MARGIN,
        background: HIGHLIGHT_COLOR, message: 'Filter'
      }).on({
        textChanged: ({ value }) => this.filterSuggestions(value)
      }),
      this.collectionView = new CollectionView({
        layoutData: { left: MARGIN, right: 0, top: [this.textInput, MARGIN], bottom: SMALL_MARGIN },
        updateCell: (cell, index) => this.updateCell(cell, index),
        createCell: (type) => this.createCell(type),
        itemCount,
        cellHeight: (index, type) => type === 'divider' ? 6 : 'auto',
        cellType: (index) => this.cellType(index)
      }).on({
        select: ({ index }) => this.onSelect(index)
      })
    );
  }

  private cellType(index: number): string {
    return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'diagCell' : 'divider')
  }

  private onSelect(index: number) {
    if (index === this.collectionView.itemCount - 1) {
      new CreateDiagnosisOverlay().onAccept(() => {
        this.filteredSuggestions = globalDataObject.diagnoses;
        this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
      })
    } else if (index % 2 === 0) {
      let suggestion = this.filteredSuggestions[Math.floor(index / 2)];
      this.callback(suggestion.id);
      this.dispose();
    }
  }

  public onAccept(callback: (id: number) => void) {
    this.callback = callback;
  }

  private filterSuggestions(text: string) {
    this.filteredSuggestions = globalDataObject.diagnoses.filter(entry =>
      entry.name.toLowerCase().includes(text.toLowerCase())
    );
    this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
  }


  private updateCell(cell: Widget, index: number) {
    if (cell instanceof TextView) {
      let diagnosisIndex = Math.floor(index / 2);
      let diag = this.filteredSuggestions[diagnosisIndex];
      cell.text = diag.name;
      cell.id = diag.id.toString();
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
            this.promptModifyDiagnosis(target);
          }
        }
      })
    } else {
      return new AddButtonCell();
    }
  }

  private promptModifyDiagnosis(diagnosis: TextView) {
    new AlertDialog({
      title: 'Bearbeiten',
      message: diagnosis.text,
      buttons: {
        ok: 'abbrechen',
        cancel: 'bearbeiten',
        neutral: 'löschen'
      }
    }).on({
      closeCancel: () => this.modifyEntry(parseInt(diagnosis.id)),
      closeNeutral: () => this.deleteEntry(parseInt(diagnosis.id))
    }).open();
  }

  private deleteEntry(id: number) {
    let index = globalDataObject.diagnoses.findIndex(entry => entry.id === id);
    globalDataObject.diagnoses.splice(index, 1);
    this.filterSuggestions(this.textInput.text);
  }

  private modifyEntry(id: number) {
    new CreateDiagnosisOverlay(getDiagnosis(id)).onAccept(() => {
      storeData();
      this.collectionView.refresh();
    });
  }

}

class Divider extends Composite {
  constructor() {
    super();
    this.append(new Composite({ left: 0, right: 100, top: 2, bottom: 2, background: FADED_HIGHLIGHT_COLOR }))
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
