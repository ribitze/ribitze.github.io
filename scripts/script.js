// custom querySelector – NOT jquery!
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
//–––––––––––––––––––––––––––––––––––––––––––––––––
const title = $('#title');
const container = $('.container');
const body = $('body');
// footer-elements
const kanjiControl = $('#kanji-control');
const inputKanji = $('#input-kanji');
const kanjiBtn = $('#create-kanji');
const highlightSearch = $('.highlight-search');
const darkModeBtn = $('#dark-mode-btn');
const darkModeIcon = $('.fa-sun-o');
const kanjiCounter = $('#kanji-counter');
// main-kanji
const kanjiMain = $('.kanji');
// footer: input-values
const kanji = $('.symbol');
const kun = $('#kun-reading');
const on = $('#on-reading');
const meaning = $('#meaning-print');
// kanji-words
const kanjiWords = $('.kanji-words');
// kanji-stash
const kanjiStash = $('#kanji-stash');
const kanjiList = $('.kanji-list');
const hoverClass = $('.hover-state');
// sidebar
const sidebar = $('.sidebar');
const sidebarContent = $('#sidebar-content');
const sidebarBtn = $('#sidebar-button');
const sidebarSmall = '20vw'; // global sidebar-values
const sidebarBig = '55vw';
// if Dark-Mode is turned on == true (default)
let isDark = true;
// example-kanji
const onLoadValue = '入';
// 'stashKanji': kanji + ID
let stashedKanji = [];
// 'showSentences': kanji / jap + eng
let sentences = [];

// kanji-stash
function stashKanji() {
  let counter = 1;
  for (const kanji of kanjis) {
    let kanjiName = `kan${counter}`;
    let stashElement = document.createElement('div');
    stashElement.textContent = kanji;
    stashElement.id = kanjiName;
    stashElement.className = 'kanji-list';
    stashElement.setAttribute('onclick', `clickOnKanji(${kanjiName})`);
    kanjiStash.appendChild(stashElement);
    stashedKanji.push({
      char: `${kanji}`,
      id: `${kanjiName}`,
    });
    counter++;
  }
}

function createKanji(char) {
  fetch('../kanji.json')
    .then(response => response.json())
    .then(data => {
      if (data[char]) {
        let entries = data[char];

        kanji.textContent = char;
        kun.textContent = `kun: ${entries.readings_kun.join('. ')}`;
        on.textContent = `on: ${entries.readings_on.join('. ')}`;
        meaning.textContent = `${entries.meanings.join(', ')}`.toLowerCase();
        title.firstChild.textContent =
          `${char}-${entries.meanings[0]}`.toLowerCase();
      } else {
        let noValue = '?';
        kanji.innerHTML = noValue;
        kun.innerHTML = noValue;
        on.textContent = noValue;
        meaning.textContent = noValue;
      }
    });
  showSentences(char);
}

function createWords(char) {
  fetch(`../jisho/${char}.json`)
    .then(response => response.json())
    .then(jisho => {
      let len = jisho.data.length;
      kanjiWords.textContent = '';
      for (let i = 0; i < len; i++) {
        let jap = jisho.data[i].slug;
        let eng = jisho.data[i].senses[0].english_definitions.join(', ');

        let japWord = document.createElement('div');
        japWord.id = `jap${i}`;
        japWord.textContent = `${jap} `;
        japWord.className = 'jap-word';
        japWord.setAttribute('ondblclick', `copyToClipBoard(${japWord.id})`);
        kanjiWords.appendChild(japWord);
        //–––
        let engWord = document.createElement('div');
        engWord.id = `eng${i}`;
        engWord.textContent = eng;
        engWord.className = 'eng-word';
        engWord.setAttribute('ondblclick', `copyToClipBoard(${engWord.id})`);
        kanjiWords.appendChild(engWord);
      }
    })
    .catch(e => {
      console.log(e);
    });
  kanjiWords.scrollTo(0, 0);
}

function showWords() {
  if (kanjiWords.style.display === 'none') {
    kanji.style.display = 'none';
    kun.style.display = 'none';
    on.style.display = 'none';
    meaning.style.display = 'none';
    kanjiWords.style.display = 'block';
  } else {
    kanji.style.removeProperty('display');
    kun.style.removeProperty('display');
    on.style.removeProperty('display');
    meaning.style.removeProperty('display');
    kanjiWords.style.display = 'none';
  }
}

