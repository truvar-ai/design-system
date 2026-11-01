import fs from "fs";
import { topology } from "topojson-server";
import { quantize } from "topojson-client";
const src = JSON.parse(fs.readFileSync("./geo-src/ne_110m_admin_0_countries.geojson", "utf8"));
const features = src.features.map((f) => {
  const p = f.properties;
  const iso2 = p.ISO_A2_EH && p.ISO_A2_EH !== "-99" ? p.ISO_A2_EH : null;
  return { type: "Feature", id: p.ADM0_A3, geometry: f.geometry, properties: {
    a3: p.ADM0_A3, iso2, eg: p.ADM0_A3_EG, cont: p.CONTINENT, en: p.NAME_EN, ar: p.NAME_AR, pop: p.POP_EST } };
});
const topo = quantize(topology({ countries: { type: "FeatureCollection", features } }), 1e4);
fs.writeFileSync("./src/components/geo/world-110m.json", JSON.stringify(topo));
console.log("features", features.length, "bytes", fs.statSync("./src/components/geo/world-110m.json").size,
  "continents", [...new Set(features.map(f=>f.properties.cont))].join(", "), "| no iso2:", features.filter(f=>!f.properties.iso2).map(f=>f.properties.en).join(", "));
