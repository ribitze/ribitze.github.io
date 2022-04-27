// custom querySelector – NOT jquery!
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
//–––––––––––––––––––––––
const title = $("#title");
const container = $(".container");
const body = $("body");
// footer-elements
const kanjiControl = $("#kanji-control");
const inputKanji = $("#input-kanji");
const kanjiBtn = $("#create-kanji");
const highlightSearch = $(".highlight-search");
const darkModeBtn = $("#dark-mode-btn");
const darkModeIcon = $(".fa-sun-o");
const kanjiCounterBtn = $("#kanji-counter");
// main-kanji
const kanjiMain = $(".kanji");
const kanji = $(".symbol");
const kun = $("#kun-reading");
const on = $("#on-reading");
const meaning = $("#meaning-print");
const kanjiTree = $("#tree");
// meta-data
const metaData = $(".meta-data");
const metaRadical = $(".radical");
/* const metaParts = $(".parts"); */
const metaFrequency = $(".frequency");
const metaRelated = $(".related");
// kanji-words
const kanjiWords = $(".kanji-words");
// kanji-stash
const kanjiStash = $("#kanji-stash");
const kanjiList = $(".kanji-list");
const hoverClass = $(".hover-state");
// sidebar
const sidebar = $(".sidebar");
const sidebarBtn = $("#sidebar-button");
const sidebarSmall = "20vw"; // global sidebar-values
const sidebarBig = "55vw";
// 'stashKanji': kanji + ID
let stashedKanji = [];
// if Dark-Mode is turned on == true (default)
let isDark = true;
// defines which kanji is shown on window.load
let onLoadValue = "一";
kanjiCounterBtn.value = "";

// kanji-stash
function stashKanji() {
  let counter = 1;
  for (const kanji of kanjis) {
    let kanjiName = `kan${counter}`;
    let stashElement = document.createElement("div");
    stashElement.textContent = kanji;
    stashElement.id = kanjiName;
    stashElement.className = "kanji-list";
    stashElement.setAttribute("onclick", `clickOnKanji(${kanjiName})`);
    kanjiStash.appendChild(stashElement);
    stashedKanji.push({
      char: `${kanji}`,
      id: `${kanjiName}`,
    });
    counter++;
  }
}

function clickOnKanji(name) {
  createKanji(name.textContent);
  highlightClicked(name.id);
}

function clickOnRelated(name) {
  createKanji(name.textContent);
  scrollToKanji(name.textContent);
}

function createKanji(char) {
  fetch("../kanji.json")
    .then(response => response.json())
    .then(data => {
      if (char.length > 1) {
        let matches = [];
        char = char.toLowerCase();
        for (let kan of kanjis) {
          data[kan].meanings = data[kan].meanings.toString().toLowerCase();
          if (data[kan].meanings.includes(char) || char[0] === kan) {
            matches.push(kan);
          }
        }
        if (matches.length === 0) {
          matches.push("");
        }
        let newChar = matches[0];
        createKanji(newChar);
        scrollToKanji(newChar);
        console.log(matches.join(" · "));
        //
      } else if (data[char]) {
        let entries = data[char];
        kanji.textContent = char;
        kun.textContent = `${entries.readings_kun.join(" • ")}`;
        on.textContent = `${entries.readings_on.join(" • ")}`;
        meaning.textContent = `${entries.meanings.join(", ")}`.toLowerCase();
        metaRadical.textContent = `${entries.radical} ⏐ ${entries.kangxi}`;
        metaRadical.id = `${entries.kangxi}`;

        /*if (entries.parts !== "") {
          metaParts.textContent = `${entries.parts.join(" · ")}`;
        }*/

        entries.freq === null
          ? (metaFrequency.textContent = "▲ –")
          : (metaFrequency.textContent = `▲ ${entries.freq}`);
        title.firstChild.textContent =
          `${char}-${entries.meanings[0]}`.toLowerCase();
      } else {
        let noValue = "?";
        let empty = "•";
        kanji.innerHTML = noValue;
        kun.innerHTML = empty;
        on.textContent = empty;
        meaning.textContent = noValue;
        metaRadical.textContent = empty;
        metaFrequency.textContent = empty;
        metaRelated.textContent = empty;
      }

      if (data[char] === undefined) {
        return;
      } else {
        (async () => {
          await createTree(char);
        })();
      }

      if (data[char].parts !== "") {
        metaRelated.textContent = "";
        metaRelated.style.display = "flex";
        let matchCounter = 0;
        let maximum = 102;

        for (let kanji of kanjis) {
          if (data[kanji].parts.includes(char)) {
            let relatedElement = document.createElement("div");
            relatedElement.className = "related-kanji";
            relatedElement.id = `rel${matchCounter}`;
            relatedElement.textContent = kanji;
            relatedElement.setAttribute(
              "onclick",
              `clickOnRelated(${relatedElement.id})`
            );
            if (kanji == data[kanji].parts) {
              continue;
            } else {
              metaRelated.appendChild(relatedElement);
              matchCounter++;
            }
            if (matchCounter == maximum) break;
          }
        }
      } else {
        metaRelated.textContent = "";
        metaRelated.style.display = "none";
      }

      checkMeta(char);

      function checkMeta(char) {
        data[char].kangxi === ""
          ? (metaRadical.style.display = "none")
          : metaRadical.style.removeProperty("display");

        /* data[char].parts === ""
          ? (metaParts.style.display = "none")
          : metaParts.style.removeProperty("display"); */

        data[char].freq !== undefined
          ? metaFrequency.style.removeProperty("display")
          : (metaFrequency.style.display = "none");
      }
    });
  setTimeout(() => {
    createSentences(char);
  }, 150);
  setTimeout(() => {
    if (char.length === 1) {
      createWords(char);
    }
  }, 100);
}

