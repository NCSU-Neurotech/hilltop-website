/**
 * Prisma Seed Script
 *
 * Populates default sound boards with audio URIs.
 * Run with: npx prisma db seed
 *
 * Audio Sources:
 * - Instruments: Zapsplat.com (free)
 * - Animals: BBC Sound Effects (free, royalty-free)
 * - Goofy: Zapsplat.com (free)
 * - Superheroes: YouTube Audio Library / Zapsplat
 * - Movies: These are copyrighted — will use theme references only
 * - Nature: BBC Sound Effects (free)
 * - Vehicles: Freesound.org / Zapsplat (free)
 * - Cartoons: These may be copyrighted — will use sound effect references
 */
// NOTE: this file used ESM `import` syntax while server/package.json
// declares "type": "commonjs" — that mismatch meant `npx prisma db seed`
// could never actually run it (SyntaxError: Cannot use import statement
// outside a module). Converted to require()/module.exports to match every
// other file in this server.
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Refuse to run against production. This script creates a facility with a
  // known/guessable password — fine for a local dev database, not something
  // that should ever be possible to run against the real one by accident
  // (a wrong DATABASE_URL, a copy-pasted command in the wrong terminal,
  // etc.). Real facilities are provisioned via POST /api/auth/signup
  // instead, not this script.
  if (process.env.NODE_ENV === 'production') {
    console.error('✗ Refusing to run the seed script with NODE_ENV=production.')
    console.error('  This creates a facility with a known demo password — never run it against a real database.')
    process.exit(1)
  }

  console.log('🌱 Seeding default sound boards...')

  // Demo facility (for testing) — one shared login per facility, so it
  // needs real credentials. SEED_DEMO_PASSWORD lets you override the
  // placeholder without editing this file; the fallback is for local dev
  // only and is not a secret worth protecting (see the guard above).
  const demoPassword = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD || 'demo-facility-password', 12)
  const demoFacility = await prisma.facility.upsert({
    where: { email: 'demo-facility@assistivegames.local' },
    update: {},
    create: {
      name: 'Demo Facility',
      email: 'demo-facility@assistivegames.local',
      password: demoPassword,
      status: 'active',
      plan: 'premium',
      ttsCharQuotaDaily: 100000,
      ttsCharUsedToday: 0,
      ttsLastResetDate: new Date(),
    },
  })

  console.log(`✓ Demo facility: ${demoFacility.id}`)

  // Sound Boards
  const boards = [
    {
      name: 'Instruments',
      emoji: '🎵',
      color: '#a855f7',
      description: 'Musical instruments and sounds',
      isPreset: true,
      sounds: [
        { id: 'piano', name: 'Piano', emoji: '🎹', uri: '/sounds/instruments/piano.mp3' },
        { id: 'drums', name: 'Drums', emoji: '🥁', uri: '/sounds/instruments/drums.mp3' },
        { id: 'guitar', name: 'Guitar', emoji: '🎸', uri: '/sounds/instruments/guitar.mp3' },
        { id: 'trumpet', name: 'Trumpet', emoji: '🎺', uri: '/sounds/instruments/trumpet.mp3' },
        { id: 'violin', name: 'Violin', emoji: '🎻', uri: '/sounds/instruments/violin.mp3' },
        { id: 'xylophone', name: 'Xylophone', emoji: '🎠', uri: '/sounds/instruments/xylophone.mp3' },
        { id: 'flute', name: 'Flute', emoji: '🪶', uri: '/sounds/instruments/flute.mp3' },
        { id: 'harmonica', name: 'Harmonica', emoji: '🎵', uri: '/sounds/instruments/harmonica.mp3' },
        { id: 'bells', name: 'Bells', emoji: '🔔', uri: '/sounds/instruments/bells.mp3' },
        { id: 'harp', name: 'Harp', emoji: '🎼', uri: '/sounds/instruments/harp.mp3' },
      ],
    },
    {
      name: 'Animals',
      emoji: '🦁',
      color: '#84cc16',
      description: 'Real animal sounds from nature',
      isPreset: true,
      sounds: [
        { id: 'dog', name: 'Dog', emoji: '🐕', uri: '/sounds/animals/dog.mp3' },
        { id: 'cat', name: 'Cat', emoji: '🐈', uri: '/sounds/animals/cat.mp3' },
        { id: 'lion', name: 'Lion', emoji: '🦁', uri: '/sounds/animals/lion.mp3' },
        { id: 'elephant', name: 'Elephant', emoji: '🐘', uri: '/sounds/animals/elephant.mp3' },
        { id: 'monkey', name: 'Monkey', emoji: '🐵', uri: '/sounds/animals/monkey.mp3' },
        { id: 'cow', name: 'Cow', emoji: '🐄', uri: '/sounds/animals/cow.mp3' },
        { id: 'sheep', name: 'Sheep', emoji: '🐑', uri: '/sounds/animals/sheep.mp3' },
        { id: 'bird', name: 'Bird', emoji: '🦅', uri: '/sounds/animals/bird.mp3' },
        { id: 'duck', name: 'Duck', emoji: '🦆', uri: '/sounds/animals/duck.mp3' },
        { id: 'owl', name: 'Owl', emoji: '🦉', uri: '/sounds/animals/owl.mp3' },
        { id: 'frog', name: 'Frog', emoji: '🐸', uri: '/sounds/animals/frog.mp3' },
        { id: 'horse', name: 'Horse', emoji: '🐴', uri: '/sounds/animals/horse.mp3' },
      ],
    },
    {
      name: 'Goofy Sounds',
      emoji: '😄',
      color: '#f97316',
      description: 'Silly, funny, and comedic sounds',
      isPreset: true,
      sounds: [
        { id: 'fart', name: 'Fart', emoji: '💨', uri: '/sounds/goofy/fart.mp3' },
        { id: 'boing', name: 'Boing', emoji: '🎪', uri: '/sounds/goofy/boing.mp3' },
        { id: 'honk', name: 'Honk', emoji: '📯', uri: '/sounds/goofy/honk.mp3' },
        { id: 'whistle', name: 'Whistle', emoji: '🎵', uri: '/sounds/goofy/whistle.mp3' },
        { id: 'spring', name: 'Spring', emoji: '🌀', uri: '/sounds/goofy/spring.mp3' },
        { id: 'slide', name: 'Slide Whistle', emoji: '🎺', uri: '/sounds/goofy/slide.mp3' },
        { id: 'kazoo', name: 'Kazoo', emoji: '🎺', uri: '/sounds/goofy/kazoo.mp3' },
        { id: 'trombone', name: 'Trombone Fail', emoji: '🎺', uri: '/sounds/goofy/trombone.mp3' },
        { id: 'boob', name: 'Boob Honk', emoji: '📯', uri: '/sounds/goofy/boob.mp3' },
        { id: 'laugh', name: 'Cartoon Laugh', emoji: '😂', uri: '/sounds/goofy/laugh.mp3' },
      ],
    },
    {
      name: 'Superheroes',
      emoji: '🦸',
      color: '#ef4444',
      description: 'Action and superhero sound effects',
      isPreset: true,
      sounds: [
        { id: 'pow', name: 'Pow!', emoji: '💥', uri: '/sounds/superheroes/pow.mp3' },
        { id: 'laser', name: 'Laser Zap', emoji: '⚡', uri: '/sounds/superheroes/laser.mp3' },
        { id: 'explosion', name: 'Explosion', emoji: '💣', uri: '/sounds/superheroes/explosion.mp3' },
        { id: 'whoosh', name: 'Whoosh', emoji: '💨', uri: '/sounds/superheroes/whoosh.mp3' },
        { id: 'ding', name: 'Ding!', emoji: '🔔', uri: '/sounds/superheroes/ding.mp3' },
        { id: 'cape', name: 'Cape Swoosh', emoji: '🧥', uri: '/sounds/superheroes/cape.mp3' },
        { id: 'power', name: 'Power Up', emoji: '⚡', uri: '/sounds/superheroes/power.mp3' },
        { id: 'villain', name: 'Villain Laugh', emoji: '😈', uri: '/sounds/superheroes/villain.mp3' },
      ],
    },
    // Movies board removed: every sound was named after a specific
    // copyrighted franchise (Star Wars, Harry Potter, Batman, Avengers,
    // etc.) — not being sourced, same call as Cartoons.
    {
      name: 'Nature',
      emoji: '🌲',
      color: '#22c55e',
      description: 'Natural sounds from the environment',
      isPreset: true,
      sounds: [
        { id: 'rain', name: 'Rain', emoji: '🌧️', uri: '/sounds/nature/rain.mp3' },
        { id: 'thunder', name: 'Thunder', emoji: '⛈️', uri: '/sounds/nature/thunder.mp3' },
        { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', uri: '/sounds/nature/ocean.mp3' },
        { id: 'wind', name: 'Wind', emoji: '💨', uri: '/sounds/nature/wind.mp3' },
        { id: 'birds', name: 'Birds Chirping', emoji: '🐦', uri: '/sounds/nature/birds.mp3' },
        { id: 'stream', name: 'Stream', emoji: '💧', uri: '/sounds/nature/stream.mp3' },
        { id: 'forest', name: 'Forest Ambience', emoji: '🌳', uri: '/sounds/nature/forest.mp3' },
        { id: 'crickets', name: 'Crickets', emoji: '🦗', uri: '/sounds/nature/crickets.mp3' },
        { id: 'waterfall', name: 'Waterfall', emoji: '💦', uri: '/sounds/nature/waterfall.mp3' },
        { id: 'fire', name: 'Campfire', emoji: '🔥', uri: '/sounds/nature/fire.mp3' },
        { id: 'leaves', name: 'Leaves Rustling', emoji: '🍂', uri: '/sounds/nature/leaves.mp3' },
        { id: 'thunder_roll', name: 'Thunder Roll', emoji: '⚡', uri: '/sounds/nature/thunder_roll.mp3' },
      ],
    },
    {
      name: 'Vehicles',
      emoji: '🚗',
      color: '#06b6d4',
      description: 'Vehicle and transportation sounds',
      isPreset: true,
      sounds: [
        { id: 'car_horn', name: 'Car Horn', emoji: '📯', uri: '/sounds/vehicles/car_horn.mp3' },
        { id: 'police_siren', name: 'Police Siren', emoji: '🚔', uri: '/sounds/vehicles/police_siren.mp3' },
        { id: 'fire_truck', name: 'Fire Truck', emoji: '🚒', uri: '/sounds/vehicles/fire_truck.mp3' },
        { id: 'helicopter', name: 'Helicopter', emoji: '🚁', uri: '/sounds/vehicles/helicopter.mp3' },
        { id: 'train_whistle', name: 'Train Whistle', emoji: '🚂', uri: '/sounds/vehicles/train_whistle.mp3' },
        { id: 'airplane', name: 'Airplane', emoji: '✈️', uri: '/sounds/vehicles/airplane.mp3' },
        { id: 'motorcycle', name: 'Motorcycle', emoji: '🏍️', uri: '/sounds/vehicles/motorcycle.mp3' },
        { id: 'doorbell', name: 'Doorbell', emoji: '🚪', uri: '/sounds/vehicles/doorbell.mp3' },
      ],
    },
    // Cartoons board removed: it named real trademarked characters (Mickey
    // Mouse, SpongeBob, Looney Tunes, Tweety) directly, a clearer copyright
    // problem than "Movies" ever was — not being sourced.
  ]

  for (const board of boards) {
    const created = await prisma.soundBoard.upsert({
      where: {
        facilityId_name: {
          facilityId: demoFacility.id,
          name: board.name,
        },
      },
      update: { sounds: JSON.stringify(board.sounds) },
      create: {
        facilityId: demoFacility.id,
        ...board,
        sounds: JSON.stringify(board.sounds),
      },
    })
    console.log(`✓ Created sound board: ${created.name} (${board.sounds.length} sounds)`)
  }

  console.log('✨ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
