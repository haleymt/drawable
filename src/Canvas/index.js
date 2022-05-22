/* global window, document */
import * as React from "react";
import "./style.css";

export default class Canvas extends React.Component {
  constructor() {
    super();

    this.state = { showPrompt: false, showClear: false };

    this._isDrawing = false;
    this._hasMoved = false;
    this._hasDrawn = false;
    this._hasDrawnEver = false;
  }

  componentDidMount() {

    window.addEventListener("mousedown", this.startDrawing);
    window.addEventListener("mousemove", this.draw);
    window.addEventListener("mouseup", this.endDrawing);
    // 20s in milliseconds === 20000
    // setTimeout(this.showPrompt, 12000);
  }

  get xDim() {
    return window.screen.width;
  }

  get yDim() {
    return window.screen.height < 900 ? 900 : window.screen.height;
  }

  get ctx() {
    return this.canvas ? this.canvas.getContext('2d') : null;
  }

  validTarget = (e) => {
    const target = e.target;
    const invalids = document.getElementsByClassName("invalid") || [];
    if (!this.canvas || !target) return false;

    for (let idx = 0; idx < invalids.length; idx++) {
      const invalid = invalids[idx];
      if (invalid && invalid.contains(target)) return false;
    }

    return true;
  }

  showPrompt = () => {
    if (this._hasDrawnEver) return;

    this.setState({ showPrompt: true}, () => {
      // setTimeout(() => {
      //   this.setState({ showPrompt: false });
      // }, 10000)
    })
  }

  startDrawing = (e) => {
    if (this.ctx && this.validTarget(e)) {
      const coords = this.getCoordinates(e);
      this.setState({ showPrompt: false });

      this._hasDrawnEver = true;
      this._isDrawing = true;

      document.body.style.cursor = 'crosshair';

      this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
      this.changeFavicon();
      this.ctx.beginPath();
      this.ctx.moveTo(coords.x, coords.y);
    }
  }

  endDrawing = (e) => {
    if (this._isDrawing && !this._hasMoved) {
      var coords = this.getCoordinates(e);
      this.drawPixel(coords.x, coords.y);
    }

    if (this._isDrawing && !this._hasDrawn) {
      this._hasDrawn = true;
      this.setState({ clearCanvas: true });
    }

    this._isDrawing = false;
    this._hasMoved = false;
    document.body.style.cursor = 'auto';
  }

  clearCanvas = (e) => {
    e.stopPropagation();

    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.xDim, this.yDim);
      this.setState({ showClear: false })
      this._hasDrawn = false;

      var link1 = document.getElementById('favicon1');
      var link2 = document.getElementById('favicon2');
      link1.href = 'favicon.ico';
      link2.href = 'favicon.ico';
    }
  }

  getCoordinates = (e) => {
    var pageX = e.clientX;
    var pageY = e.clientY;
    var offsetX = (this.xDim - window.innerWidth) / 2;
    var offsetY = (this.yDim - window.innerHeight) / 2;

    return { x: pageX + offsetX, y: pageY + offsetY };
  }

  drawPixel = (xCoord, yCoord) => {
    if (!this.ctx) return;

    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(
      xCoord,
      yCoord,
      1.5,
      0,
      2 * Math.PI,
      false
    );

    this.ctx.fill();
  };

  draw = (e) => {
    if (this._isDrawing && this.ctx) {
      const coords = this.getCoordinates(e);
      this.ctx.lineTo(coords.x, coords.y);
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = this.color;

      this.ctx.stroke();
      this._hasMoved = true;

      if (!this._hasDrawn) {
        this._hasDrawn = true;
        this.setState({ showPrompt: false, showClear: true })
      }
    }
  }

  changeFavicon = () => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');

    c.height = 32;
    c.width = 32;

    ctx.rect(0, 0, 32, 32);
    ctx.fillStyle = this.color;
    ctx.fill();

    c.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      var link1 = document.getElementById('favicon1');
      var link2 = document.getElementById('favicon2');
      link1.href = url;
      link2.href = url;
    });
  }

  render() {
    return (
      <React.Fragment>
        <canvas
          ref={ref => (this.canvas = ref)}
          className="canvas"
          width={this.xDim}
          height={this.yDim}
        />
        {this.state.showClear &&
          <div className="button-block invalid">
            <button onClick={this.clearCanvas}>
              <div className="clear-icon" />clear
            </button>
          </div>
        }
        {/*this.state.showPrompt &&
          <div className="hiddenInfo">
            *{"  "}try clicking and dragging on the background
          </div>
        */}
      </React.Fragment>
    )
  }
}
