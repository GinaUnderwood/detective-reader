// Screen 4 lists are curated separately; sparse word families intentionally contain fewer examples.
const LESSONS=[
  ['-it',['fit','sit','hit'],['bit','kit','lit']],
  ['-ip',['dip','lip','sip'],['hip','rip','tip']],
  ['-in',['fin','pin','win'],['bin','tin','chin']],
  ['-is',['is','his','sis'],['this']],
  ['-id',['bid','did','hid'],['kid','lid','rid']],
  ['-ig',['big','dig','fig'],['gig','jig','pig']],
  ['-im',['dim','him','rim'],['slim','swim','trim']],
  ['-ib',['bib','fib','rib'],['crib','nib']],
  ['-ix',['fix','mix','six'],['nix']],
  ['-iff',['cliff','sniff','stiff'],['riff','skiff','whiff']],
  ['-ill',['fill','hill','mill'],['bill','pill','will']],
  ['-iss',['hiss','kiss','miss'],['bliss','Swiss']],
  ['-at',['bat','cat','hat'],['fat','mat','rat']],
  ['-ap',['cap','map','tap'],['gap','lap','nap']],
  ['-an',['can','fan','man'],['ban','pan','ran']],
  ['-as',['as','gas','has'],['alas']],
  ['-ad',['bad','dad','mad'],['had','lad','pad']],
  ['-ag',['bag','rag','tag'],['gag','lag','wag']],
  ['-am',['ham','jam','ram'],['dam','yam','clam']],
  ['-ax',['ax','max','tax'],['wax','fax','lax']],
  ['-ab',['cab','dab','lab'],['gab','jab','tab']],
  ['-ot',['cot','hot','pot'],['dot','lot','not']],
  ['-op',['hop','mop','top'],['bop','cop','pop']],
  ['-on',['on','Don','Ron'],['con','upon']],
  ['-od',['cod','nod','pod'],['rod','sod','prod']],
  ['-og',['dog','fog','log'],['bog','hog','jog']],
  ['-om',['mom','Tom','pom'],['prom']],
  ['-ob',['cob','job','rob'],['bob','mob','sob']],
  ['-ox',['box','fox','ox'],['lox','pox','inbox']],
  ['-off',['off','scoff','doff'],['kickoff','cutoff','liftoff']],
  ['-oss',['boss','loss','moss'],['toss','floss','gloss']],
  ['-et',['bet','get','pet'],['jet','let','net']],
  ['-ep',['pep','rep','step'],['yep','prep']],
  ['-en',['den','hen','pen'],['men','ten','yen']],
  ['-ed',['bed','fed','red'],['led','wed','shed']],
  ['-eg',['beg','leg','peg'],['keg','Meg','nutmeg']],
  ['-em',['hem','rem','stem'],['gem','them']],
  ['-eb',['web','Deb','neb'],['Jeb','celeb']],
  ['-ell',['bell','fell','well'],['tell','sell','yell']],
  ['-ess',['less','mess','press'],['bless','dress','chess']],
  ['-ut',['but','cut','hut'],['gut','nut','rut']],
  ['-up',['cup','pup','sup'],['up','yup','pickup']],
  ['-un',['bun','fun','run'],['nun','pun','sun']],
  ['-us',['bus','plus','us'],['Gus','thus']],
  ['-ug',['bug','hug','mug'],['dug','jug','rug']],
  ['-ud',['bud','cud','mud'],['dud','thud','spud']],
  ['-um',['gum','hum','sum'],['drum','plum','chum']],
  ['-ub',['cub','rub','tub'],['dub','hub','sub']],
  ['-uff',['buff','cuff','puff'],['huff','fluff','stuff']],
  ['-ull',['dull','gull','hull'],['lull','mull','skull']]
].map(([pattern,words,keepReadingWords])=>({pattern,words,keepReadingWords}));

