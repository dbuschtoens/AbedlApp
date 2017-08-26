import { ui, Button, Composite, CollectionView, Tab, TextView, TextInput, ScrollView, Widget, TextViewProperties, TextInputProperties, device, CollectionViewProperties, AlertDialog } from 'tabris';
import { globalDataObject, storeData } from '../app';
import { PatientData, AbedlSectionIndex, AbedlTable, getEntries } from '../PatientData';
import AddAbedlEntryOverlay from '../AddAbedlEntryOverlay';
import { omit } from '../util'
import HeadingCell from "./Cells/HeadingCell";
import SectionHeadingCell from "./Cells/SectionHeadingCell";
import AbedlEntryCell from "./Cells/AbedlEntryCell";
import { LIST_SUBELEMENT_COLOR, LIGHT_GRAY_COLOR } from "../constants";
import { abedlTexts } from "../ABEDLTexts";


const CHAPTER_TITLE = 'chapterTitle';
const SUBCHAPTER_TITLE = 'subChapterTitle';
const HEADING = 'heading';
const CONTENT = 'content';
const CONTENT_HEADING = 'contentHeading';
const DIVIDER = 'divider';
const NOTES = 'notes';
const NOTE = 'notes';

const MARGIN = 10;
const SUB_MARGIN = 5;
const HIGHLIGHT_COLOR = '#FF9800';
const ADD_ICON = '+';

export interface AbedlCellProperties extends TextViewProperties {
  descriptor: CellDescriptor;
  text: string;
  buttonVisible?: boolean;
}

export interface CellDescriptor {
  abedlIndex: AbedlSectionIndex;
  headingType?: 'chapterTitle' | 'subChapterTitle' | 'notes' | undefined;
  type: 'heading' | 'contentHeading' | 'content' | 'divider';
  contentIndex?: number;
}

interface AbedlTableViewProperties extends CollectionViewProperties {
  patient: PatientData;
}

export default class AbedlTab extends Tab {

  private collectionView: CollectionView;
  private patient: PatientData;
  private cellDescriptors: CellDescriptor[];

  constructor(patient: PatientData) {
    super({ title: 'AbedlTab' });
    this.patient = patient;
    this.createCellDescriptors();
    this.collectionView = new CollectionView({
      layoutData: { left: 0, top: 0, bottom: 0, right: 0 },
      createCell: (type) => this.createCell(type),
      updateCell: (cell, cellIndex) => this.updateCell(cell, cellIndex),
      cellHeight: (index, type) => type === DIVIDER ? 6 : 'auto',
      itemCount: this.cellDescriptors.length,
      cellType: (cellIndex) => this.cellDescriptors[cellIndex].type
    }).appendTo(this);

    this.onAppear();
  }

  public onAppear() {
    ui.drawer.enabled = true;
    this.createDrawerContent();
  }

  public onDisappear() {
    ui.drawer.find().dispose();
    ui.drawer.enabled = false;
  }

  private createDrawerContent() {
    let drawerContent = new ScrollView({
      left: 0, right: 0, top: 0, bottom: 0
    }).appendTo(ui.drawer);
    for (let chapterIndex = 0; chapterIndex < abedlTexts.length; chapterIndex++) {
      let thisChapter = chapterIndex;
      new TextView({
        left: MARGIN, top: ['prev()', 2 * MARGIN], right: MARGIN,
        text: (thisChapter + 1) + '. ' + abedlTexts[thisChapter].shortName,
        font: '20px'
      }).on({
        tap: () => {
          this.collectionView.reveal(this.cellDescriptors.findIndex(desc =>
            desc.headingType === 'chapterTitle'
            && desc.abedlIndex.chapter === thisChapter
          ));
          ui.drawer.close();
        }
      }).appendTo(drawerContent);
    }
  }

