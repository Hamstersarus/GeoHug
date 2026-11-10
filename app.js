let features = [];

const svg = d3.select("#map");

const zoom = d3.zoom()
    .scaleExtent([1, 12])
    .on("zoom", event => {
        svg.select(".map-layer").attr("transform", event.transform);
    });

svg.call(zoom);

function drawMap(featuresToDraw) {
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    const projection = d3.geoNaturalEarth1().fitSize(
        [width, height],
        { type: 'FeatureCollection', features: featuresToDraw }
    );
    const path = d3.geoPath(projection);

    svg.selectAll(".map-layer").remove();
    svg.call(zoom.transform, d3.zoomIdentity);

    svg.append("g")
        .attr("class", "map-layer")
        .selectAll("path")
        .data(featuresToDraw)
        .join("path")
        .attr("d", path)
        .attr("data-name", d => d.properties.NAME)
        .attr("class", "country");
}

function reverseRings(feature) {
    const g = feature.geometry;
    let polygons = g.coordinates;

    if(g.type === "Polygon") {
        polygons = [g.coordinates];
    }

    polygons.forEach(polygon => polygon.forEach(ring => ring.reverse()));
}

// Some longitudes are a hair past 180 (e.g. 180.00000000000006), which D3 wraps to
// the other side of the world and stretches the map frame.
function clampLongitudes(feature) {
    const g = feature.geometry;
    let polygons = g.coordinates;

    if(g.type === "Polygon") {
        polygons = [g.coordinates];
    }

    polygons.forEach(polygon => polygon.forEach(ring => ring.forEach(point => {
        point[0] = Math.max(-180, Math.min(180, point[0]));
    })));
}

// [west, south, east, north]. Pieces of a country whose centre falls outside
// its continent's box (Russia's tip past the date line, French Guiana, one Fiji island)
// are dropped so they don't shrink the map.
const continentBoxes = {
    "Europe": [-30, 30, 180, 85],
    "Oceania": [100, -50, 180, 5]
};

function trimStrayPieces(feature) {
    const box = continentBoxes[feature.properties.CONTINENT];
    const g = feature.geometry;

    if(!box || g.type !== "MultiPolygon") {
        return;
    }

    g.coordinates = g.coordinates.filter(polygon => {
        const centre = d3.geoCentroid({ type: "Polygon", coordinates: polygon });
        return centre[0] >= box[0] && centre[0] <= box[2] &&
               centre[1] >= box[1] && centre[1] <= box[3];
    });
}

let selected  = [];

const countryInput = document.querySelector("#country-input");
const addBtn = document.querySelector("#add-btn");
const errorMsg = document.querySelector("#error-msg");
const countryList = document.querySelector("#country-list");
const datalist = document.querySelector("#country-options");
const retryBtn = document.querySelector("#retry-btn");
let total = 0;

const aliases = {
    // United States
    "usa": "United States of America",
    "us": "United States of America",
    "united states": "United States of America",
    "u.s.": "United States of America",
    "u.s.a.": "United States of America",
    "america": "United States of America",

    // United Kingdom
    "uk": "United Kingdom",
    "u.k.": "United Kingdom",
    "england": "United Kingdom",
    "great britain": "United Kingdom",
    "britain": "United Kingdom",

    // Europe
    "czech republic": "Czechia",
    "holland": "Netherlands",
    "the netherlands": "Netherlands",
    "republic of ireland": "Ireland",
    "macedonia": "North Macedonia",
    "bosnia": "Bosnia and Herz.",
    "bosnia and herzegovina": "Bosnia and Herz.",
    "bosnia & herzegovina": "Bosnia and Herz.",
    "russian federation": "Russia",
    "turkiye": "Turkey",
    "türkiye": "Turkey",
    "northern cyprus": "N. Cyprus",

    // Africa
    "ivory coast": "Côte d'Ivoire",
    "cote d'ivoire": "Côte d'Ivoire",
    "drc": "Dem. Rep. Congo",
    "dr congo": "Dem. Rep. Congo",
    "democratic republic of the congo": "Dem. Rep. Congo",
    "democratic republic of congo": "Dem. Rep. Congo",
    "congo-kinshasa": "Dem. Rep. Congo",
    "congo kinshasa": "Dem. Rep. Congo",
    "republic of the congo": "Congo",
    "republic of congo": "Congo",
    "congo-brazzaville": "Congo",
    "congo brazzaville": "Congo",
    "south sudan": "S. Sudan",
    "central african republic": "Central African Rep.",
    "car": "Central African Rep.",
    "equatorial guinea": "Eq. Guinea",
    "western sahara": "W. Sahara",
    "swaziland": "eSwatini",
    "eswatini": "eSwatini",
    "the gambia": "Gambia",

    // Asia
    "burma": "Myanmar",
    "east timor": "Timor-Leste",
    "timor leste": "Timor-Leste",
    "dprk": "North Korea",
    "republic of korea": "South Korea",
    "viet nam": "Vietnam",
    "lao": "Laos",
    "uae": "United Arab Emirates",
    "emirates": "United Arab Emirates",
    "palestinian territories": "Palestine",
    "state of palestine": "Palestine",
    "west bank": "Palestine",

    // Americas and Oceania
    "dominican republic": "Dominican Rep.",
    "falkland islands": "Falkland Is.",
    "falklands": "Falkland Is.",
    "the bahamas": "Bahamas",
    "trinidad": "Trinidad and Tobago",
    "solomon islands": "Solomon Is.",
    "png": "Papua New Guinea",

    // Other
    "french southern and antarctic lands": "Fr. S. Antarctic Lands"
};

