/**
 * Learn module data registry.
 *
 * Each module: { id, title, emoji, color, tier, cards: [{ symbol, illustration, word, ttsText, dots? }] }
 *
 * tier: 'beginner' (ages 3-7) | 'intermediate' (ages 8-12) | 'advanced' (ages 13-17)
 * ttsText is read aloud; may differ slightly from visible word for richer speech.
 */

// ---------------------------------------------------------------------------
// BEGINNER TIER
// ---------------------------------------------------------------------------

// Alphabet (A–Z)
const ALPHABET_DATA = [
  ['A', '🍎', 'Apple'],    ['B', '🐻', 'Bear'],
  ['C', '🐱', 'Cat'],      ['D', '🐶', 'Dog'],
  ['E', '🥚', 'Egg'],      ['F', '🐟', 'Fish'],
  ['G', '🦒', 'Giraffe'],  ['H', '🐴', 'Horse'],
  ['I', '🍦', 'Ice Cream'],['J', '🃏', 'Joker'],
  ['K', '🦘', 'Kangaroo'], ['L', '🦁', 'Lion'],
  ['M', '🌙', 'Moon'],     ['N', '📰', 'Newspaper'],
  ['O', '🦉', 'Owl'],      ['P', '🐧', 'Penguin'],
  ['Q', '👑', 'Queen'],    ['R', '🌈', 'Rainbow'],
  ['S', '☀️', 'Sun'],      ['T', '🐯', 'Tiger'],
  ['U', '☂️', 'Umbrella'], ['V', '🌋', 'Volcano'],
  ['W', '🌊', 'Wave'],     ['X', '🎸', 'Xylophone'],
  ['Y', '🧶', 'Yarn'],     ['Z', '🦓', 'Zebra'],
]

const alphabet = {
  id: 'alphabet', title: 'Alphabet', emoji: '🔤', color: '#3b82f6', tier: 'beginner',
  cards: ALPHABET_DATA.map(([letter, icon, word]) => ({
    symbol: letter, illustration: icon, word,
    ttsText: `${letter} is for ${word}`,
  })),
}

// Numbers (1–10)
const NUMBER_DATA = [
  [1,  '☝️',  'One',   'one hand'],
  [2,  '✌️',  'Two',   'two fingers'],
  [3,  '🌟',  'Three', 'three stars'],
  [4,  '🍀',  'Four',  'a four leaf clover'],
  [5,  '⭐',  'Five',  'five stars'],
  [6,  '🎲',  'Six',   'a dice with six dots'],
  [7,  '🌈',  'Seven', 'seven colours in a rainbow'],
  [8,  '🐙',  'Eight', 'an octopus with eight arms'],
  [9,  '🎳',  'Nine',  'nine bowling pins'],
  [10, '🔟',  'Ten',   'ten'],
]
function dots(n) { return Array(n).fill('●').join(' ') }

const numbers = {
  id: 'numbers', title: 'Numbers', emoji: '🔢', color: '#22c55e', tier: 'beginner',
  cards: NUMBER_DATA.map(([n, icon, word, desc]) => ({
    symbol: String(n), illustration: icon, word, dots: dots(n),
    ttsText: `${n}. ${word}. ${desc}.`,
  })),
}

// Colors
const COLORS_DATA = [
  ['Red',    '🍎', 'Red is the color of apples and roses.'],
  ['Orange', '🍊', 'Orange is the color of oranges and sunsets.'],
  ['Yellow', '🌟', 'Yellow is the color of the sun and bananas.'],
  ['Green',  '🌿', 'Green is the color of grass and leaves.'],
  ['Blue',   '💧', 'Blue is the color of the sky and the ocean.'],
  ['Purple', '🔮', 'Purple is a mix of red and blue.'],
  ['Pink',   '🌸', 'Pink is a light, soft color like flowers.'],
  ['White',  '☁️', 'White is the color of clouds and snow.'],
  ['Black',  '🐈', 'Black is the darkest color of all.'],
  ['Brown',  '🐻', 'Brown is the color of earth and chocolate.'],
]

const colors = {
  id: 'colors', title: 'Colors', emoji: '🎨', color: '#ec4899', tier: 'beginner',
  cards: COLORS_DATA.map(([color, icon, desc]) => ({
    symbol: color, illustration: icon, word: color, ttsText: desc,
  })),
}

