/* All site content in one place. Edit text, prices and dishes here.
   Prices: leave `price` empty to show the "USD · TBC" placeholder, or set e.g. '48' to show "USD 48". */

export type Dish = { name: string; desc: string; price?: string };
export type Main = Dish & {
  img: string; small: string; smallW: 540 | 720; large: string; largeW: 960 | 1280; w: number; h: number; alt: string;
  pairing: string; why: string;
};

export const NAV = [
  { href: '#philosophy', label: 'Philosophy' },
  { href: '#fire', label: 'The Fire' },
  { href: '#menu', label: 'Menu' },
  { href: '#whiskey', label: 'Whiskey' },
  { href: '#lounge', label: 'Lounge' },
  { href: '#interior', label: 'Interior' }
];

export const MOBILE_NAV = [
  { href: '#philosophy', label: 'Philosophy' },
  { href: '#fire', label: 'The Open Fire' },
  { href: '#menu', label: 'The Menu' },
  { href: '#whiskey', label: 'The Whiskey Library' },
  { href: '#tableside', label: 'Tableside' },
  { href: '#lounge', label: 'The Cigar Lounge' },
  { href: '#interior', label: 'The Interior' }
];

export const TENETS = [
  ['Real wood', 'Oak for beef, olive for fish, vine for shellfish. Each wood gives its own smoke.'],
  ['Precise heat', 'Grates rise and fall by hand. The chef reads the embers, not a dial.'],
  ['Live cooking', 'Nothing is hidden. The kitchen is the centre of the room.'],
  ['Craft', 'Every cut is chosen, aged and finished with care, then carried straight from the fire to your table.']
] as const;

export const STATIONS = [
  { n: 'I', title: 'The wood grill', text: 'A long iron grill over oak embers, raised and lowered by hand to hold the exact heat each cut needs.', img: 'hearth-station-sm', w: 960, h: 536, alt: 'Flames rising from oak embers under the adjustable iron grill' },
  { n: 'II', title: 'The ember beds', text: 'Vegetables, garlic and fruit roasted directly in the coals, where they blister, soften and sweeten.', img: 'ember-ingredients-sm', w: 960, h: 536, alt: 'Vegetables and fruit blistering in a bed of coals' },
  { n: 'III', title: 'The wood-fired oven', text: 'A domed oven in the stone wall for breads, bones and slow roasting.', img: 'oven-sm', w: 640, h: 794, alt: 'A domed wood-fired oven glowing in a dark stone wall, a wooden peel resting beside it', tall: true },
  { n: 'IV', title: "The chef's counter", text: 'Eight to ten seats facing the fire. The closest view in the house.', img: 'chefs-counter-sm', w: 960, h: 536, alt: "The chef's counter: leather stools along a burnt-oak counter facing the open fire" },
  { n: 'V', title: 'The dining room', text: 'Every table is set with a view of the hearth, so the fire is part of the evening.', img: 'dining-room-sm', w: 960, h: 536, alt: 'The main dining room, linen-dressed tables and leather chairs facing the glowing hearth' }
];

export const FTP_STAGES = [
  { n: 'I', name: 'Fire', line: 'It starts with oak, burned down to embers.', img: 'fire', clip: 'ftp-fire', alt: 'Close view of flames rising from glowing oak embers' },
  { n: 'II', name: 'Craft', line: "Then the chef's hands, the heat, and the moment it is ready.", img: 'craft', clip: 'ftp-craft', alt: 'A chef brushing smoked butter over a seared steak on the grill' },
  { n: 'III', name: 'The Pour', line: 'And finally, the whiskey chosen to meet it.', img: 'pour', clip: 'ftp-pour', alt: 'Amber whiskey pouring from a crystal decanter into a cut-crystal tumbler over an ice sphere' }
];

export const STARTERS: Dish[] = [
  { name: 'Oscietra Caviar', desc: 'Ember-baked brioche, smoked crème fraîche.' },
  { name: 'Bone Marrow', desc: 'Roasted in the coals, black truffle, grilled sourdough.' },
  { name: 'Wagyu Beef Tartare', desc: 'Smoked egg yolk, black truffle.' },
  { name: 'Seared Foie Gras', desc: 'Fig jam prepared over the fire.' },
  { name: 'Mediterranean Octopus', desc: 'Grilled over the embers, smoked paprika, lemon.' }
];

