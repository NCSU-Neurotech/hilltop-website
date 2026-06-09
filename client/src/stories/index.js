/**
 * Classic childhood stories for read-aloud sessions.
 * Each story: { id, title, emoji, color, pages: [{ illustration, text }] }
 * Text is TTS-ready — short sentences, clear punctuation.
 */

const cinderella = {
  id: 'cinderella', title: 'Cinderella', emoji: '👸', color: '#ec4899',
  pages: [
    { illustration: '👧🏠', text: 'Once upon a time, there was a kind and gentle girl named Cinderella. She lived with her stepmother and two stepsisters, who were very mean to her. They made her cook, clean, and do all the hard work every single day.' },
    { illustration: '📜🎉', text: 'One day, a royal messenger came to the village with exciting news. The prince was holding a grand ball at the palace! Every lady in the kingdom was invited to come and dance.' },
    { illustration: '👗✨', text: 'Cinderella\'s stepsisters rushed to get ready. They tried on gown after gown and put on sparkling jewels. But they told Cinderella, "You cannot come! You must stay home and clean the house."' },
    { illustration: '🔥😢', text: 'Cinderella sat alone by the fireplace and wept. She wished with all her heart that she could go to the ball. Suddenly, the room filled with a warm, golden light.' },
    { illustration: '🧚‍♀️✨', text: 'Her fairy godmother appeared, shimmering and kind. "Do not cry, my dear," she said with a smile. She waved her magic wand and a pumpkin by the garden gate began to glow.' },
    { illustration: '🎃🐭🐎', text: 'The pumpkin transformed into a beautiful golden carriage! Six mice became six white horses. Then Cinderella\'s old dress turned into a dazzling gown, with the most delicate glass slippers you ever saw.' },
    { illustration: '⏰🌙', text: '"Go to the ball!" said the fairy godmother. "But you must return home before midnight. When the clock strikes twelve, the magic will fade away." Cinderella promised and stepped into the golden carriage.' },
    { illustration: '🏰💃', text: 'Cinderella arrived at the palace and everyone stopped to stare. The prince came forward and bowed low. "May I have this dance?" he asked. Cinderella took his hand, and they danced together all evening long.' },
    { illustration: '🔔😱', text: 'Then the clock began to chime. Bong! Bong! Bong! It was midnight! Cinderella remembered her godmother\'s warning. She pulled away and ran as fast as she could down the palace steps.' },
    { illustration: '👠🤴', text: 'In her rush, one glass slipper slipped off her foot. The prince ran after her, but she had vanished into the night. He picked up the tiny glass slipper and held it carefully.' },
    { illustration: '🏘️👠', text: '"I will find the girl whose foot fits this slipper," declared the prince. He traveled to every home in the kingdom. Many ladies tried, but the slipper fit no one.' },
    { illustration: '🏠💫', text: 'At last the prince came to Cinderella\'s house. The stepsisters squeezed and pushed, but their feet were far too big. Then Cinderella stepped forward quietly, and the slipper slid perfectly onto her foot.' },
    { illustration: '🧚‍♀️👗', text: 'The prince\'s eyes lit up with joy. "It is you!" he cried. Her fairy godmother appeared and turned her dress back into her beautiful ball gown, more lovely than ever before.' },
    { illustration: '💒🎊', text: 'The prince asked Cinderella to marry him, and she said yes with all her heart. They had a wonderful wedding, and Cinderella was kind even to her stepsisters. She and the prince lived happily ever after. The End.' },
  ],
}

