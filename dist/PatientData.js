"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getEntries(table, index) {
    if (index.type === 'notes') {
        return table[index.chapter].notes;
    }
    else {
        return table[index.chapter].subChapters[index.subChapter][index.type];
    }
}
exports.getEntries = getEntries;
