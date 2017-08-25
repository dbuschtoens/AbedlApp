import { TextView, TextInput, Button, device, AlertDialog, CollectionView, CollectionViewProperties, Composite, TextViewProperties, Widget, CompositeProperties } from 'tabris';
import FloatingWindow from '../FloatingWindow';
import { omit } from "../util";
import { FADED_HIGHLIGHT_COLOR, LIGHT_GRAY_COLOR, HIGHLIGHT_COLOR, LIST_ELEMENT_COLOR, LIST_SUBELEMENT_COLOR } from "../constants";
import { Medication, Perscription } from "../PatientData";
import { globalDataObject, storeData } from "../app";
import CreatePerscriptionOverlay from "./CreatePerscriptionOverlay";
import CreateMedicationOverlay from "./CreateMedicationOverlay";

const MARGIN = 20;
const SMALL_MARGIN = 10;
const SEND_ICON = '✔️'

export default class AddPerscriptionOverlay extends FloatingWindow {

  protected callback: (perscription: Perscription) => void;
  private filteredSuggestions: Medication[];
  private collectionView: CollectionView;
  private textInput: TextInput;

  constructor() {
    super({ windowWidth: 0.8, windowHeight: 0.8, centerX: 0, top: MARGIN });
    this.filteredSuggestions = globalDataObject.medications;
    let itemCount = 2 * (1 + this.filteredSuggestions.length) - 1;
    this.append(
      this.textInput = new TextInput({
        left: MARGIN, right: MARGIN, top: MARGIN,
        background: HIGHLIGHT_COLOR, message: 'Filter'
      }).on({
        textChanged: ({ value }) => this.filterSuggestions(value)
      }),
      this.collectionView = new CollectionView({
        layoutData: { left: 0, right: 0, top: [this.textInput, MARGIN], bottom: SMALL_MARGIN },
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
    return index === this.collectionView.itemCount - 1 ? 'addButton' : (index % 2 === 0 ? 'medCell' : 'divider')
  }

  private onSelect(index: number) {
    if (index === this.collectionView.itemCount - 1) {
      new CreateMedicationOverlay().onAccept((medication) => {
        this.textInput.text = '';
        this.filteredSuggestions = globalDataObject.medications;
        this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
      });
    } else if (index % 2 === 0) {
      let suggestion = this.filteredSuggestions[Math.floor(index / 2)];
      new CreatePerscriptionOverlay(suggestion).onAccept(perscription => {
        this.callback(perscription);
        this.dispose();
      });
    }
  }

  public onAccept(callback: (perscription: Perscription) => void) {
    this.callback = callback;
  }

  private filterSuggestions(text: string) {
    this.filteredSuggestions = globalDataObject.medications.filter(entry =>
      entry.name.toLowerCase().includes(text.toLowerCase()) || entry.agent.toLowerCase().includes(text.toLowerCase())
    );
    console.log('filtered suggestions: ' + this.filteredSuggestions.length);
    this.collectionView.load(2 * (1 + this.filteredSuggestions.length) - 1);
    console.log('CVLength: ' + this.collectionView.itemCount);
  }

  private createCell(type: string) {
    if (type === 'divider') {
      return new Divider();
    } else if (type === 'medCell') {
      return new MedCell().on({
        longpress: ({ target, state }) => {
          if (state !== 'end') {
            this.onCellLongpress(target.medication)
          }
        }
      });
    } else {
      return new AddButtonCell();
    }
  }

  private updateCell(cell: Widget, index: number) {
    if (cell instanceof MedCell) {
      cell.update(this.filteredSuggestions[Math.floor(index / 2)]);
    }
  }

  private onCellLongpress(medication: Medication) {
    new AlertDialog({
      title: 'Bearbeiten',
      message: medication.name,
      buttons: {
        ok: 'abbrechen',
        cancel: 'bearbeiten',
        neutral: 'löschen'
      }
    }).on({
      closeCancel: () => this.modifyEntry(medication),
      closeNeutral: () => this.deleteEntry(medication)
    }).open();
  }

  private deleteEntry(medication: Medication) {
    let index = globalDataObject.medications.findIndex(entry => entry.name === medication.name);
    globalDataObject.medications.splice(index, 1);
    this.filterSuggestions(this.textInput.text);
  }

  private modifyEntry(medication: Medication) {
    new CreateMedicationOverlay(medication).onAccept(() => {
      storeData();
      this.collectionView.refresh();
    });
  }

}

class MedCell extends Composite {

  public medication: Medication;

  constructor() {
    super({ highlightOnTouch: true });
    this.append(
      new TextView({ left: SMALL_MARGIN, top: 0, font: 'bold 20px', textColor: LIST_ELEMENT_COLOR, id: 'name' }),
      new TextView({ left: SMALL_MARGIN, top: ['prev()', 0], font: 'bold 17 px', textColor: LIST_SUBELEMENT_COLOR, id: 'agent' })
    );
  }

  public update(medication: Medication) {
    this.medication = medication;
    this.find(TextView).filter('#name').first().text = medication.name;
    this.find(TextView).filter('#agent').first().text = medication.agent;
  }
}

class Divider extends Composite {
  constructor() {
    super();
    this.append(new Composite({ left: SMALL_MARGIN, right: 100, top: 2, bottom: 2, background: FADED_HIGHLIGHT_COLOR }))
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