const threeLittlePigs = {
  id: 'three-little-pigs', title: 'The Three Little Pigs', emoji: '🐷', color: '#f97316',
  pages: [
    { illustration: '🐷🐷🐷', text: 'Once upon a time, three little pigs grew up and decided to build their own homes. Their mother waved goodbye and said, "Work hard and build well! And watch out for the big bad wolf!"' },
    { illustration: '🌾🏠', text: 'The first little pig was in a great hurry. He gathered bundles of straw and built his house very quickly. By lunchtime he was done, and he skipped off happily to play.' },
    { illustration: '🪵🏠', text: 'The second little pig worked a little longer. He collected sticks and built a tidy stick house. When he finished, he too went off to play, feeling very pleased with himself.' },
    { illustration: '🧱🏠', text: 'The third little pig was very careful and patient. He bought bricks and worked all day long, laying each one with great care, until his strong and solid brick house was finished.' },
    { illustration: '🐺💨', text: 'One day, a big bad wolf came prowling through the forest. He was very hungry. He spotted the straw house and knocked on the door. "Little pig, little pig, let me come in!" he called.' },
    { illustration: '🌬️🌾💥', text: '"Not by the hair of my chinny chin chin!" squealed the first little pig. So the wolf huffed and he puffed and he BLEW the straw house right down! The frightened pig ran as fast as he could to his brother\'s stick house.' },
    { illustration: '🐺🌬️🪵', text: 'The wolf followed and knocked on the stick house. Both pigs cried, "Not by the hair of our chinny chin chins!" The wolf huffed and puffed and blew the stick house down too! Both pigs ran to their brother\'s brick house.' },
    { illustration: '🏃🏃🧱🏠', text: 'All three little pigs squeezed inside the brick house and locked the door tight. The wolf pounded and growled. "Little pigs, little pigs, let me come in!"' },
    { illustration: '💪🧱', text: '"Not by the hair of our chinny chin chins!" they all shouted. The wolf huffed and puffed with all his might — but the brick house would not fall. The bricks held firm.' },
    { illustration: '🏠🔥🐺😱', text: 'The wolf had one more idea. He climbed up to the roof to slide down the chimney. But the three little pigs had put a pot of boiling soup in the fireplace. SPLASH! The wolf landed right in the hot soup and ran away, never to return.' },
    { illustration: '🐷🎉🏡', text: 'The three little pigs celebrated and danced together. From that day on, they all lived happily and safely in the strong brick house. They learned that it always pays to work hard and build things well. The End.' },
  ],
}

const goldilocks = {
  id: 'goldilocks', title: 'Goldilocks and the Three Bears', emoji: '🐻', color: '#f59e0b',
  pages: [
    { illustration: '👧🌲', text: 'Once upon a time, there was a curious little girl with beautiful curly golden hair. Everyone called her Goldilocks. One sunny morning, she went for a walk in the forest all by herself.' },
    { illustration: '🏡🐻🐻🐻', text: 'Deep in the woods she found a lovely little cottage. It belonged to a family of three bears: a great big Papa Bear, a medium-sized Mama Bear, and a tiny Baby Bear.' },
    { illustration: '🥣🥣🥣', text: 'The bears had gone for a walk while their porridge cooled on the table. Goldilocks knocked on the door. No one answered, so she pushed it open and walked right in.' },
    { illustration: '🥣🔥❄️✅', text: 'She tasted Papa Bear\'s porridge. "Too hot!" She tasted Mama Bear\'s. "Too cold!" She tasted Baby Bear\'s. "Just right!" And she ate every last drop.' },
    { illustration: '🪑🪑🪑💥', text: 'Next she found three chairs in the sitting room. Papa Bear\'s was too hard. Mama Bear\'s was too soft. Baby Bear\'s was just right! She sat down — but she was too heavy. Crack! The little chair broke to pieces.' },
    { illustration: '🛏️😴', text: 'Feeling sleepy, Goldilocks went upstairs and found three beds. Papa Bear\'s was too hard. Mama Bear\'s was too soft. Baby Bear\'s was just right! She pulled up the covers and fell fast asleep.' },
    { illustration: '🐻🐻🐻🏡', text: 'Soon the three bears came home. Papa Bear looked at his porridge bowl and growled in his great big voice, "SOMEONE HAS BEEN EATING MY PORRIDGE!"' },
    { illustration: '😠😠😢', text: 'Mama Bear said in her middle voice, "Someone has been eating MY porridge!" Baby Bear cried in his tiny voice, "Someone has been eating my porridge — and they have eaten it ALL UP!"' },
    { illustration: '🪑🔍😡', text: '"Someone has been sitting in my chair!" growled Papa Bear. "Someone has been sitting in my chair!" said Mama Bear. "Someone has been sitting in my chair and BROKEN IT!" wept Baby Bear.' },
    { illustration: '🛏️😮', text: '"Someone has been sleeping in my bed!" growled Papa Bear. "Someone has been sleeping in MY bed!" said Mama Bear. "Someone is sleeping in my bed RIGHT NOW!" squeaked Baby Bear.' },
    { illustration: '👧😱🏃', text: 'Goldilocks woke with a start. Three bears were staring right at her! She screamed, leapt out of bed, ran downstairs, and jumped right out the window.' },
    { illustration: '🌲🏃💨🏠', text: 'Goldilocks ran through the forest as fast as she could, all the way home. She never went into anyone else\'s house without being invited ever again. And the three bears had a peaceful evening fixing Baby Bear\'s chair. The End.' },
  ],
}