// Shapes
const SHAPES_DATA = [
  ['Circle',    '⚽', 'A circle is perfectly round, like a ball.'],
  ['Square',    '🟦', 'A square has four equal sides.'],
  ['Triangle',  '🔺', 'A triangle has three sides and three corners.'],
  ['Rectangle', '📱', 'A rectangle has two long sides and two short sides.'],
  ['Star',      '⭐', 'A star has five points.'],
  ['Heart',     '❤️', 'A heart shape means love.'],
  ['Diamond',   '💎', 'A diamond is like a square tilted on its side.'],
  ['Oval',      '🥚', 'An oval is like a stretched circle, like an egg.'],
]

const shapes = {
  id: 'shapes', title: 'Shapes', emoji: '🔷', color: '#f97316', tier: 'beginner',
  cards: SHAPES_DATA.map(([shape, icon, desc]) => ({
    symbol: shape, illustration: icon, word: shape, ttsText: desc,
  })),
}

// Animals
const ANIMALS_DATA = [
  ['Dog',      '🐶', 'Dogs are friendly pets. They say woof!'],
  ['Cat',      '🐱', 'Cats purr when they are happy. They say meow!'],
  ['Cow',      '🐄', 'Cows live on farms and give us milk. They say moo!'],
  ['Horse',    '🐴', 'Horses are strong animals we can ride.'],
  ['Elephant', '🐘', 'Elephants are the biggest animals on land.'],
  ['Lion',     '🦁', 'Lions are called the kings of the jungle.'],
  ['Tiger',    '🐯', 'Tigers have orange fur with black stripes.'],
  ['Rabbit',   '🐰', 'Rabbits have long ears and love to hop.'],
  ['Duck',     '🦆', 'Ducks swim in ponds and say quack quack!'],
  ['Fish',     '🐟', 'Fish breathe underwater using their gills.'],
  ['Bird',     '🐦', 'Birds have wings and most of them can fly.'],
  ['Frog',     '🐸', 'Frogs jump and love to live near water.'],
]

const animals = {
  id: 'animals', title: 'Animals', emoji: '🦁', color: '#84cc16', tier: 'beginner',
  cards: ANIMALS_DATA.map(([name, icon, desc]) => ({
    symbol: name, illustration: icon, word: name, ttsText: desc,
  })),
}

// Body Parts
const BODY_DATA = [
  ['Head',  '🧠', 'Your head sits on top of your body. Your brain is inside.'],
  ['Eyes',  '👁️',  'You see with your eyes.'],
  ['Nose',  '👃', 'You smell things with your nose.'],
  ['Mouth', '👄', 'You eat and talk with your mouth.'],
  ['Ears',  '👂', 'You hear sounds with your ears.'],
  ['Hands', '✋', 'You use your hands to hold and touch things.'],
  ['Feet',  '🦶', 'You walk and run with your feet.'],
  ['Arms',  '💪', 'Your arms connect your hands to your shoulders.'],
  ['Legs',  '🦵', 'Your legs help you stand, walk, and run.'],
  ['Tummy', '🫃', 'Your tummy holds the food you eat.'],
]

const bodyParts = {
  id: 'body-parts', title: 'Body Parts', emoji: '🧠', color: '#06b6d4', tier: 'beginner',
  cards: BODY_DATA.map(([name, icon, desc]) => ({
    symbol: name, illustration: icon, word: name, ttsText: desc,
  })),
}

// ---------------------------------------------------------------------------
// INTERMEDIATE TIER
// ---------------------------------------------------------------------------

// Sight Words
const SIGHT_WORDS_DATA = [
  ['the',  '📖', 'We read the book.'],
  ['and',  '🤝', 'The cat and the dog are friends.'],
  ['is',   '✅', 'The sky is blue.'],
  ['it',   '👇', 'It is warm today.'],
  ['in',   '📦', 'The ball is in the box.'],
  ['at',   '📍', 'She is at the park.'],
  ['he',   '👦', 'He is running fast.'],
  ['she',  '👧', 'She likes to sing.'],
  ['we',   '👫', 'We are going to school.'],
  ['my',   '🙋', 'This is my book.'],
  ['can',  '💪', 'I can do it!'],
  ['go',   '🏃', 'Let us go to the playground.'],
  ['up',   '⬆️', 'The balloon went up.'],
  ['on',   '📌', 'The cup is on the table.'],
  ['was',  '⏪', 'It was a sunny day.'],
  ['but',  '↩️', 'I tried, but I could not reach.'],
  ['see',  '👀', 'I can see the stars.'],
  ['look', '🔭', 'Look at that rainbow!'],
  ['you',  '👉', 'You are doing great.'],
  ['for',  '🎁', 'This present is for you.'],
]