function createSentences(char) {
  fetch("../all_v10.json")
    .then(response => response.json())
    .then(data => {
      if (data) {
        let trueCounter = 0;
        let maximum = 100;
        sidebar.textContent = "";
        for (let i = 0; i < data.length; i++) {
          let japData = data[i].jap;
          let engData = data[i].eng;
          let japSentence = document.createElement("div");
          let engSentence = document.createElement("div");
          if (japData.includes(char) && engData) {
            trueCounter += 1;
            // Japanese
            japSentence.textContent = japData;
            japSentence.id = `jap${trueCounter}`;
            japSentence.className = "jap-sentence";
            japSentence.setAttribute(
              "ondblclick",
              `copyToClipBoard(${japSentence.id})`
            );
            sidebar.appendChild(japSentence);
            // English
            engSentence.textContent = engData;
            engSentence.id = `eng${trueCounter}`;
            engSentence.className = "eng-sentence";
            engSentence.setAttribute(
              "ondblclick",
              `copyToClipBoard(${engSentence.id})`
            );
            sidebar.appendChild(engSentence);
            //
            if (trueCounter == maximum) break;
          }
        }
      }
      if (char === "") {
        sidebar.textContent = "Please enter a symbol!";
        sidebar.style.fontFamily = "Roboto Medium";
      } else {
        sidebar.style.fontFamily = "Roboto Light";
      }
      sidebar.scrollTo(0, 0);
    });
}

function createWords(char) {
  fetch(`../jisho/${char}.json`)
    .then(response => response.json())
    .then(jisho => {
      let len = jisho.data.length;
      kanjiWords.textContent = "";
      for (let i = 0; i < len; i++) {
        let jap = jisho.data[i].slug;
        let reading = jisho.data[i].japanese[0].reading;
        let eng = jisho.data[i].senses[0].english_definitions
          .join(", ")
          .toLowerCase();

        let japReading = document.createElement("div");
        japReading.id = `japReading${i}`;
        japReading.textContent = `${reading}`;
        japReading.className = "jap-reading";
        japReading.setAttribute(
          "ondblclick",
          `copyToClipBoard(${japReading.id})`
        );
        kanjiWords.appendChild(japReading);
        //–––
        let japWord = document.createElement("div");
        japWord.id = `japWord${i}`;
        japWord.textContent = jap;
        japWord.className = "jap-word";
        japWord.setAttribute("ondblclick", `copyToClipBoard(${japWord.id})`);
        kanjiWords.appendChild(japWord);
        //–––
        let engWord = document.createElement("div");
        engWord.id = `engWord${i}`;
        engWord.textContent = eng;
        engWord.className = "eng-word";
        engWord.setAttribute("ondblclick", `copyToClipBoard(${engWord.id})`);
        kanjiWords.appendChild(engWord);

        if (jisho.data[i].is_common) {
          japWord.style.color = "#13949d";
        }
      }
    })
    .catch(e => {
      //console.log(e);
      return;
    });
  kanjiWords.scrollTo(0, 0);
}

