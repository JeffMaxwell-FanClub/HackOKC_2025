// 1. Import Dependencies
const fs = require('fs');
const Classifier = require('wink-naive-bayes-text-classifier');
const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');

// 2. Initialize the Tools
const classifier = Classifier();
const nlp = winkNLP(model);
const its = nlp.its;

// 3. Define the "Preprocessing" Task
const prepTask = function (text) {
  const tokens = [];
  nlp.readDoc(text)
    .tokens()
    .filter((t) => (t.out(its.type) === 'word' && !t.out(its.stopWordFlag)))
    .each((t) => tokens.push(t.out(its.stem)));
  return tokens;
};

classifier.definePrepTasks([prepTask]);
classifier.defineConfig({ considerOnlyPresence: true, smoothingFactor: 0.5 });

// ==========================================
// 4. ULTRA TRAINING DATA (Expanded Dataset)
// ==========================================

// 🔴 HIGH PRIORITY (Level 3)
// Definition: Danger to life/safety, active flooding, total building outage, security breaches.
const highPriorityData = [
  // Fire / Electric / Gas
  'Smoke is coming from the electrical outlet',
  'Sparks are flying from the breaker panel',
  'I smell burning plastic in the dorm hallway',
  'The outlet is buzzing loudly and hot to the touch',
  'Exposed live wires hanging from the ceiling',
  'The fire alarm is constantly beeping and showing a system error',
  'Smell of natural gas in the chemistry lab',
  'Boiler room sounds like it is going to explode',
  'Power is completely out in the entire building',
  'Emergency exit sign is broken and sparking',
  'Smoke detector is dangling by its wires',
  'Burning smell coming from the server room',
  'The fuse box is smoking',
  'Major power surge destroyed lab equipment',
  'Arcing noise coming from the transformer outside',
  'Electrical socket is blackened and smells like char',
  'Light fixture fell and is sparking on the floor',
  'Extension cord is melting',
  'There is a small fire in the trash can',
  'Microwave in the kitchen caught fire',
  'Smell of ozone and loud buzzing from the wall',
  'Wires are sparking near the water fountain',
  'The switch board is smoking',
  'Electric shock when touching the metal door handle',
  'Chemical spill in the science hallway',
  'Biohazard bin overturned in the hallway',
  'Strong smell of rotten eggs in the basement',
  'Carbon monoxide detector is chirping',
  'Unidentified chemical leaking from a drum',
  'Gas valve is stuck open',

  // Active Flooding / Structural Failure
  'Water is gushing out of the pipe',
  'The hallway is completely flooded with water',
  'Major leak in the ceiling above the computer lab',
  'Toilet is overflowing and water is reaching the hallway',
  'Sewage backing up into the shower drains',
  'The fire sprinkler system went off accidentally',
  'Hot water pipe burst in the basement',
  'Water is pouring down the stairwell like a waterfall',
  'Roof is leaking heavily onto expensive equipment',
  'Found a large puddle of water near the high voltage server room',
  'The pipe under the sink has burst and is spraying everywhere',
  'Basement is filling up with water rapidly',
  'Steam is shooting out of the radiator',
  'Drinking fountain is stuck on and flooding the floor',
  'The bathroom ceiling has collapsed',
  'Glass shattered in the main hallway entrance',
  'Elevator is stuck between floors with students inside',
  'Someone is trapped in the dorm room because the door jammed',
  'The front door lock is completely broken and won\'t lock',
  'Window is smashed and won\'t close, freezing inside',
  'Staircase railing has fallen off completely',
  'Floorboards are rotting and caving in',
  'Black mold visible on the damp walls',
  'The balcony railing is loose and extremely dangerous',
  'Broken glass all over the entry ramp',
  'Automatic door closed on a student',
  'Handicap ramp is covered in thick ice and unsalted',
  'Ceiling tiles fell on a student\'s desk',
  'The fire escape door is rusted shut',
  'Access control system failed, nobody can enter the building',
  'The gym bleachers collapsed partially',
  'There is a giant hole in the floor',
  'Brick fell off the facade of the building',
  'The master key card reader is not working',
  'Intruder alarm is sounding',
  'Security gate is stuck open',
  'The front door glass is smashed',
  'Lock is jammed and key broke off inside',
  'Door hinge is broken and door is falling off',
  'Window fell out of the frame',
  'Support beam looks cracked',
  'Concrete steps are crumbling and unsafe',
  'Asbestos insulation is exposed',
  'Roof access door was left broken open'
];

