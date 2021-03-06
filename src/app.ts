import { ui, Button, TextView, NavigationView, app, Action } from 'tabris';
import PatientPage from './PatientPage';
import PatientListPage from './PatientListPage';
import { PatientData, AbedlTable, AbedlChapter, Medication, Diagnosis } from "./PatientData";
import FloatingWindow from "./FloatingWindow";
import SyncPage from "./SyncPage";
import { abedlTexts } from "./ABEDLTexts";

const ABEDL_PATH = '../ressources/ABEDLTexts.json';
export let floatingWindowStack: FloatingWindow[] = [];
app.on({
  backNavigation: (event) => {
    if (floatingWindowStack.length > 0) {
      let topWindow = floatingWindowStack.find(window => window && !window.isDisposed());
      if (topWindow) {
        topWindow.dispose();
        event.preventDefault();
      }
    }
  }
});
export let globalDataObject: {
  nextMedId: number,
  nextDiagId: number,
  patients: PatientData[],
  medications: Medication[],
  diagnoses: Diagnosis[],
  abedlEntries: AbedlTable,
  dosageUnits: string[],
  dosageForms: string[]
};

export function storeData(newData?: any) {
  if (newData) {
    Object.keys(globalDataObject).forEach(key => {
      globalDataObject[key] = newData[key];
    })
  }
  localStorage.setItem('data', JSON.stringify(globalDataObject));
}

export function openPatientPage(index: number) {
  new PatientPage(globalDataObject.patients[index]).appendTo(navigationView);
}

export function createPatient(name: string, date: string) {
  let abedlTable: AbedlTable = createAbedlTable();
  globalDataObject.patients.push({
    name,
    date,
    abedlTable,
    diagnosisIds: [],
    medication: []
  });
  storeData();
}

export function createDiagnosis({ name, explanation }: { name: string, explanation: string }) {
  if (globalDataObject.diagnoses.find(med => med.name === name)) {
    console.error(`Diagnose "${name}" existiert bereits`);
  } else {
    let id = globalDataObject.nextDiagId++;
    let result: Diagnosis = { id, name, explanation };
    globalDataObject.diagnoses.push(result);
    storeData();
    return result;
  }
}

export function createMedication(
  {
    name,
    agent,
    availableDosages,
    form,
    usages,
    sideEffects,
    counterSigns
}: {
      name: string;
      agent: string;
      availableDosages: string[];
      form: string;
      usages: string[];
      sideEffects: string,
      counterSigns: string
    }) {
  let existingMed = globalDataObject.medications.find(med => med.name === name);
  if (existingMed) {
      existingMed.name = name;
      existingMed.agent = agent;
      existingMed.availableDosages = availableDosages;
      existingMed.form = form;
      existingMed.usages = usages;
      existingMed.sideEffects = sideEffects;
      existingMed.counterSigns = counterSigns;
      storeData();
      return existingMed;
  } else {
    let id = globalDataObject.nextMedId++;
    let result: Medication = {
      id,
      name,
      agent,
      availableDosages,
      form,
      usages,
      sideEffects,
      counterSigns
    }
    globalDataObject.medications.push(result);
    storeData();
    return result;
  }
}

export function getMedication(id: number) {
  let result = globalDataObject.medications.find(med => med.id === id);
  console.log('found medication: ' + result);
  return result;
}

export function getDiagnosis(id: number) {
  let result = globalDataObject.diagnoses.find(diag => diag.id === id);
  return result;
}



function createAbedlTable(): AbedlTable {
  let abedlTable: AbedlTable = [];
  for (let chapterIndex = 0; chapterIndex < abedlTexts.length; chapterIndex++) {
    let tableChapter: AbedlChapter = { subChapters: [], notes: [] };
    for (let subChapterIndex = 0; subChapterIndex < abedlTexts[chapterIndex].subChapters.length; subChapterIndex++) {
      tableChapter.subChapters.push({ problems: [], ressources: [], stuff: [] });
    }
    abedlTable.push(tableChapter);
  }
  console.log(JSON.stringify(abedlTable));
  return abedlTable;
}

export function modifyPatient(index: number, name: string, date: string) {
  globalDataObject.patients[index].name = name;
  globalDataObject.patients[index].date = date;
  storeData();
}

export function deletePatient(index: number) {
  globalDataObject.patients.splice(index);
  storeData();
}

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

let action: Action = new Action({
  title: 'daten übertragen'
}).on({
  select: () => {
    new SyncPage().appendTo(navigationView);
  }
}).appendTo(navigationView);

// createPatient('Ute Testbeispiel', '25.4.2014');
// createPatient('Manfred Foobar', '172.0.1337');

loadData()
loadMainPage();

function loadData() {
  console.log('loading Data');
  let storedData = localStorage.getItem('data');
  if (storedData) {
    let data = JSON.parse(storedData);
    data.patients.forEach((patient: PatientData) => patient.medication.forEach((perscription: any) => {
      if (typeof perscription.usage === 'string') {
        perscription.usage = [perscription.usage];
      }
    }));
    globalDataObject = data;

  } else {
    globalDataObject = initData();
  }
}

function loadMainPage() {
  new PatientListPage().appendTo(navigationView);
}

function initData() {
  return {
    nextDiagId: 0,
    nextMedId: 0,
    patients: [],
    medications: [],
    diagnoses: [],
    abedlEntries: createAbedlTable(),
    dosageForms: [],
    dosageUnits: []
  };
}
