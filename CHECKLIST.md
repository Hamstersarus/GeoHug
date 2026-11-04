# GeoHug Project Checklist

A map-quiz website: the user enters the countries they want to be quized on, the contenets are drawn, and only the entered countries are quizzed.

## Step 1: Project setup

- [x] In `/home/ayla/Work/GeoHug`, create `index.html`, `style.css` and `app.js`
- [x] In `index.html`, add the HTML skeleton (doctype, head, body, title)
- [x] Link `style.css` with a `<link>` tag in the head
- [x] Before the closing `</body>` tag, add the D3 script tag (`https://cdn.jsdelivr.net/npm/d3@7`), then the `app.js` script tag, in that order
- [ ] Add three screens, only one visible at a time:
  - [x] Setup: text input, Add button, country list, Start quiz button
  - [ ] Quiz: SVG map, prompt, score
  - [x] Results: final score, Restart button
- [x] Run `python3 -m http.server` in the project folder
- [ ] Open `http://localhost:8000`, put `console.log(d3.version)` in `app.js`, confirm a `7.x.x` version prints in the console (F12), then delete the log

## Step 2: Get the data

- [x] Download Natural Earth 1:110m Admin 0 – Countries and convert it to GeoJSON
- [x] Save it in the project folder as `countries.geojson`
- [x] Inspect the properties: name field is `NAME`, continent field is `CONTINENT`
- [x] Load it with `d3.json` and confirm the file is fetched (server log shows 200)
- [ ] Delete the temporary load-check snippet from `app.js`
- [ ] Commit and push `countries.geojson`
