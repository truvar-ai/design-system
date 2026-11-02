import { DocPage } from "../../../src/docs/DocPage.jsx";
import { docMeta, docJsonLd } from "../../../src/site/meta.js";
import { JsonLd } from "../../../src/site/JsonLd.jsx";

export const metadata = docMeta("en", "");
export default function Page() { return <><JsonLd data={docJsonLd("en", "")} /><DocPage id="" /></>; }
