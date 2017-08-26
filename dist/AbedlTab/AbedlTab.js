"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const app_1 = require("../app");
const PatientData_1 = require("../PatientData");
const AddAbedlEntryOverlay_1 = require("../AddAbedlEntryOverlay");
const HeadingCell_1 = require("./Cells/HeadingCell");
const SectionHeadingCell_1 = require("./Cells/SectionHeadingCell");
const AbedlEntryCell_1 = require("./Cells/AbedlEntryCell");
const constants_1 = require("../constants");
const ABEDLTexts_1 = require("../ABEDLTexts");
const FloatingWindow_1 = require("../FloatingWindow");
const CHAPTER_TITLE = 'chapterTitle';
const SUBCHAPTER_TITLE = 'subChapterTitle';
const HEADING = 'heading';
const CONTENT = 'content';
const CONTENT_HEADING = 'contentHeading';
const DIVIDER = 'divider';
const NOTES = 'notes';
const NOTE = 'notes';
const SMALL_MARGIN = 10;
const MARGIN = 10;
const SUB_MARGIN = 5;
const HIGHLIGHT_COLOR = '#FF9800';
const ADD_ICON = '+';
const SEND_ICON = '✔️';
const DELETE_ICON = '❌';
class AbedlTab extends tabris_1.Tab {
    constructor(patient) {
        super({ title: 'AbedlTab' });
        this.patient = patient;
        this.createCellDescriptors();
        this.collectionView = new tabris_1.CollectionView({
            layoutData: { left: 0, top: 0, bottom: 0, right: 0 },
            createCell: (type) => this.createCell(type),
            updateCell: (cell, cellIndex) => this.updateCell(cell, cellIndex),
            cellHeight: (index, type) => type === DIVIDER ? 6 : 'auto',
            itemCount: this.cellDescriptors.length,
            cellType: (cellIndex) => this.cellDescriptors[cellIndex].type
        }).appendTo(this);
        this.onAppear();
    }
    onAppear() {
        tabris_1.ui.drawer.enabled = true;
        this.createDrawerContent();
    }
    onDisappear() {
        tabris_1.ui.drawer.find().dispose();
        tabris_1.ui.drawer.enabled = false;
    }
    createDrawerContent() {
        let drawerContent = new tabris_1.ScrollView({
            left: 0, right: 0, top: 0, bottom: 0
        }).appendTo(tabris_1.ui.drawer);
        for (let chapterIndex = 0; chapterIndex < ABEDLTexts_1.abedlTexts.length; chapterIndex++) {
            let thisChapter = chapterIndex;
            new tabris_1.TextView({
                left: MARGIN, top: ['prev()', 2 * MARGIN], right: MARGIN,
                text: (thisChapter + 1) + '. ' + ABEDLTexts_1.abedlTexts[thisChapter].shortName,
                font: '20px'
            }).on({
                tap: () => {
                    this.collectionView.reveal(this.cellDescriptors.findIndex(desc => desc.headingType === 'chapterTitle'
                        && desc.abedlIndex.chapter === thisChapter));
                    tabris_1.ui.drawer.close();
                }
            }).appendTo(drawerContent);
        }
    }
    createCellDescriptors() {
        this.cellDescriptors = [];
        for (let chapter = 0; chapter < ABEDLTexts_1.abedlTexts.length; chapter++) {
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
    createCell(type) {
        switch (type) {
            case HEADING:
                return new HeadingCell_1.default();
            case CONTENT_HEADING:
                return new SectionHeadingCell_1.default().onAddButton((section) => this.showAddContentOverlay(section));
            case CONTENT:
            case NOTE:
                return new AbedlEntryCell_1.default()
                    .onSavePressed((section, index) => this.saveAbedlEntry(section, index))
                    .onTapped((section, index) => this.modifyAbedlEntry(section, index));
            case DIVIDER:
                return new Divider();
            default:
                console.error('Wrong');
                return new tabris_1.Composite();
        }
    }
    updateCell(cell, index) {
        let descriptor = this.cellDescriptors[index];
        if (cell instanceof HeadingCell_1.default) {
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
        }
        else if (cell instanceof SectionHeadingCell_1.default) {
            cell.set({
                layoutData: { left: descriptor.abedlIndex.type === 'notes' ? 10 : 15, centerY: 0 },
                descriptor,
                text: descriptor.abedlIndex.type === 'notes' ? 'Notizen' : (descriptor.abedlIndex.type === 'problems' ? 'Probleme' : descriptor.abedlIndex.type === 'ressources' ? 'Ressourcen' : 'Maßnahmen'),
                font: 'bold 18px'
            });
        }
        else if (cell instanceof AbedlEntryCell_1.default) {
            let entry = PatientData_1.getEntries(this.patient.abedlTable, descriptor.abedlIndex)[descriptor.contentIndex];
            let inDatabase = (PatientData_1.getEntries(app_1.globalDataObject.abedlEntries, descriptor.abedlIndex).indexOf(entry)) !== -1;
            cell.set({
                layoutData: { left: 20, right: 40 },
                descriptor,
                text: entry,
                textColor: inDatabase ? constants_1.LIST_SUBELEMENT_COLOR : 'black',
                buttonVisible: !inDatabase,
                font: '14px'
            });
        }
    }
    showAddContentOverlay(section) {
        new AddAbedlEntryOverlay_1.default(PatientData_1.getEntries(app_1.globalDataObject.abedlEntries, section))
            .onCreationComplete((entry) => this.addEntry(section, entry));
        app_1.storeData();
    }
    modifyAbedlEntry(section, index) {
        let entry = PatientData_1.getEntries(this.patient.abedlTable, section)[index];
        let inDatabase = (PatientData_1.getEntries(app_1.globalDataObject.abedlEntries, section).indexOf(entry)) !== -1;
        new AddTextWindow(entry).onComplete(newString => {
            let entries = PatientData_1.getEntries(this.patient.abedlTable, section);
            entries[index] = newString;
            app_1.storeData();
            this.collectionView.refresh();
        }).onDelete(() => {
            this.deleteAbedlEntry(section, index);
        });
        // closeOk: () => this.deleteAbedlEntry(section, index),
    }
    saveAbedlEntry(section, index) {
        PatientData_1.getEntries(app_1.globalDataObject.abedlEntries, section).push(PatientData_1.getEntries(this.patient.abedlTable, section)[index]);
        app_1.storeData();
        this.collectionView.refresh();
    }
    deleteAbedlEntry(section, index) {
        let entries = PatientData_1.getEntries(this.patient.abedlTable, section);
        entries.splice(index, 1);
        app_1.storeData();
        let baseIndex = this.findCellBaseIndex(section);
        this.cellDescriptors.splice(baseIndex + 2 * index + ((index === 0) ? 1 : 0), entries.length === 0 ? 1 : 2);
        for (let i = 0; i < entries.length; i++) {
            let cellIndex = baseIndex + 2 * i + 1;
            this.cellDescriptors[cellIndex].contentIndex = i;
        }
        this.collectionView.refresh();
    }
    addEntry(section, entry) {
        let currentEntries = PatientData_1.getEntries(this.patient.abedlTable, section);
        currentEntries.push(entry);
        app_1.storeData();
        let contentIndex = currentEntries.length - 1;
        let cellBaseIndex = this.findCellBaseIndex(section);
        let newDescriptor = {
            abedlIndex: section,
            contentIndex,
            type: CONTENT
        };
        let newDivider = {
            abedlIndex: section,
            type: DIVIDER
        };
        if (contentIndex === 0) {
            this.cellDescriptors.splice(cellBaseIndex + 1, 0, newDescriptor);
        }
        else {
            this.cellDescriptors.splice(cellBaseIndex + (2 * contentIndex), 0, newDivider, newDescriptor);
        }
        this.collectionView.refresh();
    }
    findCellBaseIndex(section) {
        return this.cellDescriptors.findIndex((descriptor) => {
            return descriptor.abedlIndex.chapter === section.chapter
                && descriptor.abedlIndex.subChapter === section.subChapter
                && descriptor.abedlIndex.type === section.type
                && descriptor.type == 'contentHeading';
        });
    }
    getChapterText(descriptor) {
        return `${(descriptor.abedlIndex.chapter + 1)}.  ${ABEDLTexts_1.abedlTexts[descriptor.abedlIndex.chapter].name}`;
    }
    getSubChapterText(descriptor) {
        let subChapterTitle = ABEDLTexts_1.abedlTexts[descriptor.abedlIndex.chapter].subChapters[descriptor.abedlIndex.subChapter];
        if (subChapterTitle === '')
            return '';
        if (descriptor.headingType === 'notes')
            return 'Notizen';
        return `${(descriptor.abedlIndex.chapter + 1)}.${(descriptor.abedlIndex.subChapter + 1)}.  ${subChapterTitle}`;
    }
}
exports.default = AbedlTab;
class Divider extends tabris_1.Composite {
    constructor() {
        super();
        this.append(new tabris_1.Composite({ left: 20, right: 40, top: 2, bottom: 2, background: constants_1.LIGHT_GRAY_COLOR }));
    }
}
class AddTextWindow extends FloatingWindow_1.default {
    constructor(text) {
        super({ centerX: 0, centerY: 0, windowWidth: 0.9 });
        this.append(new tabris_1.Button({
            right: ['prev()', SMALL_MARGIN], top: SMALL_MARGIN, bottom: SMALL_MARGIN, width: 50,
            text: SEND_ICON, textColor: HIGHLIGHT_COLOR
        }).on({
            select: () => this.onSelect()
        }), new tabris_1.Button({
            right: ['prev()', 0], top: SMALL_MARGIN, bottom: SMALL_MARGIN, width: 50,
            text: DELETE_ICON, textColor: HIGHLIGHT_COLOR
        }).on({
            select: () => this._onDelete()
        }), new tabris_1.TextInput({
            left: SMALL_MARGIN, top: SMALL_MARGIN, right: ['prev()', SMALL_MARGIN], type: 'multiline', text
        }).on({
            accept: () => this.onSelect()
        }));
        this.once({ resize: () => this.find(tabris_1.TextInput).first().focused = true });
    }
    onComplete(callback) {
        this.callback = callback;
        return this;
    }
    onDelete(callback) {
        this.delCallback = callback;
    }
    onSelect() {
        this.callback(this.find(tabris_1.TextInput).first().text);
        this.dispose();
    }
    _onDelete() {
        this.delCallback();
        this.dispose();
    }
}