const littleRedRidingHood = {
  id: 'little-red-riding-hood', title: 'Little Red Riding Hood', emoji: '🧺', color: '#ef4444',
  pages: [
    { illustration: '👧🧣', text: 'Once there was a sweet little girl who always wore a bright red cloak with a hood. Everyone in the village called her Little Red Riding Hood. She was kind, cheerful, and dearly loved by all.' },
    { illustration: '🧺🍰', text: 'One morning, her mother called her. "Grandma is feeling poorly today. Please take her this basket of fresh cakes and butter." She tied a ribbon on the basket and handed it to her daughter.' },
    { illustration: '⚠️🌲', text: '"Walk straight through the forest and stay on the path," said her mother. "Do not talk to strangers." Little Red Riding Hood promised and set off skipping through the woods.' },
    { illustration: '🐺😈', text: 'The forest was sunny and pretty, and birds sang in every tree. But before long, a sly wolf appeared on the path. He smiled his biggest, sharpest smile. "Good morning, little girl! Where are you going today?"' },
    { illustration: '🏡🌳', text: 'Little Red Riding Hood forgot her mother\'s warning. "To my grandmother\'s cottage, past the big oak tree," she said. The wolf had a wicked idea. He said goodbye and ran ahead through the forest.' },
    { illustration: '🚪🐺😱', text: 'The wolf arrived at grandmother\'s cottage first. When Grandma opened the door, the wolf leapt inside and locked her in the wardrobe. Then he put on her nightcap, climbed into her bed, and waited.' },
    { illustration: '🚪🧺', text: 'Little Red Riding Hood arrived and knocked gently. A strange, scratchy voice called, "Come in, my dear!" She stepped inside. Something felt odd, but she walked to the bedroom.' },
    { illustration: '👁️👂🦷', text: '"Grandma, what big ears you have!" "All the better to hear you with, my dear." "What big eyes you have!" "All the better to see you with." "What very big TEETH you have!" "ALL THE BETTER TO EAT YOU WITH!"' },
    { illustration: '😱🔊🪓', text: 'The wolf leapt from the bed with a roar! Little Red Riding Hood screamed as loud as she could. A woodcutter nearby heard her cries, burst through the door, and chased the wolf far away into the forest.' },
    { illustration: '🚪👵💕', text: 'The woodcutter freed grandmother from the wardrobe. She was frightened but perfectly safe. Little Red Riding Hood hugged her grandmother tightly and would not let go for a very long time.' },
    { illustration: '🏡🎂🍵', text: 'Together they sat and enjoyed all the cakes from the basket. Little Red Riding Hood never spoke to strangers in the forest again, and she always, always stayed on the path. The End.' },
  ],
}

