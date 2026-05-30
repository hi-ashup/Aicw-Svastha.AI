export interface AyurvedicFoodGuide {
  dosha: 'Vata' | 'Pitta' | 'Kapha';
  elements: string;
  gunas: string[];
  pacifyingTastes: string[];
  aggravatingTastes: string[];
  keyPrinciple: string;
  fullReasoning: string;
  favor: {
    category: string;
    items: string[];
    explanation: string;
  }[];
  avoid: {
    category: string;
    items: string[];
    explanation: string;
  }[];
}

export interface TcmFoodItem {
  id: string;
  name: string;
  category: 'grain' | 'vegetable' | 'fruit' | 'herb' | 'protein' | 'dairy' | 'spice';
  nature: 'Cold' | 'Cool' | 'Neutral' | 'Warm' | 'Hot';
  flavor: ('Sweet' | 'Sour' | 'Bitter' | 'Pungent' | 'Salty')[];
  organs: string[];
  effect: string;
  description: string;
}

export interface TcmBalanceScenario {
  id: string;
  title: string;
  imbalance: string;
  symptoms: string[];
  mechanism: string;
  targetNature: ('Cold' | 'Cool' | 'Neutral' | 'Warm' | 'Hot')[];
  targetFlavor: ('Sweet' | 'Sour' | 'Bitter' | 'Pungent' | 'Salty')[];
  avoidNature: ('Cold' | 'Cool' | 'Neutral' | 'Warm' | 'Hot')[];
  recommendedFoods: string[];
  avoidFoods: string[];
  explanation: string;
}

