// ─── Trait Registry ──────────────────────────────────────────────────────────
// Hard-coded trait database parsed from layer filenames.
// Paths: /assets/layers/general/{Category}/{TraitName}_{Weight}.png
//        /assets/layers/onsie/{Category}/{TraitName}_{Weight}.png

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Trait {
  name: string;        // e.g. "Gold_Tail"
  displayName: string; // e.g. "Gold Tail"
  category: string;    // e.g. "Accessories"
  weight: number;      // from filename
  imagePath: string;   // e.g. "/assets/layers/general/Accessories/Gold_Tail_4.png"
  isOnsie: boolean;
}

export interface TraitCategory {
  name: string;
  traits: Trait[];
  totalWeight: number;
}

export type CubType = "regular" | "onsie" | "oneofone";

export interface CubMetadata {
  id: number;
  name: string;
  type: CubType;
  attributes: { trait_type: string; value: string }[];
}

// ─── Render order ────────────────────────────────────────────────────────────

const REGULAR_CATEGORY_ORDER = [
  "Background",
  "Body",
  "Outfit",
  "Hat",
  "Eyes",
  "Accessories",
  "Mouth",
  "Shoes",
] as const;

const ONSIE_CATEGORY_ORDER = [
  "Background",
  "Body",
  "Mouth",
  "Onsie",
  "Eyes",
] as const;

// ─── Helper to build a Trait from raw data ───────────────────────────────────

function makeTrait(
  category: string,
  name: string,
  weight: number,
  isOnsie: boolean,
): Trait {
  const set = isOnsie ? "onsie" : "general";
  return {
    name,
    displayName: name.replace(/_/g, " "),
    category,
    weight,
    imagePath: `/assets/layers/${set}/${category}/${name}_${weight}.png`,
    isOnsie,
  };
}

// ─── Raw layer data ──────────────────────────────────────────────────────────
// Format: [traitName, weight]

type RawEntry = [string, number];

