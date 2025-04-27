let points = 0;
let clickValue = 1;
let autoClickerActive = false;
let autoClicker2Active = false;
let silverAutoClickerActive = false;
let musicPlaying = false;

const pointsElement = document.getElementById('points');
const clickButton = document.getElementById('clickButton');
const musicToggleButton = document.getElementById('musicToggle');
const backgroundMusic = document.getElementById('backgroundMusic');
const settingsButton = document.getElementById('settingsButton');
const settingsMenu = document.getElementById('settingsMenu');
const closeSettingsButton = document.getElementById('closeSettings');
const volumeSlider = document.getElementById('volumeSlider');
const submitCodeButton = document.getElementById('submitCode');
const secretCodeInput = document.getElementById('secretCode');
const upgrade1Button = document.getElementById('upgrade1');
const upgrade2Button = document.getElementById('upgrade2');
const upgrade3Button = document.getElementById('upgrade3');
const autoClickerButton = document.getElementById('autoClicker');
const stormClickerButton = document.getElementById('stormClicker');
const upgrade5Button = document.getElementById('upgrade5');
const upgrade6Button = document.getElementById('upgrade6');
const upgrade7Button = document.getElementById('upgrade7');
const megaClickerButton = document.getElementById('megaClicker');
const silverAutoClickerButton = document.getElementById('silverAutoClicker');

clickButton.addEventListener('click', () => {
  points += clickValue;
  pointsElement.textContent = points;
  spawnMeteor();
});

settingsButton.addEventListener('click', () => {
  settingsMenu.style.display = 'flex';
});

closeSettingsButton.addEventListener('click', () => {
  settingsMenu.style.display = 'none';
});

submitCodeButton.addEventListener('click', () => {
  const code = secretCodeInput.value.trim();
  if (code === "code123") {
    points += 10000;
    pointsElement.textContent = points;
    secretCodeInput.value = '';
  }
});

volumeSlider.addEventListener('input', () => {
  backgroundMusic.volume = volumeSlider.value;
});

musicToggleButton.addEventListener('click', () => {
  musicPlaying = !musicPlaying;
  if (musicPlaying) {
    backgroundMusic.play();
    musicToggleButton.textContent = '🎶';
  } else {
    backgroundMusic.pause();
    musicToggleButton.textContent = '🎵';
  }
});

upgrade1Button.addEventListener('click', () => {
  if (points >= 31) {
    points -= 31;
    clickValue += 1;
    pointsElement.textContent = points;
  }
});

upgrade2Button.addEventListener('click', () => {
  if (points >= 303) {
    points -= 303;
    clickValue += 5;
    pointsElement.textContent = points;
  }
});

upgrade3Button.addEventListener('click', () => {
  if (points >= 604) {
    points -= 604;
    clickValue += 25;
    pointsElement.textContent = points;
  }
});

autoClickerButton.addEventListener('click', () => {
  if (points >= 1208 && !autoClickerActive) {
    points -= 1208;
    autoClickerActive = true;
    pointsElement.textContent = points;
  }
});

stormClickerButton.addEventListener('click', () => {
  if (points >= 15000) {
    points -= 15000;
    stormClickerButton.classList.add('hidden');
    pointsElement.textContent = points;
  }
});

upgrade5Button.addEventListener('click', () => {
  if (points >= 12075) {
    points -= 12075;
    clickValue += 100;
    pointsElement.textContent = points;
  }
});

upgrade6Button.addEventListener('click', () => {
  if (points >= 20000) {
    points -= 20000;
    clickValue += 250;
    pointsElement.textContent = points;
  }
});

upgrade7Button.addEventListener('click', () => {
  if (points >= 100000) {
    points -= 100000;
    clickValue += 1000;
    pointsElement.textContent = points;
  }
});

megaClickerButton.addEventListener('click', () => {
  if (points >= 1000000) {
    points -= 1000000;
    clickValue += 10000;
    pointsElement.textContent = points;
  }
});

silverAutoClickerButton.addEventListener('click', () => {
  if (points >= 2500000) {
    points -= 2500000;
    silverAutoClickerActive = true;
    pointsElement.textContent = points;
  }
});

function spawnMeteor() {
  let meteorType = Math.random();
  let meteor;
  if (meteorType < 0.959) {
    meteor = document.createElement('div');
    meteor.classList.add('meteor', 'normalMeteor');
  } else if (meteorType < 0.989) {
    meteor = document.createElement('div');
    meteor.classList.add('meteor', 'goldenMeteor', 'rareMeteor');
  } else if (meteorType < 0.999) {
    meteor = document.createElement('div');
    meteor.classList.add('meteor', 'diamondMeteor', 'rareMeteor');
  } else {
    meteor = document.createElement('div');
    meteor.classList.add('meteor', 'purpleMeteor', 'rareMeteor');
  }

  meteor.style.top = Math.random() * -50 + 'px';
  meteor.style.left = Math.random() * window.innerWidth + 'px';

  meteor.addEventListener('click', () => {
    if (meteor.classList.contains('goldenMeteor')) {
      points += points * 0.25;
    } else if (meteor.classList.contains('diamondMeteor')) {
      points += points * 0.35;
    } else if (meteor.classList.contains('purpleMeteor')) {
      points += points * 1;
    }
    pointsElement.textContent = points;
    meteor.remove();
  });

  document.body.appendChild(meteor);
  setTimeout(() => meteor.remove(), 3000);
}