function findCountryName(txt) {
    const types = txt.trim().toLowerCase();

    if(aliases[types]) {
        return aliases[types];
    }

    const match = features.find(f => f.properties.NAME.toLowerCase() === types);
    if(match) {
        return match.properties.NAME;
    }
    return null;
}

function renderList() {
    countryList.innerHTML = "";

    selected.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name + " ";

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => {
            selected = selected.filter(n => n !== name);
            renderList();
        });

        li.appendChild(removeBtn);
        countryList.appendChild(li);
    });

    saveSelected();
}

function saveSelected() {
    try {
        localStorage.setItem("geohug-selected", JSON.stringify(selected));
    } catch(e) {}
}

function loadSelected() {
    try {
        const saved = JSON.parse(localStorage.getItem("geohug-selected"));
        if(Array.isArray(saved)) {
            selected = saved.filter(name => features.some(f => f.properties.NAME === name));
            renderList();
        }
    } catch(e) {}
}

function addCountry() {
    const name = findCountryName(countryInput.value);

    if(name === null) {
        errorMsg.textContent = "Country not found. Check the spelling";
        return;
    }

    if(selected.includes(name)) {
        errorMsg.textContent = name + " is already in the list.";
        return;
    }

    selected.push(name);
    errorMsg.textContent = "";
    countryInput.value = "";
    renderList();
}

function fillDataList() {
    const names = features
    .map(f => f.properties.NAME).sort();

    names.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        datalist.appendChild(option);
    });
}

const presetSelect = document.querySelector("#preset-select");
const presetAddBtn = document.querySelector("#preset-add-btn");
const presetReplaceBtn = document.querySelector("#preset-replace-btn");
const clearBtn = document.querySelector("#clear-btn");

let presetGroups = {};

const customAreas = {
    "Nordic Countries" : [],
    "Baltic states" : [],
    "Balkans" : [],
    "British Isles" : [],
    "Benelux" : [],
    "Caucasus" : [],
    "Middle East" : [],
    "Mainland Southeast Asia" : [],
    "Horn of Africa" : [],
    "Sahel" : [],
    "Maghreb" : [],
    "Andrean countries" : [],
    "The -stans" : [],
};

function buildPresetGroups() {
    const continents = {};
    const regions = {};

    features.forEach(f => {
        const name = f.properties.NAME;
        const continent = f.properties.CONTINENT;
        const subregion = f.properties.SUBREGION;

        if(!continents[continent]) {
            continents[continent] = [];
        }
        continents[continent].push(name);

        if(subregion !== continent) {
            if(!regions[subregion]) {
                regions[subregion] = [];
            }
            regions[subregion].push(name);
        }
    });

    presetGroups = {
        "Continents" : continents,
        "Regions": regions,
        "Areas": customAreas
    };
}

function fillPresetSelect() {
    presetSelect.innerHTML = "";

    Object.keys(presetGroups).forEach(groupName => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = groupName;

        Object.keys(presentGroups[groupName]).sort().forEach(presetName => {
            const names = presetGroups[groupName][presetName];
            if(names.length < 2) {
                return;
            }

            const option = document.createElement("option");
            option.value = groupName + "|" + presetName;
            option.textContent = presetName + " (" + names.length + ") ";
            optgroup.appendChild(option);
        });

        presetSelect.appendChild(optgroup);
    });
}