const jackBeanstalk = {
  id: 'jack-beanstalk', title: 'Jack and the Beanstalk', emoji: '🌱', color: '#22c55e',
  pages: [
    { illustration: '👦🐄🏚️', text: 'Once upon a time, a boy named Jack lived with his mother in a tiny cottage. They were very poor, and their only treasure was their old cow, Milky White.' },
    { illustration: '🐄😔', text: 'One day their cow stopped giving milk. "We have no money left," said his mother sadly. "You must take Milky White to market and sell her. It is the only way."' },
    { illustration: '🌱✨🤝', text: 'On the road to market, Jack met a peculiar old man. "I\'ll trade you these magic beans for your cow!" he said, holding out a handful of colourful beans. Jack made the trade and went home.' },
    { illustration: '😠🌙', text: 'When his mother saw what Jack had done, she was furious. "Magic beans?! You foolish boy!" She threw the beans out the window and sent Jack straight to bed without any supper.' },
    { illustration: '🌱🌤️🌿', text: 'The very next morning, Jack looked out his window and gasped. An enormous beanstalk had sprouted overnight! It twisted up and up and up, higher than the highest cloud and out of sight.' },
    { illustration: '🧗☁️🏰', text: 'Jack climbed the beanstalk, up through the clouds, until he reached a magical kingdom in the sky. There stood a colossal castle. He walked up to the great door and knocked.' },
    { illustration: '👩🏰😰', text: 'A giant woman answered. "You must hide!" she whispered urgently. "My husband is a terrible giant who eats boys for breakfast. Quick — get in the cupboard!" She hid Jack just as heavy footsteps shook the whole castle.' },
    { illustration: '👹💨🦴', text: 'THUMP THUMP THUMP! The giant came home and sniffed the air. "FEE FI FO FUM! I smell the blood of an Englishman!" His wife brought him his dinner, and he grumbled but sat down to eat his enormous meal.' },
    { illustration: '🪙🎵😴', text: 'After dinner the giant called for his magic harp that played music all by itself. The harp played so sweetly that the giant\'s eyes grew heavy and he fell fast asleep, snoring like thunder.' },
    { illustration: '🏃🎵', text: 'Jack crept from the cupboard and grabbed the magic harp. But the harp cried out, "Master! Master!" The giant woke with a roar and chased Jack out of the castle.' },
    { illustration: '🌿🧗💨', text: 'Jack slid down the beanstalk as fast as he possibly could. "Mother! Bring me the axe!" he shouted. He could feel the whole beanstalk shaking as the giant thundered down after him.' },
    { illustration: '🪓🌿💥', text: 'The moment Jack touched the ground, he grabbed the axe and chopped at the beanstalk with all his might. CRACK! CRACK! The beanstalk toppled over and the giant crashed to the earth with a tremendous BOOM.' },
    { illustration: '🎵🏡', text: 'The magic harp sang beautiful songs for Jack and his mother every single evening. They also found a bag of golden coins among the beanstalk\'s roots.' },
    { illustration: '🏡💛🎶', text: 'Jack and his mother were never poor again. They lived comfortably and happily together for all the rest of their days. The End.' },
  ],
}

const hanselGretel = {
  id: 'hansel-gretel', title: 'Hansel and Gretel', emoji: '🍬', color: '#a855f7',
  pages: [
    { illustration: '👦👧🌲', text: 'Once upon a time, a woodcutter lived at the edge of a dark forest with his son Hansel and his daughter Gretel. Times were very hard, and the family often had little food to eat.' },
    { illustration: '🌙👂😨', text: 'One night, Hansel lay awake and heard his stepmother whisper, "We must take the children deep into the forest and leave them there. There is not enough food for all of us." Hansel crept quietly outside.' },
    { illustration: '🌕🪨✨', text: 'In the moonlight, Hansel filled his pockets with small white pebbles that gleamed like silver. He had a plan to find their way home. The next morning, the family walked deep into the forest.' },
    { illustration: '🌲🔥', text: 'As they walked, Hansel dropped white pebbles one by one along the path. The stepmother lit a fire and said, "Wait here — we will come back for you." Then she and their father slipped away into the trees.' },
    { illustration: '🌕🪨🏡', text: 'Night fell and no one came back. Gretel cried, but Hansel comforted her. When the full moon rose, the white pebbles glimmered on the path and led them all the way safely home.' },
    { illustration: '😠🌲🍞', text: 'Their stepmother was furious. A few days later she took them even deeper into the forest. This time Hansel had only bread. He dropped breadcrumbs along the path — but birds ate every single crumb.' },
    { illustration: '🌲😢😮', text: 'Hansel and Gretel were lost. After wandering for two whole days, they spotted something astonishing through the trees: a little cottage built of gingerbread, candy, and icing sugar!' },
    { illustration: '😋🍬🧙‍♀️', text: 'They ran up and began eating the walls hungrily. An old woman appeared and invited them inside for a warm meal. But the old woman was a wicked witch who wanted to eat children.' },
    { illustration: '🔒🧙‍♀️🦴', text: 'She locked Hansel in a cage and made Gretel do all the cooking. Each day the witch grabbed Hansel\'s finger to feel if he was plump enough to eat. But clever Hansel held out a chicken bone instead.' },
    { illustration: '🔥🧙‍♀️😤', text: 'One day the impatient witch asked Gretel to lean into the oven to test if it was hot. Gretel pretended not to understand. "Show me how!" she said. When the witch leaned in, Gretel gave her a push and shut the door.' },
    { illustration: '🔓💎', text: 'Gretel freed Hansel from the cage and they searched the cottage, finding chests full of pearls and precious jewels. They filled their pockets and ran through the forest.' },
    { illustration: '👨‍👧‍👦💎🎉', text: 'Their loving father wept with joy when he saw them. Their cruel stepmother had gone away forever. With their treasure, the family lived happily together from that day on. The End.' },
  ],
}

