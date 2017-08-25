"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const AbedlTab_1 = require("./AbedlTab");
class PatientPage extends tabris_1.Page {
    constructor() {
        super({ title: "Bewohnername Hier" });
        this.createUI();
    }
    createUI() {
        this.tabFolder = new tabris_1.TabFolder({
            layoutData: { left: 0, right: 0, bottom: 0, top: 0 },
            tabBarLocation: "top",
            paging: true
        }).append(new AbedlTab_1.default(), new tabris_1.Tab({ title: "Medikamente" }), new tabris_1.Tab({ title: "Diagnosen" })).appendTo(this);
    }
}
exports.default = PatientPage;
