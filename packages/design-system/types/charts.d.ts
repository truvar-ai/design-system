// Types for `@truvar-ai/design-system/charts`: Truvar-styled Recharts, plain-HTML/SVG chart widgets and the WorldMap.
import type * as React from "react";
import type { XAxisProps, YAxisProps } from "recharts";

/* ------------------------------------------------------------------ */
/* Recharts primitives, re-exported unchanged (ChartCell = Recharts Cell, ChartTooltipBase = Recharts Tooltip) */
/* ------------------------------------------------------------------ */
export {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell as ChartCell,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltipBase,
  ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Palette, locale and Recharts prop helpers                           */
/* ------------------------------------------------------------------ */

/** The six categorical chart colours as CSS variable references (`var(--chart-1)` to `var(--chart-6)`). */
export declare const CHART_COLORS: readonly [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

/** Locale-aware number formatters and reading direction for chart code (reads the react-aria locale). */
export interface ChartLocale {
  /** BCP 47 locale from the surrounding `I18nProvider`, e.g. `"en-US"` or `"ar-EG"`. */
  locale: string;
  /** True when the locale reads right to left. */
  rtl: boolean;
  /** `"ar"` for Arabic locales, otherwise `"en"`. */
  lang: "en" | "ar";
  /** Format a number with optional `Intl.NumberFormat` options. */
  num: (value: number, options?: Intl.NumberFormatOptions) => string;
  /** Compact notation, at most one fraction digit (`1.2K`). */
  compact: (value: number) => string;
  /** Format a ratio (0.25) as a percentage; `digits` is the maximum fraction digits (default 0). */
  pct: (value: number, digits?: number) => string;
  /** Compact EGP currency. */
  money: (value: number) => string;
}
/** Locale, direction and number formatters for building charts. Must run under a react-aria locale context (works without a provider too). */
export declare function useChartLocale(): ChartLocale;

/** Props returned by `axisProps` before the caller's overrides. */
export interface ChartAxisBaseProps {
  tick: { fill: string; fontSize: number; fontFamily: string };
  tickLine: false;
  axisLine: { stroke: string };
}
/** Props accepted as overrides by `axisProps` (any Recharts XAxis or YAxis prop). */
export type ChartAxisOverrides = Partial<XAxisProps> | Partial<YAxisProps>;
/** Truvar axis styling (muted ticks, no tick lines) for `<XAxis>` / `<YAxis>`; `extra` props override the defaults. */
export declare function axisProps<E extends ChartAxisOverrides = {}>(
  rtl?: boolean,
  extra?: E,
): Omit<ChartAxisBaseProps, keyof E> & E;

/** Props for a Truvar-styled `<CartesianGrid>` (horizontal dashed-free lines only). Spread it, then override as needed. */
export declare const gridProps: Readonly<{ stroke: string; strokeDasharray: string; vertical: false }>;

/** One series row passed to `ChartTooltip` by Recharts. */
export interface ChartTooltipEntry {
  name?: string | number;
  value?: number;
  dataKey?: string | number;
  color?: string;
  payload?: { fill?: string; [key: string]: unknown };
}
export interface ChartTooltipProps<L extends string | number = string | number> {
  /** Supplied by Recharts. */
  active?: boolean;
  /** Supplied by Recharts. */
  payload?: readonly ChartTooltipEntry[];
  /** The hovered x value, supplied by Recharts. */
  label?: L;
  /** Format each series value; receives the whole entry so you can branch on `dataKey`. */
  valueFormat?: (value: number, entry: ChartTooltipEntry) => React.ReactNode;
  /** Format the heading (the x value). */
  labelFormat?: (label: L) => React.ReactNode;
}
/** Tooltip body in Truvar style; pass it as the `content` of a Recharts Tooltip (see `tooltipProps`). */
export declare function ChartTooltip<L extends string | number = string | number>(
  props: ChartTooltipProps<L>,
): React.JSX.Element | null;

/** Props to spread onto `ChartTooltipBase` (Recharts Tooltip): Truvar content, cursor and no animation. */
export interface ChartTooltipSpreadProps {
  content: React.ReactElement;
  cursor: { fill: string; stroke: string; strokeWidth: number };
  wrapperStyle: { outline: string };
  isAnimationActive: false;
}
/** Build Recharts Tooltip props with Truvar styling; `valueFormat` and `labelFormat` configure `ChartTooltip`. */
export declare function tooltipProps<L extends string | number = string | number>(
  valueFormat?: ChartTooltipProps<L>["valueFormat"],
  labelFormat?: ChartTooltipProps<L>["labelFormat"],
): ChartTooltipSpreadProps;

/* ------------------------------------------------------------------ */
/* ChartCard + legend                                                  */
/* ------------------------------------------------------------------ */

export interface ChartLegendItem {
  name: string;
  /** Any CSS colour, usually a `var(--chart-n)`. */
  color: string;
  /** Draw the swatch as a dashed line marker. */
  dashed?: boolean;
}
export interface ChartLegendProps {
  items: readonly ChartLegendItem[];
}
/** A horizontal legend list of coloured dots and names. */
export declare function ChartLegend(props: ChartLegendProps): React.JSX.Element;

/** A column of the "Table" view; `key` is a property of the row object. */
export type ChartTableColumn<R extends object> = {
  [K in keyof R & string]: {
    key: K;
    label: React.ReactNode;
    /** Render the cell; defaults to showing the raw value. */
    format?: (value: R[K], row: R) => React.ReactNode;
    align?: "start" | "end";
  };
}[keyof R & string];
/** The accessible table that mirrors the chart's data. */
export interface ChartTable<R extends object> {
  columns: readonly ChartTableColumn<R>[];
  rows: readonly R[];
}

export interface ChartCardProps<R extends object = Record<string, unknown>> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Plain-text description of what the chart shows; used as the chart's accessible name and a screen-reader caption. */
  summary?: string;
  legend?: readonly ChartLegendItem[];
  /** When set, a Chart/Table toggle appears and the table renders the same data. */
  table?: { columns: readonly ChartTableColumn<NoInfer<R>>[]; rows: readonly R[] };
  /** Chart body height in px. Default 260. */
  height?: number;
  /** A Recharts chart (e.g. `<LineChart>`); it is wrapped in a `ResponsiveContainer`. */
  children: React.ReactElement;
  /** Extra controls placed beside the toggle in the header. */
  actions?: React.ReactNode;
  /** Heading level of the title. Default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}
/** A figure with title, legend, screen-reader summary and a Chart/Table toggle wrapping a Recharts chart. */
export declare function ChartCard<R extends object = Record<string, unknown>>(props: ChartCardProps<R>): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Small standalone charts                                             */
/* ------------------------------------------------------------------ */

interface SparklineBaseProps<T extends object> {
  data: readonly T[];
  /** Line/area colour. Default `var(--chart-1)`. */
  color?: string;
  /** Height in px (or any CSS length). Default 36. */
  height?: number | string;
  /** Fill under the line. Default true. */
  area?: boolean;
}
/** Props for `Sparkline`: `dataKey` defaults to `"v"`, so it is only required when rows have no `v`. */
export type SparklineProps<T extends object = { v: number }> = SparklineBaseProps<T> &
  ([T] extends [{ v: unknown }] ? { dataKey?: keyof T & string } : { dataKey: keyof T & string });
/** A tiny trend line or area for stat tiles (decorative, hidden from assistive tech). */
export declare function Sparkline<T extends object = { v: number }>(props: SparklineProps<T>): React.JSX.Element;

export interface GaugeProps {
  /** Progress from 0 to 1 (clamped). */
  value: number;
  /** Accessible name, announced with the percentage. */
  label: string;
  /** Small text under the percentage. */
  sublabel?: React.ReactNode;
  /** Goal from 0 to 1, drawn as a tick on the arc. */
  target?: number;
}
/** A half-ring gauge showing one ratio against an optional target. */
export declare function Gauge(props: GaugeProps): React.JSX.Element;

export interface FunnelStage {
  label: React.ReactNode;
  value: number;
}
export interface FunnelBarsProps {
  /** Ordered stages; bars are scaled to the first stage. */
  stages: readonly FunnelStage[];
  /** Format a stage count. */
  format: (value: number) => React.ReactNode;
  /** Format the conversion ratio (0 to 1) from the previous stage. */
  pct: (ratio: number) => React.ReactNode;
  /** Screen-reader text after each conversion, e.g. "of the previous stage". */
  convLabel: React.ReactNode;
}
/** A stepped funnel as an ordered list, with each stage's count and conversion from the previous one. */
export declare function FunnelBars(props: FunnelBarsProps): React.JSX.Element;

export interface RankedBarItem {
  label: React.ReactNode;
  value: number;
}
export interface RankedBarsProps {
  /** Rendered in the given order (sort largest first yourself). */
  items: readonly RankedBarItem[];
  format: (value: number) => React.ReactNode;
  /** Bar colour. Default `var(--chart-1)`. */
  color?: string;
}
/** Horizontal bars as an HTML list, scaled to the largest value. */
export declare function RankedBars(props: RankedBarsProps): React.JSX.Element;

export interface HeatmapProps {
  /** Row labels (top to bottom). */
  rows: readonly string[];
  /** Column labels (left to right); use "" to leave a column unlabelled. */
  cols: readonly string[];
  /** `values[rowIndex][colIndex]`. */
  values: readonly (readonly number[])[];
  /** Value that maps to the darkest cell. */
  max: number;
  /** Format a value for the default cell tooltip. */
  format: (value: number) => string;
  /** Accessible description of the whole grid. */
  ariaLabel?: string;
  /** Custom tooltip text for a cell. */
  cellLabel?: (row: string, col: string, value: number) => string;
}
/** A rows by columns grid whose cell colour follows a sequential scale. */
export declare function Heatmap(props: HeatmapProps): React.JSX.Element;

/* ------------------------------------------------------------------ */
/* Maps                                                                */
/* ------------------------------------------------------------------ */

/** Country id used by the map: Natural Earth ADM0_A3 (ISO 3166-1 alpha-3 style) code such as `"EGY"`, `"SAU"`, `"USA"`. Not alpha-2. */
export type CountryCode = string;
/** Continent focus ids: a Natural Earth continent name, `"all"` for the whole world, or `"mena"` for Middle East and North Africa. */
export type MapContinentId = "all" | "Africa" | "Asia" | "Europe" | "North America" | "South America" | "Oceania" | "mena";
/** Which border view to draw: `"EG"` (Egypt's official view, default) or `"default"` (de facto control). */
export type MapPov = "EG" | "default";

export interface MapContinent {
  readonly id: MapContinentId;
  readonly en: string;
  readonly ar: string;
}
/** The region choices shown in the map's region switcher. */
export declare const CONTINENTS: readonly MapContinent[];

export interface MapMarker {
  id: string;
  /** Longitude in degrees. */
  lon: number;
  /** Latitude in degrees. */
  lat: number;
  /** Dot radius in map units. Default 5. */
  r?: number;
  /** Adds a pulsing ring (paused for reduced motion). */
  live?: boolean;
  /** Tooltip text (the SVG title). */
  label?: string;
}

export interface WorldMapProps {
  /** Value per country, keyed by `CountryCode`; countries with no value (or 0 or less) stay empty. */
  data?: Readonly<Record<CountryCode, number>>;
  /** Name of the measure, shown in the tooltip, legend and table. */
  valueLabel?: React.ReactNode;
  /** Format a value for the tooltip, legend and table. */
  format?: (value: number) => React.ReactNode;
  /** Number of colour buckets. Default 5. */
  steps?: number;
  /** Selected country id (controlled). */
  selected?: CountryCode | null;
  /** Called with the clicked country, or `null` when the selected one is clicked again. */
  onSelect?: (id: CountryCode | null) => void;
  markers?: readonly MapMarker[];
  /** Border view. Default `"EG"`. */
  pov?: MapPov;
  /** Focused region (controlled); omit for uncontrolled. */
  continent?: MapContinentId;
  onContinentChange?: (id: MapContinentId) => void;
  /** Maximum height of the map or table in px. Default 520. */
  height?: number | string;
  /** Accessible description of the map. */
  ariaLabel?: string;
  /** Show the region switcher. Default true. */
  showContinents?: boolean;
  /** Show the Map/Table switcher. Default true. */
  showTableToggle?: boolean;
  /** Enable zoom, pan, selection and keyboard control. Default true. */
  interactive?: boolean;
}
/** An interactive choropleth world map (Natural Earth, d3-geo) with region focus, zoom, selection, live markers and a table view. */
export declare function WorldMap(props: WorldMapProps): React.JSX.Element;

/** Properties of a country in the bundled geography. */
export interface MapCountryProperties {
  /** ISO 3166-1 alpha-2 code; missing for a few disputed areas (e.g. Northern Cyprus, Somaliland) in the default view. */
  iso2?: string;
  /** English name. */
  en: string;
  /** Arabic name. */
  ar: string;
}
/** The display name of a country in English or Arabic (uses the shared phone/country-input names when available). */
export declare function countryName(properties: MapCountryProperties, lang: "en" | "ar"): string;

/** A country entry for pickers that pair with the map. */
export interface MapCountry {
  /** The same id the map uses for `data` and `selected`. */
  id: CountryCode;
  /** ISO 3166-1 alpha-2 code (for flags); undefined for a few disputed areas. */
  iso2: string | undefined;
  /** Continent name as in Natural Earth. */
  cont: string;
  /** Population. */
  pop: number;
  /** Localised name. */
  name: string;
}
/** All map countries (sorted by localised name) for a search box or list beside the map. */
export declare function useMapCountries(pov?: MapPov): MapCountry[];