const portrait = (img: string) => ({ img, small: `${img}-sm`, smallW: 540 as const, large: img, largeW: 960 as const, w: 640, h: 794 });

export const MAINS: Main[] = [
  { name: 'A5 Japanese Wagyu Striploin', desc: 'Seared over oak embers.', ...portrait('wagyu-a5'), alt: 'Slices of seared A5 wagyu striploin with flaky salt on a dark plate', pairing: 'Japanese Whisky', why: 'Delicate and clean, it lets the marbling speak.' },
  { name: 'Dry-Aged Tomahawk for Two', desc: 'Carved tableside.', img: 'tomahawk', small: 'tomahawk-sm', smallW: 720, large: 'tomahawk', largeW: 1280, w: 960, h: 536, alt: 'A dry-aged tomahawk carved into rosy slices along the bone on an oak board', pairing: 'Bold Bourbon', why: 'Vanilla and char to match the crust.' },
  { name: 'Rack of Lamb', desc: 'Rosemary smoke, ember-roasted garlic.', ...portrait('lamb'), alt: 'A rack of lamb charred over fire with smoking rosemary and roasted garlic', pairing: 'Spicy Rye Whiskey', why: 'Pepper and spice against rosemary smoke.' },
  { name: 'Whole Grilled Lobster', desc: 'Vine wood, smoked butter.', ...portrait('lobster'), alt: 'A whole lobster split and grilled over vine wood, glossed with smoked butter', pairing: 'Lightly Peated Single Malt', why: 'A gentle smoke that meets the vine wood.' },
  { name: 'Wild Sea Bass', desc: 'Cooked whole over olive wood.', ...portrait('seabass'), alt: 'A whole sea bass in an iron grilling basket over olive-wood embers', pairing: 'Smoky Islay Scotch', why: 'Sea air and peat for a fish cooked whole.' },
  { name: 'Duck Breast', desc: 'Honey and pomegranate glaze.', ...portrait('duck'), alt: 'Sliced duck breast lacquered with honey and pomegranate glaze, scattered with pomegranate seeds', pairing: 'Sherry-Cask Single Malt', why: 'Dried fruit and spice to echo the pomegranate.' },
  { name: 'Wagyu Short Rib', desc: 'Braised for 12 hours, finished over the fire with a whiskey glaze.', ...portrait('shortrib'), alt: 'A wagyu short rib on the bone with a dark whiskey glaze, a tumbler of whiskey behind', pairing: 'Aged Bourbon', why: 'Deep caramel, the same note as its glaze.' },
  { name: 'Iberico Pork Presa', desc: 'Charred stone fruit.', ...portrait('iberico'), alt: 'Sliced Iberico pork presa beside charred peaches and apricots', pairing: 'Speyside Single Malt', why: 'Orchard fruit beside charred stone fruit.' }
];

export const DESSERTS: Dish[] = [
  { name: 'Dark Chocolate Fondant', desc: 'Smoked sea salt and caramel.' },
  { name: 'Ember-Caramelized Figs and Dates', desc: 'Vanilla bean ice cream.' }
];

export const WHISKIES = [
  { name: 'Japanese Whisky', notes: 'Clean, floral, precise.', meets: 'A5 Japanese Wagyu', liq: '#D9A441' },
  { name: 'American Bourbon', notes: 'Vanilla, caramel, toasted oak.', meets: 'Tomahawk · Short Rib', liq: '#B4632A' },
  { name: 'Rye Whiskey', notes: 'Pepper, spice, a dry finish.', meets: 'Rack of Lamb', liq: '#A8522A' },
  { name: 'Islay Scotch', notes: 'Peat smoke, sea salt, iodine.', meets: 'Wild Sea Bass · Lobster', liq: '#D8B36A' },
  { name: 'Speyside Single Malt', notes: 'Orchard fruit, honey, soft malt.', meets: 'Iberico Pork Presa', liq: '#C98C3A' },
  { name: 'Sherry-Cask Whisky', notes: 'Dried fig, raisin, warm spice.', meets: 'Duck Breast', liq: '#7A3218' }
];

