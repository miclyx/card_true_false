let words = [];
let mainDeck = [];
let wrongWords = [];
let currentWord = null;

const supabaseUrl = 'https://ghjtiktynoidljnthqjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoanRpa3R5bm9pZGxqbnRocWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzY4MjgsImV4cCI6MjA0ODg1MjgyOH0.pff0q4Zz7HxE1MvlXOblZRpV-javKLJdexVyl_wc0IE';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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
