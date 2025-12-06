/*global bootstrap, ClipboardJS*/

var requestId;

function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function createTuneObj(tuneStr) {
  var tuneArr = tuneStr.trim().split(/\s+/);
  var tuneObj = Object();
  tuneObj.tempo = parseInt(tuneArr[0]);
  tuneObj.tune = [];
  tuneArr = tuneArr.splice(1);
  while (tuneArr.length > 0) {
    tuneObj.tune.push({
      frequency: parseInt(tuneArr[0]),
      duration: parseInt(tuneArr[1])
    });
    tuneArr = tuneArr.splice(2);
  }
  return tuneObj;
}

function calculateDuration(tuneObj) {
  var playlength = Number();
  for (var i = 0; i < tuneObj.tune.length; i++) {
    playlength += 1 / (tuneObj.tempo / 60) * tuneObj.tune[i].duration;
  }
  document.getElementById('notes').textContent = tuneObj.tune.length;
  document.getElementById('duration').textContent = Math.round(playlength * 1000) + 'ms';
  document.getElementById('duration').title = (playlength % 1 == 0 ? playlength : playlength.toFixed(3)) + 's';
}

function play(tuneObj) {
  let audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
    baseTime = audioCtx.currentTime,
    arrayLength = tuneObj.tune.length,
    playlength = 0,
    gainNode = audioCtx.createGain();
  for (var i = 0; i < arrayLength; i++) {
    let oscillator = audioCtx.createOscillator();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.125;
    playlength = 1 / (tuneObj.tempo / 60) * tuneObj.tune[i].duration;
    oscillator.type = 'square';
    oscillator.frequency.value = tuneObj.tune[i].frequency;
    if (i == arrayLength - 1) {
      oscillator.onended = () => {
        document.getElementById('tune-select').classList.remove('disabled');
        document.getElementById('tune-select').removeAttribute('disabled');
        document.getElementById('play').classList.remove('d-none');
        document.getElementById('stop').classList.add('d-none');
        cancelAnimationFrame(requestId);
      };
    }
    tuneObj.tune[i].oscillator = oscillator;
    oscillator.start(baseTime);
    oscillator.stop(baseTime + playlength);
    baseTime += playlength;
  }
  document.getElementById('stop').addEventListener('click', () => {
    for (let note of tuneObj.tune) {
      note.oscillator.stop();
    }
  }, {
    once: true
  });
}