const snowWhite = {
  id: 'snow-white', title: 'Snow White', emoji: '🍎', color: '#3b82f6',
  pages: [
    { illustration: '👸❄️🌹', text: 'Long ago, a queen wished for a daughter with skin as white as snow, lips as red as a rose, and hair as black as ebony. Her wish came true, and the baby was named Snow White. Sadly, the queen did not live long after.' },
    { illustration: '🪞👸💬', text: 'The king married again. The new queen was beautiful but terribly vain. She owned a magic mirror and every morning she asked it, "Mirror, mirror on the wall — who is the fairest of them all?" Every day it replied, "You, my queen."' },
    { illustration: '👸🌷', text: 'Snow White grew up kind and gentle and more beautiful every year. One morning the mirror gave a different answer. "Snow White is the fairest of them all." The wicked queen\'s face twisted with jealousy and rage.' },
    { illustration: '🗡️🌲', text: 'The queen ordered a huntsman to take Snow White into the forest and kill her. But when the moment came, the huntsman could not do it. "Run away, child, and never return," he whispered. Snow White fled deep into the woods.' },
    { illustration: '🏡🌿', text: 'Snow White ran until she found a tiny cottage in the woods. She knocked — no answer. Inside she found seven little plates, seven little chairs, and seven little beds. She was so tired she lay down and fell fast asleep.' },
    { illustration: '⛏️🎵', text: 'When she woke, seven little dwarfs were staring at her. They had just come home from the diamond mines. Their names were Grumpy, Sleepy, Bashful, Doc, Happy, Sneezy, and Dopey.' },
    { illustration: '🤝🏡', text: 'The kind dwarfs let Snow White stay with them. Every morning before leaving they warned her, "Beware the wicked queen! Do not let strangers inside." Snow White promised she would be careful.' },
    { illustration: '🪞😡👵', text: 'The magic mirror told the queen where Snow White was hiding. Furious, the queen disguised herself as an old peddler woman and made a poisoned apple. She set off for the cottage.' },
    { illustration: '🍎🤝', text: '"Try this beautiful apple, my dear," coaxed the old woman sweetly. Snow White knew she should not take it. But the apple looked so fresh and rosy. She took one bite and fell down as if she were dead.' },
    { illustration: '🌙💐⚰️', text: 'When the dwarfs came home and found Snow White, they could not wake her. Heartbroken, they made her a glass coffin and placed it in the forest, where flowers bloomed all year round.' },
    { illustration: '🤴🌿', text: 'A prince from a faraway land was riding through the forest when he saw Snow White lying peacefully in her glass coffin. He asked the dwarfs if he could stay nearby, and every day he came to visit.' },
    { illustration: '💋✨', text: 'The prince leaned down and gently kissed her. At that very moment the piece of poisoned apple fell from Snow White\'s lips. Her eyes fluttered open, and she looked up at the smiling prince for the very first time.' },
    { illustration: '🎉⛏️💍', text: 'Snow White and the prince fell in love at once. They invited all seven dwarfs to their wedding, and the dwarfs celebrated more joyfully than they ever had in their whole little lives.' },
    { illustration: '🪞💔🎊', text: 'The wicked queen\'s mirror shattered on its own. Snow White and the prince ruled with kindness and happiness forever after, and the seven dwarfs visited them every single year. The End.' },
  ],
}

