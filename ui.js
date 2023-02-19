// functions that affect the DOM or called by 
// DOM events

function loadSettings() {
  let helperText = createButton('Hide help text');
  helperText.parent("settings-header");
  helperText.mousePressed(() => {
    let x = (helperText.html().includes("Hide")) ? false : true;
    x ? $(".help-text").show() : $(".help-text").hide();
    helperText.html((x? "Hide" : "Show") + " help text");
    select("#body-container").style("grid-template-rows", (x ? "180px auto" : "150px auto"));
  });
  
  let showHide = createButton('Hide settings');
  showHide.parent("settings-header");
  
  let warps = createInput(TX.warps.toString());
  warps.parent("num-warps");
  warps.class("num-input");
  warps.input(() => {
    let num = parseInt(warps.value());
    if (num > 50) setWarps(num);
  });
  
  let wefts = createInput(TL.picks.toString());
  wefts.parent("num-wefts");
  wefts.class("num-input");
  wefts.input(() => {
    let num = parseInt(wefts.value());
    if (num > 50) setWefts(num);
  });
  
  let threadMenu = createSelect();
  threadMenu.parent("thread-menu");
  threadMenu.option("Straight draw");
  threadMenu.option("Point draw");
  threadMenu.option("Advancing point");
  threadMenu.changed(() => {
    updateDraft();
    if (treadleAs.checked()) { 
      treadleMenu.value(threadMenu.value());
      updateDraft(false); }
  });
  
  let treadleAs = createCheckbox("Tromp as writ", true);
  treadleAs.parent("treadle-as");
  
  let treadleMenu = createSelect();
  treadleMenu.parent("treadle-menu");
  treadleMenu.option("Straight draw");
  treadleMenu.option("Point draw");
  treadleMenu.option("Advancing point");
  treadleMenu.changed(() => updateDraft(false));
  
  treadleAs.changed(() => {
    if (treadleAs.checked()) {
      $('#treadle-menu').hide();
    } else { $('#treadle-menu').show(); }
  });
  
  $('#treadle-menu').hide();
  $('.weft').hide();
}

function updateDraft(tr=true) {
  let sel = tr ? $("#thread-menu > select").val() :  $("#treadle-menu > select").val();
  switch (sel) {
    case "Straight draw": 
      straightThreading(tr);
      break;
    case "Point draw": 
      pointThreading(tr);
      break;
    case "Advancing point": 
      advancingPointThreading(tr);
      break;
  }
  redraw();
}

function loadColor(c) {
  let str = "<tr id='c-"+c.key+"'>";
  str += "<td id='c-"+c.key+"-symb'></td>";
  str += "<td id='c-"+c.key+"-pick'></td></tr>";
  color_list.append(str);

  let inp = createInput(c.key);
  inp.parent("c-"+c.key+"-symb");
  inp.id(c.key+"symbol");
  inp.size(14);
  inp.input(() => {
    if (inp.value().length > 0) {
      console.log(inp.value());
      let newKey = color_sequence.setSymbol(inp.id()[0], inp.value()[0]);
      console.log(color_sequence);
      inp.id(newKey+"symbol");
      inp.value(newKey);
      seq_input.value(color_sequence.seq);
    }
    // print("color change");
  });

  let picker = createColorPicker(c.color);
  picker.parent("c-"+c.key+"-pick");
  picker.id(c.key+"picker");
  picker.input(() => {
    color_sequence.setColor(picker.id()[0], picker.color());
    redraw();
  });
}

function addColor() {
  let newKey = color_sequence.colors.length.toString();
  let newC = color(random(0, 255), random(0, 255), random(0, 255));
  let newColor = {key: newKey, color: newC};
  color_sequence.colors.push(newColor);
  loadColor(newColor);
}

function toggleColorMatch() {
  if (color_sequence.match) {
    $('.weft').hide();
    $('#sequence-label').text("Color Sequence");
    
  } else {
    // display two different color sequences
    if (color_sequence.weft_seq == "") {
      color_sequence.weft_seq = color_sequence.seq;
      weft_seq_input.value(color_sequence.weft_seq);
    }
    $('.weft').show();
    $('#sequence-label').text("Warp Color Sequence");
  }
}
