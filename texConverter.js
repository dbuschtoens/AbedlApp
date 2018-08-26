const fs = require('fs');
const snippets = require('./texSnippets.json');
const abedlData = require('./receivedFile.json');

function getMed(id) {
  for (let med of abedlData.medications) {
    if (med.id == id) return med;
  }
  throw new Error('med with id ' + id + ' not found');
}

function getDiagnosis(id) {
  for (let diag of abedlData.diagnoses) {
    if (diag.id == id) return diag;
  }
  throw new Error('diagnosis with id ' + id + ' not found');
}

function makeTimesString(times) {
  let result = [times.morning, times.noon, times.evening, times.night].join('-');
  if (times.adLib) result += ', nach Bedarf'
  return result;
}

for (let patientIndex = 0; patientIndex < abedlData.patients.length; patientIndex++) {
  let patient = abedlData.patients[patientIndex];
  const outFile = patient.name + '.tex';
  let result = [];
  result.push(snippets.header);
  result.push('\\title{' + patient.name + '}');
  result.push(snippets.titleToSection1)
  result.push('Name der Bewohnerin/des Bewohners: &' + patient.name + ' \\\\');
  result.push('Kurs: & 69&');
  result.push('Geb. Datum: & ' + patient.date + '\\\\');
  result.push('\\end{tabular}');
  result.push('');

  for (let chapterIndex = 0; chapterIndex < patient.abedlTable.length; chapterIndex++) {
    let chapter = patient.abedlTable[chapterIndex];
    let abedlSection = snippets.abedlSections[chapterIndex]
    result.push(snippets.tableHeader);
    for (let subChapterIndex = 0; subChapterIndex < chapter.subChapters.length; subChapterIndex++) {
      let subChapter = chapter.subChapters[subChapterIndex];
      let columnOne = "  &";
      let subsectionName = abedlSection.subsectionNames[subChapterIndex];
      if (subChapterIndex == 0) columnOne = abedlSection.name
      result.push(columnOne);
      result.push(subsectionName)
      for (let problemIndex = 0; problemIndex < subChapter.problems.length; problemIndex++) {
        let problem = subChapter.problems[problemIndex];
        result.push('  - ' + problem + ' + \\newline');
      }
      result.push('&');
      for (let ressourceIndex = 0; ressourceIndex < subChapter.ressources.length; ressourceIndex++) {
        let ressource = subChapter.ressources[ressourceIndex];
        result.push('  - ' + ressource + ' + \\newline');
      }
      result.push('\\Tstrut\\\\');
      result.push('\\hline\n');
    }
    result.push('\\end{longtable}');
    if (chapter.notes.length > 0) {
      result.push('\\begin{itemize}');
      for (let noteIndex = 0; noteIndex < chapter.notes.length; noteIndex++) {
        let note = chapter.notes[noteIndex];
        let line = '  \\item ' + note;
        if (noteIndex < chapter.notes.length - 1) line += "  \\newline";
        result.push(line);
      }
      result.push('\\end{itemize}');
    }
  }
  result.push('\\newpage');
  result.push('\n%------------------------------------------\n');
  if (patient.medication.length > 0) {

    result.push('\\section{Medikamente}');
    result.push('\\begin{description}');

    for (let perscription of patient.medication) {
      // console.log(JSON.stringify(perscription));
      let med = getMed(perscription.medId);

      result.push('\\item[' + med.name + '] \\ \\\\');
      result.push('\\begin{description}');
      result.push('\\item[Wirkstoff] ' + med.agent);
      result.push('\\item[Einnahme] ' + makeTimesString(perscription.times));
      result.push('\\item[Dosis] ' + perscription.dosage);
      result.push('\\item[Darreichungsform] ' + med.form);
      result.push('\\item[Anwendung] ' + perscription.usage.join(', '));
      result.push('\\item[Nebenwirkungen] ' + med.sideEffects);
      result.push('\\item[Gegenanzeichen] ' + med.counterSigns);
      result.push('\\end{description}');
    }

    result.push('\\end{description}');
    result.push('\\newpage');
    result.push('\n%------------------------------------------\n');
  }
  if (patient.diagnosisIds.length > 0) {
    result.push('\\section{Diagnosen}');
    result.push('\\begin{description}');
    for (let diagId of patient.diagnosisIds) {
      let diagnosis = getDiagnosis(diagId);
      result.push('\\item[' + diagnosis.name + '] ' + diagnosis.explanation);
    }
    result.push('\\end{description}');
  }
  result.push('\n%------------------------------------------\n');
  result.push('\\end{document}');
  fs.writeFileSync(outFile, result.join('\n'));
}