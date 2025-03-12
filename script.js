let words = [];
let mainDeck = [];
let wrongWords = [];
let currentWord = null;

function loadWords() {
  fetch('words.json')
    .then(response => response.json())
    .then(data => {
      words = data;
      mainDeck = [...words];
      showNextWord();
    })
    .catch(error => console.error("加载词汇数据失败：", error));
}

function showNextWord() {
  if (mainDeck.length === 0 && wrongWords.length === 0) {
    document.getElementById("word").textContent = "恭喜，全部完成!";
    document.getElementById("btnTrue").disabled = true;
    document.getElementById("btnFalse").disabled = true;
    return;
  }
  if (mainDeck.length === 0) {
    mainDeck = [...wrongWords];
    wrongWords = [];
  }
  const index = Math.floor(Math.random() * mainDeck.length);
  currentWord = mainDeck[index];
  currentWord.index = index;
  document.getElementById("word").textContent = currentWord.text;
  document.getElementById("feedback").textContent = "";
}

document.getElementById("btnTrue").addEventListener("click", function() {
  if (currentWord) {
    if (currentWord.isTrue) {
      document.getElementById("feedback").textContent = "正确！";
      mainDeck.splice(currentWord.index, 1);
    } else {
      document.getElementById("feedback").textContent = "错误！";
      if (!wrongWords.some(w => w.text === currentWord.text)) {
        wrongWords.push(currentWord);
      }
    }
    setTimeout(showNextWord, 1000);
  }
});

document.getElementById("btnFalse").addEventListener("click", function() {
  if (currentWord) {
    if (!currentWord.isTrue) {
      document.getElementById("feedback").textContent = "正确！";
      mainDeck.splice(currentWord.index, 1);
    } else {
      document.getElementById("feedback").textContent = "错误！";
      if (!wrongWords.some(w => w.text === currentWord.text)) {
        wrongWords.push(currentWord);
      }
    }
    setTimeout(showNextWord, 1000);
  }
});

loadWords();
