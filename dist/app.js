"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const PatientPage_1 = require("./PatientPage");
const PatientListPage_1 = require("./PatientListPage");
const SyncPage_1 = require("./SyncPage");
const ABEDLTexts_1 = require("./ABEDLTexts");
const ABEDL_PATH = '../ressources/ABEDLTexts.json';
exports.floatingWindowStack = [];
tabris_1.app.on({
    backNavigation: (event) => {
        if (exports.floatingWindowStack.length > 0) {
            let topWindow = exports.floatingWindowStack.find(window => window && !window.isDisposed());
            if (topWindow) {
                topWindow.dispose();
                event.preventDefault();
            }
        }
    }
});
function storeData(newData) {
    if (newData) {
        Object.keys(exports.globalDataObject).forEach(key => {
            exports.globalDataObject[key] = newData[key];
        });
    }
    localStorage.setItem('data', JSON.stringify(exports.globalDataObject));
}
exports.storeData = storeData;
function openPatientPage(index) {
    new PatientPage_1.default(exports.globalDataObject.patients[index]).appendTo(navigationView);
}
exports.openPatientPage = openPatientPage;
function createPatient(name, date) {
    let abedlTable = createAbedlTable();
    exports.globalDataObject.patients.push({
        name,
        date,
        abedlTable,
        diagnosisIds: [],
        medication: []
    });
    storeData();
}
exports.createPatient = createPatient;
function createDiagnosis({ name, explanation }) {
    if (exports.globalDataObject.diagnoses.find(med => med.name === name)) {
        console.error(`Diagnose "${name}" existiert bereits`);
    }
    else {
        let id = exports.globalDataObject.nextDiagId++;
        let result = { id, name, explanation };
        exports.globalDataObject.diagnoses.push(result);
        storeData();
        return result;
    }
}
exports.createDiagnosis = createDiagnosis;
function createMedication({ name, agent, availableDosages, form, usages, sideEffects, counterSigns }) {
    let existingMed = exports.globalDataObject.medications.find(med => med.name === name);
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
    }
    else {
        let id = exports.globalDataObject.nextMedId++;
        let result = {
            id,
            name,
            agent,
            availableDosages,
            form,
            usages,
            sideEffects,
            counterSigns
        };
        exports.globalDataObject.medications.push(result);
        storeData();
        return result;
    }
}
exports.createMedication = createMedication;
function getMedication(id) {
    let result = exports.globalDataObject.medications.find(med => med.id === id);
    console.log('found medication: ' + result);
    return result;
}
exports.getMedication = getMedication;
function getDiagnosis(id) {
    let result = exports.globalDataObject.diagnoses.find(diag => diag.id === id);
    return result;
}
exports.getDiagnosis = getDiagnosis;
function createAbedlTable() {
    let abedlTable = [];
    for (let chapterIndex = 0; chapterIndex < ABEDLTexts_1.abedlTexts.length; chapterIndex++) {
        let tableChapter = { subChapters: [], notes: [] };
        for (let subChapterIndex = 0; subChapterIndex < ABEDLTexts_1.abedlTexts[chapterIndex].subChapters.length; subChapterIndex++) {
            tableChapter.subChapters.push({ problems: [], ressources: [], stuff: [] });
        }
        abedlTable.push(tableChapter);
    }
    console.log(JSON.stringify(abedlTable));
    return abedlTable;
}
function modifyPatient(index, name, date) {
    exports.globalDataObject.patients[index].name = name;
    exports.globalDataObject.patients[index].date = date;
    storeData();
}
exports.modifyPatient = modifyPatient;
function deletePatient(index) {
    exports.globalDataObject.patients.splice(index);
    storeData();
}
exports.deletePatient = deletePatient;
let navigationView = new tabris_1.NavigationView({
    left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris_1.ui.contentView);
let action = new tabris_1.Action({
    title: 'daten übertragen'
}).on({
    select: () => {
        new SyncPage_1.default().appendTo(navigationView);
    }
}).appendTo(navigationView);
// createPatient('Ute Testbeispiel', '25.4.2014');
// createPatient('Manfred Foobar', '172.0.1337');
loadData();
loadMainPage();
function loadData() {
    console.log('loading Data');
    let storedData = localStorage.getItem('data');
    if (storedData) {
        let data = JSON.parse(storedData);
        data.patients.forEach((patient) => patient.medication.forEach((perscription) => {
            if (typeof perscription.usage === 'string') {
                perscription.usage = [perscription.usage];
            }
        }));
        exports.globalDataObject = data;
    }
    else {
        exports.globalDataObject = initData();
    }
}
function loadMainPage() {
    new PatientListPage_1.default().appendTo(navigationView);
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
