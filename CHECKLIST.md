# GeoHug Project Checklist

A map-quiz website: the user enters the countries they want to be quized on, the contenets are drawn, and only the entered countries are quizzed.

## Step 1: Project setup

- [ ] In `/home/ayla/Work/GeoHug`, create `index.html`, `style.css` and `app.js`
- [ ] In `index.html`, add the HTML skeleton (doctype, head, body, title)
- [ ] Link `style.css` with a `<link>` tag in the head
- [ ] Before the closing `</body>` tag, add the D3 script tag (`https://cdn.jsdelivr.net/npm/d3@7`), then the `app.js` script tag, in that order
- [ ] Add three screens, only one visible at a time:
  - [ ] Setup: text input, Add button, country list, Start quiz button
  - [ ] Quiz: SVG map, prompt, score
  - [ ] Results: final score, Restart button
- [ ] Run `python3 -m http.server` in the project folder
- [ ] Open `http://localhost:8000`, put `console.log(d3.version)` in `app.js`, confirm a `7.x.x` version prints in the console (F12), then delete the log