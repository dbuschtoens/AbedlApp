import { Composite, TextView, device } from 'tabris';
import { AbedlSectionIndex, getEntries } from "../../PatientData";
import { AbedlCellProperties, CellDescriptor } from "../AbedlTab";
import { globalDataObject } from "../../app";
import { omit } from "../../util";

const SAVE_ICON = '💾';
const SUB_MARGIN = 5;

export default class AbedlEntryCell extends Composite {

  private textView: TextView;
  private contentIndex: number;
  private section: AbedlSectionIndex;
  private callback: (section: AbedlSectionIndex, index: number) => void;

  constructor() {
    super({ highlightOnTouch: true });
    this.textView = new TextView().appendTo(this);
    if (device.platform === 'windows') {

      this.on({
        tap: () => {
          this.callback(this.section, this.contentIndex);
        }
      });

    } else {

      this.on({
        longpress: ({ state }) => {
          if (state !== 'end') {
            this.callback(this.section, this.contentIndex);
          }
        }
      });
    }
    // this.saveButton = new TextView({
    //   layoutData: { centerY: 0, left: [this.textView, SUB_MARGIN], right: 0 },
    //   text: SAVE_ICON, font: '20px', highlightOnTouch: true, alignment: 'left'
    // }).on({
    //   tap: () => {
    //     this.saveCallback(this.section, this.contentIndex);
    //     this.saveButton.visible = false;
    //   }
    // }).appendTo(this);
  }

  public set(arg1: string, value?: any): this;
  public set(arg1: AbedlCellProperties): this;
  public set(arg1: any, value?: any) {
    if (typeof arg1 === 'string') {
      this.textView.set(arg1, value);
    } else {
      let descriptor: CellDescriptor = arg1.descriptor;
      this.section = descriptor.abedlIndex;
      this.contentIndex = descriptor.contentIndex || 0;
      this.textView.set(omit(arg1, 'descriptor'));
    }
    return this;
  }

  public onLongpress(callback: (section: AbedlSectionIndex, index: number) => void) {
    this.callback = callback;
    return this;
  }

}
