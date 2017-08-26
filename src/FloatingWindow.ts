import { Composite, CompositeProperties, ui, app, device } from 'tabris';
import { omit } from "./util";
import { floatingWindowStack } from "./app";

const BLUR_COLOR = 'rgba(120,120,120,0.3)';

interface FloatingWindowProperties extends CompositeProperties {
  windowWidth?: number,
  windowHeight?: number
}

export default class FloatingWindow extends Composite {

  private backgroundBlur: Composite;
  private windowWidth?: number;
  private windowHeight?: number;

  constructor(properties: FloatingWindowProperties) {
    properties = properties || {};
    properties.background = properties.background || 'white';
    properties.elevation = 1000;
    properties.cornerRadius = 5;
    if (properties.width || properties.height) console.error('cant apply width to floating window');
    super(omit(properties, 'windowWidth', 'windowHeight'));
    floatingWindowStack.unshift(this);
    this.windowWidth = properties.windowWidth;
    this.windowHeight = properties.windowHeight;
    this.backgroundBlur = new Composite({ left: 0, right: 0, top: 0, bottom: 0, background: BLUR_COLOR })
      .on('tap', () => {
        this.backgroundBlur.dispose();
        this.dispose();
      }).appendTo(ui.contentView);
    this.appendTo(this.backgroundBlur);
    this.applyScreenSize();
    device.on({
      orientationChanged: () => this.applyScreenSize()
    });
  }

  private applyScreenSize() {
    if (this.windowHeight) this.height = device.screenHeight * this.windowHeight;
    if (this.windowWidth) this.width = device.screenWidth * this.windowWidth;
  }

  public dispose() {
    console.log('disposing Window ' + this.constructor.name + ' ' + this.cid);
    this.backgroundBlur.dispose();
    super.dispose();
  }

}
