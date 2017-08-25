"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const AbedlTab_1 = require("./AbedlTab/AbedlTab");
const MedicationTab_1 = require("./MedicationTab/MedicationTab");
const DiagnosesTab_1 = require("./DiagnosesTab/DiagnosesTab");
class PatientPage extends tabris_1.Page {
    constructor(patient) {
        super({ title: patient.name });
        this.patient = patient;
        this.createUI();
    }
    createUI() {
        this.tabFolder = new tabris_1.TabFolder({
            layoutData: { left: 0, right: 0, bottom: 0, top: 0 },
            tabBarLocation: 'top',
            paging: true
        }).append(this.abedlTab = new AbedlTab_1.default(this.patient), new MedicationTab_1.default(this.patient.medication), new DiagnosesTab_1.default(this.patient.diagnosisIds)).on({
            selectionChanged: ({ value }) => {
                if (value instanceof AbedlTab_1.default)
                    this.abedlTab.onAppear();
                else
                    this.abedlTab.onDisappear();
            }
        }).appendTo(this);
        this.on({
            disappear: () => this.abedlTab.onDisappear()
        });
    }
}
exports.default = PatientPage;