const sightWords = {
  id: 'sight-words', title: 'Sight Words', emoji: '📖', color: '#f59e0b', tier: 'intermediate',
  cards: SIGHT_WORDS_DATA.map(([word, icon, example]) => ({
    symbol: word, illustration: icon, word,
    ttsText: `${word}. ${example}`,
  })),
}

// Simple Addition
const ADDITION_DATA = [
  [1, 1, 2],  [1, 2, 3],  [2, 2, 4],
  [2, 3, 5],  [3, 3, 6],  [3, 4, 7],
  [4, 4, 8],  [4, 5, 9],  [5, 5, 10],
  [2, 4, 6],  [3, 5, 8],  [6, 4, 10],
]
const NUM_WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten']

const addition = {
  id: 'addition', title: 'Addition', emoji: '➕', color: '#22c55e', tier: 'intermediate',
  cards: ADDITION_DATA.map(([a, b, sum]) => ({
    symbol: `${a} + ${b}`,
    illustration: `${sum}`,
    word: `= ${sum}`,
    ttsText: `${a} plus ${b} equals ${sum}. ${NUM_WORDS[a]} plus ${NUM_WORDS[b]} equals ${NUM_WORDS[sum]}.`,
  })),
}

// Emotions
const EMOTIONS_DATA = [
  ['Happy',     '😊', 'Happy. When something good happens, you might feel happy.'],
  ['Sad',       '😢', 'Sad. When something upsets you, you might feel sad. That is okay.'],
  ['Angry',     '😠', 'Angry. When something feels unfair, you might feel angry.'],
  ['Scared',    '😨', 'Scared. When something feels dangerous, you might feel scared.'],
  ['Surprised', '😲', 'Surprised. When something unexpected happens, you feel surprised.'],
  ['Excited',   '🤩', 'Excited. When you are looking forward to something great, you feel excited.'],
  ['Tired',     '😴', 'Tired. When your body needs rest, you feel tired.'],
  ['Bored',     '😑', 'Bored. When nothing feels interesting, you might feel bored.'],
  ['Silly',     '😜', 'Silly. When you feel like being funny, you feel silly.'],
  ['Calm',      '😌', 'Calm. When everything feels peaceful and quiet, you feel calm.'],
]

const emotions = {
  id: 'emotions', title: 'Emotions', emoji: '😊', color: '#a855f7', tier: 'intermediate',
  cards: EMOTIONS_DATA.map(([name, icon, desc]) => ({
    symbol: name, illustration: icon, word: name, ttsText: desc,
  })),
}

// ---------------------------------------------------------------------------
// ADVANCED TIER
// ---------------------------------------------------------------------------

// Science Facts
const SCIENCE_DATA = [
  ['Photosynthesis', '🌿', 'Photosynthesis is how plants make their own food. They use sunlight, water, and carbon dioxide to create energy and release oxygen.'],
  ['Gravity',        '🍎', 'Gravity is the force that pulls objects toward each other. It is what keeps us on the ground and keeps planets orbiting the sun.'],
  ['Atoms',          '⚛️',  'Atoms are the tiny building blocks that make up everything in the universe. They are so small that millions fit on the tip of a pin.'],
  ['DNA',            '🧬', 'DNA is a molecule inside every living cell that carries the instructions for how a living thing grows, works, and reproduces.'],
  ['Evolution',      '🦎', 'Evolution is the process by which living things change gradually over millions of years, adapting to their environments.'],
  ['Solar System',   '🪐', 'Our solar system has eight planets orbiting the Sun. Earth is the third planet from the Sun and the only one known to support life.'],
  ['Volcanoes',      '🌋', 'Volcanoes are openings in the Earth\'s crust where molten rock called magma escapes as lava. They can form mountains over time.'],
  ['Ecosystems',     '🌏', 'An ecosystem is a community of living things interacting with each other and their environment. Oceans, forests, and deserts are all ecosystems.'],
  ['Water Cycle',    '💧', 'The water cycle describes how water moves on Earth. Water evaporates, forms clouds, falls as rain, and flows back to the ocean.'],
  ['Electricity',    '⚡', 'Electricity is the flow of tiny particles called electrons through a conductor. It powers our homes, devices, and much of the modern world.'],
]