const uglyDuckling = {
  id: 'ugly-duckling', title: 'The Ugly Duckling', emoji: '🦢', color: '#06b6d4',
  pages: [
    { illustration: '🦆🥚🌿', text: 'On a warm summer day, a mother duck sat on her nest by a quiet pond. One by one, her eggs cracked open and out tumbled fluffy yellow ducklings. But the last egg was very large and slow to hatch.' },
    { illustration: '🐣😮', text: 'At last it cracked open. Out tumbled a large, gray, awkward-looking bird. He was not yellow and fluffy like his brothers and sisters. "What an odd creature," said the mother duck, quite puzzled.' },
    { illustration: '😢🦆', text: 'The other ducklings teased him without mercy. The farm animals pecked at him and laughed. Even his brothers and sisters said, "You are far too ugly to play with us." The poor duckling was terribly lonely.' },
    { illustration: '🌲🌊😔', text: 'Unable to bear it any longer, the duckling ran away from the farm. He spent the long summer alone by a cold, quiet marsh, trying again and again to make friends — but everyone turned him away.' },
    { illustration: '🍂❄️', text: 'Autumn came and the leaves turned to gold. Then winter arrived. Ice crept across the pond. The duckling struggled alone in the freezing cold, shivering and very hungry.' },
    { illustration: '🏡🔥', text: 'A kind old farmer found the duckling nearly frozen in the ice and carried him home to warm up. But when the farmer\'s children tried to play with him, the frightened duckling flapped and splashed water everywhere.' },
    { illustration: '❄️🌿😔', text: 'The farmer\'s wife chased him back outside. The ugly duckling huddled in the reeds by a frozen pond and waited alone through the long, cold winter, hoping for spring to come.' },
    { illustration: '🌸☀️', text: 'At last the warm spring sun returned and the ice melted. The duckling stretched his wings — and was astonished at how large and powerful they had grown over the winter months.' },
    { illustration: '🕊️☁️', text: 'He spread his wings and flew up into the bright sky, soaring higher than he had ever imagined. He glided down toward a wide, gleaming lake where beautiful white birds were swimming gracefully.' },
    { illustration: '🦢💧🪞', text: 'He was afraid they would chase him away too. He bowed his head sadly and looked into the still water — and gasped. Gazing back at him was not an ugly gray duckling at all, but a magnificent white swan.' },
    { illustration: '🦢🦢🦢', text: 'The other swans swam over joyfully and welcomed him, bowing their long, graceful necks. Children nearby pointed and called out, "Look at that new swan — the most beautiful one of all!"' },
    { illustration: '🌅🦢💛', text: 'The swan remembered all his lonely, painful days. He was grateful beyond words for his wonderful new life. He had learned that being kind matters more than how you look, and that everyone belongs somewhere. The End.' },
  ],
}

const sleepingBeauty = {
  id: 'sleeping-beauty', title: 'Sleeping Beauty', emoji: '🌹', color: '#8b5cf6',
  pages: [
    { illustration: '👑🍼🎉', text: 'Long ago, a king and queen had waited many years for a child. At last a beautiful baby girl was born. They named her Aurora and threw the grandest celebration the kingdom had ever seen.' },
    { illustration: '🧚‍♀️✨', text: 'Seven fairies were invited as godmothers. One by one they stepped forward with gifts for baby Aurora. "She will be beautiful," said the first fairy. "She will be kind," said the second. "She will have the voice of an angel," said the third.' },
    { illustration: '⚡👵😡', text: 'Before the seventh fairy could speak, a dark cloud filled the room. An old fairy who had not been invited swept in, shaking with rage. "On her sixteenth birthday," she hissed, "the princess will prick her finger on a spindle — and die!"' },
    { illustration: '🧚‍♀️💫', text: 'The seventh fairy stepped forward quickly. "I cannot undo the curse," she said, "but I can soften it. The princess will not die. She will fall into a deep sleep and wake only when a prince\'s kiss breaks the spell."' },
    { illustration: '🔥🧵', text: 'The king ordered every spinning wheel in the kingdom to be burned at once. Aurora grew up beautiful, kind, and full of laughter — exactly as the fairies had promised. Her parents kept the curse a secret.' },
    { illustration: '🗼🚪', text: 'On Aurora\'s sixteenth birthday, she explored a part of the castle she had never seen. She found a winding stone stair and a small wooden door. Curious, she pushed it open.' },
    { illustration: '👵🧵', text: 'Inside sat an old woman spinning thread on a spinning wheel. "What a curious thing!" said Aurora, reaching out her hand. "May I try?" The moment her finger touched the sharp spindle — prick! She fell into a deep, deep sleep.' },
    { illustration: '🧚‍♀️🏰💤', text: 'The good fairy came at once. She waved her wand and put everyone in the castle to sleep too, so that Aurora would not wake alone. Then tall brambles and thorns grew all around the castle walls.' },
    { illustration: '🌿🌙⏳', text: 'A hundred years passed. Many princes tried to fight through the thorns, but none could get through. The story of the sleeping princess became a legend whispered across the whole land.' },
    { illustration: '🤴🌿💫', text: 'A brave young prince heard the legend and rode to the castle. To his amazement, the thorns parted before him as though by magic. He walked through the silent, sleeping castle and climbed the tower stair.' },
    { illustration: '💋🌹✨', text: 'He found Aurora sleeping, as peaceful and lovely as if she had just closed her eyes. Gently he leaned down and kissed her. Her eyes opened slowly. She looked up and saw the prince\'s warm smile for the very first time.' },
    { illustration: '🎊👑💍', text: 'At that kiss, everyone in the castle woke up at once! The king and queen wept with joy. Aurora and the prince fell deeply in love. They were married in the grandest wedding anyone had ever seen, and they all lived happily ever after. The End.' },
  ],
}

