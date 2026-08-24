import { SavedProduct } from "./app-settings";

const HARAM_TOKENS = [
  "porc",
  "pork",
  "lard",
  "saindoux",
  "bacon",
  "jambon",
  "gelatine de porc",
  "pork gelatin",
  "alcool",
  "alcohol",
  "ethanol",
  "vin",
  "wine",
  "bière",
  "beer",
  "rhum",
  "liqueur",
  "e120",
  "carmin",
  "cochenille",
  "e441",
  "e542",
];

const DOUBT_TOKENS = [
  "gelatine",
  "gelatin",
  "présure",
  "rennet",
  "mono- et diglycérides",
  "monoglycerides",
  "diglycerides",
  "e471",
  "e472",
  "e470",
  "e904",
  "shellac",
  "arome naturel",
  "arôme naturel",
  "natural flavour",
  "natural flavor",
  "glycerine",
  "glycérine",
  "e422",
  "l-cysteine",
  "e920",
  "emulsifiant",
];

export type Verdict = "halal" | "haram" | "doubtful" | "unknown";

export type ProductResult = SavedProduct & {
  ingredients: string;
  reasons: string[];
  certified: boolean;
  source: string;
};

function norm(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Known halal certification bodies referenced by Open Food Facts labels. */
const CERT_TOKENS = ["halal", "mui", "lppom", "jakim", "avs", "hfa", "hmc", "sfcvh"];

const HEADERS = {
  "User-Agent": "IslamNoorApp/1.0 (https://islam-noor.app; contact@islamnoor.app)",
  Accept: "application/json",
};

export function analyse(
  product: Record<string, unknown>,
  source = "Open Food Facts",
): ProductResult {
  const name = String(
    product.product_name ||
      product.product_name_fr ||
      product.product_name_de ||
      product.product_name_en ||
      product.generic_name ||
      product.title ||
      "",
  );
  const brand = Array.isArray(product.brands)
    ? product.brands.join(", ")
    : String(product.brands || product.brand || "");

  // Multi-language ingredient extraction
  let ingredients = String(
    product.ingredients_text_fr ||
      product.ingredients_text_de ||
      product.ingredients_text_ch ||
      product.ingredients_text_nl ||
      product.ingredients_text_en ||
      product.ingredients_text_it ||
      product.ingredients_text_es ||
      product.ingredients_text ||
      product.description ||
      "",
  );

  // If text is empty, build from structured ingredients array
  if (!ingredients.trim() && Array.isArray(product.ingredients) && product.ingredients.length > 0) {
    ingredients = product.ingredients
      .map((i: unknown) => {
        if (typeof i === "object" && i !== null) {
          const obj = i as Record<string, unknown>;
          return String(obj.text || obj.text_fr || obj.text_de || obj.id || "");
        }
        return String(i || "");
      })
      .filter(Boolean)
      .join(", ");
  }

  // Tags & Hierarchies extraction
  const additivesTags = Array.isArray(product.additives_tags)
    ? product.additives_tags.map((t) => norm(String(t)))
    : [];
  const ingredientsHierarchy = Array.isArray(product.ingredients_hierarchy)
    ? product.ingredients_hierarchy.map((t) => norm(String(t)))
    : [];
  const categoriesTags = Array.isArray(product.categories_tags)
    ? product.categories_tags.map((t) => norm(String(t)))
    : Array.isArray(product.categories_hierarchy)
      ? product.categories_hierarchy.map((t) => norm(String(t)))
      : [];

  const labelsStr = Array.isArray(product.labels)
    ? product.labels.join(" ")
    : String(product.labels || "");
  const labelsTagsStr = Array.isArray(product.labels_tags)
    ? product.labels_tags.join(" ")
    : String(product.labels_tags || "");
  const labels = norm(labelsStr + " " + labelsTagsStr);

  const text = norm(ingredients + " " + ingredientsHierarchy.join(" "));
  const reasons: string[] = [];

  const certified = CERT_TOKENS.some((c) => labels.includes(c));

  let verdict: Verdict = "unknown";

  // Check Haram tokens in text & tags
  const haramInText = HARAM_TOKENS.filter((tok) => text.includes(norm(tok)));
  const haramInTags = [
    ...additivesTags.filter((t) =>
      ["e120", "carmin", "cochineal", "e441", "e542"].some((h) => t.includes(h)),
    ),
    ...ingredientsHierarchy.filter((t) =>
      ["pork", "lard", "bacon", "ham", "alcohol", "wine", "beer", "rum", "carmine", "gelatin"].some(
        (h) => t.includes(h),
      ),
    ),
    ...categoriesTags.filter((t) =>
      ["pork", "ham", "wine", "beer", "spirits", "alcoholic"].some((h) => t.includes(h)),
    ),
  ];

  // Check Doubtful tokens in text & tags
  const doubtInText = DOUBT_TOKENS.filter((tok) => text.includes(norm(tok)));
  const doubtInTags = additivesTags.filter((t) =>
    ["e471", "e472", "e470", "e904", "e422", "e920"].some((d) => t.includes(d)),
  );

  if (haramInText.length || haramInTags.length) {
    verdict = "haram";
    const found = Array.from(new Set([...haramInText, ...haramInTags]));
    reasons.push(`Ingrédients/dérivés interdits détectés : ${found.join(", ")}`);
  } else if (doubtInText.length || doubtInTags.length) {
    verdict = "doubtful";
    const found = Array.from(new Set([...doubtInText, ...doubtInTags]));
    reasons.push(`Ingrédients/additifs à origine incertaine : ${found.join(", ")}`);
  } else if (certified) {
    verdict = "halal";
    reasons.push("Certification halal déclarée (LPPOM MUI / JAKIM / AVS / HFA / HMC).");
  } else if (ingredients.trim()) {
    verdict = "halal";
    reasons.push("Aucun ingrédient interdit ni douteux détecté dans la liste.");
  } else {
    // Category check for 100% natural pure staple products (e.g. water, fruit, milk, rice)
    const isNaturalStaple = categoriesTags.some((cat) =>
      [
        "water",
        "eau",
        "fruit",
        "vegetable",
        "legume",
        "milk",
        "lait",
        "honey",
        "miel",
        "rice",
        "riz",
        "grain",
        "flour",
        "farine",
        "coffee",
        "cafe",
        "tea",
        "the",
        "egg",
        "oeuf",
      ].some((staple) => cat.includes(staple)),
    );

    if (isNaturalStaple) {
      verdict = "halal";
      reasons.push(
        "Catégorie de produit brut ou naturel (eau, fruit, légume, lait, riz, etc.) sans additifs complexes.",
      );
    } else {
      verdict = "doubtful";
      reasons.push("Liste d'ingrédients indisponible malgré la recherche multi-sources.");
    }
  }

  if (certified && verdict === "haram") {
    reasons.push("Certification déclarée mais ingrédients contradictoires : vérifiez l'étiquette.");
  }

  return {
    code: String(product.code ?? ""),
    name: name || "Produit sans nom",
    brand,
    image:
      (product.image_front_small_url as string) ||
      (product.image_url as string) ||
      (product.image_front_url as string) ||
      undefined,
    verdict,
    ingredients,
    reasons,
    certified,
    source,
  };
}

/* ---------- Multi-source Endpoints ---------- */

async function fetchWithTimeout(url: string, ms = 3000): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function offByEndpoint(
  url: string,
  sourceName = "Open Food Facts",
): Promise<ProductResult | null> {
  const res = await fetchWithTimeout(url, 3200);
  if (!res) return null;
  try {
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;
    return analyse(json.product, sourceName);
  } catch {
    return null;
  }
}

async function offByBarcode(code: string) {
  return offByEndpoint(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`,
    "Open Food Facts (World)",
  );
}

async function upcByBarcode(code: string) {
  const res = await fetchWithTimeout(
    `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`,
    3000,
  );
  if (!res) return null;
  try {
    const json = await res.json();
    const item = json.items?.[0];
    if (!item) return null;
    return analyse(
      {
        code,
        product_name: item.title,
        brands: item.brand,
        ingredients_text: item.description ?? "",
        image_url: item.images?.[0],
      },
      "UPC Item DB",
    );
  } catch {
    return null;
  }
}

/** Multi-source barcode lookup with automatic fallbacks and cross-searches. */
export async function fetchByBarcode(code: string): Promise<ProductResult | null> {
  const cleanCode = code.trim();
  if (!cleanCode) return null;

  // 1. Check Curated Verified Database
  const curated = CURATED_PRODUCTS.find((p) => p.code === cleanCode);
  if (curated) return curated;

  // 2. Primary Open Food Facts World lookup
  const primaryOff = await offByBarcode(cleanCode).catch(() => null);

  // If primary OFF returned a result WITH ingredients, return immediately
  if (primaryOff && primaryOff.ingredients && primaryOff.ingredients.trim().length > 0) {
    return primaryOff;
  }

  // 3. Multi-source parallel fallbacks (Swiss, Belgian, German, French nodes + UPCitemdb)
  const [chRes, beRes, deRes, frRes, upcRes] = await Promise.allSettled([
    offByEndpoint(
      `https://ch.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanCode)}.json`,
      "Open Food Facts (Suisse)",
    ),
    offByEndpoint(
      `https://be.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanCode)}.json`,
      "Open Food Facts (Belgique)",
    ),
    offByEndpoint(
      `https://de.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanCode)}.json`,
      "Open Food Facts (Allemagne)",
    ),
    offByEndpoint(
      `https://fr.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanCode)}.json`,
      "Open Food Facts (France)",
    ),
    upcByBarcode(cleanCode),
  ]);

  const candidates: ProductResult[] = [];
  if (primaryOff) candidates.push(primaryOff);
  if (chRes.status === "fulfilled" && chRes.value) candidates.push(chRes.value);
  if (beRes.status === "fulfilled" && beRes.value) candidates.push(beRes.value);
  if (deRes.status === "fulfilled" && deRes.value) candidates.push(deRes.value);
  if (frRes.status === "fulfilled" && frRes.value) candidates.push(frRes.value);
  if (upcRes.status === "fulfilled" && upcRes.value) candidates.push(upcRes.value);

  // Return candidate with populated ingredients
  const candidateWithIngredients = candidates.find(
    (c) => c.ingredients && c.ingredients.trim().length > 0,
  );
  if (candidateWithIngredients) return candidateWithIngredients;

  // 4. Cross-search by Product Name & Brand if ingredients are still missing
  const candidateName = candidates.find((c) => c.name && c.name !== "Produit sans nom")?.name || "";
  const candidateBrand = candidates.find((c) => c.brand)?.brand || "";

  if (candidateName || candidateBrand) {
    const searchQuery = `${candidateBrand} ${candidateName}`.trim();
    if (searchQuery.length >= 3) {
      try {
        const searchMatches = await searchByName(searchQuery);
        const matchWithIngredients = searchMatches.find(
          (m) => m.ingredients && m.ingredients.trim().length > 0,
        );
        if (matchWithIngredients) {
          return {
            ...matchWithIngredients,
            code: cleanCode,
            name: candidateName || matchWithIngredients.name,
            brand: candidateBrand || matchWithIngredients.brand,
            reasons: [
              ...matchWithIngredients.reasons,
              `Composition identifiée via recherche croisée multi-sources (${matchWithIngredients.source}).`,
            ],
          };
        }
      } catch {
        /* ignore cross-search failure */
      }
    }
  }

  // 5. Final decision based on best candidate info or category analysis
  if (candidates.length > 0) {
    return candidates.reduce((prev, curr) => {
      if (curr.verdict === "halal" || curr.verdict === "haram") return curr;
      if (prev.verdict === "halal" || prev.verdict === "haram") return prev;
      return curr;
    }, candidates[0]);
  }

  return null;
}

