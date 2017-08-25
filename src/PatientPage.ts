import {Page, TabFolder, Tab} from 'tabris';
import {globalDataObject} from './app';
import {PatientData} from './PatientData';
import AbedlTab from "./AbedlTab/AbedlTab";
import MedicationTab from "./MedicationTab/MedicationTab";
import DiagnosesTab from "./DiagnosesTab/DiagnosesTab";

export default class PatientPage extends Page {

  private tabFolder: TabFolder;
  private patient: PatientData;
  private abedlTab: AbedlTab;

  constructor(patient: PatientData) {
    super({title: patient.name});
    this.patient = patient;
    this.createUI();
  }

  private createUI() {
    this.tabFolder = new TabFolder({
      layoutData: {left: 0, right: 0, bottom: 0, top: 0},
      tabBarLocation: 'top',
      paging: true
    }).append(
      this.abedlTab = new AbedlTab(this.patient),
      new MedicationTab(this.patient.medication),
      new DiagnosesTab(this.patient.diagnosisIds)
    ).on({
      selectionChanged: ({value}) => {
        if (value instanceof AbedlTab) this.abedlTab.onAppear();
        else this.abedlTab.onDisappear();
      }
    }).appendTo(this);
    this.on({
      disappear: () => this.abedlTab.onDisappear()
    });
  }

}
