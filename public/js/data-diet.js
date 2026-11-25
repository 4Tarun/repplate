// Ingredient values are approximate (per g, ml or piece).
// g: scaling group. 'p' = protein source, 'o' = carbs/fats, 'f' = fixed (vegetables)
// buy: grocery conversion -> [ingredientId, amount per unit]
export const ING = {
  rice:       { n: 'Rice (raw)', u: 'g', k: 3.6, p: 0.07, g: 'o', c: 'Grains' },
  oats:       { n: 'Oats', u: 'g', k: 3.9, p: 0.13, g: 'o', c: 'Grains' },
  poha:       { n: 'Poha', u: 'g', k: 3.6, p: 0.07, g: 'o', c: 'Grains' },
  rava:       { n: 'Rava (suji)', u: 'g', k: 3.5, p: 0.11, g: 'o', c: 'Grains' },
  atta:       { n: 'Wheat atta', u: 'g', k: 3.4, p: 0.12, g: 'o', c: 'Grains' },
  bread:      { n: 'Brown bread', u: 'slice', k: 70, p: 3, g: 'o', c: 'Grains' },
  roti:       { n: 'Roti', u: 'pc', k: 100, p: 3, g: 'o', c: 'Grains', buy: ['atta', 30] },
  idli:       { n: 'Idli', u: 'pc', k: 58, p: 2, g: 'o', c: 'Grains', buy: ['batter', 50] },
  dosa:       { n: 'Dosa', u: 'pc', k: 120, p: 3.5, g: 'o', c: 'Grains', buy: ['batter', 90] },
  batter:     { n: 'Idli/dosa batter', u: 'g', k: 1.3, p: 0.04, g: 'o', c: 'Grains' },
  moong:      { n: 'Moong dal', u: 'g', k: 3.5, p: 0.24, g: 'p', c: 'Dals & legumes' },
  toor:       { n: 'Toor dal', u: 'g', k: 3.4, p: 0.22, g: 'p', c: 'Dals & legumes' },
  rajma:      { n: 'Rajma (dry)', u: 'g', k: 3.3, p: 0.23, g: 'p', c: 'Dals & legumes' },
  chana:      { n: 'Kabuli chana (dry)', u: 'g', k: 3.6, p: 0.19, g: 'p', c: 'Dals & legumes' },
  soya:       { n: 'Soya chunks', u: 'g', k: 3.45, p: 0.52, g: 'p', c: 'Dals & legumes' },
  roastchana: { n: 'Roasted chana', u: 'g', k: 3.7, p: 0.19, g: 'p', c: 'Dals & legumes' },
  sprouts:    { n: 'Moong sprouts', u: 'g', k: 0.3, p: 0.03, g: 'p', c: 'Vegetables' },
  paneer:     { n: 'Paneer', u: 'g', k: 2.65, p: 0.18, g: 'p', c: 'Dairy & protein' },
  tofu:       { n: 'Tofu', u: 'g', k: 1.45, p: 0.15, g: 'p', c: 'Dairy & protein' },
  curd:       { n: 'Curd', u: 'g', k: 0.6, p: 0.035, g: 'p', c: 'Dairy & protein' },
  milk:       { n: 'Milk (toned)', u: 'ml', k: 0.6, p: 0.032, g: 'p', c: 'Dairy & protein' },
  egg:        { n: 'Eggs', u: 'pc', k: 72, p: 6.3, g: 'p', c: 'Dairy & protein' },
  chicken:    { n: 'Chicken breast (boneless)', u: 'g', k: 1.2, p: 0.23, g: 'p', c: 'Dairy & protein' },
  fish:       { n: 'Fish (rohu / basa)', u: 'g', k: 1.0, p: 0.19, g: 'p', c: 'Dairy & protein' },
  veg:        { n: 'Mixed vegetables', u: 'g', k: 0.35, p: 0.02, g: 'f', c: 'Vegetables' },
  onitom:     { n: 'Onion & tomato', u: 'g', k: 0.3, p: 0.01, g: 'f', c: 'Vegetables' },
  spinach:    { n: 'Palak (spinach)', u: 'g', k: 0.23, p: 0.03, g: 'f', c: 'Vegetables' },
  salad:      { n: 'Cucumber / carrot', u: 'g', k: 0.2, p: 0.01, g: 'f', c: 'Vegetables' },
  corn:       { n: 'Sweet corn', u: 'g', k: 0.9, p: 0.03, g: 'o', c: 'Vegetables' },
  banana:     { n: 'Banana', u: 'pc', k: 105, p: 1.3, g: 'o', c: 'Fruits' },
  fruit:      { n: 'Seasonal fruit (apple / guava / papaya)', u: 'pc', k: 80, p: 1, g: 'o', c: 'Fruits' },
  peanuts:    { n: 'Peanuts', u: 'g', k: 5.7, p: 0.26, g: 'o', c: 'Pantry' },
  pb:         { n: 'Peanut butter', u: 'g', k: 5.9, p: 0.25, g: 'o', c: 'Pantry' },
  oil:        { n: 'Oil / ghee', u: 'ml', k: 9, p: 0, g: 'o', c: 'Pantry' }
};