async function createTree(char) {
  let response = await fetch(`../kanji-tree/${char}.txt`);
  let responseText = await response.text();
  response.status === 404
    ? (kanjiTree.textContent = "—")
    : (kanjiTree.textContent = responseText);
}

function showWords() {
  if (kanjiWords.style.display === "none") {
    kanji.style.display = "none";
    kun.style.display = "none";
    on.style.display = "none";
    meaning.style.display = "none";
    metaData.style.display = "none";
    kanjiTree.style.display = "none";
    kanjiWords.style.display = "flex";
  } else {
    kanji.style.removeProperty("display");
    kun.style.removeProperty("display");
    on.style.removeProperty("display");
    meaning.style.removeProperty("display");
    metaData.style.removeProperty("display");
    kanjiTree.style.display = "none";
    kanjiWords.style.display = "none";
  }
}

function showTree() {
  if (kanjiTree.style.display === "none") {
    kanji.style.display = "none";
    kun.style.display = "none";
    on.style.display = "none";
    meaning.style.display = "none";
    metaData.style.display = "none";
    kanjiWords.style.display = "none";
    kanjiTree.style.display = "flex";
  } else {
    kanji.style.removeProperty("display");
    kun.style.removeProperty("display");
    on.style.removeProperty("display");
    meaning.style.removeProperty("display");
    metaData.style.removeProperty("display");
    kanjiWords.style.display = "none";
    kanjiTree.style.display = "none";
  }
}