// Sentence practice uses only cumulative short word-family words and Dolch sight words.
const SENTENCE_SETS=[
  ['I sit.','It is a kit.','Hit it.'],
  ['Sip it.','I see a rip.','This is the tip.'],
  ['The pin is in the tin.','I win.','The fin is in the bin.'],
  ['His sis can sit.','Is this his kit?','This is his pin.'],
  ['The kid hid.','I see the lid.','I did this.'],
  ['The pig is big.','I can dig.','The fig is in the bin.'],
  ['It is dim.','I see him.','The rim is big.'],
  ['This is a bib.','It is a fib.','I see the rib.'],
  ['I can fix it.','I can mix it.','Fix the lid.'],
  // Common -iff words begin with blends, so this case reviews prior CVC families.
  ['I can fix it.','The kid can sit.','The pig is big.'],
  ['Fill it.','The pill is in the tin.','We can sit on the hill.'],
  ['Do not hiss.','I miss him.','The kiss is for him.'],
  ['The cat is fat.','The hat is on the mat.','I see a bat.'],
  ['The cap is in my lap.','Tap the map.','I can nap.'],
  ['The man ran.','I see the fan.','I can tap the pan.'],
  ['It is as big as a pig.','The man has a hat.','The can has gas.'],
  ['My dad had a map.','The kid is mad.','This is a bad hat.'],
  ['The bag has a tag.','I see the rag.','The pig can wag.'],
  ['The ham is in the pan.','I see the jam.','The ram is mad.'],
  ['I see the wax.','The wax is on the lid.','Six is the max.'],
  ['The cab is at the lab.','Dab the jam.','The can has a tab.'],
  ['The pot is hot.','I see a dot.','The cat is on the cot.'],
  ['I can hop.','The mop is in the pot.','I see the cop.'],
  ['The hat is on the cot.','The cap is on the mat.','The lid is on the pot.'],
  ['I can nod.','The cod is in the pot.','The pod is in the bag.'],
  ['The dog can jog.','The hog is in the fog.','I see a log.'],
  ['My mom can jog.','The dog is with my mom.','My mom can see the hog.'],
  ['The cob is in the bag.','It is my job.','Do not sob.'],
  ['The fox is in the box.','I see the fox.','The box is big.'],
  ['The hat is off.','The cat is off the mat.','The lid is off the pot.'],
  ['The moss is on the log.','Toss the cap to me.','The boss has a hat.'],
  ['I can get the net.','The pet is on the mat.','Let the pet sit.'],
  ['The pet has pep.','The dog can hop.','The pet can nap.'],
  ['The hen is in the pen.','Ten men can sit.','The fox is in the den.'],
  ['The red hat is on the bed.','I fed the hen.','The dog led the man.'],
  ['The dog can beg.','My leg is on the bed.','I see a peg.'],
  ['The hem is red.','The gem is in the bag.','I see the gem.'],
  ['I see a web.','The web is on the box.','The web is in the den.'],
  ['The bell fell.','Tell me.','Do not yell.'],
  ['This is a mess.','I have less jam.','The mess is on the mat.'],
  ['The hut is big.','Cut the ham.','The nut is in the bag.'],
  ['The cup is on the mat.','The pup can sit.','The pup is up.'],
  ['The bun is hot.','We can run.','The sun is up.'],
  ['The bus is big.','The bus can go.','Come with us on the bus.'],
  ['The bug is on the rug.','I can hug the pup.','The mug is on the mat.'],
  ['The bud is red.','The pig is in the mud.','The bud is in the mud.'],
  ['I can hum.','The sum is ten.','I have gum.'],
  ['The cub is in the den.','Rub the leg.','The mug is in the tub.'],
  ['The cuff is red.','The pup can huff.','I see a puff of fog.'],
  ['The gull is on the hull.','The hull is red.','The hull is dull.']
];
if(SENTENCE_SETS.length!==LESSONS.length)throw new Error('Every lesson needs a sentence set.');

const AVATARS=[['🦉','Owl Investigator'],['🦊','Fox Detective'],['🐱','Clue Cat'],['🤖','Robo Reader']];
const SHOP=[['🎩','Detective Hat',40],['🔎','Golden Magnifier',50],['📓','Secret Notebook',35],['🧥','Mystery Cape',60],['🗺️','Treasure Map',45],['🧰','Clue Kit',55],['🏠','Treehouse Office',90],['🚲','Case Cruiser',75]];
const saved=JSON.parse(localStorage.getItem('detectiveReader')||'{}');
const state={view:'home',lesson:saved.lesson||0,screen:1,coins:saved.coins??120,avatar:saved.avatar||0,owned:saved.owned||[],completed:saved.completed||[],readIndex:0,buildWords:[],buildIndex:null,spellIndex:0,spellAnswer:'',hunt:[],mastery:0};
const app=document.querySelector('#app');