function loadSelect() {
  const urlSearchParams = new URLSearchParams(window.location.search),
    params = Object.fromEntries(urlSearchParams.entries()),
    tuneParam = params['tune'];
  let data = [{
      title: 'Default tune',
      tune: '480 440 1'
    }, {
      title: 'Mario Coin FX',
      tune: '600 988 1 1319 4'
    }, {
      title: 'Mario Bros Powerup FX',
      tune: '1750 523 1 392 1 523 1 659 1 784 1 1047 1 784 1 415 1 523 1 622 1 831 1 622 1 831 1 1046 1 1244 1 1661 1 1244 1 466 1 587 1 698 1 932 1 1175 1 1397 1 1865 1 1397 1'
    }, {
      title: 'Mario Bros Music Intro',
      tune: '410 668 1 668 1 0 1 668 1 0 1 522 1 668 1 0 1 784 2 0 2 392 2'
    }, {
      title: 'Imperial March 1st Verse',
      tune: '550 392 3 0 1 392 3 0 1 392 3 0 1 311 3 466 1 392 3 0 1 311 3 466 1 392 6 0 2 587 3 0 1 587 3 0 1 587 3 0 1 622 3 466 1 370 3 0 1 311 3 466 1 392 4'
    }, {
      title: 'Close Encounters',
      tune: '400 880 2 988 2 783 2 392 2 587 3'
    }, {
      title: 'Wolfestein 3D Music Intro',
      tune: '300 131 1 196 1 196 1 196 1 294 1 196 1 294 1 196 1 131 2'
    }, {
      title: 'Super Mario',
      tune: '1000 334 1 334 1 0 1 334 1 0 1 261 1 334 1 0 1 392 2 0 4 196 2'
    }, {
      title: 'Wolfenstein 3D',
      tune: '300 131 1 196 1 196 1 196 1 294 1 196 1 294 1 196 1 131 1'
    }, {
      title: 'Legend of Zelda - Secret Reveal',
      tune: '1000 784 2 740 2 622 2 440 2 415 2 659 2 831 2 1046 5'
    }, {
      title: 'Classic Megaman menu sound',
      tune: '640 440 1 330 1 277 1 880 1'
    }, {
      title: 'Zelda Secret/Unlock Jingle',
      tune: '500 784 1 740 1 622 1 440 1 415 1 659 1 831 1 1047 3'
    }, {
      title: 'Classic Game Boy Opening Tune',
      tune: '600 1046 1 2093 5'
    }, {
      title: 'Close Encounters (Early)',
      tune: '220 900 2 1000 2 800 2 400 2 600 3'
    }, {
      title: 'Fur Elise',
      tune: '480 420 1 400 1 420 1 400 1 420 1 315 1 370 1 335 1 282 3 180 1 215 1 282 1 315 3 213 1 262 1 315 1 335 3 213 1 420 1 400 1 420 1 400 1 420 1 315 1 370 1 335 1 282 3 180 1 215 1 282 1 315 3 213 1 330 1 315 1 282 3'
    }, {
      title: 'Star Wars - Imperial March',
      tune: '480 440 4 440 4 440 4 349 3 523 1 440 4 349 3 523 1 440 8 659 4 659 4 659 4 698 3 523 1 415 4 349 3 523 1 440 8'
    }, {
      title: 'Mac Startup Sound',
      tune: '240 500 1 400 1 600 1 800 1 800 1'
    }, {
      title: 'Mac Shutdown Sound',
      tune: '240 600 1 800 1 500 1 400 1 400 1'
    }, {
      title: 'The Buddy Holly Lick',
      tune: '240 415 1 329 1 415 1 466 1 523 1 466 1 415 1 329 1 311 2'
    }, {
      title: 'We Wish You a Merry Christmas',
      tune: '300 500 2 670 1 0 1 670 1 750 1 670 1 640 1 570 1 0 1 570 1 0 2 570 1 750 1 0 1 750 1 850 1 750 1 670 1 640 1 0 1 500 1 0 1 500 1 0 1 840 1 0 1 840 1 900 1 840 1 740 1 670 1 0 1 570 1 0 1 500 1 500 1 570 1 750 1 0 2 640 1 0 1 670 1'
    }, {
      title: 'Mojang Startup Sound',
      tune: '144000 262 240 330 240 523 240 392 720 311 240 392 240 622 240 466 720 311 240 440 240 698 240 523 720 784 240 587 240 659 240 1047 720'
    }, {
      title: 'SpongeBob - Bikini Bottom Theme',
      tune: '460 587 1 494 1 392 2 494 2 587 2 784 2 784 1 880 1 784 1 740 1 784 3 784 1 659 2 523 2 659 2 784 2 784 1 880 1 784 1 740 1 784 2 784 1 659 1 740 2 587 2 740 2 880 2 1175 1 1319 1 1175 1 1047 1 1175 3 1047 1 988 8'
    }, {
      title: 'Venga Boys - We Like To Party',
      tune: '7500 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 349 2 220 1 349 2 220 1 349 2 220 1 349 2 220 1 349 2 220 1 0 15 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 0 15 349 2 220 1 349 2 220 1 349 2 220 1 349 2 220 1 0 15 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 0 15 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 0 6 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 0 30 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 349 2 220 1 349 2 220 1 349 2 220 1 349 2 220 1 349 2 220 1 0 15 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 0 15 349 2 220 1 349 2 220 1 349 2 220 1 349 2 220 1 0 15 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 0 15 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 0 6 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 262 2 208 1 0 30 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 349 2 294 1 349 2 294 1 349 2 294 1 349 2 294 1 349 2 294 1 0 15 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 0 15 349 2 294 1 349 2 294 1 349 2 294 1 349 2 294 1 349 2 294 1 0 15 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 311 2 262 1 0 15 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 0 6 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 392 2 311 1 0 30'
    }, {
      title: 'Touhou 6 - menu',
      tune: '13632 0 568 175 4 208 4 262 28 466 32 262 4 523 32 262 4 622 32 262 4 523 32 262 4 466 32 262 40 466 32 262 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 262 36 466 32 262 2 0 2 415 36 466 32 415 2 0 2 392 36 622 32 392 2 0 2 233 36 466 32 233 2 0 2 392 36 466 32 392 2 0 2 349 36 622 32 349 2 0 2 208 36 466 32 208 4 349 32 208 4 466 32 0 4 175 4 208 4 262 4 349 24 622 32 349 4 523 32 349 4 466 32 349 40 466 32 349 4 523 32 349 4 622 32 349 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 262 36 466 32 262 4 523 24 208 12 622 32 208 2 0 2 196 36 466 32 196 2 0 2 175 36 466 32 175 4 523 24 156 12 622 32 156 4 523 32 156 4 466 12 117 24 349 32 117 4 466 12 131 24 523 32 131 4 622 32 131 2 0 2 139 4 175 4 208 4 277 24 466 32 277 4 349 32 277 4 466 32 277 4 523 32 277 4 622 32 277 4 523 32 277 4 466 32 277 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 175 36 622 32 175 2 0 2 208 36 466 32 208 2 0 2 277 36 466 32 277 2 0 2 311 36 622 32 311 2 0 2 349 36 466 32 349 2 0 2 415 36 466 32 415 2 0 2 349 36 622 32 349 4 523 32 349 4 466 32 0 4 139 4 175 4 208 4 277 24 466 32 277 4 523 32 277 4 622 32 277 4 523 32 277 4 466 32 277 4 349 32 277 4 466 32 277 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 208 36 466 32 208 4 349 24 277 12 466 32 277 2 0 2 349 36 622 32 349 2 0 2 415 36 466 32 415 4 349 24 466 48 523 32 466 4 622 12 554 24 523 32 554 4 466 36 349 32 466 38 0 2 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 32 0 4 466 32 0 4 523 32 0 4 622 32 0 4 523 32 0 4 466 32 0 4 349 24 784 94 0 2 831 46 0 2 932 46 0 2 831 46 0 2 784 46 0 2 698 46 0 2 622 46 0 2 698 46 0 2 698 48 262 46 698 2 208 46 698 2 262 46 0 2 784 48 262 46 784 2 196 46 784 2 262 46 0 2 698 48 262 46 698 2 175 46 698 2 262 46 0 2 622 48 262 46 622 2 156 46 622 2 262 46 0 2 587 48 233 46 587 2 147 46 587 2 233 46 587 2 147 46 587 2 233 46 587 2 147 24 175 24 932 24 233 24 139 24 208 24 1047 44 208 2 0 2 1245 44 139 2 0 2 1047 44 208 2 0 2 932 24 196 24 1047 24 311 24 932 24 233 24 698 48 208 46 698 2 262 46 698 2 208 46 698 2 262 46 0 2 784 48 262 46 784 2 196 46 784 2 262 46 0 2 698 48 262 46 698 2 175 46 698 2 262 46 0 2 622 48 262 46 622 2 156 46 622 2 262 46 0 2 587 48 233 46 587 2 147 46 587 2 233 46 587 2 147 46 587 2 233 46 587 2 147 24 175 24 932 24 233 24 139 24 208 24 1047 44 208 2 0 2 1245 44 139 2 0 2 1047 44 208 2 0 2 932 24 196 24 1047 24 311 24 932 24 233 24 831 48 208 24 175 24 131 24 175 24 104 24 175 24 131 24 175 24 784 24 175 24 131 24 175 24 98 24 175 24 131 24 175 24 698 24 131 24 87 24 175 24 87 24 175 24 131 24 175 24 622 24 175 24 131 24 175 24 78 24 175 24 131 24 175 24 587 24 117 24 73 24 147 24 117 24 147 24 73 24 147 24 73 24 147 24 117 24 147 24 73 24 147 24 932 24 147 24 69 24 104 24 1047 24 104 24 1245 24 104 24 1047 24 104 24 932 24 117 24 1047 24 117 24 932 24 156 24 831 24 98 24 1397 24 175 24 131 24 175 24 104 24 175 24 131 24 175 24 784 24 175 24 131 24 175 24 98 24 175 24 131 24 175 24 698 24 131 24 87 24 175 24 87 24 175 24 131 24 175 24 622 24 175 24 131 24 175 24 78 24 175 24 131 24 175 24 587 24 117 24 73 24 147 24 117 24 147 24 73 24 147 24 73 24 147 24 117 24 147 24 73 24 147 24 932 24 147 24 69 24 104 24 1047 24 104 24 1245 24 104 24 1047 24 104 24 932 24 117 24 1047 24 117 24 932 24 156 24 831 24 98 24'
    }, {
      title: 'Terminator 2 - Bass intro',
      tune: '320 73 1 73 1 0 1 73 1 0 1 73 1 73 2 0 4 73 1 73 1 0 1 73 1 0 1 73 1 73 2 0 2'
    }, {
      title: 'The Lick',
      tune: '900 580 2 650 2 685 2 770 2 580 1 650 3 510 2 580 6'
    }, {
      title: 'TempleOS - Risen',
      tune: '960 587 3 659 3 698 6 698 6 659 2 659 2 698 2 587 6 523 3 587 3 587 3 659 3 523 2 783 2 698 2 587 4'
    }, {
      title: 'Still DRE',
      tune: '1100 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 523 1 660 1 880 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2 494 1 660 1 785 1 0 2'
    }, {
      title: 'DOOM - E1M1',
      tune: '400 164 1 164 1 330 2 164 1 294 2 164 1 262 2 164 1 233 2 164 1 247 1 262 1 164 1 164 1 330 2 164 1 294 2 164 1 262 2 164 1 233 6'
    }, {
      title: 'Pizza Tower - The Noise',
      tune: '43008 65 192 49 192 65 192 49 96 62 96 52 192 52 192 49 192 0 192 55 192 52 192 55 192 52 96 62 96 58 96 82 96 58 192 44 96 39 96 35 96 33 96 49 192 175 192 196 192 175 96 62 96 208 192 208 192 196 192 92 96 0 96 262 192 196 192 262 192 196 96 62 96 220 96 82 96 220 192 208 192 92 96 208 96'
    }, {
      title: 'Rude Buster',
      tune: '3000 0 1 261 1 196 1 146 1 110 1 92 8 220 1 246 1 329 1 185 1 0 2 261 1 196 1 146 1 110 1 92 2 261 1 196 1 146 1 110 1 0 2 220 1 246 1 329 1 185 1 0 2 261 1 196 1 146 1 110 1 98 8 261 1 196 1 146 1 98 1 0 2 98 12 220 1 246 1 329 1 98 1 0 2 261 1 196 1 146 1 110 1 98 8 261 1 196 1 146 1 110 1 277 1 370 1 196 1 277 1 370 1 196 1 277 1 370 1 261 1 196 1 146 1 110 1 61 8 138 1 146 1 220 1 123 1 0 2 261 1 196 1 146 1 110 1 61 2 261 1 196 1 146 1 110 1 0 2 138 1 146 1 220 1 123 1 0 2 261 1 196 1 146 1 110 1 69 8 261 1 196 1 146 1 138 1 0 2 69 12 155 1 174 1 233 1 138 1 0 2 261 1 196 1 146 1 110 1 82 6 92 2 261 1 196 1 146 1 110 1 220 1 277 1 185 1 220 1 277 1 185 1 220 1 277 1 261 1 196 1 146 1 110 1 92 8 220 1 246 1 329 1 185 1 0 2 261 1 196 1 146 1 110 1 92 2 261 1 196 1 146 1 110 1 0 2 220 1 246 1 329 1 185 1 0 2 261 1 196 1 146 1 110 1 98 8 261 1 196 1 146 1 98 1 0 2 98 12 220 1 246 1 329 1 98 1 0 2 261 1 196 1 146 1 110 1 98 8 261 1 196 1 146 1 110 1 277 1 370 1 196 1 277 1 370 1 196 1 277 1 370 1 261 1 196 1 73 1 146 1 185 1 220 1 277 1 146 1 185 1 220 1 277 1 146 1 0 6 261 1 196 1 69 1 138 1 164 1 207 1 246 1 138 1 164 1 207 1 246 1 138 1 164 1 207 1 246 1 138 1 164 1 207 1 261 1 196 1 146 1 110 1 0 8 261 1 196 1 92 1 185 1 220 1 277 1 329 1 185 1 220 1 277 1 329 1 185 1 220 1 277 1 329 1 185 1 220 1 277 1 329 1 185 1 220 1 277 1 329 1 185 1 261 1 196 1 146 1 110 1 207 2 0 6 185 1 220 2 185 1 220 2 185 1 220 2 185 1'
    }, {
      title: 'Mall (Nothing Special)',
      tune: '180 440 1 554 1 659 1'
    }, {
      title: 'Free Software Song',
      tune: '252 587 2 523 1 493 2 440 2 493 2 523 1 493 1 440 1 392 3 440 3 493 1 523 3 493 2 587 2 440 3 400 4 587 2 523 1 493 1 587 2 523 1 493 2 440 2 493 2 523 1 493 1 440 1 392 2 392 3 440 3 493 1 523 3 493 2 587 2 440 3 440 4 440 3 440 4'
    }, {
      title: 'Famima Entrance Chime',
      tune: '420 392 1 311 1 233 1 311 1 349 1 466 1 0 1 174'
    }, {
      title: 'Family Mart Jingle',
      tune: '57600 740 323 587 368 380 346 587 356 554 34 659 290 554 33 880 692 0 11 330 346 440 356 740 334 440 23 659 347 440 346 0 11 587 700'
    }, {
      title: 'Mozart (short)',
      tune: '60000 493 99 440 99 415 99 440 113 523 10 220 10 523 10 220 10 523 10 220 10 523 10 220 10 523 10 220 9 1 99 261 10 329 10 261 10 329 10 261 10 329 10 261 10 329 10 261 10 329 9 1 113 587 10 329 10 261 10 587 10 329 10 261 10 587 10 329 10 261 10 587 10 523 100 493 10 329 10 261 10 493 10 329 10 261 10 493 10 329 10 261 10 493 10 523 114 659 10 220 10 659 10 220 10 659 10 220 10 659 10 220 10 659 10 220 9 1 99 261 10 329 10 261 10 329 10 261 10 329 10 261 10 329 10 261 10 329 9 1 110 698 10 261 10 329 10 698 10 261 10 329 10 698 10 261 10 329 10 698 9 659 99 622 10 261 10 329 10 622 10 261 10 329 10 622 10 261 10 329 10 622 9 659 104 987 10 220 10 987 10 220 10 987 10 220 10 987 10 220 10 987 10 220 9 880 99 830 10 261 10 329 10 830 10 261 10 329 10 830 10 261 10 329 10 830 9 880 99 987 10 220 10 987 10 220 10 987 10 220 10 987 10 220 10 987 10 220 10 987 1 880 101 830 10 261 10 329 10 830 10 261 10 329 10 830 10 261 10 329 10 830 10 261 1 880 115 220 10 1046 10 220 10 1046 10 220 10 1046 10 220 10 1046 10 220 10 1046 10 220 2 1046 102 261 10 329 10 1046 10 261 10 329 10 1046 10 261 10 329 10 1046 10 261 10 329 6 1046 116'
    }, {
      title: 'My Little Pony',
      tune: '2400 587 18 554 4 587 8 659 12 587 16 0 10 587 4 659 4 740 8 587 4 784 12 740 8 659 8 587 4 740 20 587 40'
    }, {
      title: 'Joe Hisaishi - One Summer Day',
      tune: '1536 349 3 698 1 523 2 784 1 1319 6'
    }, {
      title: 'Symphonie Fantastique (Bassoon)',
      tune: '312 262 3 247 3 262 3 220 3 247 3 196 3 220 3 220 3 262 3 262 3 294 3 262 3 247 3 220 3 196 3 247 3 262 3 247 5 220 1 220 5'
    }, {
      title: 'Sick Sounds',
      tune: '720 440 2 440 2 440 2 932 2 880 2 784 2 440 2 440 2 440 2 1047 2 880 2 932 2 440 2 440 2 440 2 698 2 587 2 554 2 659 2 698 2 659 2 784 2 698 2 659 2 440 2 440 2 440 2 1109 1 1175 1 1109 2 880 2 440 2 440 2 440 2 1397 2 1318 2 1175 2 1109 2 1175 2 932 2 1109 2 880 2 932 2 784 2 880 2 622 2 784 2 622 2 587 2'
    }, {
      title: 'My Start Sound',
      tune: '60000 900 70 0 50 900 70 0 380 1024 20 0 70 1152 20 0 70 1280 20 0 70 1024 20 0 70'
    }, {
      title: 'Tubular Bells (Exorcist)',
      tune: '300 328 1 440 1 328 1 494 1 328 1 390 1 440 1'
    }, {
      title: 'Sharpy\'s Fountain',
      tune: '1999 1760 5 0 1 1175 5 0 1 932 5 0 1 784 5 0 1 1568 5 0 1 1175 5 0 1 932 5 0 1 784 5 0 1 1397 5 0 1 1175 5 0 1 932 5 0 1 784 5 0 1 1568 5 0 1 1175 5 0 1 932 5 0 1 784 5 0 1 1568 5 0 1 1047 5 0 1 880 5 0 1 698 5 0 1 1397 5 0 1 1047 5 0 1 880 5 0 1 698 5 0 1 1319 5 0 1 1047 5 0 1 880 5 0 1 698 5 0 1 1397 5 0 1 1047 5 0 1 880 5 0 1 698 5 0 1 1397 5 0 1 932 5 0 1 784 5 0 1 659 5 0 1 1319 5 0 1 932 5 0 1 784 5 0 1 659 5 0 1 1245 5 0 1 932 5 0 1 784 5 0 1 659 5 0 1 1319 5 0 1 932 5 0 1 784 5 0 1 659 5 0 1 1319 5 0 1 880 5 0 1 698 5 0 1 587 5 0 1 1175 5 0 1 880 5 0 1 698 5 0 1 587 5 0 1 1109 5 0 1 880 5 0 1 698 5 0 1 587 5 0 1 1175 5 0 1 880 5 0 1 698 5 0 1 587 5 0 1'
    }, {
      title: 'Imperial March (Piano)',
      tune: '2500 415 2 0 2 415 2 0 2 415 2 0 2 466 2 0 2 523 2 0 2 523 2 0 2 523 2 0 2 415 2 0 2 466 2 0 2 466 2 0 2 466 2 0 2 523 2 0 2 415 2 0 2 311 2 0 2 415 4 0 4 415 2 0 2 415 2 0 2 415 2 0 2 466 2 0 2 523 2 0 2 523 2 0 2 523 2 0 2 415 2 0 2 622 4 0 2 554 2 523 2 0 2 466 2 0 2 415 4 0 12 830 2 0 2 830 2 0 2 698 4 0 4 622 2 0 2 622 2 0 2 523 4 0 4 622 4 0 2 554 2 523 2 0 2 466 2 0 2 415 2 0 2 523 2 0 2 622 4 0 4 830 2 0 2 830 2 0 2 698 4 0 4 622 2 0 2 622 2 0 2 523 4 0 4 622 4 0 2 554 2 523 2 0 2 466 2 0 2 415 8'
    }, {
      title: 'Piano Song (32000)',
      tune: '32000 277 68 370 68 440 68 493 68 554 68 0 68 494 68 0 68 494 68 0 68 659 205 554 205 370 68 0 68 415 68 0 68 440 68 415 68 0 68 330 68 277 342 0 205 277 68 370 68 440 68 493 68 554 68 0 68 494 68 0 68 494 68 0 68 659 205 740 137 0 68 830 68 0 68 660 68 0 68 740 617 0 205 277 68 370 68 440 68 493 68 554 68 0 68 494 68 0 68 494 68 0 68 659 205 554 205 370 68 0 68 415 68 0 68 440 68 415 68 0 68 330 68 277 342 0 205 277 68 370 68 440 68 493 68 554 68 0 68 494 68 0 68 494 68 0 68 659 205 740 137 0 68 830 68 0 68 660 68 0 68 740 617 0 205 740 68 660 68 587 68 554 68 494 68 554 137 0 68 370 343 0 205 740 68 660 68 587 68 554 68 494 68 554 137 0 68 831 343 0 206 740 68 660 68 587 68 554 68 494 68 554 137 0 68 370 137 0 68 415 137 440 137 0 68 494 68 0 68 587 68 0 68 554 617 0 205 740 68 660 68 587 68 554 68 494 68 554 137 0 68 370 343 0 205 740 68 660 68 587 68 554 68 494 68 554 137 0 68 830 343 0 205 740 68 660 68 587 68 554 68 494 68 554 137 0 68 370 137 0 68 415 137 440 205 415 68 0 68 440 68 0 68 415 342 370 137 350 137 370 1097 0 3154 185 68 207 68 220 206 0 205 185 68 220 68 247 206 0 205 220 68 246 68 277 137 330 68 247 68 277 34 247 34 220 68 0 68 247 68 0 68 220 68 0 68 330 68 0 68 294 68 0 68 277 206 0 137 370 68 0 68 277 137 246 68 277 34 247 34 220 137 247 137 220 68 247 343 0 205 185 137 184 68 0 68 185 68 184 68 370 68 185 68 0 68 330 68 277 68 220 68 415 68 330 68 277 68 247 68 329 68 494 68 392 68 277 68 392 68 330 68 277 68 247 68 330 68 370 68 277 68 220 68 415 68 330 68 277 68 220 68 330 68 440 68 415 68 330 68 277 68 247 68 220 68 247 68 311 68 370 68 185 68 277 68 247 68 185 68 277 68 330 68 370 68 185 68 277 68 247 68 185 68 247 68 330 68 185 68 0 68 370 68 277 68 185 68 0 68 185 549 0 343 147 68 0 68 220 68 0 68 208 34 220 68 208 34 0 68 185 68 175 137 0 68 208 68 220 137 0 206 277 68 0 68 330 68 0 68 370 68 277 68 247 68 0 68 220 137 0 68 185 68 147 68 123 68 208 68 165 68 123 68 208 68 220 68 247 68 208 68 175 68 330 68 208 68 294 68 277 68 247 68 277 206 330 206 370 549 0 343 139 68 185 68 220 68 247 68 277 137 247 68 0 137 247 68 0 68 330 68 0 68 277 68 220 68 185 68 277 68 0 68 330 68 0 68 247 34 277 68 247 343 220 68 208 68 185 68 147 68 123 68 220 68 185 68 147 68 185 68 147 68 185 68 220 68 277 68 247 68 208 68 349 68 277 68 208 68 277 68 349 68 185 68 0 68 185 68 370 68 0 68 185 68 0 68 185 480'
    }, {
      title: 'Mysterious Melody (950)',
      tune: '950 392 3 0 6 392 3 0 6 466 3 0 3 523 3 0 3 392 3 0 6 392 3 0 6 349 3 0 3 369 3 0 3 392 3 0 6 392 3 0 6 466 3 0 3 523 3 0 3 392 3 0 6 392 3 0 6 349 3 0 3 369 3 0 3 196 3 0 6 196 3 0 6 233 3 0 3 261 3 0 3 196 3 0 6 196 3 0 6 174 3 0 3 185 3 0 3 196 3 0 6 196 3 0 6 233 3 0 3 261 3 0 3 196 3 0 6 196 3 0 6 174 3 0 3 185 3 0 3'
    }, {
      title: 'Grimoire Inspired Tune',
      tune: '210 329 2 391 2 311 1 329 1 440 1 493 1 440 2 391 2 311 2 369 2 329 4'
    }, {
      title: 'Apidya - Level 1-2',
      tune: '72000 415 240 415 240 622 240 0 240 415 240 622 240 0 240 415 240 622 1200 415 240 415 123 0 117 622 110 698 130 698 240 587 480 466 720 523 1920'
    }, {
      title: 'Shave and a Haircut',
      tune: '1440 523 4 392 2 0 1 392 2 440 4 392 4 0 4 494 4 0 1 523 4'
    }, {
      title: 'Video Game Tune (Complex)',
      tune: '51840 52 128 196 128 110 128 117 128 392 96 110 32 392 96 98 32 392 96 73 32 349 96 78 32 349 96 104 32 349 96 98 32 311 96 69 32 311 96 139 32 311 96 69 32 294 128 110 128 117 128 110 128 98 128 73 128 78 128 104 128 98 128 73 128 78 128 87 128 311 128 110 128 117 128 294 96 110 32 349 96 98 32 294 96 73 32 294 128 104 128 98 128 277 128 139 128 69 128 98 128 110 128 117 128 294 96 110 32 311 96 98 32 262 96 73 32 294 128 104 128 98 128 73 128 78 128 87 128 196 128 110 128 117 128 392 96 110 32 392 96 98 32 392 96 73 32 349 96 78 32 349 96 104 32 349 96 98 32 311 96 69 32 311 96 139 32 311 96 69 32 294 128 110 128 117 128 110 128 98 128 73 128 78 128 104 128 98 128 277 128 78 128 87 128 98 128 110 128 117 128 294 96 110 32 349 96 98 32 294 96 73 32 294 128 104 128 98 128 69 128 139 128 69 32 659 48 740 48 98 128 110 128 117 32 659 48 740 48 294 96 110 32 311 96 98 32 262 32 659 48 740 48 294 128 104 128 98 32 659 48 740 48 73 128'
    }, {
      title: 'Mystery Tune (1356)',
      tune: '1356 0 36 261 3 293 3 369 3 293 3 440 8 0 1 440 8 0 1 391 17 0 1 261 3 293 3 369 3 293 3 391 8 0 1 391 8 0 1 369 9 329 3 293 5 0 1 261 3 293 3 369 3 293 3 369 11 0 1 391 5 0 1 329 9 293 3 261 5 0 1 261 5 0 1 261 5 0 1 391 11 0 1 369 23 0 1 261 3 293 3 369 3 293 3 440 8 0 1 440 8 0 1 391 17 0 1 261 3 293 3 369 3 293 3 523 11 0 1 329 5 0 1 369 9 329 3 293 5 0 1 261 3 293 3 369 3 293 3 369 11 0 1 391 5 0 1 329 9 293 3 261 11 0 1 261 5 0 1 391 11 0 1 369 23 0 1 0 12'
    }, {
      title: 'Kessoku Band - Seishun Complex',
      tune: '480 587 1 524 1 587 1 880 1 0 1 587 1 0 1 524 2 587 1 0 1 698 1 659 1 587 1 524 1 440 1'
    }, {
      title: 'Beep Boop Melody',
      tune: '36600 740 22 0 10 740 22 0 60 740 22 0 10 740 22 0 180 1050 22 0 10 1050 22 0 10 1050 22 0 10 1050 22 0 20 520 22 0 10 520 22 0 10 520 22 0 10 520 22 0 10 520 22 0 10 520 22 0 10 520 22 0 10 520 22'
    }, {
      title: 'The Only Thing They Fear is You (Bass)',
      tune: '890 0 30 155 4 77 5 0 1 77 5 0 1 77 6 155 4 77 4 147 2 165 2 155 4 77 6 155 6 82 6 165 6 73 4'
    }, {
      title: 'Sonic Tune',
      tune: '1360 587 4 659 4 698 8 698 8 659 2 659 2 698 4 587 8 523 4 587 4 587 4 659 4 523 4 880 2 698 2 587 4 659 4 698 8 698 8 659 2 659 2 698 4 587 8 523 4 587 4 587 4 659 4 523 4 880 2 698 2 587 4 659 4 698 8 698 8 659 2 659 2 698 4 587 8 523 4 587 4 587 4 659 4 523 4 880 2 698 2 294 4 330 4 349 8 349 8 330 2 330 2 349 4 294 8 262 4 294 4 294 4 330 4 262 4 440 2 349 2 294 4 330 4 349 8 349 8 330 2 330 2 349 4 294 8 262 4 294 4 294 4 330 4 262 4 440 2 349 2 294 4 330 4 349 8 349 8 330 2 330 2 349 4 294 8 262 4 294 4 294 4 330 4 262 4 440 2 349 2 294 4 330 4 698 1 349 1 698 1 349 1 698 1 349 1 698 1 349 1 349 8 330 2 330 2 349 4 294 8 262 4 294 4 294 4 330 4 262 4 440 2 349 2 294 4 330 4 698 1 349 1 698 1 349 1 698 1 349 1 698 1 349 1 698 8 330 2 330 2 349 4 294 8 262 4 294 2 0 2 294 2 0 2 330 4 262 4 440 2 349 2 294 4 330 4 698 1 349 1 698 1 349 1 698 1 349 1 698 1 349 1 698 8 330 2 330 2 349 4 294 8 262 4 294 4 294 4 330 4 262 4 440 2 349 2'
    }, {
      title: 'Zelda Dungeon (620)',
      tune: '620 65 3 523 1 392 1 262 1 659 1 523 1 392 1 740 1 587 1 392 1 587 3 65 3 523 3 659 3 740 3 587 4'
    }, {
      title: 'Duke Nukem 3D - Intro',
      tune: '12913 47 36 55 36 0 36 62 36 0 36 0 36 47 36 62 36 0 36 70 36 0 36 0 36 47 36 70 36 0 36 74 36 0 36 47 36 0 36 70 76 62 36 55 36 47 36 42 36 44 36 47 36 50 76 62 36 55 36 47 36 47 36 55 36 0 36 62 36 0 36 0 36 47 36 62 36 0 36 70 36 0 36 0 36 47 36 70 36 0 36 74 36 0 36 47 36 0 36 70 76 62 36 55 36 47 36 50 36 53 36 62 36 50 76 62 36 55 36 50 36'
    }, {
      title: 'Duke Nukem 3D - Short',
      tune: '360 47 1 55 1 0 1 62 1 0 1 0 1 47 1 62 1 0 1 70 1 0 1 0 1 47 1 70 1 0 1 74 1 0 1 47 1 0 1 70 2 62 1 55 1 47 1 42 1 44 1 47 1 50 2 62 1 55 1 47 1'
    }, {
      title: 'Duke Nukem 3D - 2 sec',
      tune: '360 47 1 55 1 0 1 62 1 0 1 0 1 47 1 62 1 0 1 70 1 0 1 0 1'
    }, {
      title: 'Duke Nukem 3D - 1 sec',
      tune: '360 47 1 55 1 0 1 62 1 0 1 0 1'
    }, {
      title: 'Spooky Scary Skeletons',
      tune: '115200 392 432 0 144 392 432 0 144 370 432 0 144 370 432 0 144 247 432 0 144 294 240 0 144 247 624 0 144 247 432 0 144 392 240 0 144 392 624 0 144 370 432 0 144 370 432 0 144 247 432 0 1296 247 240 0 336 392 432 0 144 392 432 0 144 370 432 0 144 370 432 0 144 247 432 0 144 294 432 0 144 247 912 0 240 294 432 0 144 330 432 0 144 277 432 0 144 294 432 0 144 247 432'
    }],
    tuneInput = document.getElementById('tune-input'),
    tuneSelect = document.getElementById('tune-select');
  tuneSelect.remove(0);
  for (let item of data) {
    let option = document.createElement('option');
    option.textContent = item.title;
    option.value = item.tune;
    tuneSelect.appendChild(option);
  }
  let option = document.createElement('option');
  option.textContent = 'URL custom input';
  option.id = 'url-option';
  option.value = '';
  option.hidden = true;
  tuneSelect.appendChild(option);
  option = document.createElement('option');
  option.textContent = 'Custom input';
  option.id = 'custom-option';
  option.value = '';
  tuneSelect.appendChild(option);
  tuneSelect.removeAttribute('disabled');
  document.getElementById('tune-input').value = tuneSelect.value;
  if (tuneParam != undefined) {
    let urlCustomOption = document.getElementById('url-option');
    urlCustomOption.value = tuneParam;
    urlCustomOption.hidden = false;
    urlCustomOption.selected = true;
    tuneInput.readonly = false;
    tuneInput.value = tuneParam;
  }
}

