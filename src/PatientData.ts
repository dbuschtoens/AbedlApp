export type AbedlSubChapter = { problems: string[], ressources: string[], stuff: string[] };
export type AbedlChapter = { subChapters: Array<AbedlSubChapter>, notes: string[] };
export type AbedlTable = Array<AbedlChapter>;

export interface AbedlSectionIndex {
  chapter: number,
  subChapter: number,
  type: 'ressources' | 'problems' | 'notes' | 'stuff',
}

export function getEntries(table: AbedlTable, index: AbedlSectionIndex) {
  if (index.type === 'notes') {
    return table[index.chapter].notes;
  } else {
    return table[index.chapter].subChapters[index.subChapter][index.type];
  }
}

export interface PatientData {
  name: string;
  date: string;
  abedlTable: AbedlTable;
  medication: Perscription[];
  diagnosisIds: number[];
}

export interface PerscriptionTimes {
    morning: number,
    noon: number,
    evening: number,
    night: number,
    adLib: boolean
}

export interface Perscription {
  medId: number,
  dosage: string,
  usage: string[],
  times: PerscriptionTimes
}

export interface Medication {
  id: number;
  name: string;
  agent: string;
  availableDosages: string[];
  form: string;
  usages: string[];
  sideEffects: string,
  counterSigns: string
}

export interface Diagnosis {
  id: number;
  name: string;
  explanation: string;
}