export const CATEGORY_ORDER = ['Vegetables', 'Fruits', 'Dairy & protein', 'Dals & legumes', 'Grains', 'Pantry'];

export const MEALS = {
  // Breakfast
  b_oats:     { n: 'Banana oats with milk & peanuts', i: [['oats', 50], ['milk', 250], ['banana', 1], ['peanuts', 10]] },
  b_pesarattu:{ n: 'Pesarattu (moong dosa) + peanut chutney', i: [['moong', 70], ['onitom', 30], ['peanuts', 10], ['oil', 8], ['curd', 100]] },
  b_idli:     { n: 'Idli + sambar', i: [['idli', 4], ['toor', 30], ['veg', 80], ['oil', 3], ['curd', 100]] },
  b_paneer:   { n: 'Paneer bhurji toast', i: [['bread', 2], ['paneer', 70], ['onitom', 50], ['oil', 5]] },
  b_poha:     { n: 'Poha with peanuts + sprouts', i: [['poha', 60], ['peanuts', 15], ['sprouts', 60], ['onitom', 40], ['oil', 5], ['curd', 100]] },
  b_upma:     { n: 'Veg upma + glass of milk', i: [['rava', 60], ['veg', 60], ['oil', 7], ['milk', 250]] },
  b_dosa:     { n: 'Dosa + peanut chutney + curd', i: [['dosa', 2], ['peanuts', 20], ['curd', 150]] },
  b_omelette: { n: 'Masala omelette + toast', i: [['egg', 3], ['bread', 2], ['onitom', 40], ['oil', 5]] },
  b_eggoats:  { n: 'Boiled eggs + banana oats', i: [['egg', 2], ['oats', 40], ['milk', 200], ['banana', 1]] },

  // Lunch (rice bowls)
  l_rajma:    { n: 'Rajma burrito bowl', d: 'Rice, rajma, corn, onion-tomato salsa, curd on top.', i: [['rice', 75], ['rajma', 50], ['corn', 40], ['onitom', 60], ['salad', 50], ['curd', 75], ['oil', 7]] },
  l_soya:     { n: 'Soya keema rice bowl', d: 'Spiced soya keema over rice with sautéed veggies.', i: [['rice', 70], ['soya', 40], ['onitom', 70], ['veg', 60], ['curd', 75], ['oil', 8]] },
  l_dal:      { n: 'Dal-rice bowl + sabzi', d: 'Toor dal, rice, a dry sabzi and curd in one bowl.', i: [['rice', 75], ['toor', 45], ['veg', 120], ['curd', 100], ['oil', 8]] },
  l_paneer:   { n: 'Paneer tikka rice bowl', d: 'Grilled paneer, capsicum and onion over rice, mint curd.', i: [['rice', 70], ['paneer', 90], ['veg', 100], ['curd', 50], ['oil', 6]] },
  l_chana:    { n: 'Chana masala rice bowl', d: 'Chole over rice with cucumber salad and curd.', i: [['rice', 70], ['chana', 50], ['onitom', 70], ['salad', 60], ['curd', 75], ['oil', 8]] },
  l_curdrice: { n: 'Curd rice bowl + sprouts salad', d: 'Andhra-style curd rice with a peanut tadka and sprouts.', i: [['rice', 70], ['curd', 200], ['sprouts', 100], ['peanuts', 10], ['oil', 3]] },
  l_chicken:  { n: 'Chicken burrito bowl', d: 'Grilled chicken, rice, rajma, corn, salsa and curd.', i: [['rice', 75], ['chicken', 130], ['rajma', 25], ['corn', 40], ['onitom', 60], ['curd', 50], ['oil', 7]] },
  l_eggbhurji:{ n: 'Egg bhurji rice bowl', d: 'Masala egg bhurji over rice with veggies.', i: [['rice', 75], ['egg', 3], ['onitom', 70], ['veg', 60], ['oil', 7]] },
  l_fish:     { n: 'Fish curry rice bowl', d: 'Light fish curry over rice with a veg side.', i: [['rice', 75], ['fish', 130], ['onitom', 60], ['veg', 80], ['oil', 8]] },

  // Snack
  s_curd:     { n: 'Curd + banana + peanuts', i: [['curd', 200], ['banana', 1], ['peanuts', 15]] },
  s_chana:    { n: 'Roasted chana + fruit', i: [['roastchana', 40], ['fruit', 1]] },
  s_milkpb:   { n: 'Milk + peanut butter toast', i: [['milk', 200], ['bread', 1], ['pb', 15]] },
  s_sprouts:  { n: 'Sprouts chaat', i: [['sprouts', 120], ['roastchana', 20], ['onitom', 40], ['peanuts', 10]] },
  s_paneer:   { n: 'Paneer cubes + fruit', i: [['paneer', 60], ['fruit', 1]] },
  s_eggs:     { n: 'Boiled eggs + fruit', i: [['egg', 2], ['fruit', 1]] },

  // Dinner (bowls, a bit lighter)
  d_khichdi:  { n: 'Moong dal khichdi bowl + curd', i: [['rice', 50], ['moong', 45], ['veg', 100], ['curd', 100], ['oil', 7]] },
  d_palak:    { n: 'Palak paneer rice bowl', i: [['rice', 60], ['paneer', 80], ['spinach', 120], ['oil', 6]] },
  d_soyapulao:{ n: 'Soya-veg pulao bowl + raita', i: [['rice', 60], ['soya', 35], ['veg', 100], ['curd', 100], ['oil', 7]] },
  d_tofu:     { n: 'Tofu stir-fry rice bowl', i: [['rice', 60], ['tofu', 150], ['veg', 120], ['oil', 7]] },
  d_sambar:   { n: 'Sambar rice bowl + sprouts', i: [['rice', 60], ['toor', 40], ['veg', 120], ['sprouts', 70], ['oil', 6]] },
  d_dalroti:  { n: 'Dal + roti + sabzi', i: [['roti', 2], ['moong', 40], ['veg', 120], ['oil', 6]] },
  d_chicken:  { n: 'Chicken curry rice bowl', i: [['rice', 60], ['chicken', 130], ['onitom', 70], ['salad', 60], ['oil', 8]] },
  d_eggcurry: { n: 'Egg curry rice bowl', i: [['rice', 60], ['egg', 3], ['onitom', 80], ['veg', 60], ['oil', 7]] }
};

