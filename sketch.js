// yarn colors
let color_sequence;
let color_list;
let seq_input, weft_seq_input;

// loom set-up
let DEFAULT_SHAFTS = 4;
const DEFAULT_TREADLES = 6;
const DEFAULT_WARPS = 100;
const DEFAULT_PICKS = 70;

// pattern data
let draft;
let stitches;
let TX, TL;
let tieUp, drawdown;
let thread_colors = { warp: "", weft: "" };

// drawing parameters
var xflip = false;
var yflip = false;
let xsign, ysign, xo, yo;
const dim_cell = 5;

function setup() {  
  color_sequence = new ColorSequence();
  color_list = $('#colors-list');
  for (var c of color_sequence.colors) {
    console.log(c);
    loadColor(c);
  }
  addColor();
  addColor();
  addColor();
  color_sequence.seq = "221210000011111221100200000";
  
  $("#colors").append("<button id='c-add'>Add a color</button>");
  $("#c-add").on("click", addColor);
  
  let mirror_warp = createCheckbox("Mirror color sequence", false);
  mirror_warp.parent('sequence-settings');
  mirror_warp.changed(()=> {
    color_sequence.mirror = mirror_warp.checked();
    redraw();
  });
  
  let mirror_weft = createCheckbox("Mirror color sequence", false);
  mirror_weft.parent('sequence-settings');
  mirror_weft.hide();
  
  seq_input = createInput(color_sequence.seq);
  seq_input.parent("sequence");
  seq_input.size(400);
  seq_input.input(() => {
    if (seq_input.value().length > 0) {
      color_sequence.seq = seq_input.value();
      redraw();
    }
  });
  
  weft_seq_input = createInput(color_sequence.weft_seq);
  weft_seq_input.parent("sequence-weft");
  weft_seq_input.size(400);
  weft_seq_input.input(() => {
    if (weft_seq_input.value().length > 0) {
      color_sequence.weft_seq = weft_seq_input.value();
      redraw();
    }
  })
  
    let warpweft = createCheckbox("Match warp and weft colors", true);
  warpweft.parent('sequence');
  warpweft.changed(()=> {
    color_sequence.match = warpweft.checked();
    toggleColorMatch();
    redraw();
  })
  
  draft = new Draft({
		shafts: DEFAULT_SHAFTS,
		warps: DEFAULT_WARPS,
		treadles: DEFAULT_TREADLES,
		picks: DEFAULT_PICKS
	});

	draft.tieupFromArray(
		[[false, true, true, false, false, true],
		[true, true, false, false, true, false],
		[true, false, false, true, false, true],
		[false, false, true, true, true, false]]);
	tieUp = draft.tieup;
	// console.log(tieUp);
	TX = draft.threading;//new Threading(DEFAULT_SHAFTS, DEFAULT_WARPS);
	TL = draft.treadling;//new Treadling(DEFAULT_TREADLES, DEFAULT_PICKS);
	drawdown = draft.drawdown;//new DraftContainer(TL.picks, TX.warps);
  straightThreading();
  treadleAsWarped();
  
  loadSettings();
  
    // select("body").size(windowWidth, windowHeight);
  let mainSize = select(".grid-row-2.canvas-grid").size();
  print(mainSize);
  createCanvas(mainSize.width, mainSize.height);
  
  noLoop();
}

function setWarps(n) {
  TX.warps = n;
  // console.log(TX);
  drawdown.width = n;
  updateDraft();
  redraw();
}

function setWefts(n) {
  TL.picks = n;
  drawdown.height = n;
  updateDraft(false);
  redraw();
}


function updateThreadColors() {
  thread_colors.warp = "";
  let limit = Math.max(drawdown.width, drawdown.height);
  while (thread_colors.warp.length < limit) {
    thread_colors.warp = thread_colors.warp.concat(color_sequence.getSeq());
  }
  if (!color_sequence.match) {
    thread_colors.weft = "";
    while (thread_colors.weft.length < drawdown.height) {
      thread_colors.weft = thread_colors.weft.concat(color_sequence.getSeq(false));
    }
  }
  // console.log(thread_colors);
}

function draw() {
  updateDrawdown();
  updateThreadColors();
  
  xsign = xflip? -1 : 1;
  ysign = yflip? -1 : 1;
  
  xo = xflip? windowWidth : 0;
  yo = yflip? windowHeight : 0;
  
  background(220);
  
  let warp_xo = xo + xsign*dim_cell*(TL.treadles+1);
  
  // for (var c in thread_colors) {
  //   // console.log(c);
  //   let thread = color_sequence.seq[c];
  //   if (color_sequence.getColor(thread)) {
  //     fill(color_sequence.getColor(thread).color);
  //     noStroke();
  //     let pos = warp_xo + xsign*dim_cell*c;
  //     rect(pos, 0, 4, windowHeight);
  //   }
  // }
  
  ddxo = xo + xsign*dim_cell*(TL.treadles+1);
  ddyo = yo + ysign*dim_cell*(TX.shafts+1);
  stroke(0);
  
  let dispX, dispY;
  
  // DRAW THREADING
  for (var i = 0; i < TX.shafts; i++) { // Y coord (row)
    for (var j = 0; j < TX.warps; j++) { // X coord (col)
      if (TX.getData(i,j)) fill(0); else fill(255);
      dispX = ddxo+xsign*dim_cell*j;
      dispY = yo+ysign*dim_cell*(TX.shafts-1-i);
      rect(dispX, dispY, dim_cell, dim_cell);
    }
  }

  // DRAW TIE UP
  for (var i = 0; i < TX.shafts; i++) {
    for (var j = 0; j < TL.treadles; j++) {
      if (tieUp.getData(i, j)) fill(0); else fill(255);
      dispX = xo+xsign*dim_cell*(TL.treadles-1-j);
      dispY = yo+ysign*dim_cell*(TX.shafts-1-i);
      rect(dispX, dispY, dim_cell, dim_cell);
    }
  }

  // DRAW TREADLING
  for (var i = 0; i < TL.picks; i++) { //<>//
    for (var j = 0; j < TL.treadles; j++) {
      if (TL.getData(i,j)) fill(0); else fill(255);
      dispX = xo+xsign*dim_cell*(TL.treadles-1-j);
      dispY = ddyo+ysign*dim_cell*i;
      rect(dispX, dispY, dim_cell, dim_cell);
    }
  }

  // DRAWDOWN
  noStroke();
  let match = color_sequence.match;
  for (var i = 0; i < TL.picks; i++) {
    for (var j = 0; j < TX.warps; j++) {
      let thread;
      if (match) {
        thread = (drawdown.getData(i,j)) ?
          thread_colors.warp[j] : thread_colors.warp[i];
      } else {
        thread = (drawdown.getData(i, j)) ?
          thread_colors.warp[j] : thread_colors.weft[i];
      }
      if (color_sequence.getColor(thread)) {
        fill(color_sequence.getColor(thread).color);
        dispX = ddxo+xsign*dim_cell*j;
        dispY = ddyo+ysign*dim_cell*i;
        rect(dispX, dispY, dim_cell, dim_cell);
      }
    }
  }
}