// 🟡 MEDIUM PRIORITY (Level 2)
// Definition: Broken functionality, localized failure, contained leaks, appliances down, HVAC extremes.
const mediumPriorityData = [
  // Appliances / Utilities
  'The washing machine in the laundry room is not spinning',
  'Dryer is not heating up',
  'The dishwasher in the staff kitchen is leaking slowly',
  'Vending machine took money but didn\'t dispense',
  'The ice machine is broken',
  'Water fountain has very low pressure (unusable)',
  'The stove burner isn\'t lighting',
  'Microwave turntable is broken',
  'Refrigerator in the break room is warm',
  'The oven door won\'t close all the way',
  'Garbage disposal is jammed and humming',
  'Hand dryer in the bathroom is dead',
  'Soap dispenser fell off the wall',
  'Paper towel dispenser is jammed',
  'Toilet is running constantly (wasting water)',
  'One toilet in the stall is clogged',
  'Shower drain is clogged and draining very slowly',
  'Sink is draining slowly',
  'There is no hot water in the showers',
  'Water tastes metallic',
  'Urinal is not flushing',
  'The sink faucet won\'t turn off completely',
  'Dripping pipe under the sink (contained in bucket)',
  
  // HVAC / Environment
  'It is freezing in the classroom',
  'The AC is broken and it is 85 degrees inside',
  'Thermostat is broken and blank',
  'The heater is blowing cold air',
  'There is a weird mildew smell in the vents',
  'Vent is rattling loudly and distracting class',
  'Humidity is extremely high in the lab',
  'Draft coming from the window frame',
  'Air filter looks completely clogged',
  
  // Structural / Access (Non-Emergency)
  'The door handle is loose and hard to turn',
  'Key card reader takes 5 tries to work',
  'Window screen is torn',
  'One elevator is down (but others work)',
  'Closet door came off the track',
  'Cabinet door hinge is broken',
  'Ceiling tile is stained but dry',
  'Floor tile is cracked and loose',
  'Carpet is ripped and is a tripping hazard',
  'Blinds are stuck halfway down',
  'Projector screen won\'t retract',
  'Whiteboard is coming loose from the wall',
  'Desk chair wheel broke off',
  'Table leg is bent',
  'Locker door is jammed shut',
  'Mailbox lock is stuck',
  'Bike rack is loose',
  
  // Pests (Non-Emergency)
  'I saw a cockroach in the hallway',
  'Ants are coming in through the window',
  'There is a mouse trap that needs clearing',
  'Beehive forming near the entrance',
  'Flies in the kitchen area'
];

