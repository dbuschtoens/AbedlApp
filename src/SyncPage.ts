import { Page, Composite, TextInput, Button, device, ScrollView, TextView, fs } from "tabris/tabris";
import { globalDataObject, storeData } from "./app";

const DOWNLOAD_ICON = '🔻';
const UPLOAD_ICON = '🔺';

interface Packet {
  command: string;
  data: any;
}

export default class SyncPage extends Page {

  private url: String;
  private chatTextView: TextView;
  private inputContainer: Composite;

  constructor() {
    super();
    this.createUI();
  }

  private uploadData(url: String) {
    let file = fs.filesDir + '/AbedlData.json';
    fs.writeFile(file, JSON.stringify(globalDataObject));
    console.info("Wrote file " + file);
    this.appendToChat("Gespeichert in Datei " + file);
    console.log(" uploading file ")
    let xhr = new window.XMLHttpRequest();
    xhr.onreadystatechange = () => {
      console.log(" xhr readyState: " + READY_STATES[xhr.readyState]);
    };
    xhr.onprogress = (e) => {
      console.log(" xhr progress: " + JSON.stringify(e));
    }
    xhr.open('POST', url);
    xhr.send(JSON.stringify(globalDataObject));
    // this.appendToChat('Sichere daten...');
    // this.sendMessage('storeData', globalDataObject)
  }

  private createUI() {
    this.inputContainer = new Composite({
      left: 0, right: 0, top: 0, height: 64,
      background: '#f5f5f5'
    }).appendTo(this);

    let urlInput = new TextInput({
      left: 16, right: ['#sendButton', 16], centerY: 0,
      message: 'url'
    }).appendTo(this.inputContainer);

    let url = localStorage.getItem('url');
    if (url) urlInput.text = url;

    new Button({
      id: 'sendButton',
      right: 16, width: 76, centerY: 0,
      text: 'Hochladen'
    }).on('select', () => {
      localStorage.setItem('url', urlInput.text);
      this.uploadData('http://' + urlInput.text + ':8082');
    }).appendTo(this.inputContainer);

    let scrollView = new ScrollView({
      left: 0, right: 0, bottom: 0, top: this.inputContainer,
      background: 'white',
      elevation: 2
    }).appendTo(this);

    this.chatTextView = new TextView({
      left: 16, right: 16, top: 16,
      markupEnabled: true
    }).appendTo(scrollView);
  }

  private appendToChat(text: string) {
    this.chatTextView.set('text', this.chatTextView.text + '<br/>' + text);
  }
}