function showWarningMessage(message) {
  document.getElementById('warning-alert').classList.remove('d-none');
  document.getElementById('tune-info').classList.add('d-none');
  document.getElementById('warning-alert-message').textContent = message;
  document.getElementById('play').classList.add('disabled');
  document.getElementById('play').setAttribute('disabled', 'disabled');
}

function validateTuneInput(input) {
  let inputArray = input.trim().split(/\s+/),
    isAllNumbers = true,
    warningAlertContainer = document.getElementById('warning-alert'),
    tuneInfoContainer = document.getElementById('tune-info');
  for (let item of inputArray) {
    if (isNaN(item)) {
      isAllNumbers = false;
      break;
    }
  }
  if (input.length == 0) {
    showWarningMessage('Input at least one note.');
  } else if (!isAllNumbers) {
    showWarningMessage('Please enter only numbers.');
  } else {
    if (inputArray.length < 3) {
      showWarningMessage('Input at least one note.');
    } else if (inputArray.length >= 3 && inputArray.length % 2 == 0) {
      showWarningMessage('One more number to define a note.');
    } else {
      document.getElementById('play').classList.remove('disabled');
      document.getElementById('play').removeAttribute('disabled');
      warningAlertContainer.classList.add('d-none');
      tuneInfoContainer.classList.remove('d-none');
      calculateDuration(createTuneObj(input));
    }
  }
}

