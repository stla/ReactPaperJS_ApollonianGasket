/* jshint esversion: 6 */
import { complex, subtract, add, multiply, divide, conj, Complex } from 'mathjs';

function toCplx(x, y){
  return complex(x, y);
}

function squaredModulus(z) {
  return z.re * z.re + z.im * z.im;
}

function Modulus(z) {
  return Math.sqrt(squaredModulus(z));
}

// helper function for circumcircle
function orient(z1, z2, z3){
  var d1 = z2.re * z3.im - z3.re * z2.im;
  var d2 = z1.re * z3.im - z3.re * z1.im;
  var d3 = z1.re * z2.im - z2.re * z1.im;
  return d1 - d2 + d3;
}

function circumcircle(z1, z2, z3){
  var a = orient(z1, z2, z3);
  var q1 = squaredModulus(z1);
  var q2 = squaredModulus(z2);
  var q3 = squaredModulus(z3);
  var Dx = orient(toCplx(q1, z1.im), toCplx(q2, z2.im), toCplx(q3, z3.im));
  var Dy = orient(toCplx(q1, z1.re), toCplx(q2, z2.re), toCplx(q3, z3.re));
  var centerx = 0.5 / a * Dx;
  var centery = -0.5 / a * Dy;
  var center = toCplx(centerx, centery);
  var r = Modulus(subtract(z1, center));
  return {center: toCplx(centerx,centery), radius: r};
}

function invertCircle(zcircle0, zcircle1){
  var ctr0 = zcircle0.center;
  var ctr1 = zcircle1.center;
  var r0 = zcircle0.radius;
  var r1 = zcircle1.radius;
  var z1 = divide(subtract(ctr1, ctr0), r0);
  var D1 = r1 * r1 / r0 / r0 - squaredModulus(z1);
  var z2 = divide(z1, -D1);
  var r2 = Math.sqrt(squaredModulus(z2) + 1 / D1);
  return { 
    center: toCplx(r0 * z2.re + ctr0.re, r0 * z2.im + ctr0.im), 
    radius: r0 * r2
  };
}

function invertPoint(zcircle0, zM){
  return add(
    zcircle0.center, 
    divide(zcircle0.radius * zcircle0.radius, 
            conj(subtract(zM, zcircle0.center)))
  );
}

// starting circles and inversion circles --------------------------------------
function startingCircles(zcircle0, n, phi, shift){ // zcircle0 : exterior circle
  var invphi = 1 / phi;
  var I = add(toCplx(zcircle0.radius * invphi, 0), zcircle0.center);
  var r = zcircle0.radius * Math.sqrt(invphi * invphi - 1);
  var zcirc0 = {center: I, radius: r};
  var sine = Math.sin(Math.PI / n);
  var Cradius = zcircle0.radius / (1 + sine);
  var Cside = Cradius * sine;
  var circles0 = new Array(n+1);
  var K = new Array(n); 
  for(let i = 0; i < n; ++i) {
    var beta = (i + shift) * 2 * Math.PI / n;
    K[i] = invertPoint(zcirc0, 
      add(zcircle0.center, Complex.fromPolar(zcircle0.radius, beta)));
    var pti = add(Complex.fromPolar(Cradius, beta), zcircle0.center);
    var zcirc1 = {center: pti, radius: Cside};
    circles0[i] = invertCircle(zcirc0, zcirc1);
  }
  circles0[n] = invertCircle(zcirc0, 
    {center: zcircle0.center, radius: zcircle0.radius - 2 * Cside});
  var J = new Array(n);
  var invCircles = new Array(n + 1);
  for(let i = 0; i < n; ++i){
    var ip1 = (i + 1) % n, ip2 = (i + 2) % n;
    var zA = circles0[ip2].center;
    var rad = circles0[ip2].radius;
    var zB = circles0[ip1].center;
    var zAB = subtract(zB, zA);
    J[i] = add(zA, multiply(rad / Modulus(zAB), zAB));
    invCircles[i] = circumcircle(J[i], K[ip1], K[ip2]);
  }
  invCircles[n] = circumcircle(J[0], J[1], J[2]);
  var out = [circles0, invCircles];
  return out;
}

// check if circle belongs to circles ------------------------------------------
function iselement(zcircle, zcircles){
  var out = false;
  var eps = 0.000001 * squaredModulus(zcircle.center);
  for(let i = 0; i < zcircles.length; ++i){
    if(squaredModulus(subtract(zcircle.center, zcircles[i].center)) < eps) {
      out = true;
      break;
    }
  }
  return out;
}

// calculate children ----------------------------------------------------------
function children(invCircles, circles0, previous, c0radius){
  var m = invCircles.length;
  var n = circles0.length;
  var circles1 = [];
  for(let i = 0; i < n; ++i){
    for(let j = 0; j < m; ++j){
      var circle = invertCircle(invCircles[j], circles0[i]);
      if(Math.abs(circle.radius - c0radius) / c0radius > 0.001 &&
        !iselement(circle, circles0.concat(previous))){
        circles1.push(circle);
      }
    }
  }
  return circles1;
}

export default {
  startingCircles: startingCircles,
  children: children
};
