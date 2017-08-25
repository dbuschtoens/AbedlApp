"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const AbedlTableView_1 = require("./AbedlTableView/AbedlTableView");
class AbedlTab extends tabris_1.Tab {
    constructor(patient) {
        super({ title: 'AbedlTab' });
        this.patient = patient;
        new AbedlTableView_1.default({
            layoutData: { left: 0, top: 0, bottom: 0, right: 0 },
            patient
        }).appendTo(this);
        // this.createChapter(0);
        // this.applyLayout();
        // this.onAppear();
    }
}
exports.default = AbedlTab;
