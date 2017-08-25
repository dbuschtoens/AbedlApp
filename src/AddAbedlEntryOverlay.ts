import { TextView, TextInput, Button, device, AlertDialog, CollectionView, CollectionViewProperties, Composite, TextViewProperties, Widget } from 'tabris';
import FloatingWindow from './FloatingWindow';
import { omit } from "./util";
import { FADED_HIGHLIGHT_COLOR, LIGHT_GRAY_COLOR, HIGHLIGHT_COLOR } from "./constants";

const MARGIN = 10;
const INNER_MARGIN = 5;
const SEND_ICON = '✔️'

export default class AddEntryOverlay extends FloatingWindow {

  protected callback: (text: string) => void;
  private suggestionSource: string[];
  private filteredSuggestions: string[];
  private collectionView: CollectionView;
  private textInput: TextInput;

  constructor(suggestionSource: string[]) {
    super({ windowWidth: 0.8, windowHeight: 0.8, centerX: 0, top: MARGIN });
    this.filteredSuggestions = this.suggestionSource = suggestionSource;
    this.append(
      this.textInput = new TextInput({
        left: MARGIN, right: 50, top: MARGIN,
        type: 'multiline',
        background: HIGHLIGHT_COLOR
      }).on({
        accept: () => this.onAccept(),
        textChanged: ({ value }) => this.filterSuggestions(value)
      }),
      new Button({
        top: MARGIN, right: MARGIN, left: 'prev()',
        text: SEND_ICON,
        textColor: HIGHLIGHT_COLOR,
        font: '17px',
        background: 'white'
      }).on({
        select: () => this.onAccept()
      }),
      this.collectionView = new CollectionView({
        layoutData: { left: MARGIN, right: MARGIN, top: [this.textInput, MARGIN], bottom: INNER_MARGIN },
        updateCell: (cell, index) => this.updateCell(cell, index),
        createCell: (type) => this.createCell(type),
        itemCount: 2 * this.filteredSuggestions.length - 1,
        cellHeight: (index, type) => type === 'divider' ? 2 : 'auto',
        cellType: (index) => index % 2 === 0 ? 'textCell' : 'divider'
      }).on({
        select: ({ index }) => this.onSelect(index)
      })
    );
    this.once({resize: () => this.textInput.focused = true});
  }

  private onSelect(index: number) {
    if (index % 2 === 0) {
      let suggestion = this.filteredSuggestions[Math.floor(index / 2)];
      this.textInput.text = suggestion;
      this.textInput.focused = true;
    }
  }

  public onCreationComplete(callback: (text: string) => void) {
    this.callback = callback;
  }

  private onAccept() {
    let text = this.find(TextInput).first().text;
    if (text) {
      this.callback(text);
      this.dispose();
    }
  }

  private filterSuggestions(text: string) {
    this.filteredSuggestions = this.suggestionSource.filter(entry => entry.toLowerCase().includes(text.toLowerCase()));
    this.collectionView.load(Math.max(0, 2 * this.filteredSuggestions.length - 1));
  }

  private createCell(type: string) {
    if (type === 'divider') {
      return new Divider();
    } else {
      return new TextCell().onLongpress((index) => this.onCellLongpress(index));
    }
  }

  private updateCell(cell: Widget, index: number) {
    if (cell instanceof TextCell) {
      cell.set({
        layoutData: { left: 0, right: MARGIN },
        text: this.filteredSuggestions[Math.floor(index / 2)],
        index: Math.floor(index / 2),
        font: '17px',
        highlightOnTouch: true,
      });
    }
  }

  private onCellLongpress(index: number) {
    new AlertDialog({
      title: 'Aus der Datenbank löschen?',
      message: this.filteredSuggestions[index],
      buttons: {
        ok: 'Ja',
        cancel: 'Nein'
      }
    }).on({
      closeOk: () => {
        this.deleteEntry(index);
      }
    }).open();
  }

  private deleteEntry(index: number) {
    let mainIndex = this.suggestionSource.findIndex(entry => entry === this.filteredSuggestions[index]);
    this.suggestionSource.splice(mainIndex, 1);
    this.filterSuggestions(this.textInput.text);
  }

}

interface TextCellProperties extends TextViewProperties {
  index: number
}

class TextCell extends Composite {

  private textView: TextView;
  private index: number;

  constructor() {
    super({ width: device.screenWidth });
    this.textView = new TextView().appendTo(this);
    this.on({
      longpress: ({ state }) => {
        if (state !== 'end') {
          this.callback(this.index);
        }
      }
    });
  }

  private callback: (index: number) => void;

  public set(arg1: string, value?: any): this;
  public set(arg1: TextCellProperties): this;
  public set(arg1: any, value?: any) {
    if (typeof arg1 === 'string') {
      this.textView.set(arg1, value);
    } else {
      this.index = arg1.index;
      if (arg1.highlightOnTouch) {
        this.highlightOnTouch = arg1.highlightOnTouch;
      }
      this.textView.set(omit(arg1, 'highlightOnTouch', 'index'));
    }
    return this;
  }

  public onLongpress(callback: (index: number) => void) {
    this.callback = callback;
    return this;
  }

}


class Divider extends Composite {
  constructor() {
    super();
    this.append(new Composite({ left: MARGIN, right: 80, background: FADED_HIGHLIGHT_COLOR }))
  }
}