  private createCellDescriptors() {
    this.cellDescriptors = [];
    for (let chapter = 0; chapter < abedlTexts.length; chapter++) {
      let chapterData = this.patient.abedlTable[chapter];
      this.cellDescriptors.push({
        abedlIndex: { chapter, subChapter: -1, type: 'problems' }, type: 'heading', headingType: 'chapterTitle'
      });
      for (let subChapter = 0; subChapter < chapterData.subChapters.length; subChapter++) {
        let subChapterData = chapterData.subChapters[subChapter];
        this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'problems' }, type: 'heading', headingType: 'subChapterTitle' });
        this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'problems' }, type: 'contentHeading' });
        let contentIndex;
        for (contentIndex = 0; contentIndex < subChapterData.problems.length; contentIndex++) {
          this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'problems' }, type: 'content', contentIndex });
          if (contentIndex < subChapterData.problems.length - 1) {
            this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'problems' }, type: 'divider' });
          }
        }
        this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'ressources' }, type: 'contentHeading' });
        for (contentIndex = 0; contentIndex < subChapterData.ressources.length; contentIndex++) {
          this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'ressources' }, type: 'content', contentIndex });
          if (contentIndex < subChapterData.ressources.length - 1) {
            this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'ressources' }, type: 'divider' });
          }
        }
        this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'stuff' }, type: 'contentHeading' });
        for (contentIndex = 0; contentIndex < subChapterData.stuff.length; contentIndex++) {
          this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'stuff' }, type: 'content', contentIndex });
          if (contentIndex < subChapterData.stuff.length - 1) {
            this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'stuff' }, type: 'divider' });
          }
        }
      }
      this.cellDescriptors.push({ abedlIndex: { chapter, subChapter: -1, type: 'notes' }, type: 'contentHeading' });
      for (let noteIndex = 0; noteIndex < this.patient.abedlTable[chapter].notes.length; noteIndex++) {
        this.cellDescriptors.push({ abedlIndex: { chapter, subChapter: -1, type: 'notes' }, type: 'content', contentIndex: noteIndex });
        if (noteIndex < this.patient.abedlTable[chapter].notes.length - 1) {
          this.cellDescriptors.push({ abedlIndex: { chapter, subChapter: -1, type: 'ressources' }, type: 'divider' });
        }
      }
    }
  }

  private createCell(type: string) {
    switch (type) {
      case HEADING:
        return new HeadingCell();
      case CONTENT_HEADING:
        return new SectionHeadingCell().onAddButton((section) => this.showAddContentOverlay(section));
      case CONTENT:
      case NOTE:
        return new AbedlEntryCell()
          .onSavePressed((section, index) => this.saveAbedlEntry(section, index))
          .onLongpress((section, index) => this.showContextDialog(section, index));
      case DIVIDER:
        return new Divider();
      default:
        console.error('Wrong');
        return new Composite();
    }
  }

  private updateCell(cell: Widget, index: number) {
    let descriptor = this.cellDescriptors[index];
    if (cell instanceof HeadingCell) {
      switch (descriptor.headingType) {
        case 'chapterTitle':
          cell.set({
            layoutData: { left: 0, right: 0, top: index === 0 ? 0 : 20 },
            text: this.getChapterText(descriptor),
            font: 'bold 28px'
          });
          break;
        case 'subChapterTitle':
          cell.set({
            layoutData: { left: 10, right: 0, top: 20 },
            text: this.getSubChapterText(descriptor),
            font: 'bold 18px'
          });
          break;
        default:
          break;
      }
    } else if (cell instanceof SectionHeadingCell) {
      cell.set({
        layoutData: { left: descriptor.abedlIndex.type === 'notes' ? 10 : 15, centerY: 0 },
        descriptor,
        text: descriptor.abedlIndex.type === 'notes' ? 'Notizen' : (descriptor.abedlIndex.type === 'problems' ? 'Probleme' : descriptor.abedlIndex.type === 'ressources' ? 'Ressourcen' : 'Maßnahmen'),
        font: 'bold 18px'
      });
    } else if (cell instanceof AbedlEntryCell) {
      let entry = getEntries(this.patient.abedlTable, descriptor.abedlIndex)[descriptor.contentIndex!];
      let inDatabase = (getEntries(globalDataObject.abedlEntries, descriptor.abedlIndex).indexOf(entry)) !== -1;
      cell.set({
        layoutData: { left: 20, right: 40 },
        descriptor,
        text: entry,
        textColor: inDatabase ? LIST_SUBELEMENT_COLOR : 'black',
        buttonVisible : !inDatabase,
        font: '14px'
      });
    }
  }

  private showAddContentOverlay(section: AbedlSectionIndex) {
    new AddAbedlEntryOverlay(getEntries(globalDataObject.abedlEntries, section))
      .onCreationComplete((entry) => this.addEntry(section, entry));
    storeData();
  }

  private showContextDialog(section: AbedlSectionIndex, index: number) {
    let entry = getEntries(this.patient.abedlTable, section)[index];
    let inDatabase = (getEntries(globalDataObject.abedlEntries, section).indexOf(entry)) !== -1;
    let buttons: any = {
      ok: 'Ja',
      cancel: 'Nein',
    };
    if (!inDatabase) buttons.cancel = 'in Datenbank';
    new AlertDialog({
      title: 'Abedl Eintrag Löschen?',
      message: entry,
      buttons
    }).on({
      closeOk: () => this.deleteAbedlEntry(section, index),
    }).open();
  }

  private saveAbedlEntry(section: AbedlSectionIndex, index: number) {
    getEntries(globalDataObject.abedlEntries, section).push(
      getEntries(this.patient.abedlTable, section)[index]
    );
    storeData();
    this.collectionView.refresh();
  }

  private deleteAbedlEntry(section: AbedlSectionIndex, index: number) {
    let entries = getEntries(this.patient.abedlTable, section);
    entries.splice(index, 1);
    storeData();
    let baseIndex = this.findCellBaseIndex(section);
    this.cellDescriptors.splice(baseIndex + 2 * index + ((index === 0) ? 1 : 0), entries.length === 0 ? 1 : 2);
    for (let i = 0; i < entries.length; i++) {
      let cellIndex = baseIndex + 2 * i + 1;
      this.cellDescriptors[cellIndex].contentIndex = i;
    }
    this.collectionView.refresh();
  }

  private addEntry(section: AbedlSectionIndex, entry: string) {
    let currentEntries = getEntries(this.patient.abedlTable, section);
    currentEntries.push(entry);
    storeData();
    let contentIndex = currentEntries.length - 1;
    let cellBaseIndex = this.findCellBaseIndex(section);
    let newDescriptor: CellDescriptor = {
      abedlIndex: section,
      contentIndex,
      type: CONTENT
    }
    let newDivider: CellDescriptor = {
      abedlIndex: section,
      type: DIVIDER
    }
    if (contentIndex === 0) {
      this.cellDescriptors.splice(cellBaseIndex + 1, 0, newDescriptor);
    } else {
      this.cellDescriptors.splice(cellBaseIndex + (2 * contentIndex), 0, newDivider, newDescriptor);
    }
    this.collectionView.refresh();
  }

  private findCellBaseIndex(section: AbedlSectionIndex) {
    return this.cellDescriptors.findIndex((descriptor) => {
      return descriptor.abedlIndex.chapter === section.chapter
        && descriptor.abedlIndex.subChapter === section.subChapter
        && descriptor.abedlIndex.type === section.type
        && descriptor.type == 'contentHeading'
    });
  }

  private getChapterText(descriptor: CellDescriptor) {
    return `${(descriptor.abedlIndex.chapter + 1)}.  ${abedlTexts[descriptor.abedlIndex.chapter].name}`;
  }

  private getSubChapterText(descriptor: CellDescriptor) {
    let subChapterTitle = abedlTexts[descriptor.abedlIndex.chapter].subChapters[descriptor.abedlIndex.subChapter];
    if (subChapterTitle === '') return '';
    if (descriptor.headingType === 'notes') return 'Notizen';
    return `${(descriptor.abedlIndex.chapter + 1)}.${(descriptor.abedlIndex.subChapter + 1)}.  ${subChapterTitle}`;
  }

}

class Divider extends Composite {
  constructor() {
    super();
    this.append(new Composite({ left: 20, right: 40, top: 2, bottom: 2, background: LIGHT_GRAY_COLOR }))
  }
}
