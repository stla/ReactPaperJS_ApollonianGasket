/* jshint esversion: 6 */
import React from 'react';
import './App.css';
import { complex } from 'mathjs';
import CustomizedSlider from './slider.js';
import { PaperContainer, Circle } from '@psychobolt/react-paperjs';
import Grid from '@material-ui/core/Grid';
import cividis from './cividisHex.js';
import g from './geometry.js';
const startingCircles = g.startingCircles;
const children = g.children;

function palette(depth){
  var colors = new Array(depth);
  for(let i = 0; i < depth; ++i){
    var idx = Math.floor(255 * i/(depth-1));
    colors[i] = cividis[idx];
  }
  return colors;
}

function fillColor(zcircle, color) {
  return {
    gradient: {
      stops: [color, 'black'],
      radial: true
    },
    origin: [zcircle.center.re, zcircle.center.im],
    destination: [zcircle.center.re + zcircle.radius, zcircle.center.im]
  };
}

/* jshint ignore:start */
function makeCircle(zcircle, color) {
  var cx = zcircle.center.re, cy = zcircle.center.im, r = zcircle.radius;
  return (
    <Circle
      key = {["circle",cx,cy,r].join("_")}
      center = {[cx, cy]} radius = {r}
      fillColor = {fillColor(zcircle, color)}
    />
  );
}

function makeCircles(n, phi, shift, depth){
  if(phi === 0) return null;
  var c0 = {center: complex(250, 250), radius : 240};
  var scircles = startingCircles(c0, n, phi, n*shift);
  var circles0 = scircles[0];
  var invCircles = scircles[1];
  // construct the children ------------------------------------------------------
  var allCircles = new Array(depth);
  allCircles[0] = circles0;
  var previous = [];
  for(let i = 1; i < depth; ++i){
    allCircles[i] = children(invCircles, allCircles[i - 1], previous, c0.radius);
    previous = previous.concat(allCircles[i - 1]);
  }
  var Circles = new Array(depth);
  var colors = palette(depth);
  for (let i = 0; i < depth; ++i) {
    Circles[i] = allCircles[i].map(function(x){
      return makeCircle(x, colors[i])
    });
  }
  return [].concat.apply([], Circles);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      n: 3,
      phi: 0.25, 
      shift: 0,
      depth: 2
    };
  }

  changeHandler_n = (e, value) => this.setState(
    {
      n: value,
      phi: this.state.phi,
      shift: this.state.shift,
      depth: this.state.depth
    }
  );

  changeHandler_phi = (e, value) => this.setState(
    {
      n: this.state.n,
      phi: value,
      shift: this.state.shift,
      depth: this.state.depth
    }
  );

  changeHandler_shift = (e, value) => this.setState(
    {
      n: this.state.n,
      phi: this.state.phi,
      shift: value,
      depth: this.state.depth
    }
  );

  changeHandler_depth = (e, value) => this.setState(
    {
      n: this.state.n,
      phi: this.state.phi,
      shift: this.state.shift,
      depth: value
    }
  );

  render() {
    return (
      <React.Fragment>
        <Grid container>
          <Grid item xs={12}>
            <div className="inline vtop">
              <CustomizedSlider 
                title = "Starting circles"
                defaultValue={this.state.n} min={3} max={7}
                onChangeCommitted={this.changeHandler_n}
              />
              <CustomizedSlider
                title="phi (controls the radii of the starting cirles)"
                defaultValue={this.state.phi} min={-0.95} max={0.95} step = {0.05}
                onChangeCommitted={this.changeHandler_phi}
              />
              <CustomizedSlider
                title="shift (kind of rotation)"
                defaultValue={this.state.shift} min={0} max={1} step={0.01}
                onChangeCommitted={this.changeHandler_shift}
              />
              <CustomizedSlider
                title="depth"
                defaultValue={this.state.depth} min={1} max={5} step={1}
                onChangeCommitted={this.changeHandler_depth}
              />
            </div>
            <div className="inline">
              <PaperContainer>
                <Circle
                  center={[250, 250]} radius={240}
                  strokeColor='black'
                />
                {makeCircles(this.state.n, this.state.phi, this.state.shift, this.state.depth)}
              </PaperContainer>
            </div>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
/* jshint ignore:end */

export default App;
