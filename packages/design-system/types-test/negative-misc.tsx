// More things the types must reject: charts, brand, icons, tokens.
import { Gauge } from "@truvar-ai/design-system/charts";
import { BrandProvider } from "@truvar-ai/design-system/brand";
import { Search } from "@truvar-ai/design-system/icons";
import { light, brands } from "@truvar-ai/design-system/tokens";
import type { TokenName } from "@truvar-ai/design-system/tokens";

// @ts-expect-error value and label are required
export const a = <Gauge />;
// @ts-expect-error value is a number from 0 to 1
export const b = <Gauge value="high" label="Score" />;
// @ts-expect-error unknown brand
export const c = <BrandProvider brand="acme">x</BrandProvider>;
// @ts-expect-error size is not an svg attribute value type
export const d = <Search width={{}} />;
// @ts-expect-error unknown token name
export const e: TokenName = "--not-a-token";
// @ts-expect-error unknown brand key
export const f = brands.acme;
export const g = light;
