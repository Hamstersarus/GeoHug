let features = [];

const svg = d3.select("#map");

function drawMap(featuresToDraw) {
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    const projection = d3.geoNaturalEarth1().fitSize(
        [width, height],
        { type: 'FeatureCollection', features: featuresToDraw }
    );
    const path = d3.geoPath(projection);

    svg.selectAll("path").remove();

    svg.selectAll("path")
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

let selected  = [];

const countryInput = document.querySelector("#country-input");
const addBtn = document.querySelector("#add-btn");
const errorMsg = document.querySelector("#error-msg");
const countryList = document.querySelector("#country-list");
const datalist = document.querySelector("#country-options");

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
const promptEl =document.querySelector("#prompt");
const scoreEl = document.querySelector("#score");
const finalScoreEl = document.querySelector("#final-score");
const restartBtn = document.querySelector("#restart-btn");

let queue = [];
let currentTarget = null;
let score = 0;
let missed = [];
let acceptingClicks = false;

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

function beginQuestions() {
    queue = shuffleArray(selected);
    score = 0;
    missed = [];

    svg.selectAll("path").on("click", handleClick);
    showNextQuestion();
}

function showResults() {
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    let text = "You got " + score + " out of " + selected.length + " right.";
    if(missed.length > 0) {
        text += " Missed: " + missed.join(", ");
    }
    finalScoreEl.textContent = text;
}

function restart() {
    resultScreen.classList.add("hidden");
    setupScreen.classList.remove("hidden");
}

function startQuiz() {
    if(selected.length === 0) {
        errorMsg.textContent = "Add at least one country first.";
        return;
    }

    errorMsg.textContent = "";
    setupScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    drawMap(getVisibleFeatures());
    beginQuestions();
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", restart);

d3.json("countries.geojson").then(data => {
    data.features.forEach(reverseRings);
    features = data.features;
    fillDataList();
});