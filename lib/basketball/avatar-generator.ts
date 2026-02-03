// Avatar Generation System
// Generates unique player avatars using component-based system

export interface AvatarComponents {
  faceShape: string;
  skinTone: string;
  eyes: string;
  eyeColor: string;
  eyebrows: string;
  nose: string;
  mouth: string;
  hairStyle: string;
  hairColor: string;
  facialHair: string;
  accessories: string;
}

// Component definitions
export const FACE_SHAPES = [
  'oval', 'round', 'square', 'heart', 'diamond',
  'triangle', 'oblong', 'rectangle', 'pear', 'inverted-triangle'
];

export const FACE_SHAPE_WEIGHTS = {
  oval: 0.12,
  round: 0.12,
  square: 0.12,
  heart: 0.12,
  diamond: 0.12,
  triangle: 0.02,
  oblong: 0.12,
  rectangle: 0.12,
  pear: 0.12,
  'inverted-triangle': 0.02,
};

export const SKIN_TONES = {
  tone1: '#FFE0C4', // Very light
  tone2: '#F1C29B', // Light
  tone3: '#E0AC82', // Light-Medium
  tone4: '#C6865A', // Medium
  tone5: '#8D5524', // Medium-Dark
  tone6: '#784620', // Dark
  tone7: '#5A3214', // Very Dark
  tone8: '#3C230F', // Deep
};

export const EYE_SHAPES = [
  'round', 'almond', 'hooded', 'upturned', 'downturned',
  'monolid', 'deep-set', 'close-set', 'wide-set',
  'protruding', 'small', 'large'
];

export const EYE_COLORS = {
  brown: '#4A3728',
  'dark-brown': '#2C1810',
  blue: '#4A90E2',
  green: '#50C878',
  hazel: '#8E7618',
};

export const EYE_COLOR_WEIGHTS = {
  brown: 0.40,
  'dark-brown': 0.30,
  blue: 0.15,
  green: 0.10,
  hazel: 0.05,
};

export const EYEBROW_SHAPES = [
  'straight', 'arched', 'rounded', 's-shaped',
  'angled', 'flat', 'bushy', 'thin'
];

export const NOSE_SHAPES = [
  'straight', 'roman', 'button', 'hawk',
  'snub', 'greek', 'bulbous', 'narrow'
];

export const MOUTH_SHAPES = [
  'full', 'thin', 'wide', 'small', 'bow',
  'straight', 'upturned', 'downturned', 'asymmetric', 'pouty'
];

export const HAIR_STYLES = [
  'buzz-cut', 'crew-cut', 'fade', 'afro', 'dreadlocks',
  'cornrows', 'short-curly', 'medium-wavy', 'slicked-back',
  'spiky', 'side-part', 'mohawk', 'bald', 'receding', 'long'
];

export const HAIR_COLORS = {
  black: '#000000',
  'dark-brown': '#2C1810',
  'medium-brown': '#5C4033',
  'light-brown': '#8B7355',
  auburn: '#A52A2A',
  red: '#FF4500',
  blonde: '#FAF0BE',
  'dirty-blonde': '#D4AF37',
  gray: '#808080',
  white: '#FFFFFF',
};

export const HAIR_COLOR_WEIGHTS = {
  black: 0.30,
  'dark-brown': 0.30,
  'medium-brown': 0.15,
  'light-brown': 0.10,
  auburn: 0.05,
  red: 0.03,
  blonde: 0.03,
  'dirty-blonde': 0.02,
  gray: 0.01,
  white: 0.01,
};

export const FACIAL_HAIR = [
  'none', 'stubble', 'goatee', 'full-beard',
  'mustache', 'van-dyke', 'soul-patch', 'sideburns'
];

export const ACCESSORIES = [
  'none', 'glasses', 'sunglasses', 'headband', 'earring', 'bandana'
];

export const ACCESSORY_WEIGHTS = {
  none: 0.50,
  glasses: 0.15,
  sunglasses: 0.10,
  headband: 0.10,
  earring: 0.10,
  bandana: 0.05,
};

// Random choice from array using Math.random()
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Weighted random choice using Math.random()
function weightedChoice<T extends string>(
  options: Record<T, any>,
  weights: Record<T, number>
): T {
  const keys = Object.keys(options) as T[];
  const weightValues = keys.map(k => weights[k]);
  const totalWeight = weightValues.reduce((sum, w) => sum + w, 0);
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < keys.length; i++) {
    random -= weightValues[i];
    if (random <= 0) {
      return keys[i];
    }
  }
  
  return keys[keys.length - 1];
}

// Age-dependent facial hair choice
function ageDependentFacialHair(age: number): string {
  const noneWeight = age === 18 ? 0.70 : age === 19 ? 0.50 : 0.40;
  
  if (Math.random() < noneWeight) {
    return 'none';
  }
  
  const options = FACIAL_HAIR.filter(h => h !== 'none');
  return randomChoice(options);
}

// Generate avatar components with truly random generation
// Note: playerId parameter kept for API compatibility but not used for randomization
export function generateAvatar(playerId: string, age: number): AvatarComponents {
  const skinToneKeys = Object.keys(SKIN_TONES);
  const skinTone = randomChoice(skinToneKeys);
  
  return {
    faceShape: weightedChoice(FACE_SHAPES as any, FACE_SHAPE_WEIGHTS),
    skinTone,
    eyes: randomChoice(EYE_SHAPES),
    eyeColor: weightedChoice(EYE_COLORS, EYE_COLOR_WEIGHTS),
    eyebrows: randomChoice(EYEBROW_SHAPES),
    nose: randomChoice(NOSE_SHAPES),
    mouth: randomChoice(MOUTH_SHAPES),
    hairStyle: randomChoice(HAIR_STYLES),
    hairColor: weightedChoice(HAIR_COLORS, HAIR_COLOR_WEIGHTS),
    facialHair: ageDependentFacialHair(age),
    accessories: weightedChoice(ACCESSORIES, ACCESSORY_WEIGHTS),
  };
}

// Get color for skin tone
export function getSkinToneColor(tone: string): string {
  return SKIN_TONES[tone as keyof typeof SKIN_TONES] || SKIN_TONES.tone4;
}

// Get color for eye
export function getEyeColor(color: string): string {
  return EYE_COLORS[color as keyof typeof EYE_COLORS] || EYE_COLORS.brown;
}

// Get color for hair
export function getHairColor(color: string): string {
  return HAIR_COLORS[color as keyof typeof HAIR_COLORS] || HAIR_COLORS.black;
}

