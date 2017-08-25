"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabris_1 = require("tabris");
const util_1 = require("./util");
const app_1 = require("./app");
const BLUR_COLOR = 'rgba(120,120,120,0.3)';
class FloatingWindow extends tabris_1.Composite {
    constructor(properties) {
        properties = properties || {};
        properties.background = properties.background || 'white';
        properties.elevation = 1000;
        properties.cornerRadius = 5;
        if (properties.width || properties.height)
            console.error('cant apply width to floating window');
        super(util_1.omit(properties, 'windowWidth', 'windowHeight'));
        app_1.floatingWindowStack.push(this);
        this.windowWidth = properties.windowWidth;
        this.windowHeight = properties.windowHeight;
        this.backgroundBlur = new tabris_1.Composite({ left: 0, right: 0, top: 0, bottom: 0, background: BLUR_COLOR })
            .on('tap', () => {
            this.backgroundBlur.dispose();
            this.dispose();
        }).appendTo(tabris_1.ui.contentView);
        this.appendTo(this.backgroundBlur);
        tabris_1.app.on({
            backNavigation: (event) => {
                event.preventDefault();
                this.dispose();
            }
        });
        this.applyScreenSize();
        tabris_1.device.on({
            orientationChanged: () => this.applyScreenSize()
        });
    }
    applyScreenSize() {
        if (this.windowHeight)
            this.height = tabris_1.device.screenHeight * this.windowHeight;
        if (this.windowWidth)
            this.width = tabris_1.device.screenWidth * this.windowWidth;
    }
    dispose() {
        console.log('disposing Window');
        app_1.floatingWindowStack.splice(app_1.floatingWindowStack.indexOf(this), 1);
        this.backgroundBlur.dispose();
        super.dispose();
    }
}
exports.default = FloatingWindow;
