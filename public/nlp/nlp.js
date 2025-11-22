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

// --- HIGH PRIORITY (Hazards, Structural, Major Systems, Security) ---
const highPriorityData = [
  // Fire / Electrical Hazards
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

  // Water / Flooding
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

  // Structural / Safety / Security
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
  'Chemical spill in the science hallway',
  'Biohazard bin overturned in the hallway',
  'Gas leak alarm is going off in the kitchen',
  'The fume hood in the lab is not venting fumes'
];

// --- LOW PRIORITY (Nuisances, Cosmetic, Minor repairs, IT) ---
const lowPriorityData = [
  // Lighting / Minor Electrical
  'The light bulb in room 101 burned out',
  'One of the fluorescent lights is flickering',
  'Desk lamp switch is sticky',
  'We need a new power strip in the lounge',
  'The hallway light is a bit dim',
  'Motion sensor takes too long to turn on',
  'Need to replace batteries in the clock',
  'The projector remote is missing',
  'Tablets in the lab are low on battery',
  'One light in the cluster is out',
  'The exit sign buzzes quietly',
  'The light switch plate is cracked',
  'The lamp needs a new shade',

  // Furniture / Cosmetic / Fixtures
  'The chair leg is a bit wobbly',
  'There is a coffee stain on the carpet',
  'The paint is chipping off the wall',
  'A drawer handle is loose',
  'The blinds are stuck and wont go down',
  'Curtain rod is slightly bent',
  'Small scratch on the classroom door',
  'Whiteboard needs to be cleaned better',
  'We need more whiteboard markers',
  'The soap dispenser is empty',
  'Paper towel dispenser is jammed',
  'The trash can is missing a lid',
  'Carpet is fraying at the edge',
  'Tile in the corner is cracked but safe',
  'Graffiti on the bathroom stall door',
  'The desk is uneven',
  'Coat hook is missing from the wall',
  'The mirror in the bathroom is smudged',
  'A screw is loose on the bookshelf',
  'The bulletin board is falling off one side',
  'Room number sign fell off the door',
  'Vending machine ate my dollar',
  'The couch in the lounge has a small tear',

  // HVAC / Plumbing Nuisances
  'The air conditioner is making a quiet humming noise',
  'The room is slightly colder than usual',
  'The sink faucet drips once every hour',
  'The toilet handle jiggles',
  'Water pressure in the fountain is low',
  'The radiator makes a clanking sound in the morning',
  'The fan in the bathroom is dusty',
  'A weird smell near the trash cans',
  'The drain drains a little slowly',
  'The shower head sprays a bit wide',
  'The toilet seat is loose',
  'The hot water takes a while to warm up',
  
  // IT / General Nuisance
  'Wifi is really slow in the lobby',
  'The internet connection is lagging',
  'The printer is out of toner',
  'Mouse is missing from the computer lab',
  'Keyboard key is sticky',
  'Grass is getting too long outside',
  'There are some ants near the kitchen window',
  'The recycling bin is full',
  'The clock in the hall is five minutes slow',
  'Gym locker 45 is stuck shut',
  'The TV remote needs batteries'
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