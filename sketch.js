// background
let bg;

// fireflies
let fireflies = [];
let num_fireflies = 600;

// body segmentation with options
let bodySegmentation;
let mask_options = {
  maskType: "person"
};

// video
let video;

// segmentation variable
let segmentation;

// draw the mask for debug purposes
let draw_seg_mask = false;

// results method for segmentation
function gotResults(result) {
  segmentation = result;
}

async function setup() {
  createCanvas(1600, 900);

  // create background image
  bg = await loadImage("assets/background.jpg");

  // modes
  angleMode(DEGREES);

  // create fireflies
  for (let i = 0; i < num_fireflies; i++) {
    fireflies.push(create_random_firefly());
  }

  // initial segmentation stuff
  bodySegmentation = await ml5.bodySegmentation("SelfieSegmentation", mask_options); 

  video = createCapture(VIDEO);
  video.size(640, 360);
  video.hide();

  bodySegmentation.detectStart(video, gotResults);
}

function draw() {
  // background image
  background(bg);
  
  // show segmentation mask in debug mode
  if (segmentation && draw_seg_mask) {
    image(segmentation.mask, 0, 0, width, height);
  }

  // update all fireflies
  for (let firefly of fireflies) {

    firefly.update(1);

    // segmentation may be undefined
    firefly.respond(firefly.clicked || (segmentation && firefly.is_on_mask(segmentation.mask)));
  }
}

function mousePressed() {
  // check if any firefly is clicked
  for (let firefly of fireflies) {
    if (firefly.contains(mouseX, mouseY)) {
      firefly.click();
    }
  }
}

function keyPressed() {
  if (key == "h") {
    draw_seg_mask = !draw_seg_mask;
  }
}