export const AYURVEDIC_DOSHA_GUIDE: AyurvedicFoodGuide[] = [
  {
    dosha: 'Vata',
    elements: 'Air & Space (Vayu & Akash)',
    gunas: ['Cold', 'Light', 'Dry', 'Rough', 'Mobile'],
    pacifyingTastes: ['Sweet', 'Sour', 'Salty'],
    aggravatingTastes: ['Pungent', 'Bitter', 'Astringent'],
    keyPrinciple: 'Balance hyper-mobility and coldness with warmth, heavy oils, moisture, and grounding textures.',
    fullReasoning: 'Vata rules the nervous system, cellular transport, and elimination. Its qualities are drying and cooling. To balance Vata, one needs oily, well-cooked, warm foods cooked with spices. Raw, cold, or dry snacks disrupt digestion (Mandagni/Vishamagni), triggering neurological hyperactivity, severe gas, insomnia, and localized muscular stiffness.',
    favor: [
      {
        category: 'Grains',
        items: ['Cooked Basmati Rice', 'Steamed Oats', 'Quinoa', 'Whole Wheat'],
        explanation: 'Grounding, naturally sweet, heavy, and warming grains provide stability, steady blood sugar, and combat the airy dryness of Vata.'
      },
      {
        category: 'Fruits',
        items: ['Avocados', 'Ripe Bananas', 'Sweet Mangoes', 'Soaked Figs/Dates', 'Cooked Apples'],
        explanation: 'Sweet, moist, and building fruits nourish the dry tissue layers (Dhatus) and lubricate the stomach lining.'
      },
      {
        category: 'Vegetables',
        items: ['Sweet Potatoes', 'Red Beets', 'Carrots', 'Zucchini', 'Cooked Asparagus'],
        explanation: 'Root and sweet vegetables, when thoroughly cooked (not raw), provide grounding earth-energy and ease digestion.'
      },
      {
        category: 'Spices & Oils',
        items: ['Ghee (Clarified Butter)', 'Sesame Oil', 'Fresh Ginger', 'Cardamom', 'Cumin', 'Cinnamon'],
        explanation: 'Lubricate the joints, warm the digestive tract, kindle the Agni (digestive fire), and eliminate gas (Vata accumulation).'
      },
      {
        category: 'Proteins & Legumes',
        items: ['Split Yellow Mung Dal', 'Red Lentils', 'Warm Almond Milk', 'Soaked Almonds'],
        explanation: 'Easy-to-digest building blocks that strengthen tissue without causing digestive flatulence.'
      }
    ],
    avoid: [
      {
        category: 'Raw & Cold Foods',
        items: ['Raw Salads', 'Ice Water', 'Iced Smoothies', 'Frozen Desserts'],
        explanation: 'Directly extinguish the warming Agni, dry out the bowel, and trigger immediate spasmodic bloating.'
      },
      {
        category: 'Dry & Aggravating Grains',
        items: ['Barley', 'Millet', 'Corn', 'Dry Toast/Crackers', 'Granola'],
        explanation: 'Inherently dry, rough, and scraping, these aggravate Vata\'s dryness and spark gas and constipation.'
      },
      {
        category: 'Hard Legumes',
        items: ['Black Beans', 'Kidney Beans', 'Chickpeas', 'Soybeans'],
        explanation: 'Heavy and slow to process, these produce excess air/gas (Apana Vayu), exhausting metabolic organs.'
      },
      {
        category: 'Cruciferous Vegetables',
        items: ['Raw Broccoli', 'Cauliflower', 'Raw Cabbage', 'Brussels Sprouts'],
        explanation: 'Produce high volatile elements in the bowel, leading to erratic abdominal pressure and high stress indexes.'
      }
    ]
  },
  {
    dosha: 'Pitta',
    elements: 'Fire & Water (Tejas & Jala)',
    gunas: ['Hot', 'Sharp', 'Light', 'Acidic', 'Slightly Oily'],
    pacifyingTastes: ['Sweet', 'Bitter', 'Astringent'],
    aggravatingTastes: ['Pungent', 'Sour', 'Salty'],
    keyPrinciple: 'Quench internal fire and heat with cooling, heavy (nourishing), and dry foods. Keep spices gentle.',
    fullReasoning: 'Pitta governs thermal output, hepatic metabolism, endocrine activity, and enzymatic enzymes. Its core qualities are hot and sharp. Excess Pitta leads to systemic acidic inflammation, ulcers, skin rashes, high-stress burnout, and severe irritability. Cooling, sweet, and moderately dry foods pacify Pitta, preventing toxic overflow in the blood (Rakta Dhatu).',
    favor: [
      {
        category: 'Grains',
        items: ['Basmati Rice', 'White Barley', 'Oats', 'Spelt'],
        explanation: 'Cooling, highly digestible, sweet grains that ground the intense heat of the stomach without adding heavy grease.'
      },
      {
        category: 'Fruits',
        items: ['Sweet Watermelon', 'Ripe Pears', 'Sweet Cherries', 'Coconuts', 'Pomegranates'],
        explanation: 'Cooling, fluid-enriching fruits that alleviate liver heat and replenish cooling fluids.'
      },
      {
        category: 'Vegetables',
        items: ['Cucumbers', 'Zucchini', 'Celery', 'Leafy Greens', 'Okra', 'Broccoli'],
        explanation: 'Bitter and astringent vegetables that naturally purge heat from the gastrointestinal path and cool the blood.'
      },
      {
        category: 'Spices & Oils',
        items: ['Organic Ghee', 'Virgin Coconut Oil', 'Coriander/Cilantro', 'Fennel Seeds', 'Mint'],
        explanation: 'Cooling substances that ignite enzymatic liver cleansing (Alochaka Agni) without elevating body temperature.'
      },
      {
        category: 'Proteins & Legumes',
        items: ['Mung Beans', 'Organic Tofu/Tempeh', 'Peas', 'Soaked/Peeled Chickpeas'],
        explanation: 'Astringent and cooling proteins that build muscle mass without inducing toxic inflammatory thermal byproducts.'
      }
    ],
    avoid: [
      {
        category: 'Highly Heating Spices',
        items: ['Cayenne Pepper', 'Chili Flakes', 'Raw Garlic', 'Raw Onions', 'Horseradish', 'Vinegar'],
        explanation: 'Inject direct flame into the blood, triggering gastric reflux, liver irritation, and aggressive mental stress.'
      },
      {
        category: 'Sour & Acidifying Fruits',
        items: ['Sour Lemons/Grapefruits', 'Raw Pineapples', 'Green Tomatoes', 'Sour Berries'],
        explanation: 'Acidify the digestive pH, aggravate the fire element, and promote inflammatory skin outbreaks.'
      },
      {
        category: 'Heavily Salted & Fried Foods',
        items: ['Potato Chips', 'Deep Fried Foods', 'Soy Sauce', 'Salted Butter', 'Aged Cheese'],
        explanation: 'Salty/fried items retain hot water, burden liver pathways, and exacerbate internal warmth.'
      },
      {
        category: 'Aggressive Stimulants',
        items: ['Dark Coffee', 'Strong Alcohol', 'Carbonated Energy Drinks'],
        explanation: 'Extremely acidic and drying, these shoot adrenal scores up and exhaust cooling Yin reserves.'
      }
    ]
  },
  {
    dosha: 'Kapha',
    elements: 'Water & Earth (Jala & Prithvi)',
    gunas: ['Heavy', 'Cold', 'Slow', 'Moist', 'Slimy', 'Static'],
    pacifyingTastes: ['Pungent', 'Bitter', 'Astringent'],
    aggravatingTastes: ['Sweet', 'Sour', 'Salty'],
    keyPrinciple: 'Combat physical stagnation, fluid accumulation, and coldness with light, dry, heated, and highly spiced foods.',
    fullReasoning: 'Kapha governs bodily structure, moisture reserves, mucosal structures, and physical stability. Its qualities are heavy, cool, and moist. Under-stimulated Kapha results in lymphatic congestion, bronchial mucus, sluggish liver actions (Mandagni), rapid weight retention, and mental fog. Sharp warming spices and astringent/bitter foods dry excess moisture, cleanse mucous layers, and revitalize stagnant cells.',
    favor: [
      {
        category: 'Grains',
        items: ['Dried Barley', 'Millet', 'Quinoa', 'Buckwheat', 'Amaranth'],
        explanation: 'Drying and lighter grains that absorb excessive mucus and dampness, speeding up central endocrine circuits.'
      },
      {
        category: 'Fruits',
        items: ['Apples', 'Pears', 'Pomegranates', 'Cranberries', 'Dried Apricots'],
        explanation: 'Astringent, low-sugar, high-fiber fruits that scrape the colon and avoid fat synthesis.'
      },
      {
        category: 'Vegetables',
        items: ['Leafy Spinach/Kale', 'Bitter Melon', 'Radishes', 'Garlic', 'Onions', 'Asparagus', 'Cabbage'],
        explanation: 'Highly active bitter, pungent, and stimulating vegetables that decongest the lymphatic network and awaken metabolic flow.'
      },
      {
        category: 'Spices & Herbs',
        items: ['Black Pepper', 'Cayenne Pepper', 'Dry Ginger', 'Turmeric', 'Cloves', 'Cinnamon', 'Mustard Seeds'],
        explanation: 'The ultimate metabolic fuels! Cleanse arterial pathways, dissolve excess mucus, and spike resting digestion.'
      },
      {
        category: 'Proteins & Legumes',
        items: ['Black Beans', 'Lentils', 'Garbanzo Beans', 'Pinto Beans', 'Pumpkin Seeds'],
        explanation: 'Drying, astringent protein sources that supply structure without inviting mucus retention.'
      }
    ],
    avoid: [
      {
        category: 'Heavy Dairy & Sweets',
        items: ['Whole Milk', 'Cold Cheese', 'Yogurt', 'Refined Sugar', 'Ice Cream', 'Milk Chocolate'],
        explanation: 'Extremely damp-forming, sweet, and sticky, these block the metabolic channels (Srotas), slowing thyroid and gut health.'
      },
      {
        category: 'Sticky & Heavy Grains',
        items: ['White Wheat Flour', 'Cooked Oats', 'Glutinous White Rice', 'Pasta'],
        explanation: 'Turn into heavy, glue-like starch inside the digestive tract, inducing heavy lethargy and brain fog.'
      },
      {
        category: 'Watery Fruits & Veg',
        items: ['Avocados', 'Bananas', 'Coconuts', 'Watermelon', 'Raw Cucumbers'],
        explanation: 'Incorporate too much cooling water and fat into an already damp system, aggravating fluid storage.'
      },
      {
        category: 'Heavy Oils & Salt',
        items: ['Large amounts of Ghee/Butter', 'Salted Nuts', 'Canola Oil', 'Excessive Sea Salt'],
        explanation: 'Salt holds onto cellular water, while excessive grease dampens the thyroid and slows physical systems.'
      }
    ]
  }
];

