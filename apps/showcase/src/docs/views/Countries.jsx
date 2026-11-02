"use client";
import { useState, useMemo } from "react";
import {
  Flag, CountryPicker, SearchField, Table, TableHeader, Column, TableBody, Row, Cell, MenuButton, MenuItem,
  toast, useFormat, COUNTRIES, countryMatches, countryByCode, Badge,
} from "../../ds.js";
import * as Icon from "@truvar-ai/design-system/icons";
import { useTr, useLang } from "../i18n.jsx";
import { Spec, ViewHeader } from "../ui.jsx";

export async function copyText(text, tr) {
  try { await navigator.clipboard.writeText(text); toast({ tone: "success", title: tr("Copied", "تم النسخ"), description: text }); }
  catch { toast({ tone: "warning", title: tr("Couldn't copy", "تعذّر النسخ"), description: tr("Your browser blocked clipboard access. Select the text and copy it instead.", "منع المتصفح الوصول إلى الحافظة. حدّد النص وانسخه يدويًا.") }); }
}

const SHOWCASE = ["EG", "SA", "AE", "QA", "KW", "MA", "US", "GB", "FR", "DE", "JP", "BR"];

export function Countries() {
  const tr = useTr(); const lang = useLang(); const f = useFormat();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState("EG");
  const [sort, setSort] = useState({ column: "name", direction: "ascending" });
  const nameOf = (c) => (lang === "ar" ? c.ar : c.en);
  const rows = useMemo(() => {
    const r = COUNTRIES.filter((c) => countryMatches(c, query));
    const key = { name: (c) => (lang === "ar" ? c.ar : c.en), code: (c) => c.code, dial: (c) => Number(c.dial) }[sort.column];
    const d = sort.direction === "descending" ? -1 : 1;
    return r.sort((a, b) => {
      const x = key(a), y = key(b);
      return (typeof x === "number" ? x - y : String(x).localeCompare(String(y), lang)) * d;
    });
  }, [query, sort, lang]);
  const p = countryByCode(picked);

  return (
    <>
      <ViewHeader viewId="countries" intro={tr(
        `Flags for ${COUNTRIES.length} countries and territories, with names in English and Arabic, ISO codes and dialling codes. Flags come from country-flag-icons (MIT); names come from the browser's built-in locale data.`,
        `أعلام ${f.number(COUNTRIES.length)} دولة ومنطقة، مع أسمائها بالإنجليزية والعربية ورموز ISO ورموز الاتصال. الأعلام من مكتبة country-flag-icons (رخصة MIT)، والأسماء من بيانات اللغة المدمجة في المتصفح.`)} />

      <Spec id="flags" name={tr("Flags", "الأعلام")} primitive={'Flag code="EG"'} note={tr("Use the 3:2 rectangle next to text and the circle for avatars and tight spaces. A hairline keeps white flags visible on white.", "استخدم المستطيل ٣:٢ بجوار النصوص، والدائرة للصور الرمزية والمساحات الضيقة. الخط الرفيع يُبقي الأعلام البيضاء ظاهرة على الخلفية البيضاء.")}>
        <div className="stack">
          <div className="flag-sizes">
            {[16, 20, 24, 32].map((s) => (
              <div key={s} className="flag-size"><Flag code="EG" size={s} title={tr("Egypt", "مصر")} /><Flag code="EG" size={s} shape="circle" /><span className="tv-desc" dir="ltr">{s}px</span></div>
            ))}
          </div>
          <div className="flag-wall">
            {SHOWCASE.map((c) => { const x = countryByCode(c); return (
              <div key={c} className="flag-chip"><Flag code={c} size={18} /><span>{nameOf(x)}</span></div>
            ); })}
          </div>
        </div>
      </Spec>

      <Spec id="country-picker" name={tr("Country picker", "منتقي الدولة")} primitive="Select + Autocomplete + ListBox" note={tr("Search by name in either language, ISO code or dialling code (“+20”, “20”, “EG”, “مصر”). The same picker sits inside the phone field.", "ابحث بالاسم بأي من اللغتين أو برمز ISO أو برمز الاتصال («+20» أو «20» أو «EG» أو «مصر»). هو نفس المنتقي الموجود داخل حقل الهاتف.")}>
        <div className="stack">
          <div className="cpicker-field"><CountryPicker value={picked} onChange={setPicked} showName showDial /></div>
          {p && (
            <div className="row">
              <Badge tone="navy">{nameOf(p)}</Badge>
              <Badge tone="neutral"><span dir="ltr">ISO {p.code}</span></Badge>
              <Badge tone="neutral"><span dir="ltr">+{p.dial}</span></Badge>
            </div>
          )}
        </div>
      </Spec>

      <Spec id="country-list" name={tr("All countries", "كل الدول")} primitive="Table + SearchField" wide
        note={tr("Sort by name, ISO code or dialling code. The menu on each row copies what you need.", "رتّب حسب الاسم أو رمز ISO أو رمز الاتصال، واستخدم القائمة في كل صف لنسخ ما تحتاجه.")}>
        <div className="stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 280px", maxWidth: 420 }}>
              <SearchField aria-label={tr("Search countries", "ابحث في الدول")} placeholder={tr("Name, ISO code or +code", "الاسم أو رمز ISO أو رمز الاتصال")} value={query} onChange={setQuery} />
            </div>
            <span className="tv-desc" aria-live="polite">{tr(`${rows.length} of ${COUNTRIES.length}`, `${f.number(rows.length)} من ${f.number(COUNTRIES.length)}`)}</span>
          </div>
          <div className="tv-table-scroll tv-table-tall">
            <Table aria-label={tr("Countries", "الدول")} sortDescriptor={sort} onSortChange={setSort}>
              <TableHeader>
                <Column id="name" isRowHeader allowsSorting>{tr("Country", "الدولة")}</Column>
                <Column id="other">{lang === "ar" ? "English" : "العربية"}</Column>
                <Column id="code" allowsSorting>ISO</Column>
                <Column id="dial" allowsSorting>{tr("Dialling code", "رمز الاتصال")}</Column>
                <Column id="actions" aria-label={tr("Actions", "إجراءات")} />
              </TableHeader>
              <TableBody items={rows} renderEmptyState={() => <div className="tv-empty-mini">{tr("No country matches that search.", "لا توجد دولة مطابقة لهذا البحث.")}</div>}>
                {(c) => (
                  <Row id={c.code}>
                    <Cell><span className="country-cell"><Flag code={c.code} size={18} /><b>{nameOf(c)}</b></span></Cell>
                    <Cell><span className="tv-desc" lang={lang === "ar" ? "en" : "ar"} dir="auto">{lang === "ar" ? c.en : c.ar}</span></Cell>
                    <Cell><code dir="ltr">{c.code}</code></Cell>
                    <Cell><span dir="ltr" className="mono-num">+{c.dial}</span></Cell>
                    <Cell>
                      <MenuButton label={tr(`Copy ${c.en} details`, `نسخ بيانات ${c.ar}`)} icon={<Icon.Copy />}
                        onAction={(k) => copyText(k === "code" ? c.code : k === "dial" ? `+${c.dial}` : nameOf(c), tr)}>
                        <MenuItem id="dial">{tr("Copy dialling code", "نسخ رمز الاتصال")}</MenuItem>
                        <MenuItem id="code">{tr("Copy ISO code", "نسخ رمز ISO")}</MenuItem>
                        <MenuItem id="name">{tr("Copy name", "نسخ الاسم")}</MenuItem>
                      </MenuButton>
                    </Cell>
                  </Row>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Spec>
    </>
  );
}