export const SLOTS = [
  { id: 'B', name: 'Breakfast' },
  { id: 'L', name: 'Lunch' },
  { id: 'S', name: 'Snack' },
  { id: 'D', name: 'Dinner' }
];

// Weekly plans, index 0 = Monday
const VEG = {
  B: ['b_oats', 'b_pesarattu', 'b_idli', 'b_paneer', 'b_poha', 'b_upma', 'b_dosa'],
  L: ['l_rajma', 'l_soya', 'l_dal', 'l_paneer', 'l_chana', 'l_soya', 'l_curdrice'],
  S: ['s_curd', 's_chana', 's_milkpb', 's_sprouts', 's_paneer', 's_curd', 's_chana'],
  D: ['d_khichdi', 'd_palak', 'd_soyapulao', 'd_tofu', 'd_sambar', 'd_dalroti', 'd_palak']
};
const EGG_SWAPS = { B: { 0: 'b_eggoats', 2: 'b_omelette', 5: 'b_omelette' }, S: { 1: 's_eggs', 4: 's_eggs' }, D: { 3: 'd_eggcurry' } };
const NONVEG_SWAPS = { L: { 0: 'l_chicken', 2: 'l_eggbhurji', 4: 'l_fish', 6: 'l_chicken' }, D: { 1: 'd_chicken', 5: 'd_chicken' } };

export function mealIdFor(diet, slot, weekday) {
  let id = VEG[slot][weekday];
  if (diet === 'egg' || diet === 'nonveg') id = EGG_SWAPS[slot]?.[weekday] || id;
  if (diet === 'nonveg') id = NONVEG_SWAPS[slot]?.[weekday] || id;
  return id;
}

// Quick protein top-ups by diet. Real food only: ICMR-NIN 2024 guidelines advise against protein supplements.
export const TOPUPS = {
  veg: [
    { n: 'Soya chunks 30 g (cooked)', k: 105, p: 16 },
    { n: 'Paneer 75 g', k: 200, p: 14 },
    { n: 'Curd 200 g', k: 120, p: 7 },
    { n: 'Roasted chana 40 g', k: 150, p: 8 }
  ],
  egg: [
    { n: '2 boiled eggs', k: 145, p: 13 },
    { n: '3 egg whites', k: 50, p: 11 },
    { n: 'Soya chunks 30 g (cooked)', k: 105, p: 16 },
    { n: 'Curd 200 g', k: 120, p: 7 }
  ],
  nonveg: [
    { n: 'Chicken breast 100 g', k: 165, p: 31 },
    { n: '2 boiled eggs', k: 145, p: 13 },
    { n: 'Soya chunks 30 g (cooked)', k: 105, p: 16 },
    { n: 'Curd 200 g', k: 120, p: 7 }
  ]
};
