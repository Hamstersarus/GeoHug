console.log(d3.version);

d3.json("countries.geojson").then(data => {
    console.log(data.features.length);
    console.log(data.features[0].properties);
});