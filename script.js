const supabaseUrl = 'https://ghjtiktynoidljnthqjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoanRpa3R5bm9pZGxqbnRocWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzY4MjgsImV4cCI6MjA0ODg1MjgyOH0.pff0q4Zz7HxE1MvlXOblZRpV-javKLJdexVyl_wc0IE';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 全局变量
let words = [];       // 所有单词数据（从 words.json 加载）
let mainDeck = [];    // 当前需要练习的单词（包含正确计数）
let wrongWords = [];  // 答错的单词记录（可选，用于统计或后续复习）
let currentWord = null;

// 从 words.json 加载所有单词
function loadWords() {
  fetch('words.json')
    .then(response => response.json())
    .then(data => {
      words = data;
      // 初始化 mainDeck 为所有单词
      mainDeck = [...words];
      // 尝试从 Supabase 加载进度
      loadProgress();
    })
    .catch(error => {
      console.error("加载词汇数据失败：", error);
      mainDeck = [...words];
      showNextWord();
    });
}

// 确保每个单词都有 correctCount 属性
function initWord(word) {
  if (word.correctCount === undefined) {
    word.correctCount = 0;
  }
}

// 显示下一个单词
function showNextWord() {
  if (mainDeck.length === 0 && wrongWords.length === 0) {
    document.getElementById("word").textContent = "恭喜，全部完成!";
    document.getElementById("btnTrue").disabled = true;
    document.getElementById("btnFalse").disabled = true;
    return;
  }
  if (mainDeck.length === 0) {
    // 如果主词库为空，将错误记录重新合并进来
    mainDeck = [...wrongWords];
    wrongWords = [];
  }
  // 随机选择一个单词
  const index = Math.floor(Math.random() * mainDeck.length);
  currentWord = mainDeck[index];
  currentWord.index = index; // 保存当前索引，方便后续移除操作
  document.getElementById("word").textContent = currentWord.text;
  document.getElementById("feedback").textContent = "";
}

// 保存进度到 Supabase
async function saveProgress() {
  const progressData = {
    mainDeck: mainDeck,
    wrongWords: wrongWords
  };

  // 使用 upsert（若 id 冲突则更新）
  const { data, error } = await supabaseClient
    .from('progress')
    .upsert({
      id: 1,
      progress_data: progressData,
      updated_at: new Date()
    }, { onConflict: 'id' });

  if (error) {
    console.error("保存进度出错：", error.message);
  } else {
    console.log("进度保存成功", data);
  }
}

// 从 Supabase 加载进度
async function loadProgress() {
  const { data, error } = await supabaseClient
    .from('progress')
    .select('progress_data')
    .eq('id', 1)
    .single();

  if (error) {
    console.error("加载进度出错：", error.message);
    // 如果没有数据，则用全部单词初始化 mainDeck
    mainDeck = [...words];
  } else if (data && data.progress_data) {
    const progressData = data.progress_data;
    // 恢复进度数据：如果存在则覆盖 mainDeck 和 wrongWords，否则初始化为所有单词
    mainDeck = progressData.mainDeck || [...words];
    wrongWords = progressData.wrongWords || [];
  } else {
    mainDeck = [...words];
  }
  showNextWord();
}

// 按钮点击事件：选择“对”
document.getElementById("btnTrue").addEventListener("click", function() {
  if (currentWord) {
    initWord(currentWord);
    if (currentWord.isTrue) {
      currentWord.correctCount++;
      document.getElementById("feedback").textContent = "正确！ (" + currentWord.correctCount + " / 3)";
      // 累计答对三次后，移除该单词
      if (currentWord.correctCount >= 3) {
        mainDeck.splice(currentWord.index, 1);
      }
    } else {
      document.getElementById("feedback").textContent = "错误！";
      // 答错时，不重置累计答对次数
      if (!wrongWords.some(w => w.text === currentWord.text)) {
        wrongWords.push(currentWord);
      }
    }
    saveProgress();
    setTimeout(showNextWord, 1000);
  }
});

// 按钮点击事件：选择“错”
document.getElementById("btnFalse").addEventListener("click", function() {
  if (currentWord) {
    initWord(currentWord);
    if (!currentWord.isTrue) {
      currentWord.correctCount++;
      document.getElementById("feedback").textContent = "正确！ (" + currentWord.correctCount + " / 3)";
      if (currentWord.correctCount >= 3) {
        mainDeck.splice(currentWord.index, 1);
      }
    } else {
      document.getElementById("feedback").textContent = "错误！";
      if (!wrongWords.some(w => w.text === currentWord.text)) {
        wrongWords.push(currentWord);
      }
    }
    saveProgress();
    setTimeout(showNextWord, 1000);
  }
});

// 页面加载后启动词汇加载
document.addEventListener("DOMContentLoaded", function() {
  loadWords();
});
