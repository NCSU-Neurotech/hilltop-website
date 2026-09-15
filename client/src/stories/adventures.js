/**
 * Choose-Your-Own-Adventure stories for Group Storytime sessions.
 * The narrator picks choices; listeners follow along on their own devices.
 *
 * Structure per adventure:
 *   { id, title, emoji, color, startNode, nodes: { [key]: { illustration, text, choices, isEnding? } } }
 *
 * choices: [{ label, next }] | null (endings have no choices)
 */

const dragonMountain = {
  id: 'dragon-mountain',
  title: "The Dragon's Mountain",
  emoji: '🐉',
  color: '#ef4444',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '🗻🐉',
      text: 'You are a brave adventurer standing at the foot of a great mountain. People say a sleeping dragon lives at the very top, guarding a chest of magical wishes. Do you climb the mountain alone, or ask your cheerful friend Finn to join you?',
      choices: [
        { label: 'Climb alone', next: 'alone' },
        { label: 'Bring Finn along', next: 'with_finn' },
      ],
    },
    alone: {
      illustration: '🧗🌿',
      text: 'You hike up the winding mountain path by yourself. The air is crisp and fresh. Halfway up you reach a fork in the road. A mossy sign points left toward "The Cave of Echoes" and right toward "The Rainbow Bridge".',
      choices: [
        { label: 'Take the cave path', next: 'cave' },
        { label: 'Cross the Rainbow Bridge', next: 'bridge' },
      ],
    },
    with_finn: {
      illustration: '👫🏔️',
      text: 'Finn brings his magic lantern and a bag of sandwiches. Together you climb the mountain path, laughing and singing. Near the summit, you find the great dragon sleeping on a flat rock, its scales shimmering gold in the sunlight. Do you wake the dragon, or tiptoe past?',
      choices: [
        { label: 'Wake the dragon', next: 'wake_dragon' },
        { label: 'Tiptoe past', next: 'sneak' },
      ],
    },
    cave: {
      illustration: '🕯️🪨',
      text: 'You step into the cool, dark cave. Your lantern lights the way. Strange glowing crystals line the walls. Then you hear a deep rumbling — rocks are beginning to fall! Do you run back outside, or dive behind a large boulder and wait?',
      choices: [
        { label: 'Run back outside', next: 'cave_escape' },
        { label: 'Hide behind the boulder', next: 'cave_hide' },
      ],
    },
    bridge: {
      illustration: '🌈🌉',
      text: 'The Rainbow Bridge sparkles with every colour. You cross it carefully, feeling it bounce gently under your feet. On the other side, a small dragon with silver wings is waiting — not the great dragon, but a baby dragon who looks frightened and lost!',
      choices: [
        { label: 'Offer the baby dragon some food', next: 'baby_fed' },
        { label: 'Follow where the baby dragon leads', next: 'baby_leads' },
      ],
    },
    cave_escape: {
      illustration: '💨🪨',
      text: 'You sprint back out of the cave just in time! The rocks crash down behind you with a tremendous BOOM. You catch your breath and look up — there is the great dragon sitting right on the path above you, wide awake and watching. It tilts its head and speaks in a deep, rumbling voice.',
      choices: [
        { label: 'Listen to what the dragon says', next: 'wake_dragon' },
      ],
    },
    cave_hide: {
      illustration: '⭐🧺',
      text: 'You dive behind a huge boulder just in time. The rocks crash all around but you are perfectly safe. When the dust settles you see a golden glow deeper in the cave. You walk toward it and find a beautiful chest sitting in a beam of light. A small note reads: "One wish for those brave enough to reach this place."',
      choices: [
        { label: 'Open the chest and make a wish', next: 'ending_wish' },
      ],
    },
    baby_fed: {
      illustration: '🐉🥪💛',
      text: 'The baby dragon gobbles up the food and wags its tail happily, just like a puppy! It grabs your sleeve gently and pulls you up a hidden path to the very summit of the mountain. There sits the great dragon, wide awake and smiling. "You were kind to my child," it rumbles. "I will grant you one wish."',
      choices: [
        { label: 'Wish for everyone to be healthy and happy', next: 'ending_kind_wish' },
        { label: 'Wish for the ability to always help others', next: 'ending_helper' },
      ],
    },
    baby_leads: {
      illustration: '🌊✨',
      text: 'The baby dragon leads you over a ridge and down into a secret valley. There you find a magical spring with sparkling silver water. A carved stone beside it reads: "Drink and make one heartfelt wish — it will come true by sunrise."',
      choices: [
        { label: 'Drink from the spring and make your wish', next: 'ending_spring' },
      ],
    },
    wake_dragon: {
      illustration: '🐉👁️',
      text: 'The dragon opens one enormous golden eye and gazes at you calmly. Then it opens the other. It looks at you for a long, long moment. Then it speaks in a deep voice that makes the mountain tremble. "How brave you are to face me. Most run away. Tell me — what do you truly seek?"',
      choices: [
        { label: 'Ask for gold and treasure', next: 'ending_gold' },
        { label: 'Ask to always be able to help others', next: 'ending_helper' },
      ],
    },
    sneak: {
      illustration: '🤫👣',
      text: 'You and Finn tiptoe past the sleeping dragon as quietly as mice. But Finn accidentally kicks a pebble — clatter! The dragon\'s eye opens. It stares at you both for a long, tense moment. Then it smiles a wide, toothy smile.',
      choices: [
        { label: 'Freeze and pretend to be rocks', next: 'ending_freeze' },
        { label: 'Say hello politely', next: 'wake_dragon' },
      ],
    },
    ending_wish: {
      illustration: '⭐💛🏡',
      text: 'You open the chest and a warm golden light fills the cave. You close your eyes and wish for everyone in your village to be healthy and happy. Far away, people smile without knowing why. The dragon\'s voice echoes from above: "Well chosen, brave one." You return home a hero. The End!',
      choices: null,
      isEnding: true,
    },
    ending_kind_wish: {
      illustration: '🌟🌍',
      text: 'You wish for everyone to be healthy and happy. The dragon breathes a stream of warm golden light across the mountain top. All the way down in the valley, children laugh and gardens bloom. The dragon nods its great head. "The kindest wish I have granted in a hundred years," it says. You and Finn walk home smiling. The End!',
      choices: null,
      isEnding: true,
    },
    ending_helper: {
      illustration: '🤝💫',
      text: 'You wish for the ability to always know how to help others. The dragon smiles — an enormous, terrifying, but very kind smile. "That is the most unselfish wish I have heard in a century," it says. From that day on, whenever someone needed help, you always knew exactly what to do. You became the most beloved person in the whole land. The End!',
      choices: null,
      isEnding: true,
    },
    ending_gold: {
      illustration: '🪙🏡',
      text: 'The dragon gives you a single gold coin that magically returns to your pocket whenever you spend it. You will never go hungry again. Walking home, you feel something is still missing. "I should have asked to help others," you think. The dragon\'s laughter rolls down the mountain like distant thunder. Perhaps next time! The End!',
      choices: null,
      isEnding: true,
    },
    ending_freeze: {
      illustration: '🏔️🤝🎉',
      text: 'You and Finn freeze perfectly still. The dragon stares for a long, long moment... then closes its great eye with a rumble that might be laughter. You sneak all the way to the summit and find the chest of wishes. You each make a wish — you for kindness in the world, Finn for his grandma\'s knee to stop hurting. Both wishes come true that very night. The End!',
      choices: null,
      isEnding: true,
    },
    ending_spring: {
      illustration: '💧🌅',
      text: 'You drink from the cool spring and close your eyes. You wish for all the children everywhere to have wonderful, colourful dreams. That very night, children all across the land dream of flying and magic and adventure. The baby dragon nuzzles your hand gently. You have made a truly beautiful wish. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const piratesSea = {
  id: 'pirates-sea',
  title: 'Pirates of the Crystal Sea',
  emoji: '🏴‍☠️',
  color: '#06b6d4',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '⛵🌊',
      text: 'You are the captain of a small sailing ship on the sparkling Crystal Sea. Your first mate, a cheerful parrot named Polly, squawks excitedly and points at a map. "Captain! The map shows a magical island just two days\' sail away — the Island of a Thousand Colours!" Where do you sail first?',
      choices: [
        { label: 'Head straight for the island', next: 'straight' },
        { label: 'Stop at the market harbour first', next: 'harbour' },
      ],
    },
    straight: {
      illustration: '🌊🐋',
      text: 'You set sail across the open sea. The waves are bright as glass. Halfway across, a gigantic friendly whale surfaces right beside your ship! It opens one enormous eye and speaks in a deep bubbling voice: "Hello, Captain! I know a shortcut to the island. But beware the fog ahead."',
      choices: [
        { label: 'Take the whale\'s shortcut', next: 'whale_shortcut' },
        { label: 'Thank the whale and sail around the fog', next: 'around_fog' },
      ],
    },
    harbour: {
      illustration: '🏪🦜',
      text: 'At the market harbour you trade some cargo for a beautiful compass that always points toward treasure. An old sailor tugs your sleeve. "I sailed to that island once," she says. "You\'ll need a song — the island\'s guardian only lets you pass if you know the right song." She teaches you three notes. Polly immediately memorises them.',
      choices: [
        { label: 'Set sail now with the compass and song', next: 'island_approach' },
      ],
    },
    whale_shortcut: {
      illustration: '🐋✨🏝️',
      text: 'The whale dips below and swims ahead, creating a sparkling wake for you to follow. In just a few hours you can see the Island of a Thousand Colours on the horizon, glowing with every colour of the rainbow!',
      choices: [
        { label: 'Sail toward the island', next: 'island_approach' },
      ],
    },
    around_fog: {
      illustration: '🌫️⛵',
      text: 'You sail carefully around the thick, swirling fog. On the other side you find a small boat drifting alone. Inside is a young sailor who got lost in the fog! You help her aboard. "I know these waters well," she says gratefully. "I can guide you to the island safely."',
      choices: [
        { label: 'Accept her help', next: 'island_approach' },
      ],
    },
    island_approach: {
      illustration: '🏝️🌈',
      text: 'The Island of a Thousand Colours rises from the sea like a painting. The trees are every colour you can imagine. At the shore, a great stone gate is carved with musical notes. This must be the guardian\'s gate! Polly ruffles her feathers excitedly.',
      choices: [
        { label: 'Have Polly sing the three magic notes', next: 'gate_open' },
        { label: 'Knock loudly and call out a greeting', next: 'gate_friendly' },
      ],
    },
    gate_open: {
      illustration: '🎵🚪✨',
      text: 'Polly puffs up proudly and sings the three notes — clear and bright as bells. The stone gate rumbles and slides open! Beyond it is a valley filled with treasure: chests of rainbow gems, trees dripping with golden fruit, and flowers that sing softly in the breeze.',
      choices: [
        { label: 'Take a chest of rainbow gems home', next: 'ending_gems' },
        { label: 'Pick the golden fruit to share with your village', next: 'ending_fruit' },
      ],
    },
    gate_friendly: {
      illustration: '🦁🚪',
      text: 'The gate opens to reveal a great golden lion — the island\'s guardian! The lion looks at you with calm, wise eyes. "Most who come here seek treasure," it says. "But you greeted me as a friend. That is rare. Choose your gift freely."',
      choices: [
        { label: 'Ask for rainbow gems', next: 'ending_gems' },
        { label: 'Ask for enough golden fruit for your whole village', next: 'ending_fruit' },
        { label: 'Ask for the gift of a brave heart', next: 'ending_brave' },
      ],
    },
    ending_gems: {
      illustration: '💎🌈🏡',
      text: 'You fill your ship with glittering rainbow gems that shimmer with every colour. Sailing home, your ship lights up the whole sea. Back in port, you share the gems with every family in your village. The whole town celebrates with feasting, music, and dancing that lasts three whole days. The End!',
      choices: null,
      isEnding: true,
    },
    ending_fruit: {
      illustration: '🍎🌟🏘️',
      text: 'You fill your hold with golden fruit. Every person in your village who eats a piece feels healthy and full of energy for an entire year. The children plant the seeds and a golden orchard grows in the middle of town. Your village becomes the happiest place in all the land. The End!',
      choices: null,
      isEnding: true,
    },
    ending_brave: {
      illustration: '❤️‍🔥⛵',
      text: 'The guardian places a warm golden paw on your chest. "You already have a brave heart," it says softly. "I am simply reminding you of it." You sail home with no treasure in your hold — but with a confidence and courage that never leave you for the rest of your long and wonderful life. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const magicPotion = {
  id: 'magic-potion',
  title: 'The Magic Potion Forest',
  emoji: '🧪',
  color: '#22c55e',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '🌲🧪',
      text: 'Deep in the Magic Potion Forest, every flower and berry can be used to brew incredible potions. You are a young apprentice witch or wizard who has just found a crinkled old recipe book under a mossy log. The book falls open to two recipes. Which will you try to brew today?',
      choices: [
        { label: 'The Potion of Flying', next: 'flying_hunt' },
        { label: 'The Potion of Understanding Animals', next: 'animal_hunt' },
      ],
    },
    flying_hunt: {
      illustration: '🌸🦋',
      text: 'The recipe calls for three things: a silver moonflower, a feather from a bird who has never been frightened, and a drop of morning dew caught in your hand. You spot a moonflower near the edge of a deep pond. It is very close to the water.',
      choices: [
        { label: 'Wade carefully into the pond to reach it', next: 'pond_wade' },
        { label: 'Ask a nearby dragonfly for help', next: 'dragonfly' },
      ],
    },
    animal_hunt: {
      illustration: '🐿️🌿',
      text: 'The recipe needs a pinecone that has been sung to by a squirrel, three red berries from a laughing bush, and a single white pebble from a talking stream. A squirrel appears on a branch above you, watching you carefully.',
      choices: [
        { label: 'Offer the squirrel a nut to sing to a pinecone', next: 'squirrel_deal' },
        { label: 'Try to find a laughing bush first', next: 'laughing_bush' },
      ],
    },
    pond_wade: {
      illustration: '🌊🌸',
      text: 'You wade carefully into the cool pond. The water is up to your waist when you reach the moonflower. You pick it gently — and it glows softly silver in your hand! A friendly frog on a lily pad ribbits and says, "Well done! Here is a dew drop I have been saving." It hands you a perfect drop in a tiny leaf cup.',
      choices: [
        { label: 'Thank the frog and find a feather', next: 'feather_search' },
      ],
    },
    dragonfly: {
      illustration: '🪲✨',
      text: 'The dragonfly hovers in front of you and blinks its large shimmering eyes. "I can carry you across the water," it says, "if you promise to bring me a story from your adventure." You agree! It zips you over the pond and you pluck the moonflower easily. Then it offers you a single drop of dew from its wing.',
      choices: [
        { label: 'Thank the dragonfly and find a feather', next: 'feather_search' },
      ],
    },
    feather_search: {
      illustration: '🐦🪶',
      text: 'You need a feather from a bird who has never been frightened. In a sunny clearing you find a small robin perched happily on a log, singing without a care in the world. It has never been scared of anything! It cheerfully offers you one of its rust-coloured feathers.',
      choices: [
        { label: 'Brew the Potion of Flying!', next: 'ending_flying' },
      ],
    },
    squirrel_deal: {
      illustration: '🐿️🎵',
      text: 'You hold out a fat hazelnut. The squirrel scurries down instantly and chatters happily. It takes the nut, then picks up a pinecone and sings to it in a sweet, squeaky voice. The pinecone glows faintly green. It is done! Now you need the laughing bush.',
      choices: [
        { label: 'Search for the laughing bush', next: 'laughing_bush' },
      ],
    },
    laughing_bush: {
      illustration: '🌿😄',
      text: 'You find a bush covered in bright red berries that giggles whenever the wind blows. You tickle one of its branches and it bursts into laughter, showering three red berries right into your hand! Now you only need one white pebble from the talking stream.',
      choices: [
        { label: 'Follow the sound of the stream', next: 'ending_animal' },
      ],
    },
    ending_flying: {
      illustration: '🧪✨🕊️',
      text: 'You mix your three ingredients in a little pot over a small fire. The potion shimmers silver and smells like the sky after rain. You take a tiny sip — and lift right off the ground! You soar above the treetops, over the whole forest, laughing with delight. You land gently and share the story of what you saw from up high with everyone in the village. The End!',
      choices: null,
      isEnding: true,
    },
    ending_animal: {
      illustration: '🦊🐦🐿️💬',
      text: 'You find the talking stream, which gives you a white pebble gladly. You brew all three ingredients into a bright green potion that smells of pine and berries. One sip — and suddenly you can understand every animal! The squirrel tells you about secret treasure. The robin sings you news from faraway lands. You spend a wonderful day learning the secret language of the forest. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const cloudKingdom = {
  id: 'cloud-kingdom',
  title: 'The Lost Cloud Kingdom',
  emoji: '☁️',
  color: '#a78bfa',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '☁️🏰',
      text: 'High above the world, hidden in the fluffiest clouds, is the Cloud Kingdom — a magical place where it snows soft marshmallows and the rivers run with sparkling lemonade. One morning you wake up to find a tiny envelope on your pillow. Inside is a golden ticket and a note: "You are invited! Come find us." How do you get there?',
      choices: [
        { label: 'Climb the rainbow', next: 'rainbow_climb' },
        { label: 'Ask the wind for a ride', next: 'wind_ride' },
      ],
    },
    rainbow_climb: {
      illustration: '🌈🧗',
      text: 'You run to the end of the nearest rainbow and start climbing. It is slippery but your hands feel warm and tingly. Halfway up, you meet a small cloud sprite — a fluffy little creature with sparkling eyes. "I can show you the way!" it says. "But first, can you help me find my lost hat? The wind blew it away."',
      choices: [
        { label: 'Help the sprite find its hat', next: 'sprite_hat' },
        { label: 'Ask the sprite to guide you now and find the hat together', next: 'together_hat' },
      ],
    },
    wind_ride: {
      illustration: '💨🛝',
      text: 'You call out to the wind: "Please, Wind — will you carry me to the Cloud Kingdom?" A warm gust swirls around you and scoops you gently up into the sky! You ride the wind like a slide, spinning and swooping through the air, until the Cloud Kingdom appears below — a soft white city shimmering with colour.',
      choices: [
        { label: 'Land in the middle of the city square', next: 'city_square' },
        { label: 'Land gently at the edge of the kingdom', next: 'kingdom_edge' },
      ],
    },
    sprite_hat: {
      illustration: '🍃🎩',
      text: 'You search the clouds below the rainbow and find the sprite\'s hat caught on a tiny cloud-bush. The sprite squeaks with joy and pops it right back on its fluffy head. "You are so kind!" it cries, and zooms ahead to show you the secret path to the Cloud Kingdom\'s golden gate.',
      choices: [
        { label: 'Follow the sprite through the golden gate', next: 'kingdom_feast' },
      ],
    },
    together_hat: {
      illustration: '🤝☁️🎩',
      text: 'You and the sprite search together, laughing as you bounce across the rainbow. You find the hat caught on a passing cloud. The sprite is so delighted it holds your hand and flies you straight to the Cloud Kingdom\'s back garden, where the Cloud Queen herself is having afternoon tea.',
      choices: [
        { label: 'Join the Cloud Queen for tea', next: 'queen_tea' },
      ],
    },
    city_square: {
      illustration: '🎉☁️',
      text: 'You land right in the middle of a great celebration! Cloud people of every shape and colour are dancing and tossing marshmallow snowballs. A tall Cloud King sweeps off his hat and bows. "Our visitor has arrived! The kingdom has been waiting for someone with a brave and curious heart."',
      choices: [
        { label: 'Ask the king what the kingdom needs', next: 'ending_king_gift' },
        { label: 'Join the marshmallow snowball fight first!', next: 'ending_snowball' },
      ],
    },
    kingdom_edge: {
      illustration: '🌸☁️',
      text: 'You land softly at the edge of the kingdom among a garden of cloud-flowers that tinkle like tiny bells when the breeze touches them. A gentle old cloud-gardener looks up and smiles. "Ah, a visitor with a patient heart," she says. "Most arrive in a rush. Let me show you the secret wonders of our kingdom that only patient eyes can see."',
      choices: [
        { label: 'Follow the gardener through the hidden wonders', next: 'ending_wonders' },
      ],
    },
    kingdom_feast: {
      illustration: '🍰🧁☁️',
      text: 'Inside the golden gate is a long table piled high with cloud-cakes, lemonade rivers in tiny cups, and candied starlight. The cloud people cheer when you walk in. "Our guest of honour!" they sing. You spend the most wonderful day eating, laughing, and making new friends among the clouds.',
      choices: [
        { label: 'Ask if you can visit again someday', next: 'ending_friend' },
      ],
    },
    queen_tea: {
      illustration: '👸☁️🍵',
      text: 'The Cloud Queen pours you a cup of warm sky-tea that tastes like sunshine. "I am glad the sprite brought you here," she says with a warm smile. "Our kingdom grows brighter whenever someone kind visits." She gives you a small cloud-crystal as a gift.',
      choices: [
        { label: 'Accept the crystal and head home', next: 'ending_crystal' },
      ],
    },
    ending_king_gift: {
      illustration: '☁️🎁🌍',
      text: 'The Cloud King tells you the kingdom has a gift to share with the world below: a tiny bottle of "Wonder Rain" — rain that, when it falls, makes people notice the beautiful things they normally rush past. You carry it home carefully. That evening it rains gently, and for miles around people stop and look up and smile. The End!',
      choices: null,
      isEnding: true,
    },
    ending_snowball: {
      illustration: '☁️🎿😂',
      text: 'You join the marshmallow snowball fight and it is the most fun you have ever had! You laugh until your sides hurt. At the end of the day the Cloud King gives you a sack of marshmallows that never runs out. Whenever you are sad, you open the sack and share one with a friend — and both of you feel better at once. The End!',
      choices: null,
      isEnding: true,
    },
    ending_wonders: {
      illustration: '🌌☁️✨',
      text: 'The gardener shows you cloud-paintings that shift and change, a library of books written in raindrops, and a tiny theatre where the stars perform plays every evening. You return home with a heart full of the most extraordinary memories. For the rest of your life, you are never bored, because you always remember the wonders you saw. The End!',
      choices: null,
      isEnding: true,
    },
    ending_friend: {
      illustration: '💌☁️🌈',
      text: '"Of course!" say the cloud people together. They give you a golden whistle. "Blow this whenever you want to visit. We will send the wind to carry you up." You blow it on the way home — and sure enough, a friendly gust catches you and sets you down gently at your front door. You have made friends in the sky. The End!',
      choices: null,
      isEnding: true,
    },
    ending_crystal: {
      illustration: '💎☁️🌙',
      text: 'The cloud-crystal glows softly blue on your bedside table every night. On nights when you cannot sleep or feel a little worried, it makes the room smell of warm clouds and fresh sky. You always wake up feeling calm and happy. It is the best gift you have ever received. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const undergroundLibrary = {
  id: 'underground-library',
  title: 'The Underground Library',
  emoji: '📚',
  color: '#f59e0b',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '🌳📚',
      text: 'In the middle of the park, beneath the oldest oak tree, there is a tiny wooden door no bigger than your knee. Today the door is open. A warm golden light glows from inside, and the smell of old books and cinnamon drifts out. Do you squeeze through the door?',
      choices: [
        { label: 'Squeeze through the door immediately', next: 'inside' },
        { label: 'Knock politely first', next: 'knock' },
      ],
    },
    inside: {
      illustration: '📖🌟',
      text: 'You squeeze through and tumble gently into a vast underground library that goes on and on in every direction! Staircases spiral up to balconies lined with millions of glowing books. A little mouse in a tiny waistcoat trots up. "Welcome! I am the Head Librarian. Are you here to read, or to help us solve our mystery?"',
      choices: [
        { label: 'Ask about the mystery', next: 'mystery' },
        { label: 'Explore the library first', next: 'explore' },
      ],
    },
    knock: {
      illustration: '🚪✨',
      text: 'You knock three times. A small voice calls, "Come in!" You squeeze through and find a cosy underground library filled with glowing books. A mouse in a waistcoat bows. "How polite! Most visitors just barge in. I am the Head Librarian. Because you knocked so nicely, I will show you our most secret section."',
      choices: [
        { label: 'Follow the librarian to the secret section', next: 'secret_section' },
      ],
    },
    mystery: {
      illustration: '🔍📖',
      text: 'The Head Librarian explains in a hushed voice: "Our most important book has gone missing — the Book of Every Story Ever Told. Without it, stories all over the world will begin to fade." She hands you a small map of the library with three places circled in red.',
      choices: [
        { label: 'Search the Map Room', next: 'map_room' },
        { label: 'Search the Ancient Stories Wing', next: 'ancient_wing' },
      ],
    },
    explore: {
      illustration: '🏛️📚',
      text: 'You wander through towering shelves. You find a book that reads itself aloud, one that changes its pictures to match your mood, and one that smells exactly like your favourite meal. Then you turn a corner and find a door marked "MYSTERY — DO NOT ENTER ALONE."',
      choices: [
        { label: 'Enter the mystery door', next: 'mystery' },
        { label: 'Find the librarian to go together', next: 'mystery' },
      ],
    },
    secret_section: {
      illustration: '🌌📖✨',
      text: 'Behind a bookshelf that swings open is a small room where every book is filled with unwritten stories — stories that are waiting for someone to imagine them. The librarian smiles. "Pick one. Whatever you imagine on those pages will come true for one whole day."',
      choices: [
        { label: 'Imagine a day flying on the back of a friendly dragon', next: 'ending_dragon_flight' },
        { label: 'Imagine a day where you can talk to every animal', next: 'ending_animal_day' },
      ],
    },
    map_room: {
      illustration: '🗺️🔦',
      text: 'The Map Room is filled with maps of places that do not exist yet. On the floor you find a trail of tiny glowing footprints. They lead out the window and down a tiny tunnel. You follow them into a cosy side room — and there is the missing book, being read by a very small, very apologetic dragon who blushed bright pink.',
      choices: [
        { label: 'Forgive the dragon and bring the book back together', next: 'ending_forgiving' },
      ],
    },
    ancient_wing: {
      illustration: '📜🌙',
      text: 'The Ancient Stories Wing is quiet and smells of old parchment and starlight. The books here whisper to each other softly. An ancient tortoise looks up from a reading chair. "You are looking for the missing book?" it asks slowly. "I saw it walking away on its own. Books do that sometimes, when they feel forgotten. Show it that it is loved."',
      choices: [
        { label: 'Follow the tortoise\'s advice and call out to the book', next: 'ending_call_book' },
      ],
    },
    ending_call_book: {
      illustration: '📖💛',
      text: 'You stand in the middle of the library and call out warmly, "Book of Every Story — we miss you and we love you!" A rustling comes from behind a dusty shelf. The great golden book shuffles out on its own and tucks itself gently under your arm, warm as a sleeping cat. You carry it back to its place of honour. The librarian weeps with happiness. Stories are safe again. The End!',
      choices: null,
      isEnding: true,
    },
    ending_forgiving: {
      illustration: '🐉📖🤝',
      text: 'The pink dragon is so relieved you are not angry. "I only wanted to read the stories," it whispers. You walk back together and the dragon becomes the library\'s official story-reader, sitting in the great hall and reading aloud to everyone every afternoon. Stories are safe, and the library has a new friend. The End!',
      choices: null,
      isEnding: true,
    },
    ending_dragon_flight: {
      illustration: '🐉🌅',
      text: 'You write your story on the blank pages and close the book. The next morning you wake to find a friendly dragon sitting in the garden! You spend the whole day soaring above mountains and clouds, the wind in your hair and the whole wide world spread out below you. At sunset the dragon waves goodbye. You fall asleep with the biggest smile on your face. The End!',
      choices: null,
      isEnding: true,
    },
    ending_animal_day: {
      illustration: '🦊🐦💬',
      text: 'You write your wish in the blank book and the next day every animal you meet speaks to you clearly. Your dog tells you his three favourite things. A sparrow shares news from two towns away. A hedgehog teaches you a song. By bedtime you know more about the world than you ever did before. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const seaKingdom = {
  id: 'sea-kingdom',
  title: 'The Under-the-Sea Kingdom',
  emoji: '🧜',
  color: '#3b82f6',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '🌊🐚',
      text: 'While swimming at the beach, you find a glowing seashell washed up on the sand. When you hold it to your ear, a tiny voice whispers, "The Sea Kingdom needs your help! Blow into the shell to visit us." Do you blow into the shell right away, or look for a grown-up first?',
      choices: [
        { label: 'Blow into the shell', next: 'blow_shell' },
        { label: 'Wave to a grown-up nearby first', next: 'grownup_first' },
      ],
    },
    blow_shell: {
      illustration: '✨🫧',
      text: 'You take a deep breath and blow into the shell. A swirl of gentle bubbles wraps around you, and suddenly you can breathe underwater! A friendly sea turtle named Coral paddles up. "Right on time," she says. "Climb on — the Sea Queen is waiting."',
      choices: [
        { label: 'Climb onto Coral\'s shell', next: 'meet_queen' },
      ],
    },
    grownup_first: {
      illustration: '👋🏖️',
      text: 'You wave over your grown-up and show them the shell. They smile and say, "Let\'s see what happens together." You both blow into the shell, and a swirl of bubbles wraps around you both, letting you breathe underwater side by side. A sea turtle named Coral paddles up to greet you.',
      choices: [
        { label: 'Follow Coral together', next: 'meet_queen' },
      ],
    },
    meet_queen: {
      illustration: '👑🐠',
      text: 'Coral guides you down, down, down to a shimmering coral palace. The Sea Queen, wrapped in a cloak of starfish, greets you warmly. "Our Kingdom\'s Singing Pearl has gone quiet," she says, "and without its song, the coral reef is losing its colour." She shows you a map with two paths.',
      choices: [
        { label: 'Search the Kelp Forest', next: 'kelp_forest' },
        { label: 'Search the Sunken Ship', next: 'sunken_ship' },
      ],
    },
    kelp_forest: {
      illustration: '🌿🐡',
      text: 'You swim into a tall, swaying kelp forest. A shy pufferfish peeks out from behind a frond. "I saw something shiny drop here," it says nervously, "but a curious octopus scooped it up before I could look closer." It points further into the forest.',
      choices: [
        { label: 'Follow the pufferfish deeper in', next: 'find_octopus' },
      ],
    },
    sunken_ship: {
      illustration: '🚢🦑',
      text: 'You explore an old, gentle sunken ship covered in soft green moss. Inside a barnacle-crusted chest, you find a friendly octopus curled around something round and glowing. "Oh! Is this yours?" the octopus asks, uncurling to show you the Singing Pearl. "I just thought it was so pretty."',
      choices: [
        { label: 'Ask the octopus kindly for the pearl', next: 'ending_kind_ask' },
      ],
    },
    find_octopus: {
      illustration: '🐙💫',
      text: 'You find the same friendly octopus in a small underwater cave, gently juggling the glowing Singing Pearl between its eight arms, delighted with its new shiny toy.',
      choices: [
        { label: 'Offer to trade a pretty shell for the pearl', next: 'ending_trade' },
        { label: 'Ask kindly for the pearl back', next: 'ending_kind_ask' },
      ],
    },
    ending_kind_ask: {
      illustration: '🐙💛🎵',
      text: '"Of course!" says the octopus, handing it over gently. "I did not know it belonged to anyone." You carry the Singing Pearl back to the palace, and the moment it is placed in its coral cradle, a beautiful melody fills the water and every reef bursts back into brilliant colour. The Sea Queen thanks you with a necklace of tiny glowing shells. The End!',
      choices: null,
      isEnding: true,
    },
    ending_trade: {
      illustration: '🐚🐙🎵',
      text: 'You offer the octopus a swirled pink shell from your pocket, and it happily swaps its new toy for the even prettier one. You return the Singing Pearl to its coral cradle, and its melody fills the kingdom once more, painting the reef in every colour of the rainbow. The octopus visits you every day after that, showing off shiny new treasures. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const spaceRace = {
  id: 'space-race',
  title: 'The Great Space Race',
  emoji: '🚀',
  color: '#8b5cf6',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '🚀🌌',
      text: 'You have been chosen as the youngest astronaut ever to join the Great Space Race — a friendly competition to see who can visit the most planets and make it home first! Your rocket has two buttons glowing on the dashboard.',
      choices: [
        { label: 'Press the "Fast Route" button', next: 'fast_route' },
        { label: 'Press the "Scenic Route" button', next: 'scenic_route' },
      ],
    },
    fast_route: {
      illustration: '💨🪐',
      text: 'Your rocket zooms through a shortcut past shimmering rings of ice and rock. You are making great time! Suddenly your dashboard beeps — a small asteroid is drifting slowly across your path.',
      choices: [
        { label: 'Steer gently around it', next: 'steer_around' },
        { label: 'Radio for help from Mission Control', next: 'radio_help' },
      ],
    },
    scenic_route: {
      illustration: '🌠🛰️',
      text: 'You glide past a dazzling field of slow-drifting stardust that sparkles like glitter against your windows. Floating nearby is another racer\'s rocket — stuck, with its little engine sputtering.',
      choices: [
        { label: 'Stop to help the stuck racer', next: 'help_racer' },
        { label: 'Wave hello and continue on your way', next: 'wave_continue' },
      ],
    },
    steer_around: {
      illustration: '🎮🚀',
      text: 'You carefully tilt the controls and glide smoothly around the asteroid, not a single scratch on your rocket! Ahead, a ringed planet glows in soft purple and gold — your first stop.',
      choices: [
        { label: 'Land on the ringed planet', next: 'ringed_planet' },
      ],
    },
    radio_help: {
      illustration: '📡👩‍🚀',
      text: '"Nicely spotted!" says Mission Control cheerfully. They guide you through a perfectly safe path around the asteroid, step by step. You thank them and continue toward a glowing, ringed planet in the distance.',
      choices: [
        { label: 'Land on the ringed planet', next: 'ringed_planet' },
      ],
    },
    help_racer: {
      illustration: '🤝🚀',
      text: 'You dock alongside the stuck rocket and share a bit of your own fuel through a little connecting tube. "Thank you!" the other racer beams. "Let\'s finish this race together instead of against each other." You both zoom off side by side.',
      choices: [
        { label: 'Race together to the finish', next: 'ending_teamwork' },
      ],
    },
    wave_continue: {
      illustration: '👋🚀',
      text: 'You wave and continue on your journey, watching the stuck racer grow smaller behind you. A moment later, your conscience tugs at you. You loop back around to check on them after all, and offer a hand.',
      choices: [
        { label: 'Help them and finish together', next: 'ending_teamwork' },
      ],
    },
    ringed_planet: {
      illustration: '🪐🎉',
      text: 'You touch down gently on the ringed planet, where floating jellyfish-like creatures made of light drift through a purple sky. They chime a welcoming song and gift you a glowing ring to wear on your antenna.',
      choices: [
        { label: 'Head home to complete the race', next: 'ending_solo_finish' },
      ],
    },
    ending_teamwork: {
      illustration: '🏁🤝✨',
      text: 'You and your new friend cross the finish line at exactly the same moment, engines glowing side by side. Mission Control declares it the first-ever tie in Space Race history — and everyone agrees it is the best ending of all. You spend the victory party swapping stories about the stars you saw along the way. The End!',
      choices: null,
      isEnding: true,
    },
    ending_solo_finish: {
      illustration: '🏆🚀🌍',
      text: 'You guide your rocket back through the stars and land gently on Earth, your glowing ring still sparkling on the antenna. You are welcomed home with cheers and confetti. That night, you fall asleep looking up at the very stars you just visited, already dreaming of your next adventure. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const timeTravelersAttic = {
  id: 'time-travelers-attic',
  title: "The Time Traveler's Attic",
  emoji: '⏳',
  color: '#f59e0b',
  startNode: 'start',
  nodes: {
    start: {
      illustration: '🏚️⏳',
      text: 'While visiting your grandmother\'s house, you find a dusty old clock in the attic with hands that spin backward. When you wind it, the whole room shimmers like heat over summer pavement. Do you wind it once, or twice?',
      choices: [
        { label: 'Wind it once', next: 'wind_once' },
        { label: 'Wind it twice', next: 'wind_twice' },
      ],
    },
    wind_once: {
      illustration: '🦕🌿',
      text: 'The room shimmers and fades — and you are standing in a warm, misty jungle full of enormous ferns. A gentle, plant-eating dinosaur as tall as a house munches leaves nearby, completely unbothered by your visit.',
      choices: [
        { label: 'Offer the dinosaur a leaf from a nearby branch', next: 'dino_friend' },
        { label: 'Quietly watch it from a safe distance', next: 'dino_watch' },
      ],
    },
    wind_twice: {
      illustration: '🏰⚔️',
      text: 'The room shimmers and fades — and you find yourself just outside a small stone castle, where a young royal messenger is struggling to carry an enormous stack of scrolls across the courtyard.',
      choices: [
        { label: 'Help carry the scrolls', next: 'help_messenger' },
        { label: 'Ask what the scrolls say', next: 'ask_scrolls' },
      ],
    },
    dino_friend: {
      illustration: '🦕🍃💚',
      text: 'You hold out a large leaf, and the gentle giant lowers its long neck and takes it softly from your hand. It nudges you affectionately, almost like a very large, very old dog. You spend a peaceful afternoon walking alongside it through the misty ferns.',
      choices: [
        { label: 'Wind the clock again to head home', next: 'ending_dino' },
      ],
    },
    dino_watch: {
      illustration: '👀🦕',
      text: 'You sit quietly on a mossy rock and watch the dinosaur graze. A little dragonfly the size of a bird lands on your shoulder for a moment before zipping off. You feel like the luckiest person who has ever lived, just sitting here, watching history happen.',
      choices: [
        { label: 'Wind the clock again to head home', next: 'ending_dino' },
      ],
    },
    help_messenger: {
      illustration: '📜🤝',
      text: 'You catch a few scrolls just before they tumble to the ground. "Thank you kindly, traveler!" the messenger says with a relieved smile. "These are invitations to the harvest festival tonight — will you join us? Everyone is welcome."',
      choices: [
        { label: 'Join the harvest festival', next: 'ending_festival' },
      ],
    },
    ask_scrolls: {
      illustration: '📜❓',
      text: '"Invitations to tonight\'s harvest festival!" the messenger explains, setting down the stack for a moment to catch their breath. "There will be music, dancing, and the biggest pie you have ever seen. Would you like to come?"',
      choices: [
        { label: 'Say yes and join the festival', next: 'ending_festival' },
      ],
    },
    ending_dino: {
      illustration: '⏳✨🏠',
      text: 'You wind the old clock once more, and the misty jungle shimmers away into your grandmother\'s dusty attic. You climb downstairs just as she calls you for dinner, buzzing with a story almost nobody would believe — but she just smiles knowingly, like she has a few old-clock stories of her own. The End!',
      choices: null,
      isEnding: true,
    },
    ending_festival: {
      illustration: '🎉🥧🏰',
      text: 'The harvest festival is full of lantern light, cheerful fiddle music, and the biggest pumpkin pie you have ever seen. You dance in the courtyard until the stars come out, and a kind old woman at the festival winks at you in a way that feels strangely familiar. When you wind the clock home, you can\'t help but wonder if she was your grandmother, long, long ago. The End!',
      choices: null,
      isEnding: true,
    },
  },
}

const ADVENTURES = {
  'dragon-mountain':        dragonMountain,
  'pirates-sea':            piratesSea,
  'magic-potion':           magicPotion,
  'cloud-kingdom':          cloudKingdom,
  'underground-library':    undergroundLibrary,
  'sea-kingdom':            seaKingdom,
  'space-race':             spaceRace,
  'time-travelers-attic':   timeTravelersAttic,
}

export default ADVENTURES
