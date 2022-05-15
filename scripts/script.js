// custom querySelector – NOT jquery!
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
//–––––––––––––––––––––––
const title = $("#title");
const container = $(".container");
const body = $("body");
// search-navigation
const searchKanji = $("#search-kanji");
const searchOverlay = $(".search-overlay-kanji");
const searchCloseBtn = $(".closebtn");
// footer-elements
const kanjiControl = $("#kanji-control");
const inputKanji = $("#input-kanji");
const kanjiBtn = $("#create-kanji");
const highlightSearch = $(".highlight-search");
const darkModeBtn = $("#dark-mode-btn");
const darkModeIcon = $(".fa-sun-o");
const kanjiCounterBtn = $("#kanji-counter");
const sidebarExpandBtn = $("#sidebar-expand-btn");
const showTreeBtn = $("#show-tree-btn");
const eraseHighlightBtn = $("#erase-highlight-btn");
const onlyKanjiBtn = $("#only-kanji-btn");
const copyKanjiBtn = $("#copy-kanji-btn");
const showOverlayBtn = $("#show-overlay-btn");
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
let onLoadValue;
const onLoadRange = 500; //→ kanji-frequency
// defines how long a japanese sentence should be at minimum
let sentenceLength = 4;
// sets a default value for the counter
kanjiCounterBtn.value = "";
//–––––––––––––––––––––––––––––––––––––

// kanji-stash
function stashKanji() {
  let counter = 1;
  for (const kanji of kanjis) {
    let kanjiID = `kan${counter}`;
    let stashElement = document.createElement("div");
    stashElement.textContent = kanji;
    stashElement.id = kanjiID;
    stashElement.className = "kanji-list";
    stashElement.setAttribute("onclick", `clickOnStash(${kanjiID})`);
    kanjiStash.appendChild(stashElement);
    stashedKanji.push(new Array(kanji, kanjiID));
    counter++;
  }
  let number = Math.floor(Math.random(onLoadRange) * onLoadRange);
  onLoadValue = stashedKanji[number][0];
}

