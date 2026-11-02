import { DocPage } from "../../../../../src/docs/DocPage.jsx";
import { docMeta, guideSlugs, docJsonLd } from "../../../../../src/site/meta.js";
import { JsonLd } from "../../../../../src/site/JsonLd.jsx";

export const dynamicParams = false;
// The written guides; every component page has its own generated route (scripts/routes.mjs)
export const generateStaticParams = guideSlugs;
export async function generateMetadata({ params }) { return docMeta("ar", (await params).slug); }
export default async function Page({ params }) {
  const { slug } = await params;
  return <><JsonLd data={docJsonLd("ar", slug)} /><DocPage id={slug} /></>;
}