function getPresetNames() {
    const parts = presetSelect.value.split("|");
    const names = presetGroups[parts[0]][parts[1]];

    return names.filter(name => features.some(f => f.properties.NAME === name));
}

function addPreset() {
    getPresetNames().forEach(name => {
        if(!selected.includes(name)) {
            selected.push(name);
        }
    });

    errorMsg.textContent = "";
    renderList();
}

function replacePreset() {
    selected = [];
    addPreset();
}

function clearList() {
    selected = [];
    errorMsg.textContent = "";
    renderList();
}

presetAddBtn.addEventListener("click", addPreset);
presetReplaceBtn.addEventListener("click", replacePreset);
clearBtn.addEventListener("click", clearList);

addBtn.addEventListener("click", addCountry);
countryInput.addEventListener("keydown", event => {
    if(event.key === "Enter") {
        addCountry();
    }
});

const setupScreen = document.querySelector("#setup-screen");
const quizScreen = document.querySelector("#quiz-screen");
const resultScreen = document.querySelector("#result-screen");
const startBtn = document.querySelector("#start-btn");
const promptEl = document.querySelector("#prompt");
const scoreEl = document.querySelector("#score");
const finalScoreEl = document.querySelector("#final-score");
const restartBtn = document.querySelector("#restart-btn");

let queue = [];
let currentTarget = null;
let score = 0;
let missed = [];
let acceptingClicks = false;
let currentVisible = [];
let correctNames = [];

function getVisibleFeatures() {
    const continents = new Set();

    selected.forEach(name => {
        const match = features.find(f => f.properties.NAME === name);
        continents.add(match.properties.CONTINENT);
    });

    return features.filter(f => continents.has(f.properties.CONTINENT));
}

function shuffleArray(array) {
    const copy = [...array];

    for(let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function showNextQuestion() {
    if(queue.length === 0) {
        showResults();
        return;
    }

    currentTarget = queue.pop();
    promptEl.textContent = "Click: " + currentTarget;
    scoreEl.textContent = "Score: " + score;
    acceptingClicks = true;
}

function handleClick(event, d) {
    if(!acceptingClicks) {
        return;
    }
    acceptingClicks = false;

    if(d.properties.NAME === currentTarget) {
        score++;
        correctNames.push(currentTarget);
        d3.select(event.currentTarget).classed("correct", true);
        showNextQuestion();
        return;
    }

    missed.push(currentTarget);
    d3.select(event.currentTarget).classed("wrong", true);
    svg.selectAll("path")
        .filter(f => f.properties.NAME === currentTarget)
        .classed("reveal", true);

    setTimeout(() => {
        svg.selectAll(".wrong, .reveal")
            .classed("wrong", false)
            .classed("reveal", false);
        showNextQuestion();
    }, 1200);
}

function beginQuestions(names) {
    queue = shuffleArray(names);
    total = names.length;
    score = 0;
    missed = [];
    correctNames = [];

    svg.selectAll("path")
        .classed("correct", false)
        .on("click", handleClick);
    showNextQuestion();
}

function showResults() {
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    let text = "You got " + score + " out of " + total + " right.";
    if(missed.length > 0) {
        text += " Missed: " + missed.join(", ");
    }
    finalScoreEl.textContent = text;
    retryBtn.classList.toggle("hidden", missed.length === 0);
}

function restart() {
    resultScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");
}

function redrawQuizMap() {
    drawMap(currentVisible);
    svg.selectAll("path")
        .on("click", handleClick)
        .classed("correct", d => correctNames.includes(d.properties.NAME));
}

window.addEventListener("resize", () => {
    if(!quizScreen.classList.contains("hidden")) {
        redrawQuizMap();
    }
});

function retryMissed() {
    const names = [...missed];

    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    beginQuestions(names);
}

retryBtn.addEventListener("click", retryMissed);

function startQuiz() {
    if(selected.length === 0) {
        errorMsg.textContent = "Add at least one country first.";
        return;
    }

    errorMsg.textContent = "";
    setupScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    currentVisible = getVisibleFeatures();
    drawMap(currentVisible);
    beginQuestions(selected);
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", restart);

d3.json("countries.geojson").then(data => {
    data.features.forEach(clampLongitudes);
    data.features.forEach(reverseRings);
    data.features.forEach(trimStrayPieces);
    features = data.features;
    fillDataList();
    fillDataList();
    buildPresetGroups();
    fillPresetSelect();
    loadSelected();
});