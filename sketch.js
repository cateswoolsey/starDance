let noiseDrift = 0;
let distance = 800;
let dots = [];
let radius;
let fft;
let amplitude;
let globalBrightness = 40;

let radiusMulti = 1.0;
let targetMulti = 1.0;
let intensity = 1;       // Adjust if needed
let beatDuration = 500;    // Beat effect duration in ms
let lastBeatTime = 0;      // Last time a beat was triggered

// load in the song.
let sounds = [];
function preload() {
  sounds.push(loadSound("media/Sidewalks and Skeletons - GOTH.mp3"));
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  radius = min(width, height) / 4;
  fft = new p5.FFT();
  fft.setInput(sounds[0]);
  amplitude = new p5.Amplitude();
  amplitude.setInput(sounds[0]);

  for (let i = 0; i < 100; i++) {
    dots.push(DotFace("front"));
    dots.push(DotFace("back"));
    dots.push(DotFace("left"));
    dots.push(DotFace("right"));
    dots.push(DotFace("top"));
    dots.push(DotFace("bottom"));
  }
}

function draw() {
  background(0);
  orbitControl();

  if (sounds[0].isPlaying()) {
    detectBeat();
    // Interpolate radiusMulti toward targetMulti (affecting star sizes)
    radiusMulti = lerp(radiusMulti, targetMulti, 0.15);
    noiseDrift += 0.1;
    globalBrightness = lerp(globalBrightness, 255, 0.05);
  } else {
    radiusMulti = lerp(radiusMulti, 1.0, 0.15);
    globalBrightness = lerp(globalBrightness, 40, 0.05);
  }

  drawStars(radiusMulti);

  for (let dot of dots) {
    let noiseX = noise(dot.x * 0.01 + noiseDrift) * 15 - 5;
    let noiseY = noise(dot.y * 0.01 + noiseDrift) * 15 - 5;
    let noiseZ = noise(dot.z * 0.01 + noiseDrift) * 15 - 5;

    let newX = dot.x + noiseX;
    let newY = dot.y + noiseY;
    let newZ = dot.z + noiseZ;

    let startColor = color(255);
    let rainbowColors = [
      color(255, 0, 0),
      color(255, 127, 0),
      color(255, 255, 0),
      color(0, 255, 0),
      color(0, 0, 255),
      color(75, 0, 130),
      color(148, 0, 211)
    ];
    let endColor = random(rainbowColors);
    let lerpAmount = random(0, 1);
    let baseColor = lerpColor(startColor, endColor, lerpAmount);
    let brightness = random(globalBrightness * 0.4, globalBrightness);

    let finalColor = color(
      red(baseColor) * (brightness / 255),
      green(baseColor) * (brightness / 255),
      blue(baseColor) * (brightness / 255),
      brightness
    );

    fill(finalColor);
    noStroke();

    push();
    translate(newX, newY, newZ);
    ellipse(0, 0, dot.size, dot.size);
    pop();
  }
}

function DotFace(face) {
  let x = 0, y = 0, z = 0;
  if (face === "front") {
    x = random(-distance, distance);
    y = random(-distance, distance);
    z = -distance;
  } else if (face === "back") {
    x = random(-distance, distance);
    y = random(-distance, distance);
    z = distance;
  } else if (face === "left") {
    x = -distance;
    y = random(-distance, distance);
    z = random(-distance, distance);
  } else if (face === "right") {
    x = distance;
    y = random(-distance, distance);
    z = random(-distance, distance);
  } else if (face === "top") {
    x = random(-distance, distance);
    y = -distance;
    z = random(-distance, distance);
  } else if (face === "bottom") {
    x = random(-distance, distance);
    y = distance;
    z = random(-distance, distance);
  }
  return { x, y, z, size: random(1, 15) };
}