function createKanji(char) {
  char = char.trim();
  fetch("../kanji.json")
    .then(response => response.json())
    .then(data => {
      // if multiple kanji or an english word was entered
      if (char.length > 1) {
        searchOverlay.textContent = "";
        let matches = [];
        char = char.toLowerCase();
        //
        for (let kan of kanjiAll) {
          let searchLowerCase = data[kan].meanings.toString().toLowerCase();
          //
          if (searchLowerCase.includes(char)) {
            openSearchNav();
            searchKanji.scrollTo(0, 0);
            //
            data[kan].freq === null
              ? matches.push(new Array(null, kan, data[kan].meanings))
              : matches.push(
                  new Array(data[kan].freq, kan, data[kan].meanings)
                );
          }
          if (char[0] === kan || [...char].includes(kan)) {
            openSearchNav();
            searchKanji.scrollTo(0, 0);
            if (typeof char === "object") {
              continue;
            } else {
              char = new Set([...char]);
            }
            //
            for (let character of char) {
              if (data[character]) {
                data[character].freq === null
                  ? matches.push(
                      new Array(null, character, data[character].meanings)
                    )
                  : matches.push(
                      new Array(
                        data[character].freq,
                        character,
                        data[character].meanings
                      )
                    );
              }
            }
          }
        }
        if (matches.length === 0) {
          ifValueIsNumber(char);
        }
        // sort matches
        let sortedMatches = matches.sort(sortArray(true));
        //
        for (let i = 0; i < matches.length; i++) {
          // searched kanji
          let searchElement = document.createElement("span");
          searchElement.className = "searched-kanji";
          searchElement.id = `searched${i + 1}`;
          searchElement.setAttribute(
            "onclick",
            `clickOnKanji(${searchElement.id})`
          );
          searchElement.textContent = sortedMatches[i][1];
          searchOverlay.appendChild(searchElement);
          // kanji-meanings
          let searchMeaning = document.createElement("span");
          searchMeaning.className = "searched-meaning";
          searchMeaning.id = `meaning${i + 1}`;
          searchMeaning.textContent = sortedMatches[i][2]
            .join(" · ")
            .toLowerCase();
          searchOverlay.appendChild(searchMeaning);
          // kanji-frequency
          let searchFrequency = document.createElement("span");
          searchFrequency.className = "searched-freq";
          searchFrequency.id = `freq${i + 1}`;
          // no formatting, if frequency === null
          sortedMatches[i][0] === null
            ? (searchFrequency.textContent = "")
            : (searchFrequency.textContent = `▲ ${sortedMatches[i][0]}`);
          searchOverlay.appendChild(searchFrequency);
          // break line
          let breakLine = document.createElement("div");
          breakLine.textContent = " ";
          breakLine.style.whiteSpace = "break-spaces";
          searchOverlay.appendChild(breakLine);
        }
      } else if (!data[char] && char.length === 1) {
        ifValueIsNumber(char);
        //––––––––––––––––––––––––––––––
        // if only one kanji was entered
      } else if (data[char]) {
        let entries = data[char];
        kanji.textContent = char;
        kanji.setAttribute(
          "onclick",
          `createKanjiParts("${kanji.textContent}")`
        );
        kun.textContent = `${entries.readings_kun.join(" • ")}`;
        on.textContent = `${entries.readings_on.join(" • ")}`;
        meaning.textContent = `${entries.meanings.join(", ")}`.toLowerCase();
        metaRadical.textContent = `${entries.radical} ⏐ ${entries.kangxi}`;
        metaRadical.id = `radical${entries.kangxi}`;
        metaRadical.setAttribute(
          "onclick",
          `clickOnRadical(${entries.kangxi})`
        );
        //
        entries.freq === null
          ? (metaFrequency.textContent = "▲ –")
          : (metaFrequency.textContent = `▲ ${entries.freq}`);
        //
        title.firstChild.textContent =
          `${char} · ${entries.meanings[0]}`.toLowerCase();
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
        //
        window.innerWidth >= 750
          ? (metaRelated.style.display = "flex")
          : (metaRelated.style.display = "none");
        //
        let relatedData = [];
        for (let kanji of kanjiAll) {
          if (data[kanji].parts === kanji) {
            continue;
          } else if (data[kanji].parts.includes(char)) {
            relatedData.push(new Array(data[kanji].freq, kanji));
            //
          }
        }
        //
        let relatedSorted = relatedData.sort(sortArray(true));
        //
        for (let i = 1; i < relatedData.length; i++) {
          let maximum = 102;
          let relatedElement = document.createElement("div");
          relatedElement.className = "related-kanji";
          relatedElement.id = `rel${i}`;
          relatedElement.textContent = relatedSorted[i][1];
          relatedElement.setAttribute(
            "ondblclick",
            `clickOnKanji(${relatedElement.id})`
          );
          metaRelated.appendChild(relatedElement);
          if (i == maximum) {
            break;
          }
        }
        //→ ignores the input-value contained in [kanji].parts – prevents duplication
      } else {
        metaRelated.textContent = "";
        metaRelated.style.display = "none";
      }
      //
      checkMeta(char);
      //
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
      // checks if the value of input-kanji is a valid numberical value
      function ifValueIsNumber(char) {
        char = Number(char);
        if (typeof char === "number") {
          for (kan of kanjis) {
            if (data[kan].freq === char) {
              createKanji(kan);
              scrollToKanji(kan);
            }
          }
        }
      }
    });
  setTimeout(() => {
    if (char.length <= 1) createSentences(char);
  }, 500);
  //
  setTimeout(() => {
    if (char.length <= 1) createWords(char);
  }, 350);
  setTimeout(() => {
    metaRelated.scrollTo(0, 0);
  }, 250);
  //
}