function clickOnKanji(name) {
  createKanji(name.textContent);
  createWords(name.textContent);
}

function highlightKanji() {
  //const dayHighlight = '#ff7f7f';
  const dayHighlight = '#13949d';
  const dayDefault = '#000';
  const darkHighlight = 'rgb(247, 183, 104)';
  const darkDefault = 'rgb(47, 187, 180)';

  let endValue = kanjis.length + 1;
  let userValue = endValue + Number(kanjiCounter.value) + 1 - endValue;

  for (i = 1; i < userValue; i++) {
    let selection = $(`#kan${i}`);

    isDark
      ? (selection.style.color = darkHighlight)
      : (selection.style.color = dayHighlight);
  }

  for (i = userValue; i < endValue; i++) {
    let selection = $(`#kan${i}`);

    isDark
      ? (selection.style.color = darkDefault)
      : (selection.style.color = dayDefault);
  }
}

function scrollToKanji(char) {
  for (let i = 0; i < stashedKanji.length; i++) {
    let kanjiData = stashedKanji[i].char;
    let kanjiID = stashedKanji[i].id;

    if (kanjiData.includes(char)) {
      let selected = $(`#${kanjiID}`);
      if (char === '') {
        return;
      } else {
        selected.scrollIntoView();
        // highlights the entered kanji until 'input-kanji' is used again:
        selected.classList.add('highlight-search');
        inputKanji.addEventListener('click', () => {
          selected.classList.remove('highlight-search');
        });
      }
    }
  }
}

function showSentences(char) {
  sentences.length = 0;
  fetch('../all_v10.json')
    .then(response => response.json())
    .then(data => {
      if (data) {
        let trueCounter = 0;
        let maximum = 100;
        sidebar.textContent = '';
        for (let i = 0; i < data.length; i++) {
          let japData = data[i].jap;
          let engData = data[i].eng;
          let japSentence = document.createElement('div');
          let engSentence = document.createElement('div');
          if (japData.includes(char) && engData) {
            trueCounter += 1;
            // Japanese
            japSentence.textContent = data[i].jap;
            japSentence.id = `jap${trueCounter}`;
            japSentence.className = 'jap-sentence';
            japSentence.setAttribute(
              'ondblclick',
              `copyToClipBoard(${japSentence.id})`
            );
            sidebar.appendChild(japSentence);
            // English
            engSentence.textContent = data[i].eng;
            engSentence.id = `eng${trueCounter}`;
            engSentence.className = 'eng-sentence';
            engSentence.setAttribute(
              'ondblclick',
              `copyToClipBoard(${engSentence.id})`
            );
            sidebar.appendChild(engSentence);
            //
            sentences.push({
              char: `${char}`,
              jap: `${japSentence.textContent}`,
              eng: `${engSentence.textContent}`,
            });
            if (trueCounter == maximum) break;
          }
        }
      }
      if (char === '') {
        sidebar.textContent = 'Please enter a symbol!';
        sidebar.style.fontFamily = 'Roboto Medium';
      } else {
        sidebar.style.fontFamily = 'Roboto Light';
      }
      sidebar.scrollTo(0, 0);
      return sentences;
    });
}

function copyToClipBoard(data) {
  // DOM-method
  console.log(data);
  navigator.clipboard.writeText(data.textContent);
}

function expandSidebar() {
  const small = sidebarSmall;
  const big = sidebarBig;

  sidebar.style.width > small
    ? (sidebar.style.width = small)
    : (sidebar.style.width = big);

  if (sidebar.style.width === big) {
    kanjiMain.style.display = 'none';
  } else if (sidebar.style.width !== big) {
    kanjiMain.style.removeProperty('display');
    //restoring properties after 'smallSideBar()'
    sidebar.style.display = 'flex';
    sidebar.style.textAlign = 'left';
    kanjiStash.style.display = 'flex';
  }
}

function smallSideBar() {
  const expandedSidebar = '75vw';
  if (window.innerWidth <= 970) {
    if (sidebar.style.display === 'none') {
      sidebar.style.display = 'flex';
      sidebar.style.width = expandedSidebar;
      sidebar.style.textAlign = 'center';
      kanjiMain.style.display = 'none';
      kanjiStash.style.display = 'none';
    } else {
      kanjiStash.style.display = 'flex';
      sidebar.style.display = 'none';
      kanjiMain.style.removeProperty('display');
    }
  }
}

