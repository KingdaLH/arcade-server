"use strict";
class App {
    constructor() {
        this.position = { row: 0, col: 0 };
        this.grid = [];
        this.loadGames();
    }
    loadGames() {
        fetch("./data/games.json")
            .then(res => res.json())
            .then(data => this.initMenus(data))
            .catch(error => console.log(error));
    }
    initMenus(data) {
        this.data = data;
        for (let i = 0; i < 4; i++) {
            let div = document.createElement("div");
            document.querySelectorAll(".game-row")[0].appendChild(div);
            div.innerHTML = this.data[i].name;
        }
        for (let i = 4; i < 8; i++) {
            let div = document.createElement("div");
            document.querySelectorAll(".game-row")[1].appendChild(div);
            div.innerHTML = this.data[i].name;
        }
        this.grid.push(document.querySelector("#player-menu").children);
        this.grid.push(document.querySelector("#genre-menu").children);
        this.grid.push(document.querySelectorAll(".game-row")[0].children);
        this.grid.push(document.querySelectorAll(".game-row")[1].children);
        this.grid.push(document.querySelector("#page-menu").children);
        this.grid.push(document.querySelector("#credits-menu").children);
        this.joystick = new Joystick(6);
        document.addEventListener("cursorX", (e) => {
            this.selectColumn(e.detail);
        });
        document.addEventListener("cursorY", (e) => {
            this.selectRow(e.detail);
        });
        document.addEventListener("button0", () => this.selectGame());
        document.addEventListener("keydown", (e) => this.onKeyDown(e));
        this.update();
    }
    selectRow(dir) {
        this.position.row = Math.min(Math.max(this.position.row + dir, 0), this.grid.length - 1);
        this.selectColumn(0);
    }
    selectColumn(dir) {
        let row = this.position.row;
        let maxColumn = this.grid[row].length - 1;
        this.position.col = Math.min(Math.max(this.position.col + dir, 0), maxColumn);
        this.updateSelection();
    }
    updateSelection() {
        this.clearRow(this.position.row);
        if (this.position.row == 2)
            this.clearRow(3);
        if (this.position.row == 3)
            this.clearRow(2);
        if (this.position.row != 5) {
            this.clearRow(5);
        }
        let c = document.querySelector(".cursor");
        if (c)
            c.classList.remove("cursor");
        this.getSelectedElement().classList.add("selected", "cursor");
    }
    clearRow(row) {
        let buttons = this.grid[row];
        let arr = Array.from(buttons);
        for (let b of arr) {
            b.classList.remove("selected");
        }
    }
    getSelectedElement() {
        return this.grid[this.position.row][this.position.col];
    }
    onKeyDown(e) {
        let charCode = e.which;
        if (charCode == 39 || charCode == 68) {
            this.selectColumn(1);
        }
        if (charCode == 37 || charCode == 65) {
            this.selectColumn(-1);
        }
        if (charCode == 40 || charCode == 83) {
            this.selectRow(1);
        }
        if (charCode == 38 || charCode == 87) {
            this.selectRow(-1);
        }
        if (charCode == 69 || charCode == 75 || charCode == 32) {
            this.selectGame();
        }
    }
    selectGame() {
        if (this.position.row == 2) {
            this.gotoGame(this.position.col);
        }
        if (this.position.row == 3) {
            this.gotoGame(this.position.col + 4);
        }
    }
    gotoGame(index) {
        console.log(this.data[index]);
        window.location.href = this.data[index].url;
    }
    update() {
        if (Math.random() > 0.99) {
            document.body.classList.add("zoom");
        }
        else if (Math.random() > 0.9) {
            document.body.classList.remove("zoom");
        }
        this.joystick.update();
        requestAnimationFrame(() => this.update());
    }
}
window.addEventListener("load", () => new App());
class Joystick {
    constructor(numOfButtons) {
        this.DEBUG = true;
        this.numberOfBUttons = 0;
        this.axes = [];
        this.isConnected = false;
        this.numberOfBUttons = numOfButtons;
        this.axes.push(0, 0);
        window.addEventListener("gamepadconnected", (e) => this.onGamePadConnected(e));
        window.addEventListener("gamepaddisconnected", () => this.onGamePadDisConnected());
        this.update();
    }
    get Left() {
        return (this.axes[0] == -1);
    }
    get Right() {
        return (this.axes[0] == 1);
    }
    get Up() {
        return (this.axes[1] == -1);
    }
    get Down() {
        return (this.axes[1] == 1);
    }
    onGamePadConnected(e) {
        if (this.DEBUG) {
            console.log('Game pad connected');
        }
        this.previousGamepad = e.gamepad;
        this.isConnected = true;
    }
    onGamePadDisConnected() {
        if (this.DEBUG) {
            console.log('Game pad disconnected');
        }
        this.isConnected = false;
    }
    update() {
        if (this.isConnected) {
            let gamepads = navigator.getGamepads();
            if (!gamepads) {
                return;
            }
            let gamepad = gamepads[0];
            if (gamepad) {
                for (let index = 0; index < this.numberOfBUttons; index++) {
                    if (this.buttonPressed(gamepad.buttons[index]) &&
                        !this.buttonPressed(this.previousGamepad.buttons[index])) {
                        document.dispatchEvent(new Event('button' + index));
                    }
                    if (Math.abs(gamepad.axes[0]) > 0.9 && Math.abs(this.previousGamepad.axes[0]) < 0.9) {
                        this.previousGamepad = gamepad;
                        document.dispatchEvent(new CustomEvent('cursorX', { detail: Math.round(gamepad.axes[0]) }));
                    }
                    if (Math.abs(gamepad.axes[1]) > 0.9 && Math.abs(this.previousGamepad.axes[1]) < 0.9) {
                        this.previousGamepad = gamepad;
                        document.dispatchEvent(new CustomEvent('cursorY', { detail: Math.round(gamepad.axes[1]) }));
                    }
                }
                this.axes = [Math.round(gamepad.axes[0]), Math.round(gamepad.axes[1])];
                this.previousGamepad = gamepad;
            }
        }
    }
    buttonPressed(b) {
        if (typeof (b) == "object") {
            return b.pressed;
        }
        return b == 1.0;
    }
}
//# sourceMappingURL=main.js.map