export const TCM_FOODS_MATRIX: TcmFoodItem[] = [
  {
    id: 'f1',
    name: 'Fresh Ginger',
    category: 'spice',
    nature: 'Warm',
    flavor: ['Pungent', 'Sweet'],
    organs: ['Spleen', 'Stomach', 'Lung'],
    effect: 'Warms the Middle Jiao, dispels Cold, stokes Yang, stops nausea',
    description: 'The golden root for warming the core. Excellent for chronic cold hands/feet, restoring digestive Qi, and clearing Lung mucus caused by cold winds.'
  },
  {
    id: 'f2',
    name: 'Dried Ginger',
    category: 'spice',
    nature: 'Hot',
    flavor: ['Pungent'],
    organs: ['Spleen', 'Heart', 'Lung'],
    effect: 'Recovers devastated internal Yang, dispels deep cold, dries dampness',
    description: 'Extremely stoking. Used when abdominal cold, weak pulse, or severe chronic loose stools indicate Spleen Yang exhaustion.'
  },
  {
    id: 'f3',
    name: 'Watermelon',
    category: 'fruit',
    nature: 'Cold',
    flavor: ['Sweet'],
    organs: ['Heart', 'Stomach', 'Urinary Bladder'],
    effect: 'Clears Summer Heat, generates Yin fluids, stops thirst, promotes urination',
    description: 'Perfect for neutralizing dehydration and inflammatory high body temperatures. It flushes excess heat through the urine and lubricates parched tissue.'
  },
  {
    id: 'f4',
    name: 'Cucumber',
    category: 'vegetable',
    nature: 'Cold',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach', 'Urinary Bladder'],
    effect: 'Clears heat, purges toxic metabolic waste, cools the blood, reduces swelling',
    description: 'Highly hydrating and cleansing. Excellent for toxic skin breakouts, burning urination, and acid stomach due to Damp-Heat accumulation.'
  },
  {
    id: 'f5',
    name: 'Garlic',
    category: 'vegetable',
    nature: 'Hot',
    flavor: ['Pungent'],
    organs: ['Spleen', 'Stomach', 'Lung'],
    effect: 'Warms the spleen, moves blocked Qi, sterilizes toxins, dispels parasites',
    description: 'Powerful anti-microbial warming agent. Clears deep core stagnation, warms up a freezing abdomen, and activates defensive Wei Qi.'
  },
  {
    id: 'f6',
    name: 'Mung Beans',
    category: 'grain',
    nature: 'Cold',
    flavor: ['Sweet'],
    organs: ['Heart', 'Stomach'],
    effect: 'Clears toxic heat, harmonizes Spleen, resolves hot damp swelling',
    description: 'A traditional botanical antidote for toxicity. Best used to cool acne flare-ups, relieve hives, and clear thick yellow tongue coat.'
  },
  {
    id: 'f7',
    name: 'Chicken',
    category: 'protein',
    nature: 'Warm',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach'],
    effect: 'Tonifies Spleen Qi, enriches Kidney Jing (essence), warms the interior',
    description: 'The premier meat for post-sickness exhaustion. Directly reloads deplete muscle reserves, warms the stomach stove, and builds active Qi.'
  },
  {
    id: 'f8',
    name: 'Beef',
    category: 'protein',
    nature: 'Warm',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach', 'Kidney'],
    effect: 'Strengthens Qi and Blood, bolsters bones and tendons, stokes stasis',
    description: 'Highly grounding and structural. Best for severe blood deficiency (pale gums/face, dizziness, weak joints) and chronically low endurance.'
  },
  {
    id: 'f9',
    name: 'Spinach',
    category: 'vegetable',
    nature: 'Cool',
    flavor: ['Sweet'],
    organs: ['Liver', 'Stomach', 'Large Intestine'],
    effect: 'Nourishes Liver Yin Blood, lubricates intestinal dryness, cools hot blood',
    description: 'An outstanding blood and fluid builder. Relieves burning dry eyes, mitigates dizziness, and clears dry-type heated constipation.'
  },
  {
    id: 'f10',
    name: 'Basmati Rice',
    category: 'grain',
    nature: 'Neutral',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach'],
    effect: 'Strengthens central Spleen Qi, harmonizes Stomach fire, builds body fluids',
    description: 'The foundation of metabolic stability. It does not cause internal heat or cold, serving as a clean canvas that fosters digestive comfort.'
  },
  {
    id: 'f11',
    name: 'Green Tea',
    category: 'herb',
    nature: 'Cool',
    flavor: ['Bitter', 'Sweet'],
    organs: ['Heart', 'Lung', 'Stomach', 'Urinary Bladder'],
    effect: 'Clears heat from head, dries fat dampness, aids cognitive focus, resolves fluids',
    description: 'Excellent for heavy feelings, oily skin, mental lethargy, and water logging. It dries dampness and clarifies thoughts by draining downwards.'
  },
  {
    id: 'f12',
    name: 'Cinnamon Bark',
    category: 'spice',
    nature: 'Hot',
    flavor: ['Pungent', 'Sweet'],
    organs: ['Kidney', 'Heart', 'Spleen', 'Liver'],
    effect: 'Ignites Mingmen (Kidney Fire), guides fire back to its source, revs circulation',
    description: 'The ultimate wood-fire fuel. Gently warms deep pelvic blood vessels, moves stagnant pain, and boosts adrenal thyroid energy.'
  },
  {
    id: 'f13',
    name: 'Pear',
    category: 'fruit',
    nature: 'Cool',
    flavor: ['Sweet', 'Sour'],
    organs: ['Lung', 'Stomach'],
    effect: 'Moistens dry Lungs, resolves yellow phlegm, regenerates Yin fluids',
    description: 'Highly therapeutic for dry hacking coughs, parched throat, chronic speaking exhaustion, and hot throat irritation.'
  },
  {
    id: 'f14',
    name: 'Black Sesame Seeds',
    category: 'spice',
    nature: 'Neutral',
    flavor: ['Sweet'],
    organs: ['Kidney', 'Liver', 'Large Intestine'],
    effect: 'Tonifies Liver/Kidney Yin, enriches grey hair, relieves chronic dryness',
    description: 'Concentrated essence builder. Rebuilds deep bone fluids, improves memory retention, and lubricates dry bowel movements.'
  },
  {
    id: 'f15',
    name: 'Turmeric',
    category: 'spice',
    nature: 'Warm',
    flavor: ['Bitter', 'Pungent'],
    organs: ['Spleen', 'Liver'],
    effect: 'Invigorates Blood, dispels painful stasis, regulates Liver Qi, clears dampness',
    description: 'The ultimate blood activator. Relieves swelling, stagnant muscle pain, menstrual cramping, and heavy lymphatic blockage.'
  },
  {
    id: 'f16',
    name: 'Organic Yogurt',
    category: 'dairy',
    nature: 'Cold',
    flavor: ['Sour', 'Sweet'],
    organs: ['Stomach', 'Liver'],
    effect: 'Astringes, cools hot stomach fire, builds fluids, generates phlegm',
    description: 'Cooling but highly damp/slimy. Best for cooling a hot stomach with ravenous hunger, but to be avoided if suffer from mucus or low fire.'
  },
  {
    id: 'f17',
    name: 'Millet',
    category: 'grain',
    nature: 'Cool',
    flavor: ['Sweet', 'Salty'],
    organs: ['Spleen', 'Stomach', 'Kidney'],
    effect: 'Clears heat, dries damp bloating, builds Kidney Yin, soothes sleep',
    description: 'A dense, dry, cooling grain that absorbs damp abdominal swampiness and supports a deep, refreshing sleep.'
  },
  {
    id: 'f18',
    name: 'Lemon',
    category: 'fruit',
    nature: 'Cool',
    flavor: ['Sour'],
    organs: ['Liver', 'Lung', 'Stomach'],
    effect: 'Astringes leaks, produces fluids, clears phlegm, brightens Liver Qi',
    description: 'Sour flavor stabilizes scattered energy. Generates quick saliva, treats hot morning sickness, and regulates stressful Spleen pressures.'
  },
  {
    id: 'f19',
    name: 'Goji Berries',
    category: 'fruit',
    nature: 'Neutral',
    flavor: ['Sweet'],
    organs: ['Liver', 'Kidney', 'Lung'],
    effect: 'Nourishes Liver and Kidney Yin, enriches Jing, moistens Lungs, brightens eyes',
    description: 'A legendary TCM superfood. Recharges blood, prevents premature aging, protects vision, and moistens dry air passages.'
  },
  {
    id: 'f20',
    name: 'Bitter Melon',
    category: 'vegetable',
    nature: 'Cold',
    flavor: ['Bitter'],
    organs: ['Heart', 'Spleen', 'Stomach', 'Liver'],
    effect: 'Clears Heat and drains Fire, relieves summer heat, brightens vision, dries dampness',
    description: 'Highly therapeutic for acute inflammatory Fire. Clears blood toxins, cools hot liver eyes, and stabilizes insulin performance.'
  },
  {
    id: 'f21',
    name: 'Black Beans',
    category: 'protein',
    nature: 'Neutral',
    flavor: ['Sweet'],
    organs: ['Kidney', 'Spleen'],
    effect: 'Tonifies Kidney Yin, nourishes Blood, promotes urination to resolve swelling',
    description: 'Shaped like Kidneys, they directly empower Kidney structural essence, drain damp edema, and activate slow micro-circulation.'
  },
  {
    id: 'f22',
    name: 'Black Pepper',
    category: 'spice',
    nature: 'Hot',
    flavor: ['Pungent'],
    organs: ['Stomach', 'Large Intestine'],
    effect: 'Warms the stomach, disperses cold, descends Qi, dissolves phlegm',
    description: 'Restores freezing digestive systems instantly. Aids in dispersing stomach cramping, cold diarrhea, and damp toxin phlegm.'
  },
  {
    id: 'f23',
    name: 'Ghee',
    category: 'dairy',
    nature: 'Warm',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach', 'Liver'],
    effect: 'Tonifies central Qi, enriches Yin, moistens dry intestines, promotes tissue repair',
    description: 'Highly prized in both Ayurveda and TCM. It lubricates dry linings, supports digestive enzyme flow, and provides clean long-burning metabolic fuels.'
  },
  {
    id: 'f24',
    name: 'Oats',
    category: 'grain',
    nature: 'Warm',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach', 'Lung'],
    effect: 'Tonifies Spleen Qi, regulates blood sugar, stops spontaneous sweating, moistens skin',
    description: 'A superb warming breakfast cereal that stabilizes blood sugar, lubricates dry lungs, and strengthens cellular vitality.'
  },
  {
    id: 'f25',
    name: 'Quinoa',
    category: 'grain',
    nature: 'Warm',
    flavor: ['Sweet', 'Sour'],
    organs: ['Spleen', 'Kidney', 'Heart'],
    effect: 'Enriches Kidney Yang, tonifies Qi, strengthens bones & lower back, clears excess fat and damp',
    description: 'A nutrient-dense warming grain that boosts structural stamina, reinforces joint performance, and prevents damp-heat retention.'
  },
  {
    id: 'f26',
    name: 'Salmon',
    category: 'protein',
    nature: 'Warm',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach', 'Kidney'],
    effect: 'Tonifies Spleen Qi, enriches Blood, warms the interior stove, moves stagnant water',
    description: 'Excellent source of structural fats and blood tonic proteins. Keeps core tissues warm, relieves stiff joints, and reduces dry flaky skin.'
  },
  {
    id: 'f27',
    name: 'Sweet Potato',
    category: 'vegetable',
    nature: 'Neutral',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Stomach', 'Kidney', 'Lung'],
    effect: 'Tonifies Spleen and Kidney Qi, enriches Lung Yin, builds body fluid, stabilizes digestion',
    description: 'An ultimate tonic food for weak digestive systems. Nourishes central stomach juices without generating heavy damp congestion.'
  },
  {
    id: 'f28',
    name: 'Cloves',
    category: 'spice',
    nature: 'Warm',
    flavor: ['Pungent'],
    organs: ['Spleen', 'Stomach', 'Kidney'],
    effect: 'Warms the middle jiao and descends stomach Qi, warms and tonifies Kidney Yang',
    description: 'A sharp warm spice that stops hiccups, vomiting, and bloating. Re-warms cold lower-body networks and relieves menstrual blockages.'
  },
  {
    id: 'f29',
    name: 'Pomegranate',
    category: 'fruit',
    nature: 'Warm',
    flavor: ['Sweet', 'Sour'],
    organs: ['Large Intestine', 'Stomach', 'Lung'],
    effect: 'Generates fluids, stops thirst, binds the intestines to stop loose stools, cools hot blood sparks',
    description: 'Dual-action fruit. Moistens a dry throat, regenerates blood, and stabilizes loose digestive currents with its astringing skin.'
  },
  {
    id: 'f30',
    name: 'Astragalus',
    category: 'herb',
    nature: 'Warm',
    flavor: ['Sweet'],
    organs: ['Spleen', 'Lung'],
    effect: 'Tonifies Spleen Qi, raises sunken Yang, shields defensive Wei Qi, drains water swelling',
    description: 'The premier TCM immune tonic. Broadens lung energy, seals skin from sweat drafts, and dramatically raises collapsed core fatigue.'
  }
];