function detectBeat() {
  let level = amplitude.getLevel();
  let dynamicThreshold = 0.01;
  
  // Use millis() to check if enough time has passed since the last beat
  if (level > dynamicThreshold && (millis() - lastBeatTime > beatDuration)) {
    targetMulti = 2.0;  // Set the pulsation peak value
    lastBeatTime = millis();
  } else {
    // Gradually decay targetMulti back to 1.0, using deltaTime for smoother timing
    targetMulti = lerp(targetMulti, 1.0, deltaTime / beatDuration);
  }
}

function drawStars(radiusMulti) {
  let starScale = 0.4; // scale factor for star sizes
  let posScale = 0.55; // scale factor for star positions (increased slightly for more spacing)
  colorMode(HSB, 360, 100, 100, 255);
  let starGroups = [
    {
      positions: [
        { x: -radius, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: radius, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: 0, y: -radius, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: radius, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: 0, z: -radius, rotationAxis: createVector(0, 0, 1) },
        { x: 0, y: 0, z: radius, rotationAxis: createVector(0, 0, 1) },
      ],
      size: min(width, height) * 0.24,
      color: color(300, 25, 100, 160)
    },
    {
      positions: [
        { x: -radius * 1.05, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: radius * 1.05, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: 0, y: -radius * 1.05, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: radius * 1.05, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: 0, z: -radius * 1.05, rotationAxis: createVector(0, 0, 1) },
        { x: 0, y: 0, z: radius * 1.05, rotationAxis: createVector(0, 0, 1) },
      ],
      size: min(width, height) * 0.19,
      color: color(60, 30, 100, 160)
    },
    {
      positions: [
        { x: -radius * 1.10, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: radius * 1.10, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: 0, y: -radius * 1.10, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: radius * 1.10, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: 0, z: -radius * 1.10, rotationAxis: createVector(0, 0, 1) },
        { x: 0, y: 0, z: radius * 1.10, rotationAxis: createVector(0, 0, 1) },
      ],
      size: min(width, height) * 0.13,
      color: color(140, 25, 100, 160)
    },
    {
      positions: [
        { x: -radius * 1.15, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: radius * 1.15, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: 0, y: -radius * 1.15, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: radius * 1.15, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: 0, z: -radius * 1.15, rotationAxis: createVector(0, 0, 1) },
        { x: 0, y: 0, z: radius * 1.15, rotationAxis: createVector(0, 0, 1) }
      ],
      size: min(width, height) * 0.075,
      color: color(220, 25, 100, 160)
    },
    {
      positions: [
        { x: -radius * 1.20, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: radius * 1.20, y: 0, z: 0, rotationAxis: createVector(0, 1, 0) },
        { x: 0, y: -radius * 1.20, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: radius * 1.20, z: 0, rotationAxis: createVector(1, 0, 0) },
        { x: 0, y: 0, z: -radius * 1.20, rotationAxis: createVector(0, 0, 1) },
        { x: 0, y: 0, z: radius * 1.20, rotationAxis: createVector(0, 0, 1) }
      ],
      size: min(width, height) * 0.035,
      color: color(270, 25, 100, 160)
    }
  ];

  for (let group of starGroups) {
    for (let pos of group.positions) {
      push();
      // Multiply positions by posScale to space them out accordingly
      translate(pos.x * posScale, pos.y * posScale, pos.z * posScale);
      rotateVector(pos.rotationAxis, HALF_PI);
      
      stroke(255);
      strokeWeight(2);
      noFill();
      // Scale star sizes by starScale and pulsate with radiusMulti
      drawStar(0, 0, group.size * 0.55 * starScale * radiusMulti, group.size * 1.1 * starScale * radiusMulti, 5);
      
      noStroke();
      fill(group.color);
      drawStar(0, 0, group.size * 0.5 * starScale * radiusMulti, group.size * starScale * radiusMulti, 5);
      pop();
    }
  }
  colorMode(RGB, 255);
}



function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function rotateVector(axis, angle) {
  rotateX(axis.x * angle);
  rotateY(axis.y * angle);
  rotateZ(axis.z * angle);
}

function keyPressed() {
  if (key === "p") {
    if (sounds[0].isPlaying()) {
      sounds[0].pause();
    } else {
      sounds[0].play();
    }
  }
}
