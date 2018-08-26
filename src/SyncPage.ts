import { Page, Composite, TextInput, Button, device, ScrollView, TextView, fs } from "tabris/tabris";
import { globalDataObject, storeData } from "./app";

const DOWNLOAD_ICON = '🔻';
const UPLOAD_ICON = '🔺';

interface Packet {
  command: string;
  data: any;
}

export default class SyncPage extends Page {

  private socket: WebSocket;
  private chatTextView: TextView;
  private inputContainer: Composite;

  constructor() {
    super();
    this.createUI();
  }

  private openWebsocket(url: string) {
    this.socket = new WebSocket(url, 'chat-protocol');
    this.registerSocketEvents();
    this.once({
      disappear: () => this.socket.close(1000)
    })
  }

  private registerSocketEvents() {
    this.socket.onopen = (event) => {
      this.changeUI();
      console.info('Connection opened: ' + JSON.stringify(event));
      this.appendToChat('Verbunden.<br/>');
      this.logWebSocketState();
    };

    this.socket.onmessage = (event) => {
      console.info('Server message: ' + JSON.stringify(event));
      if (typeof event.data === 'string') {
        let packet: Packet = JSON.parse(event.data);
        switch (packet.command) {
          case 'dataRecieved':
            this.appendToChat('Daten wurden hochgeladen');
            break;
          case 'ackData':
            this.appendToChat('Daten empfangen')
            packet.data.patients.forEach((patient: any) => patient.medication.forEach((perscription: any) => {
              if (typeof perscription.usage === 'string') {
                perscription.usage = [perscription.usage];
              }
            }));
            storeData(packet.data);
            this.appendToChat('Daten gespeichert')
            break;
          case 'error':
            this.appendToChat('Server Error!');
            this.appendToChat(JSON.stringify(packet.data));
            break;
          case 'noData':
            this.appendToChat('Keine daten gefunden');
            break;
          default:
            console.error('Unknown server command: ' + packet.command);
            this.appendToChat('Error: Unbekannte Servernachricht "' + packet.command + '" empfangen!!');
            break;
        }
      } else if (event.data instanceof ArrayBuffer) {
        console.error('Fehlerhafte Daten empfangen!!');
        this.appendToChat('Error: Fehlerhafte Daten empfangen!!');
      }
      this.logWebSocketState();
    };

    this.socket.onerror = (event) => {
      console.info('Error: ' + JSON.stringify(event));
      this.appendToChat('Error:' + JSON.stringify(event));
      this.logWebSocketState();
    };

    this.socket.onclose = (event) => {
      console.info('Close connection ' + JSON.stringify(event));
      this.appendToChat('Verbindung geschlossen:' + JSON.stringify(event));
      this.logWebSocketState();
    };
  }

  private changeUI() {
    this.inputContainer.find().dispose();

    new Button({
      right: 16, centerY: 0,
      text: ' ' + UPLOAD_ICON + ' '
    }).on('select', () => this.uploadData()).appendTo(this.inputContainer);

    new Button({
      left: 16, centerY: 0,
      text: ' ' + DOWNLOAD_ICON + ' '
    }).on('select', () => this.downloadData()).appendTo(this.inputContainer);
  }

  private downloadData() {
    // this.appendToChat('Fordere daten an...');
    // this.sendMessage('requestData');
  }

  private uploadData() {
    let file = fs.filesDir + '/AbedlData.json';
    fs.writeFile(file, JSON.stringify(globalDataObject));
    console.info("Wrote file " + file);
    this.appendToChat("Gespeichert in Datei " + file);
    // this.appendToChat('Sichere daten...');
    // this.sendMessage('storeData', globalDataObject)
  }

  private sendMessage(command: string, data?: any) {
    data = data || {};
    let packet: Packet = { command, data };
    this.socket.send(JSON.stringify(packet));
  }

  private createUI() {
    this.inputContainer = new Composite({
      left: 0, right: 0, top: 0, height: 64,
      background: '#f5f5f5'
    }).appendTo(this);

    let urlInput = new TextInput({
      left: 16, right: ['#connectButton', 16], centerY: 0,
      message: 'url'
    }).appendTo(this.inputContainer);

    let url = localStorage.getItem('url');
    if (url) urlInput.text = url;

    new Button({
      id: 'connectButton',
      right: 16, width: 76, centerY: 0,
      text: 'Verbinden'
    }).on('select', () => {
      localStorage.setItem('url', urlInput.text);
      this.openWebsocket('ws://' + urlInput.text + ':9000');
      this.appendToChat('Verbinde...');
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

  private logWebSocketState() {
    console.log(`WebSocket state:
        url: ${this.socket.url}
        readyState: ${this.socket.readyState}
        protocol: ${this.socket.protocol}
        extension: ${this.socket.extensions}
        bufferedAmount: ${this.socket.bufferedAmount}
        binaryType: ${this.socket.binaryType}`);
  }

  private appendToChat(text: string) {
    this.chatTextView.set('text', this.chatTextView.text + '<br/>' + text);
  }
}