const GENERAL_LAYERS: Record<string, RawEntry[]> = {
  Accessories: [
    ["Cross_Earring", 50],
    ["Gold_Hoops", 65],
    ["Gold_Stud", 40],
    ["Gold_Tail", 4],
    ["None", 750],
    ["Nose_Ring", 65],
    ["Silver_Tail", 8],
  ],
  Background: [
    ["Aquamarine", 30],
    ["Ash", 10],
    ["Baby Blue", 30],
    ["Bamboo", 2],
    ["Blue Skys", 15],
    ["Burnt Ash", 20],
    ["Denim", 5],
    ["Granite", 10],
    ["Grey", 30],
    ["Heavy Metal", 12],
    ["Lavander", 30],
    ["New Punk Blue", 30],
    ["Olive", 15],
    ["Orange", 25],
    ["Origin", 30],
    ["Pink Clouds", 5],
    ["Pink", 11],
    ["Purple", 30],
    ["Purple_Rain", 4],
    ["Purple_Stripes", 3],
    ["Slush Puppy", 4],
    ["Tiffany", 5],
    ["Wasteland", 3],
    ["White", 20],
    ["Yellow", 20],
  ],
  Body: [
    ["Black_Bear", 150],
    ["Blue_Gummy", 100],
    ["Blue_Leopard_Gummy", 10],
    ["Brown_Bear", 150],
    ["Essence", 2],
    ["Ghost", 10],
    ["Green_Gummy", 100],
    ["Green_Leopard_Gummy", 10],
    ["Invert", 8],
    ["Leopard", 7],
    ["Orange_Gummy", 100],
    ["Orange_Leopard_Gummy", 10],
    ["Panda_Bear", 150],
    ["Pink_Gummy", 100],
    ["Pink_Leopard_Gummy", 10],
    ["Polar_Bear", 150],
    ["Sketch", 30],
    ["Snow_Leopard", 3],
  ],
  Eyes: [
    ["Angry", 80],
    ["Anime", 80],
    ["Black_Out", 12],
    ["Branded_Shades", 10],
    ["Clear", 18],
    ["Cross_Eyed", 18],
    ["Cubs", 120],
    ["Cute_Cubs", 90],
    ["Incognito", 3],
    ["Laser", 10],
    ["Lightning", 15],
    ["Nerd", 20],
    ["Rainbow", 14],
    ["Retro_Specs", 15],
    ["See the Dark", 20],
    ["See the Light", 20],
    ["Snake", 16],
    ["Sport", 2],
    ["Teary", 15],
    ["Tinted-Shades", 18],
    ["VR", 12],
    ["Wink", 20],
  ],
  Hat: [
    ["Army", 4],
    ["Banana", 10],
    ["Bandana_Stripes", 6],
    ["Bankman", 6],
    ["Bear_Bucket", 20],
    ["Black_Beanie", 54],
    ["Black_Beanie_Skull", 12],
    ["Black_Bucket", 50],
    ["Black_Cap", 50],
    ["Black_Ski_Mask", 15],
    ["Blue_Beanie", 12],
    ["Clear_Cap", 10],
    ["Conical_Hat", 7],
    ["Cork_Hat", 6],
    ["Cow_Bucket", 12],
    ["Cubs_Block_Cap", 20],
    ["Devil", 5],
    ["Dreads", 5],
    ["Duck_Cap", 20],
    ["Frog_Bucket", 20],
    ["Green_Beanie", 12],
    ["Halo", 4],
    ["Headband", 25],
    ["Horns", 8],
    ["Intuition_Cap", 15],
    ["Kings_Crown", 2],
    ["Leprechaun", 3],
    ["Mohawk", 5],
    ["Night_Cap", 8],
    ["None", 150],
    ["Pink_Beanie", 12],
    ["Pink_Bucket", 18],
    ["Pink_Cap", 18],
    ["Punk_Mohawk", 10],
    ["Rain_Hat", 8],
    ["Red_Bandana", 6],
    ["Red_Cap", 12],
    ["Sailor", 4],
    ["Top_Hat", 3],
    ["Ushanka", 6],
    ["White_Cap", 30],
    ["Witch", 7],
  ],
  Mouth: [
    ["Bubble_Gum", 6],
    ["Cub", 300],
    ["Gold_Smile", 20],
    ["Grill_Grin", 20],
    ["Grin", 150],
    ["Growl_Gold", 15],
    ["Smile", 100],
    ["Stitch", 10],
    ["Tounge", 50],
    ["White Smile", 45],
    ["White_Growl", 30],
  ],
  Outfit: [
    ["Anarcist", 5],
    ["Angel_Wings", 15],
    ["Bee_More_Cub", 5],
    ["Black_Jumper", 50],
    ["Black_Jumper_With_Chain", 20],
    ["Black_Track_Suit", 15],
    ["Blue_Gummie_Wings", 20],
    ["Blue_Suit", 5],
    ["Cowboy", 2],
    ["Crystal_Gem", 10],
    ["Cub_Bag", 25],
    ["Cubs_Block_T", 20],
    ["Dark_Side_Wings", 15],
    ["Emerald_Gem", 3],
    ["Gold_Chain", 25],
    ["Gold_Chain_Cuban", 15],
    ["Green_Gummie_Wings", 20],
    ["Green_Suit", 7],
    ["Green_Track_Suit", 15],
    ["Grey_Jumper", 7],
    ["Jumpsuit_Purple", 15],
    ["Jumpsuit_Yellow", 10],
    ["Kimono", 2],
    ["Monster_Scarf", 12],
    ["None", 200],
    ["Orange_Gummie_Wings", 20],
    ["Pink_Gummie_Wings", 20],
    ["Plain_White_T", 25],
    ["Purple_Jumper", 15],
    ["Purple_Track_Suit", 15],
    ["Red_Wings", 3],
    ["Robot_Suit", 3],
    ["Scarf", 40],
    ["Silver_Chain", 30],
    ["Suit", 7],
    ["Tuxedo", 3],
    ["White_Track_Suit", 15],
    ["Wings", 10],
    ["Wizard", 5],
  ],
  Shoes: [
    ["Bumble_Bee", 10],
    ["Chicargo", 10],
    ["Cubs", 3],
    ["DIOR", 10],
    ["Grape_Vine", 10],
    ["Lucky_Green", 8],
    ["Moo's", 6],
    ["None", 800],
    ["OG_Pine_Green", 8],
    ["OGs", 10],
    ["Off_White", 10],
    ["Off_White_White", 10],
    ["Pine_Green", 8],
    ["Rookie_Of_The_Year", 10],
    ["Royal_Toe", 10],
    ["Shattered_Backboard", 10],
    ["T_Scotts", 8],
    ["Transparant", 4],
    ["University_Blue", 10],
    ["White_On_White", 10],
  ],
};

