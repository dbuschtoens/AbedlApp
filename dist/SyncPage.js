"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris/tabris");
const app_1 = require("./app");
const DOWNLOAD_ICON = '🔻';
const UPLOAD_ICON = '🔺';
class SyncPage extends tabris_1.Page {
    constructor() {
        super();
        this.createUI();
    }
    openWebsocket(url) {
        this.socket = new WebSocket(url, 'chat-protocol');
        this.registerSocketEvents();
        this.once({
            disappear: () => this.socket.close(1000)
        });
    }
    registerSocketEvents() {
        this.socket.onopen = (event) => {
            this.changeUI();
            console.info('Connection opened: ' + JSON.stringify(event));
            this.appendToChat('Verbunden.<br/>');
            this.logWebSocketState();
        };
        this.socket.onmessage = (event) => {
            console.info('Server message: ' + JSON.stringify(event));
            if (typeof event.data === 'string') {
                let packet = JSON.parse(event.data);
                switch (packet.command) {
                    case 'dataRecieved':
                        this.appendToChat('Daten wurden hochgeladen');
                        break;
                    case 'ackData':
                        this.appendToChat('Daten empfangen');
                        app_1.storeData(packet.data);
                        this.appendToChat('Daten gespeichert');
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
            }
            else if (event.data instanceof ArrayBuffer) {
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
    changeUI() {
        this.inputContainer.find().dispose();
        new tabris_1.Button({
            right: 16, centerY: 0,
            text: ' ' + UPLOAD_ICON + ' '
        }).on('select', () => this.uploadData()).appendTo(this.inputContainer);
        new tabris_1.Button({
            left: 16, centerY: 0,
            text: ' ' + DOWNLOAD_ICON + ' '
        }).on('select', () => this.downloadData()).appendTo(this.inputContainer);
    }
    downloadData() {
        this.appendToChat('Fordere daten an...');
        this.sendMessage('requestData');
    }
    uploadData() {
        this.appendToChat('Sichere daten...');
        this.sendMessage('storeData', app_1.globalDataObject);
    }
    sendMessage(command, data) {
        data = data || {};
        let packet = { command, data };
        this.socket.send(JSON.stringify(packet));
    }
    createUI() {
        this.inputContainer = new tabris_1.Composite({
            left: 0, right: 0, top: 0, height: 64,
            background: '#f5f5f5'
        }).appendTo(this);
        let urlInput = new tabris_1.TextInput({
            left: 16, right: ['#connectButton', 16], centerY: 0,
            message: 'url'
        }).appendTo(this.inputContainer);
        let url = localStorage.getItem('url');
        if (url)
            urlInput.text = url;
        new tabris_1.Button({
            id: 'connectButton',
            right: 16, width: 76, centerY: 0,
            text: 'Verbinden'
        }).on('select', () => {
            localStorage.setItem('url', urlInput.text);
            this.openWebsocket('ws://' + urlInput.text + ':9000');
            this.appendToChat('Verbinde...');
        }).appendTo(this.inputContainer);
        let scrollView = new tabris_1.ScrollView({
            left: 0, right: 0, bottom: 0, top: this.inputContainer,
            background: 'white',
            elevation: 2
        }).appendTo(this);
        this.chatTextView = new tabris_1.TextView({
            left: 16, right: 16, top: 16,
            markupEnabled: true
        }).appendTo(scrollView);
    }
    logWebSocketState() {
        console.log(`WebSocket state:
        url: ${this.socket.url}
        readyState: ${this.socket.readyState}
        protocol: ${this.socket.protocol}
        extension: ${this.socket.extensions}
        bufferedAmount: ${this.socket.bufferedAmount}
        binaryType: ${this.socket.binaryType}`);
    }
    appendToChat(text) {
        this.chatTextView.set('text', this.chatTextView.text + '<br/>' + text);
    }
}
exports.default = SyncPage;
