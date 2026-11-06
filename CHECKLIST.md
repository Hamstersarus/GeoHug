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
- [ ] Commit and push

## Step 4: Input handling

- [x] Create the `selected` array and select the input, Add button, error message, country list and datalist elements
- [x] Write the `aliases` object (lowercase keys, values that match the exact `NAME` strings in the data)
- [x] Write `findCountryName(text)`: check aliases first, then compare lowercase against the data names, return the exact `NAME` or `null`
- [x] Write `renderList()`: rebuild the `<ul>` from `selected`, with a Remove button on each item
- [x] Write `addCountry()`: show an error for unknown names and for duplicates, otherwise add the country, clear the input and re-render
- [x] Write `fillDataList()` and call it after the data loads, so the input autocompletes
- [x] Wire up the Add button click and the Enter key
- [ ] Test: autocomplete suggests Germany, Add and Enter both work, a duplicate shows an error, "Narnia" shows an error, "USA" adds "United States of America", Remove works
- [ ] Commit and push