const scienceFacts = {
  id: 'science-facts', title: 'Science Facts', emoji: '🔬', color: '#06b6d4', tier: 'advanced',
  cards: SCIENCE_DATA.map(([topic, icon, desc]) => ({
    symbol: topic, illustration: icon, word: topic, ttsText: desc,
  })),
}

// World Geography
const GEO_DATA = [
  ['Africa',        '🌍', 'Africa is the second-largest continent. It is home to the Sahara Desert, the Nile River, and an enormous variety of wildlife.'],
  ['Asia',          '🌏', 'Asia is the largest continent on Earth, covering about one-third of the world\'s land. It is home to more than four billion people.'],
  ['Europe',        '🗼', 'Europe is a continent of 44 countries. It is home to historic cultures, the Alps mountains, and the Mediterranean Sea.'],
  ['North America', '🗽', 'North America includes Canada, the United States, and Mexico. It has vast prairies, mountains, and the Amazon\'s northern forests.'],
  ['South America', '🌿', 'South America is home to the Amazon Rainforest, the world\'s largest tropical forest, and the Andes, its longest mountain range.'],
  ['Australia',     '🦘', 'Australia is both a continent and a country. It is famous for unique animals like kangaroos, koalas, and the Great Barrier Reef.'],
  ['Antarctica',    '🧊', 'Antarctica is the coldest and windiest continent on Earth. It is covered in ice and home to penguins but no permanent human population.'],
  ['Amazon River',  '🐊', 'The Amazon River in South America is the world\'s largest river by volume of water. It flows through the Amazon Rainforest.'],
  ['Mt. Everest',   '⛰️', 'Mount Everest, on the border of Nepal and Tibet, is the highest mountain on Earth at 8,849 metres above sea level.'],
  ['Great Wall',    '🏯', 'The Great Wall of China is one of the longest structures ever built, stretching over 21,000 kilometres across northern China.'],
]

const worldGeography = {
  id: 'world-geography', title: 'World Geography', emoji: '🌍', color: '#f97316', tier: 'advanced',
  cards: GEO_DATA.map(([topic, icon, desc]) => ({
    symbol: topic, illustration: icon, word: topic, ttsText: desc,
  })),
}

// Vocabulary Builder
const VOCAB_DATA = [
  ['Perseverance', '🏆', 'Perseverance means continuing to try even when something is very difficult.'],
  ['Empathy',      '🤗', 'Empathy means understanding and sharing the feelings of another person.'],
  ['Resilience',   '🌱', 'Resilience is the ability to recover quickly from difficulties or setbacks.'],
  ['Curiosity',    '🔭', 'Curiosity is a strong desire to learn or know about something.'],
  ['Ambitious',    '🚀', 'Being ambitious means having a strong desire to achieve something great.'],
  ['Compassion',   '❤️', 'Compassion means feeling care and concern for others who are suffering.'],
  ['Integrity',    '⚖️', 'Integrity means being honest and having strong moral principles.'],
  ['Collaborate',  '🤝', 'To collaborate means to work together with others toward a shared goal.'],
  ['Innovative',   '💡', 'Being innovative means creating new ideas or ways of doing things.'],
  ['Communicate',  '💬', 'To communicate means to share information or feelings with others clearly.'],
  ['Diverse',      '🌈', 'Diverse means including many different types of people, ideas, or things.'],
  ['Inspire',      '✨', 'To inspire means to fill someone with the urge or ability to do something creative or wonderful.'],
]

const vocabulary = {
  id: 'vocabulary', title: 'Vocabulary', emoji: '📝', color: '#8b5cf6', tier: 'advanced',
  cards: VOCAB_DATA.map(([word, icon, def]) => ({
    symbol: word, illustration: icon, word, ttsText: def,
  })),
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const MODULES = {
  alphabet,
  numbers,
  colors,
  shapes,
  animals,
  'body-parts': bodyParts,
  'sight-words': sightWords,
  addition,
  emotions,
  'science-facts': scienceFacts,
  'world-geography': worldGeography,
  vocabulary,
}

export default MODULES