// 🟢 LOW PRIORITY (Level 1)
// Definition: Cosmetic, nuisance, minor repairs, requests, IT/General.
const lowPriorityData = [
  // Cosmetic / Minor
  'The light bulb in room 101 burned out',
  'One of the fluorescent lights is flickering',
  'Desk lamp switch is sticky',
  'The hallway light is a bit dim',
  'Motion sensor takes too long to turn on',
  'One light in the cluster is out',
  'The exit sign buzzes quietly',
  'The light switch plate is cracked',
  'The lamp needs a new shade',
  'Bulb is dead in the study lounge',
  'Light is flickering in the bathroom',
  'Need to replace the bulb in the closet',
  'The dimmer switch is loose',
  'A light cover is missing',
  'The exterior light is out',
  'The chair leg is a bit wobbly',
  'A drawer handle is loose',
  'The blinds are stuck and wont go down',
  'Curtain rod is slightly bent',
  'Whiteboard needs to be cleaned better',
  'We need more whiteboard markers',
  'The trash can is missing a lid',
  'Coat hook is missing from the wall',
  'The mirror in the bathroom is smudged',
  'A screw is loose on the bookshelf',
  'The bulletin board is falling off one side',
  'Room number sign fell off the door',
  'The couch in the lounge has a small tear',
  'Table is uneven',
  'Chair squeaks loudly',
  'Cabinet door squeaks',
  'The rug is bunched up',
  'Desks are arranged messily',
  'Missing a knob on the cabinet',
  'The clock fell off the wall',
  'Seat cushion is ripped',
  'Blind slats are bent',
  'There is a coffee stain on the carpet',
  'The paint is chipping off the wall',
  'Small scratch on the classroom door',
  'Carpet is fraying at the edge',
  'Tile in the corner is cracked but safe',
  'Graffiti on the bathroom stall door',
  'Scuff marks on the floor',
  'Ceiling tile has a water stain',
  'Paint is peeling near the window',
  'Wallpaper is peeling',
  'Gum stuck under the desk',
  'The floor is a bit sticky',
  'Dust bunnies in the corner',
  'Cobwebs in the ceiling corner',
  'Carpet tile is loose',
  'The sink faucet drips once every hour',
  'The toilet handle jiggles',
  'Water pressure in the fountain is low',
  'The drain drains a little slowly',
  'The shower head sprays a bit wide',
  'The toilet seat is loose',
  'The hot water takes a while to warm up',
  'Faucet handle is stiff',
  'Shower head is dripping slightly',
  'Toilet makes a running sound',
  'Sink is draining slow',
  'Soap dispenser is clogged',
  'One sink in the bathroom is out of order',
  'Paper towel dispenser is jammed',
  'The soap dispenser is empty',
  'Need more toilet paper in stall 2',
  'Hand dryer is weak',
  'The air conditioner is making a quiet humming noise',
  'The room is slightly colder than usual',
  'The radiator makes a clanking sound in the morning',
  'The fan in the bathroom is dusty',
  'A weird smell near the trash cans',
  'It is a little stuffy in here',
  'Vent is rattling',
  'Thermostat display is dim',
  'Draft coming from the window',
  'The room is a bit too warm',
  'AC is blowing directly on my desk',
  'Heater smells like dust when it turns on',
  'Wifi is really slow in the lobby',
  'The internet connection is lagging',
  'The printer is out of toner',
  'Mouse is missing from the computer lab',
  'Keyboard key is sticky',
  'Need to replace batteries in the clock',
  'The projector remote is missing',
  'Tablets in the lab are low on battery',
  'Grass is getting too long outside',
  'The recycling bin is full',
  'The clock in the hall is five minutes slow',
  'Gym locker 45 is stuck shut',
  'The TV remote needs batteries',
  'Projector bulb is dim',
  'Ethernet port is loose',
  'Monitor stand is broken',
  'Mouse is double clicking',
  'Scanner is jammed',
  'Vending machine is making a buzzing noise',
  'Elevator buttons are sticky',
  'Pencil sharpener is full'
];


// Load data into classifier
highPriorityData.forEach(text => classifier.learn(text, 'High Priority'));
lowPriorityData.forEach(text => classifier.learn(text, 'Low Priority'));

// 5. CONSOLIDATE (This finishes the training)
classifier.consolidate();
console.log('Training complete.');

// ==========================================
// 6. SAVING & LOADING (Simulating Production)
// ==========================================

// In a real app, you would save this string to a file (e.g., 'model.json')
const trainedModelJSON = classifier.exportJSON();
fs.writeFileSync('model.json', trainedModelJSON);
console.log('Success! Trained model saved to "model.json"');

// ... imagine the server restarts here ...

// Now we create a NEW classifier instance to simulate a running server
const productionClassifier = Classifier();
productionClassifier.definePrepTasks([prepTask]); // You must redefine tasks
productionClassifier.importJSON(trainedModelJSON); // Load the brain
productionClassifier.consolidate(); // <--- FIX: Consolidate is required after import!
console.log('Model imported from JSON (simulated load from disk).\n');


// ==========================================
// 7. LIVE TESTING
// ==========================================
console.log('--- Live Triage Test ---');

const newReports = [
  "The hallway is flooded with water!",       
  "I can smell burning plastic in the dorm",  
  "My desk chair is squeaking",               
  "The internet connection is lagging",
  "There is a giant hole in the floor", 
  "The faucet is dripping a little bit",
  "The front door won't lock", // Should be High
  "Someone wrote on the bathroom wall", // Should be Low
  "The steam pipe exploded" // Should be High
];

newReports.forEach(report => {
  const result = productionClassifier.predict(report);
  console.log(`Report: "${report}"`);
  console.log(`Predicted: ${result}`);
  console.log('-----------------------------------');
});