function createSentences(char) {
  fetch("../all_v10.json")
    .then(response => response.json())
    .then(data => {
      if (data) {
        sidebar.textContent = "";
        let sentenceData = [];
        let trueCounter = 0;
        let maximum = 500;
        //
        for (let i = 0; i < data.length; i++) {
          let japData = data[i].jap;
          let engData = data[i].eng;
          if (japData.includes(char) && engData) {
            trueCounter++;
            sentenceData.push(new Array(japData, engData));
            //
          }
          if (trueCounter == maximum) break;
        }
        // sort sentences
        function sortSentences(ascending) {
          return function (a, b) {
            // equal items sort equally
            if (a[0].length === b[0].length) {
              return 0;
            }
            // otherwise, if we're ascending, lowest sorts first
            else if (ascending) {
              return a[0].length < b[0].length ? -1 : 1;
            }
            // if descending, highest sorts first
            else {
              return a[0].length < b[0].length ? 1 : -1;
            }
          };
        }
        //
        let sortedData = sentenceData.sort(sortSentences(true));
        //
        for (let i = 0; i < sortedData.length; i++) {
          let maximum = 100;
          let japSentence = document.createElement("div");
          let engSentence = document.createElement("div");
          // Japanese
          if (sortedData[i][0].length > sentenceLength) {
            // sentenceLength === global scope
            japSentence.textContent = sortedData[i][0];
            japSentence.id = `jap${i + 1}`;
            japSentence.className = "jap-sentence";
            japSentence.setAttribute(
              "ondblclick",
              `copyToClipBoard(${japSentence.id})`
            );
            sidebar.appendChild(japSentence);
            // English
            engSentence.textContent = sortedData[i][1];
            engSentence.id = `eng${i + 1}`;
            engSentence.className = "eng-sentence";
            engSentence.setAttribute(
              "ondblclick",
              `copyToClipBoard(${engSentence.id})`
            );
            sidebar.appendChild(engSentence);
            //
            if (i === maximum) break;
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
      kanjiWords.textContent = "";
      for (let i = 0; i < jisho.data.length; i++) {
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

function createKanjiParts(char) {
  searchOverlay.textContent = "";
  let partsData = [];
  fetch("../kanji.json")
    .then(response => response.json())
    .then(data => {
      for (let part of data[char].parts) {
        if (data[part]) {
          partsData.push(new Array(data[part].freq, part, data[part].meanings));
        }
      }
      //
      let partsSorted = partsData.sort(sortArray(true));
      //
      for (let i = 0; i < partsSorted.length; i++) {
        let kanjiParts = document.createElement("span");
        kanjiParts.className = "searched-kanji";
        kanjiParts.id = `part${i + 1}`;
        kanjiParts.textContent = partsSorted[i][1];
        // kanji.json has no entries if length is 0 – therefore a click shouldn't initialize a search (again)!
        if (partsSorted[i][2].length > 0) {
          kanjiParts.setAttribute("onclick", `clickOnKanji(${kanjiParts.id})`);
        }
        searchOverlay.appendChild(kanjiParts);
        // kanji-meanings
        let partsMeaning = document.createElement("span");
        partsMeaning.className = "searched-meaning";
        partsMeaning.id = `p-meaning${i + 1}`;
        //
        partsSorted[i][2].length === 0
          ? (partsMeaning.textContent = "–")
          : (partsMeaning.textContent = partsSorted[i][2]
              .join(" · ")
              .toLowerCase());
        //
        searchOverlay.appendChild(partsMeaning);
        // kanji-frequency
        let partsFrequency = document.createElement("span");
        partsFrequency.className = "searched-freq";
        partsFrequency.id = `p-freq${i + 1}`;
        // no formatting, if frequency === null
        partsSorted[i][0] === null
          ? (partsFrequency.textContent = "")
          : (partsFrequency.textContent = `▲ ${partsSorted[i][0]}`);
        searchOverlay.appendChild(partsFrequency);
        // break line
        let partsBreakLine = document.createElement("div");
        partsBreakLine.textContent = " ";
        partsBreakLine.style.whiteSpace = "break-spaces";
        searchOverlay.appendChild(partsBreakLine);
      }
      if (partsSorted[0][1] !== char) openSearchNav();
    });
}

function showWords() {
  const hidden = "none";
  const display = "display";
  if (!kanjiWords.style.display) {
    kanji.style.display = hidden;
    kun.style.display = hidden;
    on.style.display = hidden;
    meaning.style.display = hidden;
    metaData.style.display = hidden;
    kanjiTree.style.display = hidden;
    kanjiWords.style.display = "flex";
  } else {
    kanji.style.removeProperty(display);
    kun.style.removeProperty(display);
    on.style.removeProperty(display);
    meaning.style.removeProperty(display);
    metaData.style.removeProperty(display);
    kanjiTree.style.removeProperty(display);
    kanjiWords.style.removeProperty(display);
  }
}

function showTree() {
  if (!kanjiTree.style.display) {
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
    kanjiWords.style.removeProperty("display");
    kanjiTree.style.removeProperty("display");
  }
}

function sortArray(ascending) {
  return function (a, b) {
    // equal items sort equally
    if (a[0] === b[0]) {
      return 0;
    }
    // nulls sort after anything else
    else if (a[0] === null) {
      return 1;
    } else if (b[0] === null) {
      return -1;
    }
    // otherwise, if we're ascending, lowest sorts first
    else if (ascending) {
      return a[0] < b[0] ? -1 : 1;
    }
    // if descending, highest sorts first
    else {
      return a[0] < b[0] ? 1 : -1;
    }
  };
}

function clickOnStash(name) {
  createKanji(name.textContent);
  highlightClicked(name.id);
}

function clickOnKanji(name) {
  createKanji(name.textContent);
  scrollToKanji(name.textContent);
  // if search-overlay is active: close
  if (searchKanji.style.height === "100%") {
    closeSearchNav();
  }
}

function clickOnRadical(id) {
  searchOverlay.textContent = "";
  fetch("../kanji.json")
    .then(response => response.json())
    .then(data => {
      let radicalData = [];
      for (let kanji of kanjiAll) {
        if (!data[kanji].kangxi) {
          continue;
        } else if (data[kanji].kangxi === id) {
          radicalData.push(
            new Array(data[kanji].freq, `${kanji}`, data[kanji].meanings)
          );
        }
      }
      let radicalSorted = radicalData.sort(sortArray(true));
      openSearchNav();
      for (let i = 0; i < radicalSorted.length; i++) {
        // searched kanji
        let radicalElement = document.createElement("span");
        radicalElement.className = "searched-kanji";
        radicalElement.id = `searched${i + 1}`;
        radicalElement.setAttribute(
          "onclick",
          `clickOnKanji(${radicalElement.id})`
        );
        radicalElement.textContent = radicalSorted[i][1];
        searchOverlay.appendChild(radicalElement);
        // kanji-meanings
        let radicalMeaning = document.createElement("span");
        radicalMeaning.className = "searched-meaning";
        radicalMeaning.id = `meaning${i + 1}`;
        radicalMeaning.textContent = radicalSorted[i][2]
          .join(" · ")
          .toLowerCase();
        searchOverlay.appendChild(radicalMeaning);
        // kanji-frequency
        let radicalFrequency = document.createElement("span");
        radicalFrequency.className = "searched-freq";
        radicalFrequency.id = `freq${i + 1}`;
        //
        radicalSorted[i][0] === null
          ? (radicalFrequency.textContent = "")
          : (radicalFrequency.textContent = `▲ ${radicalSorted[i][0]}`);
        //–––––––––––––––––––––––
        searchOverlay.appendChild(radicalFrequency);
        // break line
        let radicalBreakLine = document.createElement("div");
        radicalBreakLine.textContent = " ";
        radicalBreakLine.style.whiteSpace = "break-spaces";
        searchOverlay.appendChild(radicalBreakLine);
        //
      }
    });
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
  eraseHighlightBtn.addEventListener("click", () => {
    clicked.classList.remove("highlight-search");
  });
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
  for (let i = 0; i < stashedKanji.length; i++) {
    let kanjiData = stashedKanji[i][0];
    let kanjiID = stashedKanji[i][1];

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

function openSearchNav() {
  searchKanji.style.height = "100%";
  searchCloseBtn.className = "closebtn-show";
}

function closeSearchNav() {
  searchKanji.style.height = "0%";
  searchCloseBtn.className = "closebtn";
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
    onlyKanjiBtn.style.display = "none";
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
    onlyKanjiBtn.style.removeProperty("display");

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
  const nightTime = "#c1e8e4";
  const dayTime = "#7fe2d8";
  if (boolean) {
    inputKanji.style.background = nightTime;
    kanjiBtn.style.background = nightTime;
    darkModeBtn.style.background = nightTime;
    kanjiCounterBtn.style.background = nightTime;
    sidebarExpandBtn.style.background = nightTime;
    showTreeBtn.style.background = nightTime;
    eraseHighlightBtn.style.background = nightTime;
    onlyKanjiBtn.style.background = nightTime;
    copyKanjiBtn.style.background = nightTime;
    showOverlayBtn.style.background = nightTime;
  } else if (!boolean) {
    inputKanji.style.background = dayTime;
    kanjiBtn.style.background = dayTime;
    darkModeBtn.style.background = dayTime;
    kanjiCounterBtn.style.background = dayTime;
    sidebarExpandBtn.style.background = dayTime;
    showTreeBtn.style.background = dayTime;
    eraseHighlightBtn.style.background = dayTime;
    onlyKanjiBtn.style.background = dayTime;
    copyKanjiBtn.style.background = dayTime;
    showOverlayBtn.style.background = dayTime;
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
    /* searchKanji.style.background = "#7db7b4f2"; //#c1e8e4f2
    searchOverlay.style.color = "#000";
    searchCloseBtn.style.color = "#000"; */
  } else if (!isDark) {
    isDark = true;
    body.style.background = night;
    kanjiMain.style.color = mainNight;
    kanjiStash.style.color = stashNight;
    sidebar.style.color = mainNight;
    kanjiTree.style.color = treeNight;
    darkModeIcon.className = "fa fa-sun-o";
    /* searchKanji.style.background = "#231433f2";
    searchOverlay.style.color = "#2fbbb4";
    searchCloseBtn.style.color = "#2fbbb4"; */
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

function scrollSearch(event) {
  event = event || window.event;
  searchKanji.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (event) {
    searchKanji.style.cursor = "grabbing";
    searchKanji.style.userSelect = "none";

    pos = {
      left: searchKanji.scrollLeft,
      top: searchKanji.scrollTop,
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
    searchKanji.scrollTop = pos.top - dy;
    searchKanji.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    searchKanji.style.cursor = "grab";
    searchKanji.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  // Attach the handler
  searchKanji.addEventListener("mousedown", mouseDownHandler);
}

function showOnlyKanji() {
  if (window.innerWidth > 970) {
    kanjiStash.style.display === "none"
      ? (kanjiStash.style.display = "flex")
      : (kanjiStash.style.display = "none");

    sidebar.style.display === "none"
      ? (sidebar.style.display = "flex")
      : (sidebar.style.display = "none");

    sidebarBtn.style.display === "none"
      ? sidebarBtn.style.removeProperty("display")
      : (sidebarBtn.style.display = "none");

    metaRelated.style.display === "none"
      ? (metaRelated.style.display = "flex")
      : (metaRelated.style.display = "none");
  }
}

function showOnlySentences() {
  if (sidebar.style.width > sidebarSmall) {
    /*     kanjiControl.style.display === "none"
      ? (kanjiControl.style.display = "flex")
      : (kanjiControl.style.display = "none"); */

    kanjiStash.style.display === "none"
      ? (kanjiStash.style.display = "flex")
      : (kanjiStash.style.display = "none");

    /* sidebarBtn.style.display === "none"
      ? sidebarBtn.style.removeProperty("display")
      : (sidebarBtn.style.display = "none"); */
  } else {
    /*     kanjiControl.style.display === "none"
      ? (kanjiControl.style.display = "flex")
      : (kanjiControl.style.display = "none"); */

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

function loadActions() {
  stashKanji();
  createKanji(onLoadValue);
  changeControl(isDark);
  checkWindow();
  toggleDarkMode();
}

//–––––––––––––––EVENTS––––––––––––––––––
// footer – button-events
document.onkeydown = function keyPress(event) {
  //gets rid of all elements except the main-kanji – for printing
  if (event.ctrlKey && event.altKey && event.key === ",") {
    showOnlyKanji();
  }
  if (event.ctrlKey && event.altKey && event.key === ".") {
    showOnlySentences();
  }
  //––––––––––––––––––––––––––––––––––––––––
  if (event.key === "Enter") {
    createKanji(inputKanji.value);
    scrollToKanji(inputKanji.value);
  }
  if (event.ctrlKey && event.key === " ") toggleDarkMode();
  if (event.altKey && event.key === "w") {
    showWords();
  }
  if (event.altKey && event.key === "e") {
    showTree();
  }
  if (event.altKey && event.key === "j") goToJisho(kanji.textContent);
  //––––––––––––––––––––––––––––––––––––––––
  if (event.ctrlKey && event.key === "Backspace") kanjiStash.scrollTo(0, 0);
  if ((event.ctrlKey && event.key === "x") || event.key === "Escape") {
    if (searchOverlay.textContent) {
      searchKanji.style.height === "100%" ? closeSearchNav() : openSearchNav();
    }
  }
  if (event.altKey && event.key === "Backspace") searchKanji.scrollTo(0, 0);
};
//–––––––––––––––––––––––––––––––––––––––
kanjiMain.addEventListener("auxclick", showTree);
kanjiBtn.addEventListener("click", () => {
  createKanji(inputKanji.value);
  scrollToKanji(inputKanji.value);
});
sidebarExpandBtn.addEventListener("click", () => {
  expandSidebar();
  smallSideBar();
});
showTreeBtn.addEventListener("click", showTree);
onlyKanjiBtn.addEventListener("click", showOnlyKanji);
onlyKanjiBtn.addEventListener("auxclick", showOnlySentences);
copyKanjiBtn.addEventListener("click", () => {
  copyToClipBoard(kanji);
});
showOverlayBtn.addEventListener("click", () => {
  if (searchOverlay.textContent) openSearchNav();
});
darkModeBtn.addEventListener("click", toggleDarkMode);
kanjiCounterBtn.addEventListener("input", highlightKanji);
// sidebar-button
sidebarBtn.addEventListener("click", () => {
  showWords();
});
sidebarBtn.addEventListener("auxclick", () => {
  expandSidebar();
  smallSideBar();
});
// scroll-behaviour
document.addEventListener("DOMContentLoaded", () => {
  scrollStash(),
    scrollSidebar(),
    scrollWords(),
    scrollRelated(),
    scrollSearch(),
    highlightKanji();
});
// stash Kanji on windowload
window.onload = loadActions();
window.addEventListener("resize", checkWindow);
