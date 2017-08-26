import { TextView, TextInput, Button, device, AlertDialog } from 'tabris';
import FloatingWindow from './FloatingWindow';
import { createPatient, modifyPatient, deletePatient, globalDataObject } from './app';

const MARGIN = 20;
const INNER_MARGIN = 10;

class PatientOverlay extends FloatingWindow {

  protected callback: () => void;

  constructor(name = '', date = '') {
    super({ windowWidth: 0.8, centerX: 0, centerY: 0 });
    this.append(
      new TextView({
        left: MARGIN, top: MARGIN,
        text: 'Name:'
      }),
      new TextInput({
        left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()', text: name,
        id: 'nameInput'
      }).on({
        accept: () => {
          this.find(TextInput).filter('#dateInput').first().focused = true;
        }
      }),
      new TextView({
        left: MARGIN, top: ['prev()', INNER_MARGIN],
        text: 'Geburtsdatum:'
      }),
      new TextInput({
        left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()', text: date, keyboard: 'numbersAndPunctuation',
        id: 'dateInput'
      }).on({
        accept: () => {
          this.onAccept();
        }
      })
    );
  }

  public onCreationComplete(callback: () => void) {
    this.callback = callback;
  }

  protected onAccept() { };

}

export class CreatePatientOverlay extends PatientOverlay {

  constructor() {
    super();
    this.append(
      new Button({
        right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
        text: 'Erstellen'
      }).on({
        select: () => this.onAccept()
      })
    );
    this.apply({
      TextView: { font: 'bold 18px' }
    });
  }

  protected onAccept() {
    createPatient(
      this.find(TextInput).filter('#nameInput').first().text,
      this.find(TextInput).filter('#dateInput').first().text
    );
    this.callback();
    this.dispose();
  }

}

export class ModifyPatientOverlay extends PatientOverlay {
  index: number;

  constructor(index: number) {
    let patient = globalDataObject.patients[index];
    super(patient.name, patient.date);
    this.index = index;
    this.append(
      new Button({
        right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
        text: 'Ändern'
      }).on({
        select: () => this.onAccept()
      }),
      new Button({
        left: MARGIN, bottom: MARGIN,
        text: 'Löschen'
      }).on({
        select: () => {
          new AlertDialog({
            title: `Alle daten für ${patient.name} löschen?`,
            buttons: {
              cancel: 'nein',
              ok: 'ja'
            }
          }).on({
            closeOk: () => {
              deletePatient(index);
              this.callback();
              this.dispose();
            }
          }).open();
        }
      })
    );
    this.apply({
      TextView: { font: 'bold 18px' }
    });
  }

  protected onAccept() {
    modifyPatient(
      this.index,
      this.find(TextInput).filter('#nameInput').first().text,
      this.find(TextInput).filter('#dateInput').first().text
    );
    this.callback();
    this.dispose();
  }

}
