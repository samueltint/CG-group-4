import { randFloat } from "three/src/math/MathUtils.js";

class LSystemGenerator {

  constructor(rules = [], rootSentence = '[]') {
    this.rules = rules;
    this.rootSentence = rootSentence;
  }
  iterationLimit = 3;
  ignoreRuleChance = 0.3;

  GenerateSentence(word = null) {
    if (!word) {
      word = this.rootSentence;
    }
    let final = this.GrowRecursive(word)
    console.log("final: " + final)
    return final;
  }

  GrowRecursive(word, iteration = 0) {
    if (iteration >= this.iterationLimit) {
      return word;
    }

    let newWord = '';
    for (const c of word) {
      if (iteration > 1 && randFloat() < this.ignoreRuleChance) { return }
      newWord += this.ProcessRulesRecursively(c, iteration);
    }

    return newWord;
  }

  ProcessRulesRecursively(c, iteration) {
    for (const rule of this.rules) {
      if (rule.letter === c) {
        return c + this.GrowRecursive(rule.getResult(), iteration + 1);
      }
    }
    return c;
  }
}

export { LSystemGenerator }