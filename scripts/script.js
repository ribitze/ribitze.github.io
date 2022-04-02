// custom querySelector – NOT jquery!
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
//–––––––––––––––––––––––––––––––––––––––––––––––––
const title = $('#title');
const container = $('.container');
const body = $('body');
// footer-elements
const kanjiFooter = $('#kanji-footer');
const inputKanji = $('#input-kanji');
const kanjiBtn = $('#create-kanji');
const darkModeBtn = $('#dark-mode-btn');
const darkModeIcon = $('.fa-sun-o');
const kanjiToggleBtn = $('#kanji-toggle');
const kanjiMain = $('.kanji');
// footer: input-values
const kanji = $('.symbol');
const kun = $('#kun-reading');
const on = $('#on-reading');
const meaning = $('#meaning-print');
// kanji-stash
const kanjiStash = $('#kanji-stash');
const kanjiList = $('.kanji-list');
const hoverClass = $('.hover-state');
// sidebar
const sidebar = $('.sidebar');
const sidebarContent = $('#sidebar-content');

/*const japSentence = $('.jap-sentence');
const engSentence = $('.eng-sentence');*/
const foldBtn = $('#fold-button');
// if Dark-Mode is turned on == true (default)
let isDark = true;
// if toggleKanjiFullScreen is active
const isFullScreen = false;
// example-kanji
const onLoadValue = '入';

// kanji-stash
function stashKanji() {
  let counter = 1;
  for (const kanji of kanjis) {
    let kanjiName = `kanji${counter}`;
    let divElement = document.createElement('div');
    divElement.textContent = kanji;
    divElement.id = kanjiName;
    divElement.className = 'kanji-list';
    divElement.setAttribute('onclick', `clickOnKanji(${kanjiName})`);
    kanjiStash.appendChild(divElement);
    counter++;
  }
}

function createKanji(char) {
  fetch('../kanji.json')
    .then(response => response.json())
    .then(data => {
      if (data[char]) {
        let entries = data[char];

        kanji.innerHTML = char;
        kun.innerHTML = entries.readings_kun.join('. ');
        on.textContent = entries.readings_on.join('. ');
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

function clickOnKanji(name) {
  createKanji(name.textContent);
  kanjiStash.addEventListener('dblclick', () => {
    if (kanjiStash.style.width === '86vw') toggleKanjiFullScreen();
  });
}

function showSentences(char) {
  let sentences = [];
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
              'onclick',
              `copyToClipBoard(${japSentence.id})`
            );
            sidebar.appendChild(japSentence);
            // English
            engSentence.textContent = data[i].eng;
            engSentence.id = `eng${trueCounter}`;
            engSentence.className = 'eng-sentence';
            engSentence.setAttribute(
              'onclick',
              `copyToClipBoard(${engSentence.id})`
            );
            sidebar.appendChild(engSentence);
            //
            sentences.push({
              char: `${char}`,
              jap: `${japSentence.textContent}`,
              eng: `${engSentence.textContent}`,
            });
            //
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

      //
      sidebar.scrollTo(0, 0);
      return sentences;
    });
}

function copyToClipBoard(data) {
  navigator.clipboard.writeText(data.textContent);
}

function expandSidebar() {
  const sidebarSmall = '22vw';
  const sidebarBig = '55vw';

  sidebar.style.width > sidebarSmall
    ? (sidebar.style.width = sidebarSmall)
    : (sidebar.style.width = sidebarBig);

  if (sidebar.style.width === sidebarBig) {
    kanjiMain.style.display = 'none';
  } else if (sidebar.style.width !== sidebarBig) {
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
  const sidebarSmall = '22vw';
  const sidebarBig = '55vw';
  let smallScreen = 970;

  if (window.innerWidth <= smallScreen) {
    if (sidebar.style.display === 'none' || sidebar.style.width <= sidebarBig) {
      kanjiMain.style.removeProperty('display');
      sidebar.style.display = 'none';
      sidebar.style.width = sidebarSmall;
      kanjiFooter.style.zIndex = '-1';
    }
  } else if (window.innerWidth > smallScreen) {
    sidebar.style.display = 'flex';
    if (sidebar.style.width > sidebarSmall) {
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
    foldBtn.style.display = 'none';
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
    foldBtn.style.removeProperty('display');
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
}

document.onkeydown = function keyPress(event) {
  /* gets rid of all elements except the main-kanji – for   printing */
  if (event.key === 'Escape') {
    kanjiFooter.style.display === 'none'
      ? (kanjiFooter.style.display = 'block')
      : (kanjiFooter.style.display = 'none');

    kanjiStash.style.display === 'none'
      ? (kanjiStash.style.display = 'flex')
      : (kanjiStash.style.display = 'none');

    sidebar.style.display === 'none'
      ? (sidebar.style.display = 'flex')
      : (sidebar.style.display = 'none');

    foldBtn.style.display === 'none'
      ? foldBtn.style.removeProperty('display')
      : (foldBtn.style.display = 'none');
  }

  //––––––––––––––––––––––––––––––––––––––––
  if (event.key === 'Enter') createKanji(inputKanji.value);
  if (event.ctrlKey && event.key === 'Enter') toggleKanjiFullScreen();
  if (event.ctrlKey && event.key === ' ') toggleDarkMode();
  if (event.key === 'ArrowUp') kanjiStash.scrollTo(0, 0);
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

function loadActions() {
  stashKanji();
  createKanji(onLoadValue);
  changeFooter(isDark);
  smallSideBar();
  checkWindow();
}

//–––––––––––––––EVENTS––––––––––––––––––
// footer – button-events
kanjiBtn.addEventListener('click', () => createKanji(inputKanji.value));
darkModeBtn.addEventListener('click', toggleDarkMode);
/* kanjiToggleBtn.addEventListener('click', toggleKanjiFullScreen); */
// fold-button
foldBtn.addEventListener('click', () => {
  expandSidebar();
  smallSideBar();
});
// scroll-behaviour
document.addEventListener('DOMContentLoaded', () => {
  scrollStash(), scrollSidebar();
});
// stash Kanji on windowload
window.onload = loadActions();
window.addEventListener('resize', checkWindow);