function highlightKanji() {
  //const dayHighlight = '#ff7f7f';
  const dayHighlight = "#13949d";
  const dayDefault = "#000";
  const darkHighlight = "rgb(247, 183, 104)";
  const darkDefault = "rgb(47, 187, 180)";

  let endValue = kanjis.length + 1;
  let userValue = endValue + Number(kanjiCounterBtn.value) + 1 - endValue;

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

function highlightClicked(char) {
  let clicked = $(`#${char}`);
  clicked.classList.add("highlight-search");
  kanjiStash.addEventListener("auxclick", () => {
    clicked.classList.remove("highlight-search");
  });
}

function expandSidebar() {
  const small = sidebarSmall;
  const big = sidebarBig;

  sidebar.style.width > small
    ? (sidebar.style.width = small)
    : (sidebar.style.width = big);

  if (sidebar.style.width === big) {
    kanjiMain.style.display = "none";
    kanjiControl.style.display = "flex";
    metaData.style.display = "none";
  } else if (sidebar.style.width !== big) {
    kanjiMain.style.removeProperty("display");
    kanjiControl.style.display = "flex";
    if (
      kanjiTree.style.display === "flex" ||
      kanjiWords.style.display === "flex"
    ) {
      metaData.style.display = "none";
    } else {
      metaData.style.removeProperty("display");
    }
    //restoring properties after 'smallSideBar()'
    sidebar.style.display = "flex";
    sidebar.style.textAlign = "left";
    kanjiStash.style.display = "flex";
  }
}

function smallSideBar() {
  const expandedSidebar = "75vw";
  if (window.innerWidth <= 970) {
    if (sidebar.style.display === "none") {
      sidebar.style.display = "flex";
      sidebar.style.width = expandedSidebar;
      sidebar.style.textAlign = "center";
      kanjiMain.style.display = "none";
      kanjiStash.style.display = "none";
    } else {
      kanjiStash.style.display = "flex";
      sidebar.style.display = "none";
      kanjiMain.style.removeProperty("display");
    }
  }
}

function scrollToKanji(char) {
  for (const kanji of stashedKanji) {
    let kanjiData = kanji.char;
    let kanjiID = kanji.id;

    if (kanjiData.includes(char)) {
      let selected = $(`#${kanjiID}`);
      if (char === "") {
        return;
      } else {
        selected.scrollIntoView();
        // highlights the entered kanji until 'input-kanji' is used again:
        selected.classList.add("highlight-search");
        inputKanji.addEventListener("click", () => {
          selected.classList.remove("highlight-search");
        });
      }
    }
  }
}

function copyToClipBoard(data) {
  // DOM-method
  navigator.clipboard.writeText(data.textContent);
}

function checkWindow() {
  const small = sidebarSmall;
  const big = sidebarBig;
  let smallScreen = 970;

  if (window.innerWidth <= smallScreen) {
    if (sidebar.style.display === "none" || sidebar.style.width <= big) {
      kanjiMain.style.removeProperty("display");
      metaRelated.style.display = "none";
      sidebar.style.display = "none";
      sidebar.style.width = small;
      kanjiControl.style.display = "flex";

      if (
        kanjiTree.style.display === "flex" ||
        kanjiWords.style.display === "flex"
      ) {
        metaData.style.display = "none";
      } else {
        metaData.style.removeProperty("display");
      }
    }
  } else if (window.innerWidth > smallScreen) {
    kanjiMain.style.removeProperty("display");
    kanjiStash.style.display = "flex";
    kanjiControl.style.display = "flex";
    sidebar.style.display = "flex";
    sidebarBtn.style.removeProperty("display");

    if (
      kanjiTree.style.display === "flex" ||
      kanjiWords.style.display === "flex"
    ) {
      metaData.style.display = "none";
    } else {
      metaData.style.removeProperty("display");
    }

    if (sidebar.style.width > small && sidebar.style.width !== big) {
      sidebar.style.display === "flex"
        ? (kanjiStash.style.display = "none")
        : (kanjiStash.style.display = "flex");
    }

    if (sidebar.style.width > small) {
      kanjiMain.style.display = "none";
    }
  }
  if (window.innerWidth > 750) {
    metaRelated.style.display = "flex";
  }
}

function changeControl(boolean) {
  if (boolean) {
    inputKanji.style.background = "#c1e8e4";
    kanjiBtn.style.background = "#c1e8e4";
    darkModeBtn.style.background = "#c1e8e4";
    kanjiCounterBtn.style.background = "#c1e8e4";
  } else if (!boolean) {
    inputKanji.style.background = "#7fe2d8";
    kanjiBtn.style.background = "#7fe2d8";
    darkModeBtn.style.background = "#7fe2d8";
    kanjiCounterBtn.style.background = "#7fe2d8";
  }
}

function toggleDarkMode() {
  const day = "#fff";
  const night = "#231433";
  const mainDay = "#000";
  const mainNight = "#e0e0ce";
  const stashNight = "#2fbbb4";
  const treeNight = "#c1e8e4";

  if (isDark) {
    isDark = false;
    body.style.background = day;
    kanjiMain.style.color = mainDay;
    kanjiStash.style.color = mainDay;
    sidebar.style.color = mainDay;
    kanjiTree.style.color = mainDay;
    darkModeIcon.className = "fa fa-moon-o";
  } else if (!isDark) {
    isDark = true;
    body.style.background = night;
    kanjiMain.style.color = mainNight;
    kanjiStash.style.color = stashNight;
    sidebar.style.color = mainNight;
    kanjiTree.style.color = treeNight;
    darkModeIcon.className = "fa fa-sun-o";
  }
  changeControl(isDark);
  highlightKanji();
}

function goToJisho(char) {
  let urlEnd = "%23kanji";
  window.open(
    `https://jisho.org/search/${char} ${urlEnd}`,
    (target = "_blank")
  );
}

document.onkeydown = function keyPress(event) {
  /* gets rid of all elements except the main-kanji – for   printing */
  if (event.ctrlKey && event.altKey && event.key === ",") {
    kanjiControl.style.display === "none"
      ? (kanjiControl.style.display = "flex")
      : (kanjiControl.style.display = "none");

    kanjiStash.style.display === "none"
      ? (kanjiStash.style.display = "flex")
      : (kanjiStash.style.display = "none");

    sidebar.style.display === "none"
      ? (sidebar.style.display = "flex")
      : (sidebar.style.display = "none");

    sidebarBtn.style.display === "none"
      ? sidebarBtn.style.removeProperty("display")
      : (sidebarBtn.style.display = "none");
  }
  if (event.ctrlKey && event.altKey && event.key === ".") {
    if (sidebar.style.width > sidebarSmall) {
      kanjiControl.style.display === "none"
        ? (kanjiControl.style.display = "flex")
        : (kanjiControl.style.display = "none");

      kanjiStash.style.display === "none"
        ? (kanjiStash.style.display = "flex")
        : (kanjiStash.style.display = "none");
    } else {
      kanjiControl.style.display === "none"
        ? (kanjiControl.style.display = "flex")
        : (kanjiControl.style.display = "none");

      kanjiStash.style.display === "none"
        ? (kanjiStash.style.display = "flex")
        : (kanjiStash.style.display = "none");

      kanjiMain.style.display === "none"
        ? kanjiMain.style.removeProperty("display")
        : (kanjiMain.style.display = "none");

      metaData.style.display === "none"
        ? metaData.style.removeProperty("display")
        : (metaData.style.display = "none");
    }
  }
  //––––––––––––––––––––––––––––––––––––––––
  if (event.key === "Enter") {
    createKanji(inputKanji.value);
    scrollToKanji(inputKanji.value);
  }
  if (event.ctrlKey && event.key === " ") toggleDarkMode();
  if (event.altKey && event.key === "ArrowRight") showWords();
  if (event.altKey && event.key === "ArrowLeft") showTree();
  if (event.altKey && event.key === "j") goToJisho(kanji.textContent);
  //––––––––––––––––––––––––––––––––––––––––
  if (event.key === "Backspace") kanjiStash.scrollTo(0, 0);
};

function scrollStash(event) {
  event = event || window.event;
  kanjiStash.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    kanjiStash.style.cursor = "grabbing";
    kanjiStash.style.userSelect = "none";

    pos = {
      left: kanjiStash.scrollLeft,
      top: kanjiStash.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
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
    kanjiStash.style.cursor = "grab";
    kanjiStash.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  // Attach the handler
  kanjiStash.addEventListener("mousedown", mouseDownHandler);
}

function scrollSidebar(event) {
  event = event || window.event;
  sidebar.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    sidebar.style.cursor = "grabbing";
    sidebar.style.userSelect = "none";

    pos = {
      left: sidebar.scrollLeft,
      top: sidebar.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
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
    sidebar.style.cursor = "grab";
    sidebar.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  // Attach the handler
  sidebar.addEventListener("mousedown", mouseDownHandler);
}

function scrollWords(event) {
  event = event || window.event;
  kanjiWords.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    kanjiWords.style.cursor = "grabbing";
    kanjiWords.style.userSelect = "none";

    pos = {
      left: kanjiWords.scrollLeft,
      top: kanjiWords.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
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
    kanjiWords.style.cursor = "grab";
    kanjiWords.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  // Attach the handler
  kanjiWords.addEventListener("mousedown", mouseDownHandler);
}

function scrollRelated(event) {
  event = event || window.event;
  metaRelated.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    metaRelated.style.cursor = "grabbing";
    metaRelated.style.userSelect = "none";

    pos = {
      left: metaRelated.scrollLeft,
      top: metaRelated.scrollTop,
      // Get the current mouse position
      x: event.clientX,
      y: event.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (event) {
    // How far the mouse has been moved
    const dx = event.clientX - pos.x;
    const dy = event.clientY - pos.y;

    // Scroll the element
    metaRelated.scrollTop = pos.top - dy;
    metaRelated.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    metaRelated.style.cursor = "grab";
    metaRelated.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  // Attach the handler
  metaRelated.addEventListener("mousedown", mouseDownHandler);
}

function loadActions() {
  stashKanji();
  createKanji(onLoadValue);
  changeControl(isDark);
  checkWindow();
  //toggleDarkMode();
}

//–––––––––––––––EVENTS––––––––––––––––––
// footer – button-events
kanjiBtn.addEventListener("click", () => {
  createKanji(inputKanji.value);
  scrollToKanji(inputKanji.value);
});
darkModeBtn.addEventListener("click", toggleDarkMode);
kanjiCounterBtn.addEventListener("input", highlightKanji);
kanjiMain.addEventListener("auxclick", showTree);
// sidebar-button
sidebarBtn.addEventListener("click", () => {
  expandSidebar();
  smallSideBar();
});
sidebarBtn.addEventListener("auxclick", () => {
  showWords();
});
// scroll-behaviour
document.addEventListener("DOMContentLoaded", () => {
  scrollStash(),
    scrollSidebar(),
    scrollWords(),
    scrollRelated(),
    highlightKanji();
});
// stash Kanji on windowload
window.onload = loadActions();
window.addEventListener("resize", checkWindow);