const rumpelstiltskin = {
  id: 'rumpelstiltskin', title: 'Rumpelstiltskin', emoji: '🧵', color: '#84cc16',
  pages: [
    { illustration: '👨‍🌾👧👑', text: 'Once upon a time, a poor miller wanted to seem important to the king. When he met the king one day, he boasted foolishly, "My daughter can spin straw into gold!" The king\'s eyes lit up with greedy excitement.' },
    { illustration: '🌾🔒😢', text: 'The king locked the miller\'s daughter in a room piled high with straw. "Spin all of this into gold by morning," he said, "or you shall lose your head." He locked the door and left her alone.' },
    { illustration: '🧙‍♂️✨🚪', text: 'The poor girl had no idea how to spin straw into gold. She sat down and wept bitterly. Suddenly the door creaked open and a tiny, strange little man danced in. "Why do you weep?" he asked with a wide grin.' },
    { illustration: '💛📿🌾✨', text: '"I must spin all this straw into gold or the king will kill me," she sobbed. "What will you give me if I do it?" asked the little man. She offered her gold necklace. He sat at the wheel — whirr whirr whirr — and spun all night until every piece of straw was gleaming gold.' },
    { illustration: '🏰🌾💍', text: 'The king was delighted but still not satisfied. He locked the girl in a bigger room with even more straw. The little man appeared again, and this time she gave him her ring. By morning, all the straw was gold once more.' },
    { illustration: '👸💍🌾', text: '"Spin this last room into gold and you shall be my queen," said the king. When the little man appeared, the girl had nothing left to give. "Then promise me your first child," he said. Desperate, she agreed.' },
    { illustration: '👸👑🎉', text: 'She spun the gold. The king kept his word and made her his queen. She was happy. In time she had a beautiful baby — and for a while she forgot all about the little man\'s bargain.' },
    { illustration: '🧙‍♂️👶😰', text: 'Then one night the little man appeared. "I have come for what you promised me!" he said, reaching for the baby. The queen clutched her child and begged and wept. The little man finally agreed to give her three nights to guess his name.' },
    { illustration: '📜🔍🏘️', text: 'The queen sent messengers far across the land to find every unusual name they could discover. She guessed all night on the first and second nights, but the little man just laughed and danced at every guess.' },
    { illustration: '🔥🕺🎵', text: 'On the third night a messenger rushed back with thrilling news. He had spotted a strange little man dancing around a fire in the forest, singing: "She\'ll never win my little game — for Rumpelstiltskin is my name!"' },
    { illustration: '😱💥🎊', text: 'When the little man appeared, the queen said calmly, "Is your name... Rumpelstiltskin?" He let out a furious shriek, stamped his foot so hard it went right through the floor — and he was never seen or heard from again. The queen and her precious baby were safe at last. The End.' },
  ],
}

const STORIES = {
  cinderella,
  'three-little-pigs':       threeLittlePigs,
  goldilocks,
  'little-red-riding-hood':  littleRedRidingHood,
  'jack-beanstalk':          jackBeanstalk,
  'hansel-gretel':           hanselGretel,
  'snow-white':              snowWhite,
  'ugly-duckling':           uglyDuckling,
  'sleeping-beauty':         sleepingBeauty,
  rumpelstiltskin,
}

export default STORIES