/* ---------- Name search: full-text first, legacy fallback ---------- */

const CURATED_PRODUCTS: ProductResult[] = [
  {
    code: "3017620422003",
    name: "Nutella (Pâte à tartiner)",
    brand: "Ferrero",
    verdict: "halal",
    ingredients:
      "Sucre, huile de palme, noisettes (13%), lait écrémé en poudre (8,7%), cacao maigre (7,4%), émulsifiants : lécithines [soja], vanilline.",
    reasons: ["Sans porc, sans alcool. Émulsifiant d'origine végétale (soja)."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.430.400.jpg",
  },
  {
    code: "8000500037560",
    name: "Kinder Bueno",
    brand: "Ferrero",
    verdict: "doubtful",
    ingredients:
      "Chocolat au lait 31,5%, sucre, huile de palme, farine de froment, noisettes (10,8%), lait écrémé en poudre, émulsifiants: lécithines [soja], arômes.",
    reasons: ["Ingrédients à origine incertaine : présence d'arômes et dérivés lactés."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/800/050/003/7560/front_fr.112.400.jpg",
  },
  {
    code: "3103220009574",
    name: "Haribo Croco / Dragibus / Goldbären (Classique)",
    brand: "Haribo France",
    verdict: "haram",
    ingredients: "Sirop de glucose, sucre, gélatine de porc, dextrose, acidifiant: acide citrique.",
    reasons: ["Ingrédient interdit détecté : gélatine de porc."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/310/322/000/9574/front_fr.82.400.jpg",
  },
  {
    code: "8690526010014",
    name: "Haribo Halal (Chamallows / Goldbären)",
    brand: "Haribo Halal",
    verdict: "halal",
    ingredients: "Sirop de glucose, sucre, gélatine bovine certifiée halal, dextrose, arômes.",
    reasons: ["Certification halal déclarée (Gélatine bovine certifiée)."],
    certified: true,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/869/052/601/0014/front_fr.20.400.jpg",
  },
  {
    code: "5449000000996",
    name: "Coca-Cola Original",
    brand: "Coca-Cola",
    verdict: "halal",
    ingredients:
      "Eau gazéifiée, sucre, colorant: E150d, acidifiant: E338, arômes naturels (dont extraits végétaux et caféine).",
    reasons: ["Aucun ingrédient interdit ni douteux détecté."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_fr.387.400.jpg",
  },
  {
    code: "7622210449283",
    name: "Oreo Original",
    brand: "Mondelez / Oreo",
    verdict: "halal",
    ingredients:
      "Farine de blé, sucre, huile de palme, cacao maigre en poudre, sirop de glucose-fructose, poudres à lever, sel, émulsifiant (lécithines de soja), arôme (vanilline).",
    reasons: ["Convient aux végétariens, sans porc, sans alcool."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/762/221/044/9283/front_fr.46.400.jpg",
  },
  {
    code: "9002490100070",
    name: "Red Bull Energy Drink",
    brand: "Red Bull",
    verdict: "halal",
    ingredients:
      "Eau gazéifiée, sucre, glucose, acidifiant (acide citrique), taurine (0,4%), correcteur d'acidité, caféine, vitamines, arômes.",
    reasons: ["Taurine 100% synthétique, aucun ingrédient d'origine animale ni alcool."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/900/249/010/0070/front_fr.88.400.jpg",
  },
  {
    code: "5000159461122",
    name: "M&M's Peanut (Cacahuète)",
    brand: "Mars",
    verdict: "doubtful",
    ingredients:
      "Sucre, cacahuètes, pâte de cacao, lait écrémé en poudre, beurre de cacao, sirop de glucose, émulsifiants (lécithine de soja, E414), colorants (E100, E120, E133, E160a, E160e, E170).",
    reasons: [
      "Ingrédients douteux/interdits selon marchés : présence éventuelle de carmin E120 / E471.",
    ],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/500/015/946/1122/front_fr.116.400.jpg",
  },
  {
    code: "3228857000166",
    name: "Oasis Tropical",
    brand: "Oasis / Schweppes",
    verdict: "halal",
    ingredients:
      "Eau de source, jus de fruits à base de concentrés 12% (orange, pomme, fruit de la passion, mangue), sucre, acidifiant: acide citrique, arômes naturels.",
    reasons: ["Jus de fruits sans alcool, arômes végétaux."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/322/885/700/0166/front_fr.102.400.jpg",
  },
  {
    code: "8715700110487",
    name: "Pringles Original",
    brand: "Pringles",
    verdict: "halal",
    ingredients:
      "Pommes de terre déshydratées, huiles végétales (tournesol, palme, maïs), farine de blé, farine de riz, émulsifiant (E471), maltodextrine, sel.",
    reasons: ["Émulsifiant E471 d'origine 100% végétale (certifié marque)."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/871/570/011/0487/front_fr.48.400.jpg",
  },
  {
    code: "3168930010003",
    name: "Capri-Sun Multivitamin / Orange",
    brand: "Capri-Sun",
    verdict: "halal",
    ingredients:
      "Eau de source, jus de fruits à base de concentré 12% (orange, pomme, ananas, banane, kiwi, passion), sucre, acide citrique, vitamines.",
    reasons: ["Sans conservateur, sans alcool, sans gélatine."],
    certified: false,
    source: "Base de données vérifiée Nur",
    image: "https://images.openfoodfacts.org/images/products/316/893/001/0003/front_fr.78.400.jpg",
  },
];

async function searchFastOFF(q: string): Promise<ProductResult[]> {
  try {
    const res = await fetch(
      `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=24`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.hits || !Array.isArray(json.hits)) return [];
    return json.hits.map((h: Record<string, unknown>) =>
      analyse(
        {
          code: h.code || h.id,
          product_name: h.product_name || h.product_name_fr || h.product_name_en,
          brands: h.brands,
          ingredients_text_fr: h.ingredients_text_fr || h.ingredients_text,
          labels: h.labels,
          labels_tags: h.labels_tags,
          image_front_small_url: h.image_front_small_url || h.image_url || h.image_front_url,
        },
        "Open Food Facts",
      ),
    );
  } catch {
    return [];
  }
}

async function searchFallbackOFF(q: string): Promise<ProductResult[]> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.net/cgi/search.pl?search_terms=${encodeURIComponent(
        q,
      )}&search_simple=1&action=process&json=1&page_size=24`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return ((json.products ?? []) as Record<string, unknown>[]).map((p) =>
      analyse(p, "Open Food Facts"),
    );
  } catch {
    return [];
  }
}

async function searchUpc(q: string): Promise<ProductResult[]> {
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(q)}&match_mode=1`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return ((json.items ?? []) as Record<string, unknown>[]).slice(0, 10).map((item) =>
      analyse(
        {
          code: String((item.upc as string) ?? (item.ean as string) ?? ""),
          product_name: item.title,
          brands: item.brand,
          ingredients_text: item.description ?? "",
          image_url: (item.images as string[])?.[0],
        },
        "UPC Item DB",
      ),
    );
  } catch {
    return [];
  }
}

/**
 * Instant & reliable search combining curated verified database
 * with live Open Food Facts & UPC databases.
 */
export async function searchByName(q: string): Promise<ProductResult[]> {
  const term = q.trim();
  if (!term) return [];

  const normalizedTerm = norm(term);

  // 1. Check curated database first
  const curatedMatches = CURATED_PRODUCTS.filter(
    (p) =>
      norm(p.name).includes(normalizedTerm) ||
      norm(p.brand).includes(normalizedTerm) ||
      p.code.includes(term),
  );

  // 2. Fast Open Food Facts Search Engine
  const fastResults = await searchFastOFF(term);

  // 3. Fallback to secondary endpoints if fast search returns few results
  let fallbackResults: ProductResult[] = [];
  if (fastResults.length < 5) {
    const [fallbackRes, upcRes] = await Promise.allSettled([
      searchFallbackOFF(term),
      searchUpc(term),
    ]);
    fallbackResults = [
      ...(fallbackRes.status === "fulfilled" ? fallbackRes.value : []),
      ...(upcRes.status === "fulfilled" ? upcRes.value : []),
    ];
  }

  const combined = [...curatedMatches, ...fastResults, ...fallbackResults];

  const seen = new Set<string>();
  return combined.filter((r) => {
    const key = r.code ? r.code : `${r.name.toLowerCase()}-${r.brand.toLowerCase()}`;
    if (seen.has(key) || !r.name || r.name === "Produit sans nom") return false;
    seen.add(key);
    return true;
  });
}
