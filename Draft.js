/** Draft.js */
class Draft {
  constructor(init = {
    shafts: 4,
    warps: 50,
    treadles: 6,
    picks: 30
  }) {
    this.threading = new Threading(init.shafts, init.warps);
    this.treadling = new Treadling(init.treadles, init.picks);
    this.tieup = new DraftContainer(init.shafts, init.treadles);
    this.drawdown = new DraftContainer(init.picks, init.warps);

    this.sections = [this.threading, this.tieup, this.treadling, this.drawdown];
  }

  get shafts() { return this.threading.shafts; }
  set shafts(n) { 
    this.threading.shafts = n;
    this.tieup.height = n;
  }

  get treadles() { 
    return this.treadling.treadles; 
  }
  set treadles(n) {
    this.treadling.treadles = n;
    this.tieup.width = n;
  }

  tieupFromArray(array) {
    this.tieup = DraftContainer.fromArray(array);
  }

  twillTieUp(shafts, shade) {
    if (shade > 0 && shade < shafts) {
      let result = [];
      let tabby = false;
      for (var i=0; i<shafts; i++) {    
        let row = []; 
        for (var j=0; j<shafts; j++) {
          if ((shafts-i <= shade) && j < (i + shade) % shafts) { row.unshift(true); }
          else if (j < i) { row.unshift(false); }
          else if (j == i) { row.unshift(true); }
          else if (j < i + shade || j < (i + shade)%shafts) { row.unshift(true); }
          else { row.unshift(false); }
        }
        row = row.concat([tabby, !tabby]);
        tabby = !tabby;
        result.push(row);
      }
      
      this.tieupFromArray(result);
      this.shafts = shafts;
      this.treadles = shafts + 2;
    }
  }
}

function updateDrawdown() {
  // each i-th row of the drawdown:
  // i-th treadling row -> which treadle was pressed?
  // on that treadle, what does that column of tie-up look like?
  // if cell in that column, then OR to make the row

  // for each row
  for (var row = 0; row < TL.picks; row++) {
    var updatedRow = [];
    var whichTreadle = -1;
    for (var t = 0; t < TL.treadles; t++) {
      if (TL.getData(row,t)) {
        whichTreadle = t;
        break;
      }
    }
    //console.log("Row", row, "uses treadle", whichTreadle);
    
    for (var col = 0; col < TX.warps; col++) {
      if (whichTreadle == -1) {
          // no treadle on this row, row should be empty
          //console.log("empty row");
          updatedRow[col] = false;
        } else {
          for (var s = 0; s < TX.shafts; s++) {
            updatedRow[col] |= tieUp.displayData.getData(s,whichTreadle) && TX.displayData.getData(s,col);
        }
      }
    }
    //console.log(updatedRow);
    // copy updated row into drawdown
    for (var col = 0; col < TX.warps; col++) {
      drawdown.displayData.setData(row, col, updatedRow[col]);
    }
  }
  //console.log(drawdown.printData());
  redraw();
}


function straightThreading(thread=true) {
  for (var j=0; j<TX.shafts; j++) {
    for (var i=0; i<TX.warps; i++) {
      let x = (j == i % TX.shafts) ? true : false;
      if (thread) TX.setData(j, i, x);
      else TL.setData(i, j, x);
    }
  }
}

function pointThreading(thread=true) {
  let prog = [0, 1, 2, 3, 2, 1];
  for (var i=0; i<TX.warps; i++) {
    let shaft = prog[i%6];
    for (var j=0; j<TX.shafts; j++) {
      let x = (j == shaft) ? true : false;
      if (thread) TX.setData(j, i, x);
      else TL.setData(i, j, x);
    }
  }
}

function advancingPointThreading(thread=true) {
  let prog = [0, 1, 2, 3, 2];
  for (var i=0; i<TX.warps; i++) {
    let shaft = prog[i%5];
    prog[i%5] = (prog[i%5]+1)%TX.shafts;
    for (var j=0; j<TX.shafts; j++) {
      let x = (j == shaft) ? true : false;
      if (thread) TX.setData(j, i, x);
      else TL.setData(i, j, x);
    }
  }
}

function treadleAsWarped() {
  for (var i=0; i<TL.picks; i++) {
    for (var j=0; j<TX.shafts; j++) {
      let x = TX.getData(j, i);
      TL.setData(i, j, x);
    }
  }
}