const { mkdirSync, writeFileSync } = require("fs");
const mbtiles = require("@mapbox/mbtiles");
const path = require("path");
const zlib = require("zlib");

function writeToDisk(tilePath, data) {
  mkdirSync(path.dirname(tilePath), { recursive: true });
  // Decompress the data if it's compressed
  try {
    data = zlib.gunzipSync(data);
  } catch (err) {
    console.error(`Error decompressing data for ${tilePath}`);
  }
  writeFileSync(tilePath, data);
}

function fetchTile(mbt, z, x, y) {
  return new Promise((resolve) => {
    mbt.getTile(z, x, y, (err, data, headers) => {
      if (!err) {
        const filePath = `./static_tiles/${z}/${x}/${y}.pbf`;
        writeToDisk(filePath, data);
      }
      resolve();
    });
  });
}

async function processTiles(mbt, maxZoom) {
  for (let z = 0; z <= maxZoom; z++) {
    const tilePromises = [];

    for (let x = 0; x <= Math.pow(2, z) - 1; x++) {
      for (let y = 0; y <= Math.pow(2, z) - 1; y++) {
        const tilePromise = fetchTile(mbt, z, x, y);
        tilePromises.push(tilePromise);
      }
    }

    await Promise.all(tilePromises);
    console.log(`Zoom level ${z} processed.`);
  }
}

const inputPath = "./natural_earth.vector.mbtiles";
const maxZoom = 7;

new mbtiles(inputPath, async (err, mbt) => {
  if (err) {
    console.error(`Error opening mbtiles file ${inputPath}`);
    process.exit(1);
  } else {
    await processTiles(mbt, maxZoom);
    console.log("All tiles processed.");
  }
});