function checkWindow() {
  const small = sidebarSmall;
  const big = sidebarBig;
  let smallScreen = 970;

  if (window.innerWidth <= smallScreen) {
    if (sidebar.style.display === 'none' || sidebar.style.width <= big) {
      kanjiMain.style.removeProperty('display');
      sidebar.style.display = 'none';
      sidebar.style.width = small;
    }
  } else if (window.innerWidth > smallScreen) {
    sidebar.style.display = 'flex';
    if (sidebar.style.width > small) {
      kanjiMain.style.display = 'none';
    }
  }
}

/* function toggleKanjiFullScreen() {
  const smallStash = '20vw';
  const expandedStash = '86vw';
  const bigBtn = '48px';
  const smallBtn = '32px';
  const inputSmall = '24px';
  const inputBig = '64px';
  const smallFont = '16px';
  const bigFont = '23px';

  kanjiStash.style.width > smallStash
    ? (kanjiStash.style.width = smallStash)
    : (kanjiStash.style.width = expandedStash);

  kanjiStash.style.fontSize > smallFont
    ? (kanjiStash.style.fontSize = smallFont)
    : (kanjiStash.style.fontSize = bigFont);

  if (kanjiStash.style.width === expandedStash) {
    kanjiStash.style.letterSpacing = '0.4em';
    kanjiFooter.style.removeProperty('bottom');
    kanjiFooter.style.display = 'grid';
    kanjiMain.style.display = 'none';
    sidebar.style.display = 'none';
    sidebarBtn.style.display = 'none';
    inputKanji.style.width = inputSmall;
    inputKanji.style.height = bigBtn;
    kanjiBtn.style.height = bigBtn;
    darkModeBtn.style.height = bigBtn;
    kanjiToggleBtn.style.height = bigBtn;
  } else if (kanjiStash.style.width !== expandedStash) {
    kanjiStash.style.letterSpacing = '0.2em';
    kanjiFooter.style.removeProperty('display');
    // checks if sidebar is (still) expanded
    if (sidebar.style.width > '22vw') {
      kanjiMain.style.display = 'none';
    } else {
      kanjiMain.style.removeProperty('display');
    }
    //––––––––––––––––––––––––––
    sidebar.style.display = 'flex';
    sidebarBtn.style.removeProperty('display');
    //
    inputKanji.style.width = inputBig;
    inputKanji.style.height = inputSmall;
    kanjiBtn.style.height = smallBtn;
    darkModeBtn.style.height = smallBtn;
    kanjiToggleBtn.style.height = smallBtn;
  }
} */

function changeFooter(boolean) {
  if (boolean) {
    inputKanji.style.background = '#d5fff1';
    kanjiBtn.style.background = '#bf78e2';
    darkModeBtn.style.background = '#765ad4';
    /* kanjiToggleBtn.style.background = '#c76a32'; */
  } else if (!boolean) {
    inputKanji.style.background = '#b3fce4';
    kanjiBtn.style.background = '#c95ef7';
    darkModeBtn.style.background = '#825dfc';
    /* kanjiToggleBtn.style.background = '#f07e3a'; */
  }
}

function toggleDarkMode() {
  const day = '#fff';
  const night = '#231433';
  const mainDay = '#000';
  const mainNight = '#e0e0ce';
  const stashNight = '#2fbbb4';
  if (isDark) {
    isDark = false;
    body.style.background = day;
    kanjiMain.style.color = mainDay;
    kanjiStash.style.color = mainDay;
    sidebar.style.color = mainDay;
    /*sidebar.style.borderLeft = `1px solid ${mainDay}`; */
    darkModeIcon.className = 'fa fa-moon-o';
  } else if (!isDark) {
    isDark = true;
    body.style.background = night;
    kanjiMain.style.color = mainNight;
    kanjiStash.style.color = stashNight;
    sidebar.style.color = mainNight;
    /*sidebar.style.borderLeft = `1px solid ${mainNight}`; */
    darkModeIcon.className = 'fa fa-sun-o';
  }
  changeFooter(isDark);
  highlightKanji();
}

