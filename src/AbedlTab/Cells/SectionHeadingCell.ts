
import { Composite, TextView } from 'tabris';
import { AbedlSectionIndex } from "../../PatientData";
import { omit } from "../../util";
import { AbedlCellProperties, CellDescriptor } from "../AbedlTab";

const MARGIN = 10;
const SUB_MARGIN = 5;
const HIGHLIGHT_COLOR = '#FF9800';
const ADD_ICON = '+';

export default class SectionHeadingCell extends Composite {

  private textView: TextView;
  private addButton: TextView;
  private section: AbedlSectionIndex;

  private callback: (section: AbedlSectionIndex) => void;

  constructor() {
    super();
    this.textView = new TextView().appendTo(this);
    this.addButton = new TextView({
      layoutData: { centerY: 0, left: [this.textView, SUB_MARGIN] },
      text: `  ${ADD_ICON}  `, textColor: HIGHLIGHT_COLOR, font: 'bold 24px', highlightOnTouch: true, alignment: 'left'
    }).on({
      tap: () => this.callback(this.section)
    }).appendTo(this);
  }

  public set(arg1: string, value?: any): this;
  public set(arg1: AbedlCellProperties): this;
  public set(arg1: any, value?: any) {
    if (typeof arg1 === 'string') {
      this.textView.set(arg1, value);
    } else {
      let descriptor: CellDescriptor = arg1.descriptor;
      this.section = descriptor.abedlIndex;
      this.textView.set(omit(arg1, "descriptor"));
    }
    return this;
  }

  public onAddButton(callback: (section: AbedlSectionIndex) => void) {
    this.callback = callback;
    return this;
  }

}
