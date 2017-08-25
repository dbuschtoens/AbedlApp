"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const app_1 = require("../app");
const PatientData_1 = require("../PatientData");
const AddAbedlEntryOverlay_1 = require("../AddAbedlEntryOverlay");
const util_1 = require("../util");
const HeadingCell_1 = require("./Cells/HeadingCell");
const SectionHeadingCell_1 = require("./Cells/SectionHeadingCell");
const AbedlEntryCell_1 = require("./Cells/AbedlEntryCell");
const CHAPTER_TITLE = 'chapterTitle';
const SUBCHAPTER_TITLE = 'subChapterTitle';
const HEADING = 'heading';
const CONTENT = 'content';
const CONTENT_HEADING = 'contentHeading';
const ADD_WIDGET = 'addWidget';
const MARGIN = 10;
const SUB_MARGIN = 5;
const HIGHLIGHT_COLOR = '#FF9800';
const ADD_ICON = '+';
class AbedlTableView extends tabris_1.CollectionView {
    constructor(parameters) {
        parameters.createCell = (type) => this._createCell(type),
            parameters.updateCell = (cell, cellIndex) => this._updateCell(cell, cellIndex),
            parameters.cellHeight = 'auto',
            parameters.cellType = (cellIndex) => { console.log(this.cellDescriptors[cellIndex].type); return this.cellDescriptors[cellIndex].type; };
        super(util_1.omit(parameters, 'patient'));
        this.patient = parameters.patient;
        this.createCellDescriptors();
        this.itemCount = this.cellDescriptors.length;
        this.load(this.itemCount);
        console.log('tableCreated');
    }
    createCellDescriptors() {
        this.cellDescriptors = [];
        for (let chapter = 0; chapter < app_1.abedlTexts.length; chapter++) {
            let chapterData = this.patient.abedlTable[chapter];
            this.cellDescriptors.push({
                abedlIndex: { chapter, subChapter: -1, type: 'problems' }, type: 'heading', headingType: 'chapterTitle'
            });
            for (let subChapter = 0; subChapter < chapterData.length; subChapter++) {
                let subChapterData = chapterData[subChapter];
                this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'problems' }, type: 'heading', headingType: 'subChapterTitle' });
                this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'problems' }, type: 'contentHeading' });
                let contentIndex;
                for (contentIndex = 0; contentIndex < subChapterData.problems.length; contentIndex++) {
                    this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'problems' }, type: 'content', contentIndex });
                }
                this.cellDescriptors.push({ abedlIndex: { chapter, subChapter, type: 'ressources' }, type: 'contentHeading' });
                for (contentIndex = 0; contentIndex < subChapterData.ressources.length; contentIndex++) {
                    this.cellDescriptors.push({ abedlIndex: { chapter, subChapter: -1, type: 'ressources' }, type: 'content', contentIndex });
                }
            }
        }
    }
    _createCell(type) {
        console.warn(type);
        switch (type) {
            case HEADING:
                return new HeadingCell_1.default();
            case CONTENT_HEADING:
                return new SectionHeadingCell_1.default().onAddButton((section) => this.showAddContentOverlay(section));
            case CONTENT:
                return new AbedlEntryCell_1.default().onSaveButton((section, index) => this.saveAbedlEntry(section, index));
            case ADD_WIDGET:
                return new tabris_1.TextInput();
            default:
                return new tabris_1.Composite();
        }
    }
    _updateCell(cell, index) {
        let descriptor = this.cellDescriptors[index];
        if (cell instanceof HeadingCell_1.default) {
            switch (descriptor.headingType) {
                case 'chapterTitle':
                    cell.set({
                        layoutData: { left: 0, right: 0 },
                        text: this.getChapterText(descriptor),
                        font: 'bold 28px'
                    });
                    break;
                case 'subChapterTitle':
                    cell.set({
                        layoutData: { left: 10, right: 0 },
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
                layoutData: { left: 15, centerY: 0 },
                descriptor,
                text: PatientData_1.getEntries(this.patient.abedlTable, descriptor.abedlIndex)[descriptor.contentIndex || -1],
                font: 'bold 18px'
            });
        }
        else if (cell instanceof AbedlEntryCell_1.default) {
            cell.set({
                layoutData: { left: 20, right: 50 },
                descriptor,
                text: PatientData_1.getEntries(this.patient.abedlTable, descriptor.abedlIndex)[descriptor.contentIndex || -1],
                font: '14px'
            });
        }
    }
    showAddContentOverlay(section) {
        new AddAbedlEntryOverlay_1.default(PatientData_1.getEntries(app_1.globalDataObject.abedlEntries, section))
            .onCreationComplete((entry) => this.addEntry(section, entry));
        app_1.storeData();
    }
    saveAbedlEntry(section, index) {
        PatientData_1.getEntries(app_1.globalDataObject.abedlEntries, section).push(PatientData_1.getEntries(this.patient.abedlTable, section)[index]);
        app_1.storeData();
    }
    addEntry(section, entry) {
        let currentEntries = PatientData_1.getEntries(this.patient.abedlTable, section);
        currentEntries.push(entry);
        app_1.storeData();
        let offset = currentEntries.length;
        let cellBaseIndex = this.cellDescriptors.findIndex((descriptor) => {
            return descriptor.abedlIndex.chapter === section.chapter
                && descriptor.abedlIndex.subChapter === section.subChapter
                && descriptor.abedlIndex.type === section.type;
        });
        let newDescriptor = {
            abedlIndex: section,
            contentIndex: offset - 1,
            type: 'content'
        };
        this.cellDescriptors.splice(cellBaseIndex + offset, 0, newDescriptor);
    }
    getChapterText(descriptor) {
        return `${(descriptor.abedlIndex.chapter + 1)}.  ${app_1.abedlTexts[descriptor.abedlIndex.chapter].name}`;
    }
    getSubChapterText(descriptor) {
        return `${(descriptor.abedlIndex.chapter + 1)}.${(descriptor.abedlIndex.subChapter + 1)}.  ${app_1.abedlTexts[descriptor.abedlIndex.chapter].subChapters[descriptor.abedlIndex.subChapter]}`;
    }
}
exports.default = AbedlTableView;
