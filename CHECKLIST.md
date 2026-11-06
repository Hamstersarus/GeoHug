# GeoHug Project Checklist

A map-quiz website: the user enters the countries they want to be quized on, the contenets are drawn, and only the entered countries are quizzed.

## Step 1: Project setup

- [x] In `/home/ayla/Work/GeoHug`, create `index.html`, `style.css` and `app.js`
- [x] In `index.html`, add the HTML skeleton (doctype, head, body, title)
- [x] Link `style.css` with a `<link>` tag in the head
- [x] Before the closing `</body>` tag, add the D3 script tag (`https://cdn.jsdelivr.net/npm/d3@7`), then the `app.js` script tag, in that order
- [x] Add three screens, only one visible at a time:
  - [x] Setup: text input, Add button, country list, Start quiz button
  - [x] Quiz: SVG map, prompt, score
  - [x] Results: final score, Restart button
- [x] Run `python3 -m http.server` in the project folder
- [x] Open `http://localhost:8000`, put `console.log(d3.version)` in `app.js`, confirm a `7.x.x` version prints in the console (F12), then delete the log

## Step 2: Get the data

- [x] Download Natural Earth 1:110m Admin 0 – Countries and convert it to GeoJSON
- [x] Save it in the project folder as `countries.geojson`
- [x] Inspect the properties: name field is `NAME`, continent field is `CONTINENT`
- [x] Load it with `d3.json` and confirm the file is fetched (server log shows 200)
- [x] Delete the temporary load-check snippet from `app.js`
- [x] Commit and push `countries.geojson`

## Step 3: Load and draw the full world

- [x] In `app.js`, create `features`, select the SVG with `d3.select("#map")`, and write `drawMap(featuresToDraw)`
- [x] Inside `drawMap`, build the projection with `d3.geoNaturalEarth1().fitSize(...)` and a `d3.geoPath(projection)`
- [x] Draw one `<path>` per feature, with `class="country"` and a `data-name` attribute set to `NAME`
- [x] Add the `.country` and `.country:hover` rules to `style.css`
- [x] Write `reverseRings(feature)` and call it on every feature, so D3 reads the polygons correctly (without it the map is one black shape)
- [x] Load `countries.geojson` with `d3.json`, store the features, and call `drawMap(features)`
- [x] Put `class="hidden"` back on `#quiz-screen`
- [x] Commit and push

## Step 4: Input handling

- [x] Create the `selected` array and select the input, Add button, error message, country list and datalist elements
- [x] Write the `aliases` object (lowercase keys, values that match the exact `NAME` strings in the data)
- [x] Write `findCountryName(text)`: check aliases first, then compare lowercase against the data names, return the exact `NAME` or `null`
- [x] Write `renderList()`: rebuild the `<ul>` from `selected`, with a Remove button on each item
- [x] Write `addCountry()`: show an error for unknown names and for duplicates, otherwise add the country, clear the input and re-render
- [x] Write `fillDataList()` and call it after the data loads, so the input autocompletes
- [x] Wire up the Add button click and the Enter key
- [x] Test: autocomplete suggests Germany, Add and Enter both work, a duplicate shows an error, "Narnia" shows an error, "USA" adds "United States of America", Remove works
- [x] Commit and push

## Step 5: Compute which continents to show

- [x] Select the setup, quiz and result screens and the Start quiz button
- [x] Write `getVisibleFeatures()`: look up each selected country's `CONTINENT`, collect them in a `Set`, and return every feature on those continents
- [x] Write `startQuiz()`: show an error if nothing is selected, hide the setup screen, un-hide the quiz screen, then call `drawMap(getVisibleFeatures())`
- [x] Un-hide the quiz screen before drawing, because `clientWidth` and `clientHeight` are 0 while it is hidden
- [x] Remove the `drawMap(features)` call from the data load, so the map only draws when the quiz starts
- [x] Wire up the Start quiz button click
- [x] Test: Germany, Russia, Ukraine and Sweden show Europe only, and Argentina with China shows South America and Asia
- [x] Silence the favicon 404 by adding `<link rel="icon" href="data:,">` to the head
- [x] Optional polish: stop Russia's far-east piece and French Guiana from shrinking the map frame (`clampLongitudes`, `trimStrayPieces` and `continentBoxes` in `app.js`)
- [x] Commit and push

## Step 6: Quiz logic

- [x] Create the quiz state: `queue`, `currentTarget`, `score`, and a `missed` array
- [x] Write a shuffle function and fill `queue` with a shuffled copy of `selected`, so only the entered countries are asked
- [x] Write `showNextQuestion()`: take the next name from `queue`, show "Click: <name>" in `#prompt` and the score in `#score`
- [x] Add a click handler to every country path that reads the clicked `d.properties.NAME`
- [x] On a correct click: colour the country green, add 1 to `score`, then ask the next country
- [x] On a wrong click: flash the clicked country red, highlight the correct country, add the target to `missed`, then ask the next country
- [x] Add `.correct`, `.wrong` and `.reveal` rules to `style.css`
- [x] Ignore clicks while the answer feedback is showing, so a double click cannot count twice
- [x] When `queue` is empty, hide the quiz screen, show `#result-screen` and write the final score into `#final-score`
- [x] Wire up the Restart button: clear state, hide the result screen, show the setup screen
- [x] Test: only the entered countries are asked, correct and wrong clicks colour properly, the score is right, and the results screen appears at the end
- [x] Commit and push