const ONSIE_LAYERS: Record<string, RawEntry[]> = {
  Background: [
    ["Ash", 10],
    ["Baby Blue", 30],
    ["Blue Skys", 15],
    ["Burnt Ash", 20],
    ["Denim", 5],
    ["Granite", 10],
    ["Grey", 30],
    ["Heavy Metal", 12],
    ["Lavander", 30],
    ["Pink Clouds", 5],
    ["Pink", 11],
    ["Purple", 30],
    ["Purple_Rain", 4],
    ["Purple_Stripes", 3],
    ["Sketch", 11],
    ["Slush Puppy", 2],
    ["Wasteland", 7],
    ["Wishful Night", 5],
  ],
  Body: [
    ["Apechain_Essence", 1],
    ["Black_Bear", 30],
    ["Blue_Gummy", 10],
    ["Brown_Bear", 35],
    ["Ghost", 5],
    ["Green_Gummy", 10],
    ["Invert", 8],
    ["Lepord", 7],
    ["Orange_Gummy", 10],
    ["Panda_Bear", 25],
    ["Pink_Gummy", 10],
    ["Polar_Bear", 30],
    ["Sketch", 4],
    ["Snow_Lepord", 3],
  ],
  Eyes: [
    ["Angry", 80],
    ["Anime", 80],
    ["Clear", 18],
    ["Cross_Eyed", 18],
    ["Cubs", 120],
    ["Cute_Cubs", 90],
    ["Lightning", 15],
    ["See the Dark", 20],
    ["See the Light", 20],
    ["Snake", 16],
    ["Teary", 15],
    ["Tv", 14],
  ],
  Mouth: [
    ["Cub", 300],
    ["Gold_Smile", 20],
    ["Grill_Grin", 20],
    ["Grin", 150],
    ["Growl_Gold", 15],
    ["Smile", 100],
    ["Stitch", 10],
    ["Tounge", 50],
    ["White Smile", 45],
    ["White_Growl", 30],
  ],
  Onsie: [
    ["Bee", 3],
    ["Duck", 3],
    ["Elephant", 3],
    ["Frog", 3],
    ["Ghost", 5],
    ["Hazmat", 6],
    ["Ninja", 8],
    ["Racoon", 3],
    ["Royal_Cloak", 7],
    ["Space_Cub", 9],
  ],
};

// ─── Build trait objects ─────────────────────────────────────────────────────

function buildCategories(
  raw: Record<string, RawEntry[]>,
  categoryOrder: readonly string[],
  isOnsie: boolean,
): TraitCategory[] {
  return categoryOrder.map((catName) => {
    const entries = raw[catName] ?? [];
    const traits = entries.map(([name, weight]) =>
      makeTrait(catName, name, weight, isOnsie),
    );
    const totalWeight = traits.reduce((sum, t) => sum + t.weight, 0);
    return { name: catName, traits, totalWeight };
  });
}

const generalCategories = buildCategories(
  GENERAL_LAYERS,
  REGULAR_CATEGORY_ORDER,
  false,
);

const onsieCategories = buildCategories(
  ONSIE_LAYERS,
  ONSIE_CATEGORY_ORDER,
  true,
);

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the trait categories (with traits) for a given cub type, in render order.
 * "oneofone" cubs have no trait categories (they are unique 1/1s).
 */
export function getTraitCategories(cubType: CubType): TraitCategory[] {
  switch (cubType) {
    case "regular":
      return generalCategories;
    case "onsie":
      return onsieCategories;
    case "oneofone":
      return [];
  }
}

/**
 * Look up a single trait by category name and trait name.
 * If `isOnsie` is undefined, searches general first then onsie.
 */
export function getTraitByName(
  category: string,
  name: string,
  isOnsie?: boolean,
): Trait | undefined {
  const search = (cats: TraitCategory[]) => {
    const cat = cats.find((c) => c.name === category);
    return cat?.traits.find((t) => t.name === name);
  };

  if (isOnsie === true) return search(onsieCategories);
  if (isOnsie === false) return search(generalCategories);

  // Search both (general first)
  return search(generalCategories) ?? search(onsieCategories);
}

/**
 * Returns the image path for a trait. Convenience wrapper around getTraitByName.
 */
export function getTraitImagePath(
  category: string,
  traitName: string,
  isOnsie?: boolean,
): string {
  const trait = getTraitByName(category, traitName, isOnsie);
  if (trait) return trait.imagePath;

  // Fallback: construct a best-guess path (weight unknown, use 0 placeholder)
  const set = isOnsie ? "onsie" : "general";
  return `/assets/layers/${set}/${category}/${traitName}.png`;
}