document.onkeydown = function keyPress(event) {
  /* gets rid of all elements except the main-kanji – for   printing */
  if (event.key === 'Escape') {
    kanjiControl.style.display === 'none'
      ? (kanjiControl.style.display = 'block')
      : (kanjiControl.style.display = 'none');

    kanjiStash.style.display === 'none'
      ? (kanjiStash.style.display = 'flex')
      : (kanjiStash.style.display = 'none');

    sidebar.style.display === 'none'
      ? (sidebar.style.display = 'flex')
      : (sidebar.style.display = 'none');

    sidebarBtn.style.display === 'none'
      ? sidebarBtn.style.removeProperty('display')
      : (sidebarBtn.style.display = 'none');
  }

  //––––––––––––––––––––––––––––––––––––––––
  if (event.key === 'Enter') {
    createKanji(inputKanji.value);
    scrollToKanji(inputKanji.value);
  }
  if (event.ctrlKey && event.key === ' ') toggleDarkMode();
  if (event.ctrlKey && event.key === 'Backspace') {
    showWords();
  }
  if (event.key === 'PageUp') kanjiStash.scrollTo(0, 0);
};

function scrollStash(event) {
  event = event || window.event;
  kanjiStash.style.cursor = 'grab';
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    kanjiStash.style.cursor = 'grabbing';
    kanjiStash.style.userSelect = 'none';

    pos = {
      left: kanjiStash.scrollLeft,
      top: kanjiStash.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (event) {
    // How far the mouse has been moved
    const dx = event.clientX - pos.x;
    const dy = event.clientY - pos.y;

    // Scroll the element
    kanjiStash.scrollTop = pos.top - dy;
    kanjiStash.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    kanjiStash.style.cursor = 'grab';
    kanjiStash.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  // Attach the handler
  kanjiStash.addEventListener('mousedown', mouseDownHandler);
}

function scrollSidebar(event) {
  event = event || window.event;
  sidebar.style.cursor = 'grab';
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    sidebar.style.cursor = 'grabbing';
    sidebar.style.userSelect = 'none';

    pos = {
      left: sidebar.scrollLeft,
      top: sidebar.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (event) {
    // How far the mouse has been moved
    const dx = event.clientX - pos.x;
    const dy = event.clientY - pos.y;

    // Scroll the element
    sidebar.scrollTop = pos.top - dy;
    sidebar.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    sidebar.style.cursor = 'grab';
    sidebar.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  // Attach the handler
  sidebar.addEventListener('mousedown', mouseDownHandler);
}

function scrollWords(event) {
  event = event || window.event;
  kanjiWords.style.cursor = 'grab';
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    kanjiWords.style.cursor = 'grabbing';
    kanjiWords.style.userSelect = 'none';

    pos = {
      left: kanjiWords.scrollLeft,
      top: kanjiWords.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (event) {
    // How far the mouse has been moved
    const dx = event.clientX - pos.x;
    const dy = event.clientY - pos.y;

    // Scroll the element
    kanjiWords.scrollTop = pos.top - dy;
    kanjiWords.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    kanjiWords.style.cursor = 'grab';
    kanjiWords.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  // Attach the handler
  kanjiWords.addEventListener('mousedown', mouseDownHandler);
}

function loadActions() {
  stashKanji();
  createKanji(onLoadValue);
  changeFooter(isDark);
  smallSideBar();
  checkWindow();
}

//–––––––––––––––EVENTS––––––––––––––––––
// footer – button-events
kanjiBtn.addEventListener('click', () => {
  createKanji(inputKanji.value);
  scrollToKanji(inputKanji.value);
});
darkModeBtn.addEventListener('click', toggleDarkMode);
kanjiCounter.addEventListener('input', highlightKanji);
kanjiMain.addEventListener('auxclick', () => {
  createWords(kanji.textContent);
  showWords();
});

/* kanjiToggleBtn.addEventListener('click', toggleKanjiFullScreen); */
// sidebar-button
sidebarBtn.addEventListener('click', () => {
  expandSidebar();
  smallSideBar();
});
// scroll-behaviour
document.addEventListener('DOMContentLoaded', () => {
  scrollStash(), scrollSidebar();
  scrollWords();
  highlightKanji();
});
// stash Kanji on windowload
window.onload = loadActions();
window.addEventListener('resize', checkWindow);
