import Rule from "./rule";

class LSystemGenerator {
  rules = [new Rule(
    'F',
    [
      '[+F]F[-F]',
      '[+F][-F]',
      '[-F]F',
    ], true
  )
  ]
  rootSentence = 'F';
  iterationLimit = 3;

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