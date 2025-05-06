class Rule {
  constructor(letter = '', results = [], randomResult = false) {
    this.letter = letter;
    this._results = results;
    this._randomResult = randomResult;
  }

  getResult() {
    if (this._randomResult) {
      const randomIndex = Math.floor(Math.random() * this._results.length);
      return this._results[randomIndex];
    }
    return this._results[0];
  }
}

export default Rule