function save(){localStorage.setItem('detectiveReader',JSON.stringify({lesson:state.lesson,coins:state.coins,avatar:state.avatar,owned:state.owned,completed:state.completed}))}
function lesson(){return LESSONS[state.lesson]}
function keepReadingWords(){return lesson().keepReadingWords}
function ending(){return lesson().pattern.slice(1)}
function onset(word){return word.slice(0,-ending().length)}
function previousScreenWords(){
  const seen=new Set();
  return[...lesson().words,...keepReadingWords()].filter(word=>{
    const key=word.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}
function chooseScreenFiveWords(){
  const pool=previousScreenWords().filter(word=>onset(word));
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  return pool.slice(0,3);
}
function prepareScreenFive(){state.buildWords=chooseScreenFiveWords();state.buildIndex=null}
function resetScreenFive(){state.buildWords=[];state.buildIndex=null}
function screenFiveWords(){if(!state.buildWords.length)prepareScreenFive();return state.buildWords}
const FEMALE_NARRATOR_PRIORITIES=['Microsoft Aria Online (Natural)','Microsoft Jenny Online (Natural)','Microsoft Ava Online (Natural)','Microsoft Emma Multilingual Online (Natural)','Microsoft Aria','Microsoft Jenny','Microsoft Ava','Microsoft Emma','Google UK English Female','Google US English','Samantha','Ava','Emma','Allison','Zira','Victoria','Karen','Moira','Tessa','Fiona','Libby','Sonia','Hazel','Susan','Serena','Kate','Veena','Joanna','Kendra','Kimberly','Ivy','Salli'];
let narratorVoice=null,activeNarration=null,pendingNarration=null,voiceWaitTimer=null,activeNarrationTimer=null,narratorUnavailable=false;
let screenTwoRun=0,screenTwoTimer=null,screenThreeRun=0,screenThreeTimer=null,screenThreeRoot=null,screenFourRun=0,screenFourTimer=null,screenFourRoot=null;
const SCREEN_ONE_NARRATION='Welcome Pattern Detective. Your next case is ready for you to solve.';
const SCREEN_TWO_NARRATION='Listen carefully. What do these words have in common?';
const SCREEN_THREE_CONFETTI_MS=3000;
const SCREEN_THREE_ENDING_NARRATION='Their ending sound is the same.';
const SCREEN_FOUR_CONFETTI_MS=3000;
const SCREEN_FOUR_INTRO="Let's keep reading.";
const SCREEN_FOUR_QUESTION='What part of the word stays the same? Click on the part below.';
const SCREEN_FIVE_NARRATION='Now you get to build a word. Click on the first letter to build a word.';
const SCREEN_SIX_NARRATION='Your turn. Read the word and click below for the next word.';
const SCREEN_SEVEN_NARRATION='As smoothly as you can, Read all these words.';
function chooseNarratorVoice(voices){
  const english=voices.filter(v=>/^en(?:[-_]|$)/i.test(v.lang||''));
  if(!english.length)return null;
  for(const preferred of FEMALE_NARRATOR_PRIORITIES){const wanted=preferred.toLowerCase(),match=english.find(v=>{const name=v.name.toLowerCase();return wanted.includes(' ')?name.includes(wanted):name.split(/[^a-z]+/).includes(wanted)});if(match)return match}
  return english.find(v=>/\bfemale\b/i.test(v.name))||null;
}
function refreshNarratorVoice(){
  const selected=chooseNarratorVoice(speechSynthesis.getVoices());
  if(selected){narratorVoice=selected;narratorUnavailable=false}
  if(narratorVoice&&pendingNarration){const request=pendingNarration;pendingNarration=null;speak(request.text,request.rate,request.callbacks)}
}
function waitForNarratorVoice(tries=20){
  clearTimeout(voiceWaitTimer);
  voiceWaitTimer=setTimeout(()=>{refreshNarratorVoice();if(!pendingNarration)return;if(tries>1)waitForNarratorVoice(tries-1);else{const request=pendingNarration;pendingNarration=null;narratorUnavailable=true;toast('A warm female narration voice is not available on this device.');completeWithoutNarration(request.callbacks)}},250);
}
function completeWithoutNarration(callbacks){
  if(callbacks?.onStart)callbacks.onStart({unavailable:true});
  if(callbacks?.onComplete)setTimeout(()=>callbacks.onComplete({unavailable:true}),700);
}
function speak(text,rate=.78,callbacks={}){
  if(!('speechSynthesis'in window)){completeWithoutNarration(callbacks);return}
  const voices=speechSynthesis.getVoices();
  if(!narratorVoice||!voices.some(v=>v.name===narratorVoice.name&&v.lang===narratorVoice.lang))narratorVoice=chooseNarratorVoice(voices);
  if(!narratorVoice){
    if(narratorUnavailable){completeWithoutNarration(callbacks);return}
    pendingNarration={text,rate,callbacks};
    waitForNarratorVoice();
    return;
  }
  narratorUnavailable=false;
  pendingNarration=null;
  clearTimeout(voiceWaitTimer);
  clearTimeout(activeNarrationTimer);
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.voice=narratorVoice;
  u.lang=narratorVoice.lang||'en-US';
  u.rate=rate;
  u.pitch=1.04;
  u.volume=1;
  activeNarration=u;
  let finished=false,watchdogTimer=null;
  u.onstart=()=>{if(finished)return;if(callbacks.onStart)callbacks.onStart({unavailable:false})};
  const finish=(error=false)=>{if(finished)return;finished=true;clearTimeout(watchdogTimer);if(activeNarration===u)activeNarration=null;if(callbacks.onComplete)callbacks.onComplete({error})};
  u.onend=()=>finish(false);
  u.onerror=()=>finish(true);
  speechSynthesis.speak(u);
  watchdogTimer=setTimeout(()=>{finish(true);speechSynthesis.cancel()},Math.max(5000,Math.min(20000,text.length*120)));
  activeNarrationTimer=watchdogTimer;
}
function stopNarration(){
  screenTwoRun++;
  screenThreeRun++;
  screenFourRun++;
  clearTimeout(screenTwoTimer);
  clearTimeout(screenThreeTimer);
  clearTimeout(screenFourTimer);
  if(screenThreeRoot?.isConnected){
    screenThreeRoot.querySelector('[data-screen-three-confetti]')?.classList.remove('active');
    screenThreeRoot.querySelector('[data-screen-three-prompt]')?.classList.remove('ready','fallback');
  }
  if(screenFourRoot?.isConnected){
    screenFourRoot.querySelector('[data-screen-four-confetti]')?.classList.remove('active');
    screenFourRoot.classList.remove('celebrating');
  }
  screenThreeRoot=null;
  screenFourRoot=null;
  pendingNarration=null;
  activeNarration=null;
  clearTimeout(voiceWaitTimer);
  clearTimeout(activeNarrationTimer);
  if('speechSynthesis'in window)speechSynthesis.cancel();
}
if('speechSynthesis'in window){refreshNarratorVoice();speechSynthesis.addEventListener('voiceschanged',refreshNarratorVoice)}
function toast(text){const t=document.createElement('div');t.className='toast';t.textContent=text;document.body.append(t);setTimeout(()=>t.remove(),1800)}
function header(){return `<header class="topbar"><button class="brand" data-view="home" aria-label="Detective Reader home"><span class="glass"></span><span>Detective Reader<small>solve every word</small></span></button><div class="topstats"><span class="pill">${AVATARS[state.avatar][0]} ${AVATARS[state.avatar][1]}</span><button class="pill coin" data-view="rewards">🪙 ${state.coins}</button></div></header>`}
function shell(content,active='home'){return `${header()}<div class="layout"><aside class="sidebar"><button class="navbtn ${active==='home'?'active':''}" data-view="home">🏠 Case Board</button><button class="navbtn ${active==='path'?'active':''}" data-view="path">🗺️ Lesson Path</button><button class="navbtn ${active==='rewards'?'active':''}" data-view="rewards">🎒 Avatar & Shop</button><button class="navbtn" data-view="progress">📈 Progress</button></aside><main class="main">${content}</main></div>`}
function render(){
  if(state.view==='lesson') app.innerHTML=header()+renderLesson();
  else if(state.view==='path') app.innerHTML=shell(renderPath(),'path');
  else if(state.view==='rewards') app.innerHTML=shell(renderRewards(),'rewards');
  else if(state.view==='progress') app.innerHTML=shell(renderProgress(),'progress');
  else app.innerHTML=shell(renderHome(),'home');
  bind();
}

function renderHome(){const l=lesson(),pct=Math.round((state.lesson+1)/LESSONS.length*100);return `<section class="hero"><div><span class="eyebrow">Detective headquarters</span><h1>New word case ready!</h1><p>Follow the clues, discover the pattern, and earn coins for your detective collection. Mistakes are clues—try again whenever you need to.</p><button class="primary" data-start>Open Case ${state.lesson+1}</button></div><div class="avatar">${AVATARS[state.avatar][0]}</div></section><div class="grid"><article class="card casecard"><span class="eyebrow">Current case</span><div class="pattern">${l.pattern}</div><h3>Word-Family Mystery</h3><p>${l.words.join(' · ')}</p></article><article class="card"><span class="eyebrow">Case progress</span><h3>${state.completed.length} cases solved</h3><div class="progress"><span style="width:${pct}%"></span></div><p>${pct}% through the short-vowel path</p></article><article class="card"><span class="eyebrow">Rewards</span><h3>🪙 ${state.coins} coins</h3><p>${state.owned.length} detective items collected</p><button class="secondary" data-view="rewards">Visit Detective Supply</button></article></div><section class="card" style="margin-top:20px"><span class="eyebrow">Next clues</span><div class="lessonList">${LESSONS.slice(state.lesson,state.lesson+10).map((x,i)=>`<button class="lessonChip ${i===0?'current':''}" data-lesson="${state.lesson+i}">${state.lesson+i+1}. ${x.pattern}</button>`).join('')}</div></section>`}
function renderPath(){return `<span class="eyebrow">50 sequential cases</span><h1>Word-Family Case Map</h1><p>Cases unlock in a systematic short-vowel sequence.</p><div class="lessonList">${LESSONS.map((l,i)=>`<button class="lessonChip ${i===state.lesson?'current':''}" data-lesson="${i}">${state.completed.includes(i)?'✓ ':''}${i+1}. ${l.pattern}</button>`).join('')}</div>`}
function renderRewards(){return `<span class="eyebrow">Detective profile</span><h1>Choose your investigator</h1><div class="avatarGrid">${AVATARS.map((a,i)=>`<button class="avatarItem ${i===state.avatar?'selected':''}" data-avatar="${i}">${a[0]}<small>${a[1]}</small></button>`).join('')}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:34px"><div><span class="eyebrow">Detective supply shop</span><h1>Cash in earned coins</h1></div><span class="pill coin">🪙 ${state.coins}</span></div><p>Coins come only from learning activities. Every item has a fixed price—there are no random prizes or real-money purchases.</p><div class="shopGrid">${SHOP.map((s,i)=>`<article class="shopItem"><div class="icon">${s[0]}</div><h3>${s[1]}</h3><div class="price">🪙 ${s[2]}</div><button class="${state.owned.includes(i)?'secondary':'primary'}" data-buy="${i}" ${state.owned.includes(i)?'disabled':''}>${state.owned.includes(i)?'Owned':'Buy'}</button></article>`).join('')}</div>`}
function renderProgress(){const accuracy=state.completed.length?'92%':'—';return `<span class="eyebrow">Grown-up view</span><h1>Reading Progress</h1><div class="grid"><article class="card"><h2>${state.completed.length}</h2><p>Lessons completed</p></article><article class="card"><h2>${state.completed.length*10}</h2><p>Words practiced</p></article><article class="card"><h2>${accuracy}</h2><p>Practice accuracy</p></article></div><section class="card" style="margin-top:20px"><h2>Current skill: ${lesson().pattern}</h2><p>Words to practice: ${lesson().words.join(', ')}</p><p>Progress is stored in this browser for the prototype.</p></section>`}

const screenNames=['Welcome','Listen and Look','Pattern Reveal','Keep Reading','Build a Word','Read the Words','Build Fluency','Read Sentences','Story','Spelling','Pattern Hunt','Challenge','Mastery Check','Celebration'];
function lessonFrame(body){const current=state.screen,backLabel=current===1?'Back to Case Board':`Back to Screen ${current-1}: ${screenNames[current-2]}`;return `<main class="main lessonShell"><div class="lessonHead"><button class="secondary" data-back aria-label="${backLabel}"><span aria-hidden="true">←</span> Back</button><span class="pill">Case ${state.lesson+1}: ${lesson().pattern}</span><button class="secondary" data-replay aria-label="Play this screen">🔊 Play</button></div><div class="progress"><span style="width:${Math.min(100,current/screenNames.length*100)}%"></span></div><section class="screenCard ${state.screen===3?'rimeReveal':''} ${state.screen===4?'keepReading':''} ${state.screen===14?'celebrate':''}">${body}</section></main>`}
function nextButton(next,label='Continue'){return `<div class="footerActions"><button class="primary" data-next="${next}">${label} →</button></div>`}
function startCasePrompt(){return `<div class="footerActions startCasePrompt"><span class="startCaseArrow" aria-hidden="true">➜</span><button class="primary startCaseButton" data-next="2">Start the Case</button></div>`}
function wordCards(words,highlight=false){return `<div class="wordRow">${words.map(w=>{if(!highlight)return`<div class="word">${w}</div>`;const e=ending();if(!w.toLowerCase().endsWith(e.toLowerCase()))return`<div class="word">${w}</div>`;const o=w.slice(0,-e.length),r=w.slice(-e.length);return`<div class="word rimeWord">${o}<mark data-rime="${r.toLowerCase()}">${r}</mark></div>`}).join('')}</div>`}
function flashWordCards(words){return `<div class="wordRow flashWordRow" aria-label="Words to listen for">${words.map(w=>`<div class="word flashWord" data-flash-word="${w}">${w}</div>`).join('')}</div>`}
function screenFourWordCards(words){return `<div class="wordRow" aria-label="Words to read together">${words.map((w,i)=>`<div class="word screenFourWord" data-screen-four-word="${i}">${w}</div>`).join('')}</div>`}
function lessonConfetti(screen){const colors=['#e4a83d','#287a67','#3c74b9','#e56b6f','#8f6ccf','#f3c84b'];return `<div class="confettiLayer" data-${screen}-confetti aria-hidden="true">${Array.from({length:42},(_,i)=>`<span class="confettiPiece" style="--x:${(i*37)%101}%;--delay:${(i*43)%520}ms;--duration:${1850+(i*71)%520}ms;--drift:${((i*29)%101)-50}px;--spin:${360+(i*97)%720}deg;--confetti:${colors[i%colors.length]}"></span>`).join('')}</div>`}
function screenThreeConfetti(){return lessonConfetti('screen-three')}
function screenFourConfetti(){return lessonConfetti('screen-four')}
function screenThreeContinuePrompt(){return `<div class="footerActions revealContinuePrompt" data-screen-three-prompt><span class="revealContinueArrow" aria-hidden="true">➜</span><button class="primary" data-next="4">Continue to Screen 4 →</button></div>`}
function renderLesson(){const l=lesson(),s=state.screen,tag=(n)=>`<span class="screenTag">SCREEN ${n} OF ${screenNames.length} · ${screenNames[n-1]}</span>`;
  if(s===1)return lessonFrame(`${tag(1)}<div class="bigReward">🕵️</div><h1>Welcome, Pattern Detective!</h1><p>Your next case is the <strong>${l.pattern}</strong> word family.</p>${startCasePrompt()}`);
  if(s===2)return lessonFrame(`${tag(2)}<h1>Listen carefully.</h1><p class="screenTwoQuestion">What do these words have in common?</p>${flashWordCards(l.words)}<p class="clue">Watch each word flash as you hear it.</p><div class="footerActions"><button class="secondary hearWordsButton" data-play-word-sequence aria-label="Hear the Words again"><span class="humanEarIcon" aria-hidden="true">👂</span><span>Hear the Words</span></button><button class="primary" data-next="3">I listened ✓ →</button></div>`);
  if(s===3)return lessonFrame(`${screenThreeConfetti()}${tag(3)}<h1>They all end with <mark>${l.pattern}</mark>.</h1>${wordCards(l.words,true)}<p class="clue">The beginning changes. The ${l.pattern} rime stays the same.</p><p class="rimeSequenceStatus" data-screen-three-status aria-live="polite">Their ending sound is the same. Listen to the words.</p>${screenThreeContinuePrompt()}`);
  if(s===4){const distractors=['-at','-op','-it'].filter(pattern=>pattern!==l.pattern).slice(0,2);return lessonFrame(`${screenFourConfetti()}${tag(4)}<h1>Keep Reading</h1>${screenFourWordCards(l.keepReadingWords)}<p class="screenFourQuestion" data-screen-four-status aria-live="polite">${SCREEN_FOUR_INTRO}</p><div class="choiceRow"><button class="choice" data-screen-four-choice data-correct disabled>${l.pattern}</button>${distractors.map(pattern=>`<button class="choice" data-screen-four-choice data-wrong disabled>${pattern}</button>`).join('')}</div>`)}
  if(s===5){const words=screenFiveWords(),os=words.map(onset),hasBuilt=Number.isInteger(state.buildIndex)&&state.buildIndex>=0&&state.buildIndex<words.length,builtWord=hasBuilt?words[state.buildIndex]:'',rime=ending(),builtOnset=hasBuilt?builtWord.slice(0,-rime.length):'',builtRime=hasBuilt?builtWord.slice(-rime.length):rime;return lessonFrame(`${tag(5)}<h1>Build a Word</h1><div class="word buildWordBox ${hasBuilt?'built':''}" data-built-word aria-live="polite" aria-label="${hasBuilt?`Built word: ${builtWord}`:`Word building box for ${l.pattern}; beginning blank`}"><span class="buildOnset">${builtOnset}</span><span class="buildRime">${builtRime}</span></div><p class="buildInstruction" data-screen-five-status aria-live="polite">${hasBuilt?`You built ${builtWord}. Listen to the word.`:SCREEN_FIVE_NARRATION}</p><div class="choiceRow" aria-label="Beginning choices">${os.map((o,i)=>`<button class="choice buildChoice ${state.buildIndex===i?'selected':''}" data-build="${i}" aria-pressed="${state.buildIndex===i}" aria-label="Beginning ${o}">${o}</button>`).join('')}</div><div class="clue">Choose a beginning. It will join the ${l.pattern} rime to make a complete word.</div>${nextButton(6)}`)}
  if(s===6){const words=previousScreenWords(),word=words[state.readIndex%words.length],position=state.readIndex+1;return lessonFrame(`${tag(6)}<h1>Read each word</h1><div class="word" data-screen-six-word tabindex="-1" aria-live="polite" aria-label="Word ${position} of ${words.length}: ${word}">${word}</div><p>Word ${position} of ${words.length}</p><div class="footerActions"><button class="secondary hearWordsButton" data-speak="${word}" aria-label="Hear the word ${word}"><span class="humanEarIcon" aria-hidden="true">👂</span><span>Hear the word</span></button><button class="primary" data-read>I read it ✓ →</button></div>`)}
  if(s===7)return lessonFrame(`${tag(7)}<h1>Build fluency</h1><p>Read these as smoothly as you can.</p>${wordCards([...l.words,...l.words])}${nextButton(8,'Done reading')}`);
  if(s===8){const lines=SENTENCE_SETS[state.lesson];return lessonFrame(`${tag(8)}<h1>Read the sentences</h1>${lines.map(x=>`<div class="sentence">${x}</div>`).join('')}<div class="footerActions"><button class="secondary" data-speak="${lines.join(' ')}">🔊 Read to me</button><button class="primary" data-next="9">I reread them →</button></div>`)}
  if(s===9){const story=`Detective Dot opened the clue file. The first card said ${l.words[0]}. The next card said ${l.words[1]}. The last card said ${l.words[2]}. Dot read every ${l.pattern} clue and solved the case.`;return lessonFrame(`${tag(9)}<h1>The ${l.pattern} Case</h1><div class="story">${story}</div><div class="footerActions"><button class="secondary" data-speak="${story}">🔊 Read to me</button><button class="primary" data-next="10">I read it →</button></div>`)}
  if(s===10){const target=l.words[state.spellIndex%l.words.length];return lessonFrame(`${tag(10)}<h1>Spell ${target}</h1><div class="word">${state.spellAnswer||'_'}</div><div class="tileRow">${target.split('').sort(()=>.5-Math.random()).map(ch=>`<button class="choice" data-letter="${ch}">${ch}</button>`).join('')}</div><div class="footerActions"><button class="secondary" data-clear>Clear</button><button class="primary" data-checkspell="${target}">Check spelling</button></div>`)}
  if(s===11){const distract=['cat','dog','map','sun','fan'];const words=[...l.words,...distract];return lessonFrame(`${tag(11)}<h1>Pattern hunt</h1><p>Find every ${l.pattern} word.</p><div class="choiceRow">${words.map(w=>`<button class="choice ${state.hunt.includes(w)?'selected':''}" data-hunt="${w}">${w}</button>`).join('')}</div><p>${state.hunt.length} clues found</p>${state.hunt.length>=l.words.length?nextButton(12):''}`)}
  if(s===12){const big=['ch','tr','sl','gr','dr'].map(o=>o+ending());return lessonFrame(`${tag(12)}<h1>Challenge clues</h1><p>You know ${l.pattern}. Try these bigger transfer words.</p>${wordCards(big)}<p class="clue">These are prototype transfer examples. A reading specialist should approve each final challenge list before production.</p>${nextButton(13)}`)}
  if(s===13){const w=l.words[state.mastery%l.words.length];return lessonFrame(`${tag(13)}<h1>Mastery check</h1><p>No hints. Read the word.</p><div class="word">${w}</div><p>${state.mastery+1} of 10</p><button class="primary" data-mastered>✓ I read it</button>`)}
  return lessonFrame(`${tag(14)}<div class="bigReward">🎉🔎</div><h1>Case solved!</h1><p>You discovered the <strong>${l.pattern}</strong> pattern.</p><div class="choiceRow"><span class="pill coin">🪙 +10 coins</span><span class="badge">🏅 Pattern Detective Badge</span><span class="pill">⭐ 10 stars</span></div><button class="primary" data-collect>Collect rewards</button>`)
}

function startScreenTwoSequence(){
  stopNarration();
  const run=++screenTwoRun,cards=[...document.querySelectorAll('[data-flash-word]')];
  if(state.view!=='lesson'||state.screen!==2||!cards.length)return;
  cards.forEach(card=>card.classList.remove('active','seen'));
  const isCurrent=()=>run===screenTwoRun&&state.view==='lesson'&&state.screen===2;
  const playWord=(index)=>{
    if(!isCurrent())return;
    if(index>=cards.length){cards.forEach(card=>card.classList.remove('active'));return}
    const card=cards[index];
    speak(card.dataset.flashWord,.68,{
      onStart:()=>{if(!isCurrent())return;cards.forEach(item=>item.classList.remove('active'));card.classList.add('active','seen')},
      onComplete:(result={})=>{if(!isCurrent())return;if(result.error){card.classList.remove('active');return}screenTwoTimer=setTimeout(()=>{if(!isCurrent())return;card.classList.remove('active');playWord(index+1)},600)}
    });
  };
  speak(SCREEN_TWO_NARRATION,.78,{onComplete:(result={})=>{if(!isCurrent()||result.error)return;screenTwoTimer=setTimeout(()=>playWord(0),500)}});
}

function startScreenThreeSequence(){
  stopNarration();
  const run=++screenThreeRun,lessonIndex=state.lesson,words=[...lesson().words];
  const root=document.querySelector('.rimeReveal');
  if(state.view!=='lesson'||state.screen!==3||!root)return;
  screenThreeRoot=root;
  const confetti=root.querySelector('[data-screen-three-confetti]'),prompt=root.querySelector('[data-screen-three-prompt]'),status=root.querySelector('[data-screen-three-status]');
  if(!confetti||!prompt||!status)return;
  confetti.classList.remove('active');
  prompt.classList.remove('ready','fallback');
  status.textContent='Their ending sound is the same. Listen to the words.';
  const isCurrent=()=>run===screenThreeRun&&state.view==='lesson'&&state.screen===3&&state.lesson===lessonIndex&&root.isConnected;
  const wait=(next,delay)=>{screenThreeTimer=setTimeout(()=>{if(isCurrent())next()},delay)};
  const fail=()=>{
    if(!isCurrent())return;
    confetti.classList.remove('active');
    prompt.classList.add('ready','fallback');
    status.textContent='Narration is unavailable. Select Play to try again, or continue to Screen 4.';
    toast('Narration is unavailable. You can use Play or continue.');
  };
  const speakStage=(text,label,next,rate=.7,pause=320)=>{
    if(!isCurrent())return;
    status.textContent=label;
    speak(text,rate,{onComplete:(result={})=>{
      if(!isCurrent())return;
      if(result.error||result.unavailable){fail();return}
      wait(next,pause);
    }});
  };
  const finishReveal=()=>{
    if(!isCurrent())return;
    confetti.classList.remove('active');
    prompt.classList.add('ready');
    status.textContent='Pattern revealed! Continue to Screen 4.';
  };
  const celebrate=()=>{
    if(!isCurrent())return;
    status.textContent='Celebration time!';
    confetti.classList.add('active');
    screenThreeTimer=setTimeout(()=>{if(isCurrent())finishReveal()},SCREEN_THREE_CONFETTI_MS);
  };
  const readWord=(index)=>{
    if(index>=words.length){celebrate();return}
    const word=words[index];
    speakStage(word,`Word ${index+1}: ${word}`,()=>readWord(index+1),.68,350);
  };
  speakStage(SCREEN_THREE_ENDING_NARRATION,SCREEN_THREE_ENDING_NARRATION,()=>readWord(0),.78,400);
}

function startScreenFourSequence(){
  stopNarration();
  const run=++screenFourRun,lessonIndex=state.lesson,words=[...keepReadingWords()],root=document.querySelector('.keepReading');
  const status=document.querySelector('[data-screen-four-status]'),choices=[...document.querySelectorAll('[data-screen-four-choice]')],cards=[...document.querySelectorAll('[data-screen-four-word]')],confetti=root?.querySelector('[data-screen-four-confetti]');
  if(state.view!=='lesson'||state.screen!==4||!root||!status||!confetti||choices.length!==3||cards.length!==words.length)return;
  screenFourRoot=root;
  confetti.classList.remove('active');
  root.classList.remove('celebrating');
  const clearWordHighlights=()=>cards.forEach(card=>card.classList.remove('active'));
  clearWordHighlights();
  choices.forEach(choice=>choice.disabled=true);
  status.textContent=SCREEN_FOUR_INTRO;
  const isCurrent=()=>run===screenFourRun&&state.view==='lesson'&&state.screen===4&&state.lesson===lessonIndex&&root.isConnected&&status.isConnected;
  const wait=(next,delay)=>{screenFourTimer=setTimeout(()=>{if(isCurrent())next()},delay)};
  const enableChoices=()=>{choices.forEach(choice=>choice.disabled=false)};
  const fail=()=>{if(!isCurrent())return;clearWordHighlights();status.textContent=SCREEN_FOUR_QUESTION;enableChoices();toast('Narration is unavailable. Read the words, then click the part below that stays the same.')};
  const speakStage=(text,label,next=null,rate=.72,pause=350,activeCard=null)=>{
    if(!isCurrent())return;
    status.textContent=label;
    speak(text,rate,{onStart:(result={})=>{
      if(!isCurrent()||result.unavailable||!activeCard)return;
      clearWordHighlights();
      activeCard.classList.add('active');
    },onComplete:(result={})=>{
      if(!isCurrent())return;
      if(activeCard)activeCard.classList.remove('active');
      if(result.error||result.unavailable){fail();return}
      if(next)wait(next,pause);
    }});
  };
  const finishQuestion=()=>{if(!isCurrent())return;clearWordHighlights();status.textContent=SCREEN_FOUR_QUESTION;enableChoices()};
  const askQuestion=()=>speakStage(SCREEN_FOUR_QUESTION,SCREEN_FOUR_QUESTION,finishQuestion,.78,0);
  const readWord=(index)=>{
    if(index>=words.length){askQuestion();return}
    speakStage(words[index],`Word ${index+1}: ${words[index]}`,()=>readWord(index+1),.68,350,cards[index]);
  };
  speakStage(SCREEN_FOUR_INTRO,SCREEN_FOUR_INTRO,()=>readWord(0),.78,400);
}

function completeScreenFour(){
  stopNarration();
  const run=++screenFourRun,lessonIndex=state.lesson,root=document.querySelector('.keepReading');
  const status=document.querySelector('[data-screen-four-status]'),choices=[...document.querySelectorAll('[data-screen-four-choice]')],cards=[...document.querySelectorAll('[data-screen-four-word]')],confetti=root?.querySelector('[data-screen-four-confetti]');
  if(state.view!=='lesson'||state.screen!==4||!root||!status||!confetti||choices.length!==3)return;
  screenFourRoot=root;
  choices.forEach(choice=>choice.disabled=true);
  cards.forEach(card=>card.classList.remove('active'));
  status.textContent='Correct! Get ready to build a word.';
  root.classList.add('celebrating');
  confetti.classList.add('active');
  toast('Correct clue! ⭐');
  screenFourTimer=setTimeout(()=>{
    if(run!==screenFourRun||state.view!=='lesson'||state.screen!==4||state.lesson!==lessonIndex||!root.isConnected)return;
    confetti.classList.remove('active');
    goToLessonScreen(5);
  },SCREEN_FOUR_CONFETTI_MS);
}

function startScreenFiveSequence(){
  stopNarration();
  const status=document.querySelector('[data-screen-five-status]');
  if(state.view!=='lesson'||state.screen!==5||!status)return;
  status.textContent=SCREEN_FIVE_NARRATION;
  speak(SCREEN_FIVE_NARRATION,.78);
}

function startScreenSixSequence(){
  stopNarration();
  if(state.view!=='lesson'||state.screen!==6)return;
  speak(SCREEN_SIX_NARRATION,.78);
}

function startScreenSevenSequence(){
  stopNarration();
  if(state.view!=='lesson'||state.screen!==7)return;
  speak(SCREEN_SEVEN_NARRATION,.78);
}

function startAutomaticLessonSequence(){
  if(state.view!=='lesson')return;
  if(state.screen===1)speak(SCREEN_ONE_NARRATION);
  else if(state.screen===2)startScreenTwoSequence();
  else if(state.screen===3)startScreenThreeSequence();
  else if(state.screen===4)startScreenFourSequence();
  else if(state.screen===5)startScreenFiveSequence();
  else if(state.screen===6)startScreenSixSequence();
  else if(state.screen===7)startScreenSevenSequence();
}

function goToLessonScreen(next){
  stopNarration();
  const target=+next;
  if(state.screen===5&&target!==5)resetScreenFive();
  if(target===5&&state.screen!==5)prepareScreenFive();
  if((state.screen===6&&target!==6)||(target===6&&state.screen!==6))state.readIndex=0;
  state.screen=target;
  render();
  scrollPageToTop();
  startAutomaticLessonSequence();
}

function scrollPageToTop(){if(typeof window.scrollTo==='function')window.scrollTo(0,0)}

function goBackFromLesson(){
  if(state.screen>1){goToLessonScreen(state.screen-1);return}
  stopNarration();
  state.view='home';
  render();
  scrollPageToTop();
}

function buildLessonWord(index){
  const word=state.buildWords[index];
  if(!Number.isInteger(index)||!word)return;
  stopNarration();
  state.buildIndex=index;
  render();
  toast(`${word} — word built!`);
  speak(word,.68);
}

function bind(){
  document.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>{stopNarration();state.view=x.dataset.view;render()});
  document.querySelectorAll('[data-start]').forEach(x=>x.onclick=()=>{stopNarration();state.view='lesson';state.screen=1;resetLesson();render();scrollPageToTop();startAutomaticLessonSequence()});
  document.querySelectorAll('[data-lesson]').forEach(x=>x.onclick=()=>{stopNarration();state.lesson=+x.dataset.lesson;state.view='lesson';state.screen=1;resetLesson();save();render();scrollPageToTop();startAutomaticLessonSequence()});
  document.querySelectorAll('[data-back]').forEach(x=>x.onclick=goBackFromLesson);
  document.querySelectorAll('[data-next]').forEach(x=>x.onclick=()=>goToLessonScreen(x.dataset.next));
  document.querySelectorAll('[data-speak]').forEach(x=>x.onclick=()=>speak(x.dataset.speak));
  document.querySelectorAll('[data-play-word-sequence]').forEach(x=>x.onclick=()=>startScreenTwoSequence());
  document.querySelectorAll('[data-replay]').forEach(x=>x.onclick=()=>{if(state.screen===2)startScreenTwoSequence();else if(state.screen===3)startScreenThreeSequence();else if(state.screen===4)startScreenFourSequence();else if(state.screen===5)startScreenFiveSequence();else if(state.screen===6)startScreenSixSequence();else if(state.screen===7)startScreenSevenSequence();else speak(state.screen===1?SCREEN_ONE_NARRATION:`Screen ${state.screen}. Follow the clue.`)});
  document.querySelectorAll('[data-correct]').forEach(x=>x.onclick=completeScreenFour);
  document.querySelectorAll('[data-wrong]').forEach(x=>x.onclick=()=>toast('Look at the ending and try again.'));
  document.querySelectorAll('[data-build]').forEach(x=>x.onclick=()=>buildLessonWord(+x.dataset.build));
  document.querySelectorAll('[data-read]').forEach(x=>x.onclick=()=>{stopNarration();state.readIndex++;if(state.readIndex>=previousScreenWords().length){state.readIndex=0;goToLessonScreen(7);return}render();document.querySelector('[data-screen-six-word]')?.focus()});
  document.querySelectorAll('[data-letter]').forEach(x=>x.onclick=()=>{state.spellAnswer+=x.dataset.letter;render()});
  document.querySelectorAll('[data-clear]').forEach(x=>x.onclick=()=>{state.spellAnswer='';render()});
  document.querySelectorAll('[data-checkspell]').forEach(x=>x.onclick=()=>{if(state.spellAnswer===x.dataset.checkspell){toast('Spelling solved! ⭐');state.spellAnswer='';state.spellIndex++;if(state.spellIndex>=3){state.spellIndex=0;goToLessonScreen(11);return}render()}else toast('Listen to each sound and try again.')});
  document.querySelectorAll('[data-hunt]').forEach(x=>x.onclick=()=>{const w=x.dataset.hunt;if(w.toLowerCase().endsWith(ending())&&!state.hunt.includes(w)){state.hunt.push(w);toast('Pattern clue found!')}else if(!w.toLowerCase().endsWith(ending()))toast('That word belongs to another case.');render()});
  document.querySelectorAll('[data-mastered]').forEach(x=>x.onclick=()=>{state.mastery++;if(state.mastery>=10){state.mastery=0;goToLessonScreen(14);return}render()});
  document.querySelectorAll('[data-collect]').forEach(x=>x.onclick=()=>{const lessonIndex=state.lesson;if(!state.completed.includes(lessonIndex)){state.completed.push(lessonIndex);state.coins+=10}save();toast('10 coins added to your case wallet!');setTimeout(()=>{if(state.view!=='lesson'||state.screen!==14||state.lesson!==lessonIndex)return;state.lesson=Math.min(lessonIndex+1,LESSONS.length-1);state.view='home';render();scrollPageToTop()},700)});
  document.querySelectorAll('[data-avatar]').forEach(x=>x.onclick=()=>{state.avatar=+x.dataset.avatar;save();render()});
  document.querySelectorAll('[data-buy]').forEach(x=>x.onclick=()=>{const i=+x.dataset.buy,cost=SHOP[i][2];if(state.coins<cost)return toast('Solve more cases to earn coins.');state.coins-=cost;state.owned.push(i);save();toast(`${SHOP[i][1]} added to your collection!`);render()});
}
function resetLesson(){Object.assign(state,{readIndex:0,buildWords:[],buildIndex:null,spellIndex:0,spellAnswer:'',hunt:[],mastery:0})}
render();