export const TCM_BALANCE_SCENARIOS: TcmBalanceScenario[] = [
  {
    id: 's1',
    title: 'Spleen Qi Deficiency',
    imbalance: 'Qi Deficiency (Fatigue & Damp Bloat)',
    symptoms: ['Chronic fatigue', 'Abdominal bloating after meals', 'Loose stools', 'Mental fog', 'Hypothyroidism'],
    mechanism: 'In TCM, the Spleen is the "Metabolic Stove" that extracts energy (Gu Qi) from food. If it burns out due to excess cold or raw foods, digestion stalls, creating sticky "Dampness" (swamp-like state) and depleted energy reserves.',
    targetNature: ['Warm', 'Hot'],
    targetFlavor: ['Sweet', 'Pungent'],
    avoidNature: ['Cold', 'Cool'],
    recommendedFoods: ['Fresh Ginger', 'Chicken', 'Beef', 'Basmati Rice', 'Cinnamon Bark'],
    avoidFoods: ['Watermelon', 'Cucumber', 'Mung Beans', 'Organic Yogurt', 'Green Tea'],
    explanation: 'Activate the Spleen stove! Sweet-neutral cooked basmati rice paired with warm chicken and fresh ginger stokes metabolic warmth, directly bolstering energy creation while evaporating toxic damp stagnation.'
  },
  {
    id: 's2',
    title: 'Yin Deficiency / Hyperactive Heat',
    imbalance: 'Yin Deficiency (Burnout, Hot Flashes & Stress)',
    symptoms: ['Night sweats', 'Dry throat and mouth', 'Insomnia', 'High anxiety', 'Red flushed face', 'Hard stools'],
    mechanism: 'Yin represents the cooling water and lubrication of the body. When Yin is burnt out (usually by chronic high stress, lack of sleep, or spicy toxins), the body loses its engine coolant, causing hyper-active "empty heat" and mental noise.',
    targetNature: ['Cool', 'Cold', 'Neutral'],
    targetFlavor: ['Sweet', 'Sour'],
    avoidNature: ['Warm', 'Hot'],
    recommendedFoods: ['Watermelon', 'Cucumber', 'Spinach', 'Pear', 'Black Sesame Seeds', 'Lemon'],
    avoidFoods: ['Fresh Ginger', 'Garlic', 'Dried Ginger', 'Cinnamon Bark', 'Turmeric'],
    explanation: 'Inject biological engine coolant! Cool, moisturizing fruits like Pears and juicy Watermelons recharge internal water reserves (Yin), cool down blood temperature, and sedate high hypothalamic stress signals.'
  },
  {
    id: 's3',
    title: 'Yang Deficiency / Deep Internal Cold',
    imbalance: 'Yang Deficiency (Systemic Weak Fire)',
    symptoms: ['Freezing cold hands/feet', 'Extreme aversion to cold drafts', 'Heavy fluid retention', 'Slow metabolism', 'Weight gain'],
    mechanism: 'Yang represents the active physical fire, thyroid performance, and circulation. If Yang is depleted (exhausted adrenals/Mingmen), the body freezes, blood slows down, and metabolic fluids stack up as cold pooling water.',
    targetNature: ['Hot', 'Warm'],
    targetFlavor: ['Pungent', 'Sweet'],
    avoidNature: ['Cold', 'Cool'],
    recommendedFoods: ['Dried Ginger', 'Garlic', 'Cinnamon Bark', 'Chicken', 'Turmeric', 'Fresh Ginger'],
    avoidFoods: ['Watermelon', 'Cucumber', 'Mung Beans', 'Millet', 'Organic Yogurt'],
    explanation: 'Kindle the furnace! Dried ginger and cinnamon bark act as thermal spikes, stoking the Kidney Yang fireplace (Mingmen) to drive warm blood to the extremities and liquefy sluggish metabolic congestion.'
  },
  {
    id: 's4',
    title: 'Qi Stagnation / Liver Tension',
    imbalance: 'Qi Stagnation (Somatic Tension & PMS)',
    symptoms: ['Chest tightness', 'Frequent sighing', 'Sore shoulders', 'Tension headaches', 'Bloating and mood swings'],
    mechanism: 'The Liver governs the smooth, uninhibited flow of Qi (vital force). Under high psychiatric stress or physical confinement, Liver Qi blocks up like a traffic jam, manifesting as emotional pressure, localized physical pain, and bowel spasms.',
    targetNature: ['Warm', 'Neutral'],
    targetFlavor: ['Pungent', 'Bitter'],
    avoidNature: ['Cold'],
    recommendedFoods: ['Turmeric', 'Fresh Ginger', 'Lemon', 'Black Sesame Seeds', 'Basmati Rice'],
    avoidFoods: ['Organic Yogurt', 'Watermelon', 'Cold cucumber'],
    explanation: 'Dissolve the blockage! Warm-pungent spices like Turmeric and Fresh Ginger pierce through muscular tension and Liver Qi blocks. A touch of sour Lemon harmonizes Liver pressures and redirects vital energy downwards.'
  }
];
