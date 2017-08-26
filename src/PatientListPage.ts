import { ui, CollectionView, Composite, Page, TextView, Widget, device, Button } from 'tabris';
import { openPatientPage, globalDataObject, storeData } from './app';
import { CreatePatientOverlay, ModifyPatientOverlay } from './PatientOverlays';
import { HIGHLIGHT_COLOR, LIST_ELEMENT_COLOR, LIST_SUBELEMENT_COLOR, LIST_ELEMENT_FONT, LIST_SUBELEMENT_FONT } from "./constants";

const MARGIN = 20;
const SMALL_MARGIN = 10;

export default class PatientListPage extends Page {

  private collectionView: CollectionView;

  constructor() {
    super({ title: 'Bewohner' });
    this.collectionView = new CollectionView({
      left: 0, top: 0, right: 0, bottom: 0,
      createCell: (type) => this.createCell(type),
      updateCell: (cell, index) => this.updateCell(cell, index),
      cellHeight: 'auto',
      itemCount: globalDataObject.patients.length + 1,
      cellType: (index) => index < globalDataObject.patients.length ? 'patient' : 'addButton'
    }).on({
      select: ({ index }) => this.onSelect(index)
    }).appendTo(this);
  }

  private onSelect(index: number) {
    if (index < globalDataObject.patients.length) {
      openPatientPage(index);
    } else {
      new CreatePatientOverlay().onCreationComplete(() => this.updateCells());
    }
  }

  private onLongpress(index: number) {
    if (index < globalDataObject.patients.length) {
      new ModifyPatientOverlay(index).onCreationComplete(() => this.updateCells());
    }
  }

  private updateCells() {
    this.collectionView.load(globalDataObject.patients.length + 1);
  }

  private createCell(type: string) {
    return (type === 'patient') ? new PatientCell().onModify(index => this.onLongpress(index)) : new AddButtonCell();
  }

  private updateCell(cell: Widget, index: number) {
    if (cell instanceof PatientCell) {
      cell.update(index);
    }
  }

}

class PatientCell extends Composite {

  callback: (index: number) => void;

  public index: number;

  constructor() {
    super({ highlightOnTouch: true });
    this.append(
      new TextView({ left: MARGIN, top: SMALL_MARGIN, font: LIST_ELEMENT_FONT, textColor: LIST_ELEMENT_COLOR, id: 'name' }),
      new TextView({ left: MARGIN, top: ['prev()', 0], font: LIST_SUBELEMENT_FONT, textColor: LIST_SUBELEMENT_COLOR, id: 'date' })
    );
    if (device.platform === 'windows') {
      new Button({ right: MARGIN, centerY: 0, text: 'Bearbeiten' }).on({
        select: event => this.callback(this.index)
      }).appendTo(this);
    } else {
      this.on({
        longpress: (event) => {
          if (event.state !== 'end')
            return this.callback(this.index)
        }
      })
    }
  }

  public update(index: number) {
    let patient = globalDataObject.patients[index];
    this.index = index;
    this.find(TextView).filter('#name').first().text = patient.name;
    this.find(TextView).filter('#date').first().text = patient.date;
  }

  public onModify(callback: (index: number) => void) {
    this.callback = callback;
    return this;
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
