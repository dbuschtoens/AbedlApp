import {Composite, TextView, TextViewProperties, device} from 'tabris';

export default class HeadingCell extends Composite {

  private textView: TextView;

  constructor() {
    super({ width: device.screenWidth });
    this.textView = new TextView({ left: 0, right: 0 }).appendTo(this);
  }

  public set(arg1: string, value?: any): this;
  public set(arg1: TextViewProperties): this;
  public set(arg1: any, value?: any) {
    if (typeof arg1 === 'string') {
      this.textView.set(arg1, value);
    } else {
      this.textView.set(arg1);
    }
    return this;
  }

}