import {TextView, TextInput, Button, device, AlertDialog} from 'tabris';
import FloatingWindow from './FloatingWindow';
import {createPatient, modifyPatient, deletePatient, globalDataObject} from './app';

const MARGIN = 20;
const INNER_MARGIN = 10;

class PatientOverlay extends FloatingWindow {

  protected callback: () => void;

  constructor(name = '', date = '') {
    super({windowWidth: 0.8, centerX: 0, centerY: 0});
    this.append(
      new TextView({
        left: MARGIN, top: MARGIN,
        text: 'Name:'
      }),
      new TextInput({
        left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()', text: name,
        id: 'nameInput'
      }),
      new TextView({
        left: MARGIN, top: ['prev()', INNER_MARGIN],
        text: 'Geburtsdatum:'
      }),
      new TextInput({
        left: ['prev()', INNER_MARGIN], right: MARGIN, baseline: 'prev()', text: date, keyboard: 'numbersAndPunctuation',
        id: 'dateInput'
      })
    );
  }

  public onCreationComplete(callback: () => void) {
    this.callback = callback;
  }

}

export class CreatePatientOverlay extends PatientOverlay {

  constructor() {
    super();
    this.append(
      new Button({
        right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
        text: 'Erstellen'
      }).on({
        select: () => {
          createPatient(
            this.find(TextInput).filter('#nameInput').first().text,
            this.find(TextInput).filter('#dateInput').first().text
          );
          this.callback();
          this.dispose();
        }
      })
    );
    this.apply({
      TextView: {font: 'bold 18px'}
    });
  }

}

export class ModifyPatientOverlay extends PatientOverlay {

  constructor(index: number) {
    let patient = globalDataObject.patients[index];
    super(patient.name, patient.date);
    this.append(
      new Button({
        right: MARGIN, top: ['prev()', MARGIN], bottom: MARGIN,
        text: 'Ändern'
      }).on({
        select: () => {
          modifyPatient(
            index,
            this.find(TextInput).filter('#nameInput').first().text,
            this.find(TextInput).filter('#dateInput').first().text
          );
          this.callback();
          this.dispose();
        }
      }),
      new Button({
        left: MARGIN, baseline: 'prev()', bottom: MARGIN,
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
      TextView: {font: 'bold 18px'}
    });
  }

}