function addFormEvents() {
  let tuneSelect = document.getElementById('tune-select'),
    tuneInput = document.getElementById('tune-input'),
    warningAlertContainer = document.getElementById('warning-alert'),
    tuneInfoContainer = document.getElementById('tune-info');
  tuneSelect.addEventListener('change', () => {
    tuneInput.value = tuneSelect.value;
    tuneInput.parentNode.dataset.replicatedValue = tuneInput.value;
    if (tuneSelect.value === '') {
      document.getElementById('play').classList.add('disabled');
      document.getElementById('play').setAttribute('disabled', 'disabled');
      warningAlertContainer.classList.remove('d-none');
      tuneInfoContainer.classList.add('d-none');
      tuneInput.removeAttribute('readonly');
    } else {
      document.getElementById('play').classList.remove('disabled');
      document.getElementById('play').removeAttribute('disabled');
      warningAlertContainer.classList.add('d-none');
      tuneInfoContainer.classList.remove('d-none');
      calculateDuration(createTuneObj(tuneSelect.value));
      tuneInput.readonly = true;
    }
    validateTuneInput(tuneInput.value);
  });
  tuneInput.addEventListener('input', () => {
    tuneInput.parentNode.dataset.replicatedValue = tuneInput.value;
    document.getElementById('custom-option').selected = true;
    validateTuneInput(tuneInput.value);
  });
  tuneInput.addEventListener('paste', () => {
    tuneInput.parentNode.dataset.replicatedValue = tuneInput.value;
    document.getElementById('custom-option').selected = true;
    validateTuneInput(tuneInput.value);
  });
  document.getElementById('tune-form').addEventListener('submit', event => {
    event.preventDefault();
    document.getElementById('tune-select').classList.add('disabled');
    document.getElementById('tune-select').setAttribute('disabled', 'disabled');
    document.getElementById('play').classList.add('d-none');
    document.getElementById('stop').classList.remove('d-none');
    requestId = requestAnimationFrame(() => {
      play(createTuneObj(tuneInput.value));
    });
  });
}

function showTooltipOnce(element, text) {
  return function () {
    var tooltip = new bootstrap.Tooltip(element, {
      title: text,
      trigger: 'hover'
    });
    tooltip.show();
    element.addEventListener('hidden.bs.tooltip', () => {
      tooltip.dispose();
    }, {
      once: true
    });
  };
}

ready(() => {
  let tuneInput = document.getElementById('tune-input');
  tuneInput.value = 'Loading...';
  loadSelect();
  addFormEvents();
  validateTuneInput(tuneInput.value);
  calculateDuration(createTuneObj(tuneInput.value));
  let copyButton = document.getElementById('copy');
  let permalinkButton = document.getElementById('permalink');
  new bootstrap.Popover('#trivia');
  new ClipboardJS(copyButton, {
    text: () => {
      return tuneInput.value.trim().replace(/\s+/g, ' ');
    }
  }).on('success', showTooltipOnce(copyButton, 'Tune copied!'));
  new ClipboardJS(permalinkButton, {
    text: () => {
      let url = new URL(window.location.href);
      url.search = '?tune=' + tuneInput.value.trim().replace(/\s+/g, '+');
      return url.href;
    }
  }).on('success', showTooltipOnce(permalinkButton, 'URL copied!'));
});