export const MOMENTS = [
  { kicker: 'From the fire', title: 'Carving', text: 'The tomahawk for two is carved at your table, along the bone.', big: 'tomahawk', bw: 1920, bh: 1072, small: 'tomahawk-sm', w: 960, h: 536, alt: 'A tomahawk steak carved into slices at the table' },
  { kicker: 'In the pan', title: 'Flambé', text: 'Figs and dates caramelised in a copper pan, finished in flame.', big: 'flambe', bw: 1200, bh: 1489, small: 'flambe-sm', w: 640, h: 794, alt: 'A copper pan of figs flambéed on a brass réchaud at the table' },
  { kicker: 'Under glass', title: 'Smoked beneath the cloche', text: 'Some dishes arrive under a glass cloche of oak smoke, lifted in front of you.', big: 'cloche', bw: 1200, bh: 1489, small: 'cloche-sm', w: 640, h: 794, alt: 'A plate beneath a glass cloche filled with swirling smoke' },
  { kicker: 'The last second', title: 'Live finishing', text: 'Butter, salt and a final moment over the coals, just before it leaves the fire.', big: 'craft', bw: 1920, bh: 1072, small: 'craft-sm', w: 960, h: 536, alt: 'A steak brushed with smoked butter on the grill' },
  { kicker: 'To the table', title: "The chef's counter", text: 'Or take a seat at the counter and watch every course travel from fire to plate.', big: 'chefs-counter', bw: 1920, bh: 1072, small: 'chefs-counter-sm', w: 960, h: 536, alt: "Leather stools at the chef's counter facing the fire" }
];

export const LOUNGE_FEATURES = ['Cognac leather armchairs', 'Walk-in humidor', 'Whiskey service', 'Intimate seating'];

export const TILES = [
  { cls: 'a', full: 'hero-start', small: 'hero-start-sm', w: 960, h: 536, cap: 'The central hearth', alt: 'The central hearth under its brass hood, seen from the dining room' },
  { cls: 'b', full: 'dining-room', small: 'dining-room-sm', w: 960, h: 536, cap: 'The dining room', alt: 'The dining room with linen tables facing the fire' },
  { cls: 'c', full: 'materials', small: 'materials-sm', w: 640, h: 794, cap: 'Materials and light', alt: 'Honed stone, hammered brass and burnt oak under a brass sconce' },
  { cls: 'd', full: 'chefs-counter', small: 'chefs-counter-sm', w: 960, h: 536, cap: "The chef's counter", alt: "The chef's counter facing the hearth" },
  { cls: 'e', full: 'whiskey-library', small: 'whiskey-library-sm', w: 960, h: 536, cap: 'The whiskey library', alt: 'The glass-walled whiskey library' },
  { cls: 'f', full: 'cigar-lounge', small: 'cigar-lounge-sm', w: 960, h: 536, cap: 'The cigar lounge', alt: 'The private cigar lounge' }
];

export const TIMES = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
export const GUESTS = [['1', '1 guest'], ['2', '2 guests'], ['3', '3 guests'], ['4', '4 guests'], ['5', '5 guests'], ['6', '6 guests'], ['7', '7 guests'], ['8', '8 guests'], ['9+', '9 or more']] as const;
export const PREFERENCES = [
  { value: 'Main dining room', title: 'Main dining room', note: 'A table with a view of the hearth.' },
  { value: "Chef's counter", title: "Chef's counter", note: 'Eight to ten seats facing the fire.' },
  { value: 'Private cigar lounge', title: 'Private cigar lounge', note: '18+. Cigars are offered separately.' }
];

export const FACTS = [
  { k: 'Address', ph: 'Street address to be confirmed', extra: 'Downtown Beirut, Lebanon' },
  { k: 'Hours', ph: 'Opening hours to be confirmed' },
  { k: 'Reservations', ph: 'Phone and email to be confirmed', link: { href: '#reserve', label: 'Or send a request online' } },
  { k: 'Instagram', ph: 'Handle to be confirmed' },
  { k: 'Age', value: '18+ only' }
];
