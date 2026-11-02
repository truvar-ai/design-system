import { Landing } from "../../src/site/Landing.jsx";
import { homeMeta, homeJsonLd } from "../../src/site/meta.js";
import { JsonLd } from "../../src/site/JsonLd.jsx";

export const metadata = homeMeta("en");
export default function Page() { return <><JsonLd data={homeJsonLd("en")} /><Landing /></>; }
