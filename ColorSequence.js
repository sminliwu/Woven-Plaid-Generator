class ColorSequence {
  constructor() {
    this.colors = [
      // {key: '0', color: color(255, 0, 0)},
      // {key: '1', color: color(0, 255, 0)},
      // {key: '2', color: color(0, 0, 255)},
    ];
    this.seq = "";
    this.weft_seq = "";
    this.mirror = false;
    this.weft_mirror = false;
    this.match = true;
  }
  
  getColor(key) {
    let res = this.colors.filter((el) => el.key == key);
    if (res.length > 0) {
      return res[0];
    } else return undefined;
  }
  
  getIndexOfColor(key) {
    return this.colors.findIndex((el) => el.key == key);
  }
  
  setColor(key, newColor) {
    let i = this.getIndexOfColor(key);
    this.colors[i].color = newColor;
  }
  
  setSymbol(key, newKey) {
    console.log("key ", key, "newKey ", newKey);
    let i = this.getIndexOfColor(key);
    this.colors[i].key = newKey;
    this.seq = this.seq.replaceAll(key, newKey);
    return newKey;
  }
  
  getSeq(warp=true) {
    let res = warp ? this.seq : this.weft_seq;
    let mirror = warp ? this.mirror : this.weft_mirror;
    if (!mirror) return res;
    else {
      let seq = warp ? this.seq : this.weft_seq;
      for (let i=seq.length-1; i>-1; i--) {
        res += seq[i];
      }
      // console.log("mirrored color seq ", res);
      return res;
    }
  }
}