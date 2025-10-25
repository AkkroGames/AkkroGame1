class CosmicDefenderPro {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.power = 100;
        this.coins = 0;
        
        this.stats = {
            totalScore: 0,
            totalKills: 0,
            highestLevel: 1,
            playTime: 0,
            startTime: 0
        };
        
        this.upgrades = {
            damage: 0,
            shield: 0,
            speed: 0,
            energy: 0,
            ultimate: 0
        };

        this.passives = {
            coinConversion: false,
            speedBoostOnHit: false,
            damageBoostOnHit: false,
            bulletCount: 1,
            healthRegenChance: 0
        };

        this.tempBonuses = {
            coinMultiplier: { active: false, endTime: 0, multiplier: 1 },
            speedBoost: { active: false, endTime: 0, multiplier: 1 },
            damageBoost: { active: false, endTime: 0, multiplier: 1 },
            immunity: { active: false, endTime: 0 }
        };

        this.ultimate = {
            unlocked: false,
            charge: 0,
            maxCharge: 75,
            active: false,
            endTime: 0,
            duration: 10000,
            autoShootInterval: null,
            speedMultiplier: 1.5,
            timerInterval: null,
            drops: []
        };

        this.playerTransformation = {
            level10: false,
            level20: false,
            level30: false,
            level40: false,
            level50: false,
            level60: false
        };

        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        this.effects = [];
        this.laserBeams = [];
        this.energyWaves = [];
        this.bulletTrails = [];
        this.shipGlows = [];
        this.enemyHits = [];
        this.homingBullets = [];
        this.spikes = [];
        this.enemyBullets = [];
        this.bosses = [];
        
        this.keys = {};
        this.mouse = { 
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2,
            visible: true 
        };
        
        this.cardSystem = {
            levelsSinceLastCard: 0,
            cardRarities: {
                common: 50,
                rare: 25,
                epic: 15,
                legendary: 7,
                mythic: 3
            }
        };

        this.audio = {
            background: document.getElementById('backgroundMusic'),
            jazz: document.getElementById('jazzMusic'),
            laser: document.getElementById('laserSound'),
            explosion: document.getElementById('explosionSound'),
            powerUp: document.getElementById('powerUpSound'),
            cardSelect: document.getElementById('cardSelectSound'),
            ultimate: document.getElementById('ultimateSound'),
            ultimateActivate: document.getElementById('ultimateActivateSound'),
            transformation: document.getElementById('transformationSound')
        };

        this.settings = {
            graphicsQuality: 0.8,
            particlesEnabled: true,
            postProcessing: true,
            musicVolume: 0.7,
            sfxVolume: 0.85,
            mouseSensitivity: 0.6,
            invertControls: false,
            difficulty: 0.4,
            autoPause: true,
            jazzMusic: true
        };

        this.resumeTimer = null;
        this.resumeTimerCount = 3;
        this.gameLoopRunning = false;

        this.cameraZoom = 1;
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;

        this.gameSpeed = 1;

        // Система лидерборда
        this.leaderboard = {
            players: [],
            seasonEnd: 0,
            updateInterval: null,
            currentPlayer: null
        };

        // Глобальный таймер
        this.globalTimer = {
            startTime: 0,
            running: false,
            elapsed: 0
        };

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createStars();
        this.setupCustomCursor();
        this.loadGameData();
        this.loadSettings();
        this.loadLeaderboard();
        this.startSeasonTimer();
        this.startGlobalTimer();
        this.showMainMenu();
        
        this.updateCursorPosition(window.innerWidth / 2, window.innerHeight / 2);
    }

    // ========== СИСТЕМА ЛИДЕРБОРДА И ТАЙМЕРОВ ==========

    loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('cosmicDefenderLeaderboard');
        if (savedLeaderboard) {
            this.leaderboard.players = JSON.parse(savedLeaderboard);
        }
        
        const savedPlayer = localStorage.getItem('cosmicDefenderPlayer');
        if (savedPlayer) {
            this.leaderboard.currentPlayer = JSON.parse(savedPlayer);
        }

        const savedSeasonEnd = localStorage.getItem('cosmicDefenderSeasonEnd');
        if (savedSeasonEnd) {
            this.leaderboard.seasonEnd = parseInt(savedSeasonEnd);
        } else {
            this.leaderboard.seasonEnd = Date.now() + (7 * 24 * 60 * 60 * 1000);
            localStorage.setItem('cosmicDefenderSeasonEnd', this.leaderboard.seasonEnd.toString());
        }
        
        this.updateLeaderboardDisplay();
    }

    saveLeaderboard() {
        localStorage.setItem('cosmicDefenderLeaderboard', JSON.stringify(this.leaderboard.players));
        if (this.leaderboard.currentPlayer) {
            localStorage.setItem('cosmicDefenderPlayer', JSON.stringify(this.leaderboard.currentPlayer));
        }
        localStorage.setItem('cosmicDefenderSeasonEnd', this.leaderboard.seasonEnd.toString());
    }

    startGlobalTimer() {
        const savedTimer = localStorage.getItem('cosmicDefenderGlobalTimer');
        if (savedTimer) {
            const timerData = JSON.parse(savedTimer);
            this.globalTimer.startTime = timerData.startTime;
            this.globalTimer.elapsed = timerData.elapsed;
            this.globalTimer.running = timerData.running;
        } else {
            this.globalTimer.startTime = Date.now();
            this.globalTimer.elapsed = 0;
            this.globalTimer.running = true;
        }

        setInterval(() => {
            if (this.globalTimer.running) {
                this.globalTimer.elapsed = Date.now() - this.globalTimer.startTime;
                this.saveGlobalTimer();
            }
        }, 1000);
    }

    saveGlobalTimer() {
        const timerData = {
            startTime: this.globalTimer.startTime,
            elapsed: this.globalTimer.elapsed,
            running: this.globalTimer.running
        };
        localStorage.setItem('cosmicDefenderGlobalTimer', JSON.stringify(timerData));
    }

    getGlobalTime() {
        return this.globalTimer.elapsed;
    }

    formatGlobalTime() {
        const totalSeconds = Math.floor(this.globalTimer.elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    registerPlayer(name, contact) {
        if (!name.trim() || !contact.trim()) {
            this.showNotification('ОШИБКА', 'Заполните все поля!');
            return;
        }

        this.leaderboard.currentPlayer = {
            id: Date.now().toString(),
            name: name.trim(),
            contact: contact.trim(),
            score: 0,
            level: 1,
            registeredAt: Date.now(),
            globalTime: this.getGlobalTime()
        };

        this.saveLeaderboard();
        this.updateLeaderboardDisplay();
        this.showNotification('УСПЕХ', 'Вы зарегистрированы в лидерборде!');
    }

    updatePlayerScore(score, level) {
        if (!this.leaderboard.currentPlayer) return;

        this.leaderboard.currentPlayer.score = Math.max(this.leaderboard.currentPlayer.score, score);
        this.leaderboard.currentPlayer.level = Math.max(this.leaderboard.currentPlayer.level, level);
        this.leaderboard.currentPlayer.globalTime = this.getGlobalTime();

        const existingIndex = this.leaderboard.players.findIndex(p => p.id === this.leaderboard.currentPlayer.id);
        
        if (existingIndex !== -1) {
            this.leaderboard.players[existingIndex] = {...this.leaderboard.currentPlayer};
        } else {
            this.leaderboard.players.push({...this.leaderboard.currentPlayer});
        }

        this.leaderboard.players.sort((a, b) => b.score - a.score);
        this.leaderboard.players = this.leaderboard.players.slice(0, 100);

        this.saveLeaderboard();
        this.updateLeaderboardDisplay();
    }

    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboardList');
        const currentPlayerInfo = document.getElementById('currentPlayerInfo');
        const playerRegistration = document.getElementById('playerRegistration');
        const playerRankInfo = document.getElementById('playerRankInfo');

        leaderboardList.innerHTML = '';

        if (this.leaderboard.players.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-empty">Лидерборд пуст. Будьте первым!</div>';
        } else {
            this.leaderboard.players.slice(0, 10).forEach((player, index) => {
                const rank = index + 1;
                const item = document.createElement('div');
                item.className = `leaderboard-item rank-${rank}`;
                
                let medal = '';
                if (rank === 1) medal = '🥇';
                else if (rank === 2) medal = '🥈';
                else if (rank === 3) medal = '🥉';

                const totalSeconds = Math.floor(player.globalTime / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                item.innerHTML = `
                    <div class="rank-number">${rank}</div>
                    <div class="player-info">
                        <div class="player-name">${medal} ${player.name}</div>
                        <div class="player-contact">${player.contact}</div>
                        <div class="player-time">Время: ${timeString}</div>
                    </div>
                    <div class="player-score">${player.score} очков (ур. ${player.level})</div>
                `;
                
                leaderboardList.appendChild(item);
            });
        }

        if (this.leaderboard.currentPlayer) {
            playerRegistration.style.display = 'none';
            currentPlayerInfo.style.display = 'block';
            
            const playerRank = this.leaderboard.players.findIndex(p => p.id === this.leaderboard.currentPlayer.id) + 1;
            if (playerRank > 0) {
                playerRankInfo.innerHTML = `
                    <strong>${this.leaderboard.currentPlayer.name}</strong><br>
                    Позиция: <strong>${playerRank}</strong> из ${this.leaderboard.players.length}<br>
                    Очки: <strong>${this.leaderboard.currentPlayer.score}</strong><br>
                    Уровень: <strong>${this.leaderboard.currentPlayer.level}</strong><br>
                    Время: <strong>${this.formatGlobalTime()}</strong>
                `;
            } else {
                playerRankInfo.innerHTML = `
                    <strong>${this.leaderboard.currentPlayer.name}</strong><br>
                    Вы еще не в топ-100. Играйте больше!<br>
                    Время: <strong>${this.formatGlobalTime()}</strong>
                `;
            }
        } else {
            currentPlayerInfo.style.display = 'none';
            playerRegistration.style.display = 'block';
        }
    }

    startSeasonTimer() {
        this.updateSeasonTimer();
        this.leaderboard.updateInterval = setInterval(() => {
            this.updateSeasonTimer();
        }, 1000);
    }

    updateSeasonTimer() {
        const now = Date.now();
        const timeLeft = this.leaderboard.seasonEnd - now;

        if (timeLeft <= 0) {
            document.getElementById('seasonTimer').textContent = 'СЕЗОН ЗАКОНЧИЛСЯ';
            clearInterval(this.leaderboard.updateInterval);
            
            this.awardTopPlayers();
            
            setTimeout(() => {
                this.leaderboard.seasonEnd = Date.now() + (7 * 24 * 60 * 60 * 1000);
                this.saveLeaderboard();
                this.startSeasonTimer();
            }, 5000);
            
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById('seasonTimer').textContent = 
            `${days}д ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    awardTopPlayers() {
        const topPlayers = this.leaderboard.players.slice(0, 3);
        
        console.log('Награждение топ-3 игроков:', topPlayers);
        
        this.showNotification(
            'СЕЗОН ЗАКОНЧИЛСЯ!', 
            `Поздравляем победителей!\n🥇 ${topPlayers[0]?.name || 'Нет'}\n🥈 ${topPlayers[1]?.name || 'Нет'}\n🥉 ${topPlayers[2]?.name || 'Нет'}`
        );
    }

    // ========== СИСТЕМА НАСТРОЕК ==========

    loadSettings() {
        const savedSettings = localStorage.getItem('cosmicDefenderSettings');
        if (savedSettings) {
            this.settings = {...this.settings, ...JSON.parse(savedSettings)};
        }
        this.applySettings();
        this.updateSettingsUI();
    }

    saveSettings() {
        localStorage.setItem('cosmicDefenderSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        this.audio.background.volume = this.settings.musicVolume;
        this.audio.jazz.volume = this.settings.musicVolume;
        this.audio.laser.volume = this.settings.sfxVolume;
        this.audio.explosion.volume = this.settings.sfxVolume;
        this.audio.powerUp.volume = this.settings.sfxVolume;
        this.audio.cardSelect.volume = this.settings.sfxVolume;
        this.audio.ultimate.volume = this.settings.sfxVolume;
        this.audio.ultimateActivate.volume = this.settings.sfxVolume;
        this.audio.transformation.volume = this.settings.sfxVolume;

        if (this.settings.jazzMusic) {
            this.audio.jazz.play();
            this.audio.background.pause();
        } else {
            this.audio.jazz.pause();
            if (this.gameState === 'playing') {
                this.audio.background.play();
            }
        }

        this.updateGraphicsSettings();
    }

    updateGraphicsSettings() {
        // Логика для изменения графических настроек
    }

    updateSettingsUI() {
        this.updateSlider('graphicsQualitySlider', this.settings.graphicsQuality, 'graphicsQualityValue', ['Низкое', 'Среднее', 'Высокое', 'Ультра']);
        this.updateSlider('musicVolumeSlider', this.settings.musicVolume, 'musicVolumeValue', null, true);
        this.updateSlider('sfxVolumeSlider', this.settings.sfxVolume, 'sfxVolumeValue', null, true);
        this.updateSlider('mouseSensitivitySlider', this.settings.mouseSensitivity, 'mouseSensitivityValue', ['Низкая', 'Средняя', 'Высокая', 'Макс.']);
        this.updateSlider('difficultySlider', this.settings.difficulty, 'difficultyValue', ['Легкая', 'Нормальная', 'Сложная', 'Экстрим']);

        this.updateToggle('particlesToggle', this.settings.particlesEnabled, 'particlesValue');
        this.updateToggle('postProcessingToggle', this.settings.postProcessing, 'postProcessingValue');
        this.updateToggle('invertControlsToggle', this.settings.invertControls, 'invertControlsValue');
        this.updateToggle('autoPauseToggle', this.settings.autoPause, 'autoPauseValue');
    }

    updateSlider(sliderId, value, valueId, labels = null, isPercentage = false) {
        const slider = document.getElementById(sliderId);
        const thumb = slider.querySelector('.slider-thumb');
        const fill = slider.querySelector('.slider-fill');
        const valueElement = document.getElementById(valueId);

        const width = slider.offsetWidth;
        const thumbPosition = value * width;
        
        thumb.style.left = `${thumbPosition - 6}px`;
        fill.style.width = `${value * 100}%`;

        if (isPercentage) {
            valueElement.textContent = `${Math.round(value * 100)}%`;
        } else if (labels) {
            const index = Math.floor(value * (labels.length - 1));
            valueElement.textContent = labels[index];
        }
    }

    updateToggle(toggleId, state, valueId) {
        const toggle = document.getElementById(toggleId);
        const valueElement = document.getElementById(valueId);

        if (state) {
            toggle.classList.add('active');
            valueElement.textContent = 'Включено';
        } else {
            toggle.classList.remove('active');
            valueElement.textContent = 'Выключено';
        }
    }

    setupSettingsEventListeners() {
        this.setupSlider('graphicsQualitySlider', (value) => {
            this.settings.graphicsQuality = value;
            this.updateSlider('graphicsQualitySlider', value, 'graphicsQualityValue', ['Низкое', 'Среднее', 'Высокое', 'Ультра']);
        });

        this.setupSlider('musicVolumeSlider', (value) => {
            this.settings.musicVolume = value;
            this.updateSlider('musicVolumeSlider', value, 'musicVolumeValue', null, true);
            this.applySettings();
        });

        this.setupSlider('sfxVolumeSlider', (value) => {
            this.settings.sfxVolume = value;
            this.updateSlider('sfxVolumeSlider', value, 'sfxVolumeValue', null, true);
            this.applySettings();
        });

        this.setupSlider('mouseSensitivitySlider', (value) => {
            this.settings.mouseSensitivity = value;
            this.updateSlider('mouseSensitivitySlider', value, 'mouseSensitivityValue', ['Низкая', 'Средняя', 'Высокая', 'Макс.']);
        });

        this.setupSlider('difficultySlider', (value) => {
            this.settings.difficulty = value;
            this.updateSlider('difficultySlider', value, 'difficultyValue', ['Легкая', 'Нормальная', 'Сложная', 'Экстрим']);
        });

        this.setupToggle('particlesToggle', (state) => {
            this.settings.particlesEnabled = state;
            this.updateToggle('particlesToggle', state, 'particlesValue');
        });

        this.setupToggle('postProcessingToggle', (state) => {
            this.settings.postProcessing = state;
            this.updateToggle('postProcessingToggle', state, 'postProcessingValue');
        });

        this.setupToggle('invertControlsToggle', (state) => {
            this.settings.invertControls = state;
            this.updateToggle('invertControlsToggle', state, 'invertControlsValue');
        });

        this.setupToggle('autoPauseToggle', (state) => {
            this.settings.autoPause = state;
            this.updateToggle('autoPauseToggle', state, 'autoPauseValue');
        });

        document.getElementById('applySettings').addEventListener('click', () => {
            this.saveSettings();
            this.applySettings();
            this.showNotification('НАСТРОЙКИ', 'Настройки применены успешно!');
        });
    }

    setupSlider(sliderId, callback) {
        const slider = document.getElementById(sliderId);
        const thumb = slider.querySelector('.slider-thumb');
        const fill = slider.querySelector('.slider-fill');
        const width = slider.offsetWidth;

        let isDragging = false;

        const updateValue = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let x = clientX - rect.left;
            x = Math.max(0, Math.min(width, x));
            const value = x / width;
            
            thumb.style.left = `${x - 6}px`;
            fill.style.width = `${value * 100}%`;
            
            callback(value);
        };

        thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateValue(e.clientX);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateValue(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    setupToggle(toggleId, callback) {
        const toggle = document.getElementById(toggleId);
        
        toggle.addEventListener('click', () => {
            const newState = !toggle.classList.contains('active');
            callback(newState);
        });
    }

    // ========== ОСНОВНЫЕ МЕТОДЫ ИГРЫ ==========

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Escape') {
                this.togglePause();
            }
            
            if (e.code === 'Space' && this.gameState === 'playing') {
                this.shoot();
                e.preventDefault();
            }
            
            if (e.code === 'KeyQ' && this.gameState === 'playing' && this.ultimate.unlocked && this.ultimate.charge >= this.ultimate.maxCharge && !this.ultimate.active) {
                this.activateUltimate();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        document.addEventListener('mousemove', (e) => {
            this.updateCursorPosition(e.clientX, e.clientY);
        });

        document.addEventListener('mousedown', (e) => {
            if (this.gameState === 'playing') {
                this.shoot();
            }
        });

        document.addEventListener('mouseleave', (e) => {
            this.mouse.visible = false;
        });

        document.addEventListener('mouseenter', (e) => {
            this.mouse.visible = true;
        });

        document.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                this.shoot();
            }
            
            const ultimateCircle = document.getElementById('ultimateCircle');
            const rect = ultimateCircle.getBoundingClientRect();
            if (
                this.gameState === 'playing' && 
                this.ultimate.unlocked && 
                this.ultimate.charge >= this.ultimate.maxCharge && 
                !this.ultimate.active &&
                e.clientX >= rect.left && 
                e.clientX <= rect.right && 
                e.clientY >= rect.top && 
                e.clientY <= rect.bottom
            ) {
                this.activateUltimate();
            }
        });

        document.getElementById('startGame').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('continueGame').addEventListener('click', () => {
            this.continueGame();
        });

        document.getElementById('resumeGame').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('quitToMenu').addEventListener('click', () => {
            this.showMainMenu();
        });

        document.getElementById('registerPlayer').addEventListener('click', () => {
            const name = document.getElementById('playerName').value;
            const contact = document.getElementById('playerContact').value;
            this.registerPlayer(name, contact);
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            if (this.mouse.visible) {
                this.updateCursorPosition(this.mouse.x, this.mouse.y);
            }
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.setupSettingsEventListeners();
    }

    updateCursorPosition(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.mouse.visible = true;
        
        if (this.player && this.gameState === 'playing') {
            this.player.targetX = x - this.player.width / 2;
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        if (tabName === 'shop') {
            this.updateCoinsDisplay();
        } else if (tabName === 'leaderboard') {
            this.updateLeaderboardDisplay();
        } else if (tabName === 'settings') {
            this.updateSettingsUI();
        }
    }

    createStars() {
        const starsContainer = document.getElementById('stars');
        starsContainer.innerHTML = '';
        
        for (let i = 0; i < 300; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.opacity = Math.random() * 0.8 + 0.2;
            starsContainer.appendChild(star);
        }
    }

    setupCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        cursor.style.display = 'block';
        
        setInterval(() => {
            this.updateCursorDisplay();
        }, 16);
    }

    updateCursorDisplay() {
        const cursor = document.querySelector('.custom-cursor');
        if (this.mouse.visible) {
            cursor.style.left = this.mouse.x + 'px';
            cursor.style.top = this.mouse.y + 'px';
            cursor.style.display = 'block';
        } else {
            cursor.style.display = 'none';
        }
    }

    showMainMenu() {
        this.gameState = 'menu';
        document.getElementById('mainMenu').style.display = 'flex';
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('cardSelection').style.display = 'none';
        document.getElementById('ultimateContainer').style.display = 'none';
        
        this.mouse.visible = true;
        
        this.audio.background.pause();
        if (this.settings.jazzMusic) {
            this.audio.jazz.play();
        }
        this.updateStatsUI();
    }

    startNewGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = Math.min(50, 3 + this.upgrades.shield);
        this.level = 1;
        this.power = 100;
        this.cardSystem.levelsSinceLastCard = 0;
        
        this.passives = {
            coinConversion: false,
            speedBoostOnHit: false,
            damageBoostOnHit: false,
            bulletCount: 1,
            healthRegenChance: 0
        };
        
        this.ultimate.charge = 0;
        this.ultimate.active = false;
        this.ultimate.endTime = 0;
        if (this.ultimate.autoShootInterval) {
            clearInterval(this.ultimate.autoShootInterval);
            this.ultimate.autoShootInterval = null;
        }
        if (this.ultimate.timerInterval) {
            clearInterval(this.ultimate.timerInterval);
            this.ultimate.timerInterval = null;
        }
        
        this.playerTransformation = {
            level10: false,
            level20: false,
            level30: false,
            level40: false,
            level50: false,
            level60: false
        };
        
        this.stats.startTime = Date.now();
        
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        document.getElementById('gameContainer').style.display = 'block';
        
        if (this.ultimate.unlocked) {
            document.getElementById('ultimateContainer').style.display = 'block';
            this.updateUltimateDisplay();
        }
        
        this.updateCursorPosition(window.innerWidth / 2, window.innerHeight / 2);
        
        this.initGameObjects();
        this.gameLoop();
        
        if (this.settings.jazzMusic) {
            this.audio.jazz.play();
        } else {
            this.audio.background.volume = this.settings.musicVolume;
            this.audio.background.play();
        }
        
        this.updateUI();
        this.showNotification('НОВАЯ ИГРА', 'Защити галактику!');
    }

    continueGame() {
        if (this.stats.totalScore > 0) {
            this.startNewGame();
        } else {
            this.showNotification('ИГРА НЕ НАЙДЕНА', 'Начните новую игру!');
        }
    }

    initGameObjects() {
        const baseSpeed = 8 + (this.upgrades.speed * 2);
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 120,
            targetX: this.canvas.width / 2 - 25,
            width: 50,
            height: 80,
            speed: baseSpeed,
            color: '#00f3ff',
            engineParticles: [],
            pulse: 0,
            shape: 'triangle',
            spikeCooldown: 0
        };

        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        this.effects = [];
        this.laserBeams = [];
        this.energyWaves = [];
        this.bulletTrails = [];
        this.shipGlows = [];
        this.enemyHits = [];
        this.homingBullets = [];
        this.spikes = [];
        this.enemyBullets = [];
        this.bosses = [];

        this.spawnEnemies(3 + this.level);
    }

    spawnEnemies(count) {
        const enemyTypes = [
            { color: '#ff4444', health: 1.5, speed: 2, score: 100, size: 35, type: 'basic' },
            { color: '#ffaa00', health: 3, speed: 1.5, score: 200, size: 45, type: 'basic' },
            { color: '#ff00ff', health: 1.5, speed: 3, score: 150, size: 30, type: 'basic' }
        ];

        if (this.level >= 10 && Math.random() < 0.3) {
            enemyTypes.push({ color: '#888888', health: 7.5, speed: 1, score: 300, size: 50, type: 'armored' });
        }

        if (this.level >= 20 && Math.random() < 0.2) {
            enemyTypes.push({ color: '#00ff88', health: 3, speed: 1.5, score: 250, size: 40, type: 'medic' });
        }

        if (this.level >= 30 && Math.random() < 0.15) {
            enemyTypes.push({ color: '#aa00ff', health: 6, speed: 1.2, score: 400, size: 45, type: 'mage' });
        }

        if (this.level >= 50 && Math.random() < 0.1) {
            enemyTypes.push({ color: '#ff8800', health: 4.5, speed: 1.8, score: 350, size: 42, type: 'mechanic' });
        }

        for (let i = 0; i < count; i++) {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            const levelHpMultiplier = 1 + (this.level * 0.05);
            
            const waveBonus = Math.floor(this.level / 20);
            const waveHpMultiplier = 1 + (waveBonus * 0.1);
            const waveSpeedMultiplier = 1 + (waveBonus * 0.05);
            
            const baseHealth = type.health * levelHpMultiplier * waveHpMultiplier;
            const baseSpeed = type.speed * waveSpeedMultiplier;
            
            this.enemies.push({
                x: Math.random() * (this.canvas.width - type.size),
                y: -type.size,
                width: type.size,
                height: type.size,
                speed: baseSpeed,
                color: type.color,
                health: baseHealth,
                maxHealth: baseHealth,
                scoreValue: type.score,
                type: type.type,
                pattern: Math.random() > 0.5 ? 'straight' : 'zigzag',
                zigzagOffset: Math.random() * 100,
                zigzagSpeed: Math.random() * 0.05 + 0.02,
                lastHealTime: 0,
                lastSpawnTime: 0,
                lastBuffTime: 0,
                lastShootTime: 0
            });
        }

        if (this.level === 40 && this.bosses.length === 0) {
            this.spawnBoss();
        }

        if (this.level === 60 && this.bosses.length === 0) {
            this.spawnDoubleBoss();
        }
    }

    spawnBoss() {
        const levelHpMultiplier = 1 + (this.level * 0.05);
        const baseHealth = 25 * levelHpMultiplier;
        
        this.bosses.push({
            x: this.canvas.width / 2 - 75,
            y: -150,
            width: 150,
            height: 150,
            speed: 0.5,
            color: '#ff0000',
            health: baseHealth,
            maxHealth: baseHealth,
            scoreValue: 1000,
            type: 'boss',
            lastSpawnTime: 0,
            lastShootTime: 0,
            pattern: 'boss'
        });
        this.showNotification('ПОЯВЛЕНИЕ БОССА!', 'Осторожно, это сильный противник!');
    }

    spawnDoubleBoss() {
        const levelHpMultiplier = 1 + (this.level * 0.05);
        const baseHealth = 20 * levelHpMultiplier;
        
        for (let i = 0; i < 2; i++) {
            this.bosses.push({
                x: i === 0 ? this.canvas.width / 4 - 75 : 3 * this.canvas.width / 4 - 75,
                y: -150,
                width: 120,
                height: 120,
                speed: 0.7,
                color: '#ff5500',
                health: baseHealth,
                maxHealth: baseHealth,
                scoreValue: 1500,
                type: 'doubleBoss',
                lastSpawnTime: 0,
                lastShootTime: 0,
                pattern: 'boss'
            });
        }
        this.showNotification('ДВОЙНОЙ БОСС!', 'Два сильных противника атакуют!');
    }

    shoot() {
        if (this.power >= 10) {
            const damage = 1 + this.upgrades.damage;
            const bulletCount = this.passives.bulletCount;
            
            for (let i = 0; i < bulletCount; i++) {
                const offset = (i - (bulletCount - 1) / 2) * 15;
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2 + offset,
                    y: this.player.y,
                    width: 4,
                    height: 15,
                    speed: 12,
                    color: '#00f3ff',
                    damage: damage,
                    trail: []
                });
            }
            
            if (this.playerTransformation.level10) {
                this.bullets.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y,
                    width: 4,
                    height: 15,
                    speed: 12,
                    color: '#ffaa00',
                    damage: damage,
                    trail: [],
                    angle: -Math.PI/4
                });
            }
            
            if (this.playerTransformation.level20) {
                this.bullets.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y,
                    width: 4,
                    height: 15,
                    speed: 12,
                    color: '#ffaa00',
                    damage: damage,
                    trail: [],
                    angle: -3*Math.PI/4
                });
            }
            
            if (this.playerTransformation.level30) {
                for (let i = 0; i < 2; i++) {
                    this.homingBullets.push({
                        x: this.player.x + this.player.width / 2 + (i === 0 ? -20 : 20),
                        y: this.player.y,
                        width: 6,
                        height: 6,
                        speed: 8,
                        color: '#ff00ff',
                        damage: damage * 1.5,
                        trail: [],
                        target: null
                    });
                }
            }

            if (this.playerTransformation.level50 && this.player.spikeCooldown <= 0) {
                this.spikes.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y,
                    width: 8,
                    height: 8,
                    speed: 4,
                    color: '#ffff00',
                    damage: damage * 2,
                    trail: [],
                    target: null
                });
                this.player.spikeCooldown = 60;
            }

            if (this.playerTransformation.level60 && this.player.spikeCooldown <= 0) {
                for (let i = 0; i < 2; i++) {
                    this.spikes.push({
                        x: this.player.x + this.player.width / 2 + (i === 0 ? -15 : 15),
                        y: this.player.y,
                        width: 8,
                        height: 8,
                        speed: 4,
                        color: '#ffff00',
                        damage: damage * 2,
                        trail: [],
                        target: null
                    });
                }
                this.player.spikeCooldown = 60;
            }
            
            this.power -= 10;
            this.audio.laser.currentTime = 0;
            this.audio.laser.volume = this.settings.sfxVolume;
            this.audio.laser.play();
            
            this.createMuzzleFlash(this.player.x + this.player.width / 2, this.player.y);
            this.createLaserBeam(this.player.x + this.player.width / 2, this.player.y);
            this.createEnergyWave(this.player.x + this.player.width / 2, this.player.y);
        }
    }

    createMuzzleFlash(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 15,
                life: 1,
                color: '#00f3ff',
                size: Math.random() * 3 + 1
            });
        }
    }

    createLaserBeam(x, y) {
        this.laserBeams.push({
            x: x,
            y: y,
            width: 6,
            height: 0,
            maxHeight: 50,
            life: 1,
            color: '#00f3ff'
        });
    }

    createEnergyWave(x, y) {
        this.energyWaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 30,
            life: 1,
            color: '#00f3ff'
        });
    }

    createBulletTrail(x, y) {
        this.bulletTrails.push({
            x: x,
            y: y,
            width: 2,
            height: 10,
            life: 1,
            color: '#00f3ff'
        });
    }

    createShipGlow(x, y, width, height) {
        this.shipGlows.push({
            x: x,
            y: y,
            width: width,
            height: height,
            life: 1,
            color: '#00f3ff'
        });
    }

    createEnemyHit(x, y, width, height) {
        this.enemyHits.push({
            x: x,
            y: y,
            width: width,
            height: height,
            life: 1,
            color: '#ff4444'
        });
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.updateTempBonuses();
        this.updateUltimate();
        this.updatePlayerTransformation();

        this.stats.playTime = Math.floor((Date.now() - this.stats.startTime) / 1000);

        if (this.player) {
            const dx = this.player.targetX - this.player.x;
            this.player.x += dx * 0.1 * this.gameSpeed;
            this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
            
            this.player.pulse = (this.player.pulse + 0.05) % (Math.PI * 2);
            
            if (this.player.spikeCooldown > 0) {
                this.player.spikeCooldown--;
            }
            
            if (Math.random() < 0.3) {
                this.player.engineParticles.push({
                    x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 20,
                    y: this.player.y + this.player.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 3 + 2,
                    life: 1,
                    color: '#00f3ff',
                    size: Math.random() * 2 + 1
                });
            }
        }

        const energyRegen = 0.5 + (this.upgrades.energy * 0.2);
        this.power = Math.min(100, this.power + energyRegen);

        this.bullets = this.bullets.filter(bullet => {
            if (bullet.angle) {
                bullet.x += Math.cos(bullet.angle) * bullet.speed * this.gameSpeed;
                bullet.y += Math.sin(bullet.angle) * bullet.speed * this.gameSpeed;
            } else {
                bullet.y -= bullet.speed * this.gameSpeed;
            }
            
            bullet.trail.push({ x: bullet.x, y: bullet.y });
            if (bullet.trail.length > 5) bullet.trail.shift();
            
            this.createBulletTrail(bullet.x, bullet.y);
            
            return bullet.y > -bullet.height && bullet.y < this.canvas.height && 
                   bullet.x > -bullet.width && bullet.x < this.canvas.width;
        });

        this.homingBullets = this.homingBullets.filter(bullet => {
            if (!bullet.target) {
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                this.enemies.forEach(enemy => {
                    const dx = enemy.x + enemy.width/2 - bullet.x;
                    const dy = enemy.y + enemy.height/2 - bullet.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });
                
                if (closestEnemy) {
                    bullet.target = closestEnemy;
                }
            }
            
            if (bullet.target) {
                const dx = bullet.target.x + bullet.target.width/2 - bullet.x;
                const dy = bullet.target.y + bullet.target.height/2 - bullet.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance > 0) {
                    bullet.x += (dx / distance) * bullet.speed * this.gameSpeed;
                    bullet.y += (dy / distance) * bullet.speed * this.gameSpeed;
                }
                
                if (this.checkCollision(bullet, bullet.target)) {
                    bullet.target.health -= bullet.damage;
                    if (bullet.target.health <= 0) {
                        this.handleEnemyDeath(bullet.target);
                    }
                    return false;
                }
            } else {
                bullet.y -= bullet.speed * this.gameSpeed;
            }
            
            bullet.trail.push({ x: bullet.x, y: bullet.y });
            if (bullet.trail.length > 5) bullet.trail.shift();
            
            return bullet.y > -bullet.height && bullet.y < this.canvas.height && 
                   bullet.x > -bullet.width && bullet.x < this.canvas.width;
        });

        this.spikes = this.spikes.filter(spike => {
            if (!spike.target) {
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                this.enemies.forEach(enemy => {
                    const dx = enemy.x + enemy.width/2 - spike.x;
                    const dy = enemy.y + enemy.height/2 - spike.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });
                
                if (closestEnemy) {
                    spike.target = closestEnemy;
                }
            }
            
            if (spike.target) {
                const dx = spike.target.x + spike.target.width/2 - spike.x;
                const dy = spike.target.y + spike.target.height/2 - spike.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance > 0) {
                    spike.x += (dx / distance) * spike.speed * this.gameSpeed;
                    spike.y += (dy / distance) * spike.speed * this.gameSpeed;
                }
                
                if (this.checkCollision(spike, spike.target)) {
                    spike.target.health -= spike.damage;
                    if (spike.target.health <= 0) {
                        this.handleEnemyDeath(spike.target);
                    }
                    return false;
                }
            } else {
                spike.y -= spike.speed * this.gameSpeed;
            }
            
            spike.trail.push({ x: spike.x, y: spike.y });
            if (spike.trail.length > 5) spike.trail.shift();
            
            return spike.y > -spike.height && spike.y < this.canvas.height && 
                   spike.x > -spike.width && spike.x < this.canvas.width;
        });

        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed * this.gameSpeed;
            
            if (this.player && this.checkCollision(bullet, this.player)) {
                this.handlePlayerHit();
                return false;
            }
            
            this.bullets.forEach((playerBullet, index) => {
                if (this.checkCollision(bullet, playerBullet)) {
                    this.bullets.splice(index, 1);
                    return false;
                }
            });
            
            return bullet.y < this.canvas.height;
        });

        this.enemies.forEach(enemy => {
            if (enemy.pattern === 'zigzag') {
                enemy.x += Math.sin(enemy.zigzagOffset) * 2 * this.gameSpeed;
                enemy.zigzagOffset += enemy.zigzagSpeed * this.gameSpeed;
            }
            
            enemy.y += enemy.speed * this.gameSpeed;
            
            if (this.checkCollision(enemy, this.player)) {
                this.handlePlayerHit();
                this.createExplosion(enemy.x, enemy.y, enemy.color);
                enemy.health = 0;
                
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
            
            if (enemy.type === 'medic' && Date.now() - enemy.lastHealTime > 5000) {
                this.healNearbyEnemies(enemy);
                enemy.lastHealTime = Date.now();
            }
            
            if (enemy.type === 'mage' && Date.now() - enemy.lastShootTime > 3000) {
                this.enemyShoot(enemy);
                enemy.lastShootTime = Date.now();
            }
            
            if (enemy.type === 'mechanic' && Date.now() - enemy.lastBuffTime > 6000) {
                this.buffNearbyEnemies(enemy);
                enemy.lastBuffTime = Date.now();
            }
            
            if (enemy.y > this.canvas.height) {
                enemy.health = 0;
            }
        });

        this.bosses.forEach(boss => {
            boss.y += boss.speed * this.gameSpeed;
            
            if (boss.y > 100) {
                boss.y = 100;
                
                if (Date.now() - boss.lastSpawnTime > 6000) {
                    this.spawnEnemies(1);
                    boss.lastSpawnTime = Date.now();
                }
                
                if (Date.now() - boss.lastShootTime > 4000) {
                    this.bossShoot(boss);
                    boss.lastShootTime = Date.now();
                }
            }
            
            if (this.checkCollision(boss, this.player)) {
                this.handlePlayerHit();
                this.createExplosion(boss.x, boss.y, boss.color);
            }
        });

        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    let actualDamage = bullet.damage;
                    if (this.tempBonuses.damageBoost.active) {
                        actualDamage *= this.tempBonuses.damageBoost.multiplier;
                    }
                    
                    enemy.health -= actualDamage;
                    this.bullets.splice(bulletIndex, 1);
                    this.createHitEffect(enemy.x, enemy.y);
                    this.createEnemyHit(enemy.x, enemy.y, enemy.width, enemy.height);
                    
                    if (enemy.health <= 0) {
                        this.handleEnemyDeath(enemy, enemyIndex);
                    }
                }
            });

            this.bosses.forEach((boss, bossIndex) => {
                if (this.checkCollision(bullet, boss)) {
                    let actualDamage = bullet.damage;
                    if (this.tempBonuses.damageBoost.active) {
                        actualDamage *= this.tempBonuses.damageBoost.multiplier;
                    }
                    
                    boss.health -= actualDamage;
                    this.bullets.splice(bulletIndex, 1);
                    this.createHitEffect(boss.x, boss.y);
                    this.createEnemyHit(boss.x, boss.y, boss.width, boss.height);
                    
                    if (boss.health <= 0) {
                        this.handleBossDeath(boss, bossIndex);
                    }
                }
            });
        });

        this.spikes.forEach((spike, spikeIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(spike, enemy)) {
                    let actualDamage = spike.damage;
                    if (this.tempBonuses.damageBoost.active) {
                        actualDamage *= this.tempBonuses.damageBoost.multiplier;
                    }
                    
                    enemy.health -= actualDamage;
                    this.spikes.splice(spikeIndex, 1);
                    this.createHitEffect(enemy.x, enemy.y);
                    this.createEnemyHit(enemy.x, enemy.y, enemy.width, enemy.height);
                    
                    if (enemy.health <= 0) {
                        this.handleEnemyDeath(enemy, enemyIndex);
                    }
                }
            });

            this.bosses.forEach((boss, bossIndex) => {
                if (this.checkCollision(spike, boss)) {
                    let actualDamage = spike.damage;
                    if (this.tempBonuses.damageBoost.active) {
                        actualDamage *= this.tempBonuses.damageBoost.multiplier;
                    }
                    
                    boss.health -= actualDamage;
                    this.spikes.splice(spikeIndex, 1);
                    this.createHitEffect(boss.x, boss.y);
                    this.createEnemyHit(boss.x, boss.y, boss.width, boss.height);
                    
                    if (boss.health <= 0) {
                        this.handleBossDeath(boss, bossIndex);
                    }
                }
            });
        });

        this.enemies = this.enemies.filter(enemy => enemy.health > 0);

        this.powerUps.forEach((powerUp, index) => {
            powerUp.y += powerUp.speed * this.gameSpeed;
            
            if (this.checkCollision(powerUp, this.player)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            } else if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(index, 1);
            }
        });

        if (this.enemies.length < 2 + this.level && this.bosses.length === 0) {
            this.spawnEnemies(1);
        }

        this.updateParticles();
        this.updateEngineParticles();
        this.updateLaserBeams();
        this.updateEnergyWaves();
        this.updateBulletTrails();
        this.updateShipGlows();
        this.updateEnemyHits();

        if (this.score >= this.level * 1000) {
            this.levelUp();
        }

        this.updateUI();
    }

    healNearbyEnemies(medic) {
        this.enemies.forEach(enemy => {
            if (enemy !== medic) {
                const dx = enemy.x - medic.x;
                const dy = enemy.y - medic.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 50) {
                    enemy.health = Math.min(enemy.maxHealth, enemy.health + 0.5);
                    this.createHealEffect(enemy.x, enemy.y);
                }
            }
        });
    }

    buffNearbyEnemies(mechanic) {
        this.enemies.forEach(enemy => {
            if (enemy !== mechanic) {
                const dx = enemy.x - mechanic.x;
                const dy = enemy.y - mechanic.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 70) {
                    enemy.speed *= 1.2;
                    enemy.health = Math.min(enemy.maxHealth * 1.5, enemy.health + 1);
                    this.createBuffEffect(enemy.x, enemy.y);
                }
            }
        });
    }

    enemyShoot(mage) {
        this.enemyBullets.push({
            x: mage.x + mage.width / 2,
            y: mage.y + mage.height,
            width: 6,
            height: 6,
            speed: 3,
            color: '#aa00ff',
            damage: 1,
            homing: true,
            target: this.player
        });
    }

    bossShoot(boss) {
        for (let i = 0; i < 3; i++) {
            this.enemyBullets.push({
                x: boss.x + boss.width / 2,
                y: boss.y + boss.height,
                width: 8,
                height: 8,
                speed: 4,
                color: '#ff0000',
                damage: 2,
                homing: true,
                target: this.player
            });
        }
    }

    createHealEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 1,
                color: '#00ff88',
                size: Math.random() * 2 + 1
            });
        }
    }

    createBuffEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: '#ffaa00',
                size: Math.random() * 3 + 1
            });
        }
    }

    handleEnemyDeath(enemy, enemyIndex = -1) {
        let coinsEarned = Math.floor(enemy.scoreValue / 20 * 0.85);
        if (this.tempBonuses.coinMultiplier.active) {
            coinsEarned = Math.floor(coinsEarned * this.tempBonuses.coinMultiplier.multiplier);
        }
        
        this.score += enemy.scoreValue;
        this.stats.totalKills++;
        this.coins += coinsEarned;
        
        if (this.ultimate.unlocked && !this.ultimate.active) {
            this.ultimate.charge = Math.min(this.ultimate.maxCharge, this.ultimate.charge + 1);
            this.updateUltimateDisplay();
            
            this.createUltimateDrop();
            
            if (this.ultimate.charge >= this.ultimate.maxCharge) {
                this.audio.ultimate.currentTime = 0;
                this.audio.ultimate.volume = this.settings.sfxVolume;
                this.audio.ultimate.play();
                this.showNotification('УЛЬТИМЕЙТ ГОТОВ!', 'Нажмите Q или кликните на круг для активации!');
            }
        }
        
        this.createExplosion(enemy.x, enemy.y, enemy.color);
        if (enemyIndex !== -1) {
            this.enemies.splice(enemyIndex, 1);
        } else {
            this.enemies = this.enemies.filter(e => e !== enemy);
        }
        this.audio.explosion.currentTime = 0;
        this.audio.explosion.volume = this.settings.sfxVolume;
        this.audio.explosion.play();
        
        if (Math.random() < 0.1) {
            this.createPowerUp(enemy.x, enemy.y);
        }
    }

    handleBossDeath(boss, bossIndex) {
        let coinsEarned = Math.floor(100 * 0.85);
        
        this.score += boss.scoreValue;
        this.stats.totalKills++;
        this.coins += coinsEarned;
        this.lives = Math.min(50, this.lives + 1);
        
        this.createExplosion(boss.x, boss.y, boss.color);
        this.bosses.splice(bossIndex, 1);
        this.audio.explosion.currentTime = 0;
        this.audio.explosion.volume = this.settings.sfxVolume;
        this.audio.explosion.play();
        
        this.showNotification('БОСС УБИТ!', `+${boss.scoreValue} очков, +${coinsEarned} монет, +1 жизнь!`);
        
        this.spawnEnemies(3);
    }

    createUltimateDrop() {
        const drop = document.createElement('div');
        drop.className = 'ultimate-drop';
        
        const circle = document.getElementById('ultimateCircle');
        const rect = circle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2 - 10;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        const startX = centerX + Math.cos(angle) * distance;
        const startY = centerY + Math.sin(angle) * distance;
        
        drop.style.left = `${startX}px`;
        drop.style.top = `${startY}px`;
        drop.style.animationDelay = `${Math.random() * 0.5}s`;
        
        document.body.appendChild(drop);
        
        setTimeout(() => {
            if (drop.parentNode) {
                drop.parentNode.removeChild(drop);
            }
        }, 1000);
    }

    updateUltimate() {
        if (this.ultimate.active && Date.now() > this.ultimate.endTime) {
            this.deactivateUltimate();
        }
    }

    activateUltimate() {
        if (!this.ultimate.unlocked || this.ultimate.charge < this.ultimate.maxCharge || this.ultimate.active) return;
        
        this.ultimate.active = true;
        this.ultimate.endTime = Date.now() + this.ultimate.duration;
        this.ultimate.charge = 0;
        
        this.audio.ultimateActivate.currentTime = 0;
        this.audio.ultimateActivate.volume = this.settings.sfxVolume;
        this.audio.ultimateActivate.play();
        
        this.startUltimateSequence();
        
        this.updateUltimateDisplay();
        
        this.showNotification('БУРЯ ПУЛЬ!', '10 секунд непрерывного огня!');
    }

    startUltimateSequence() {
        this.gameSpeed = 0.5;
        this.cameraZoom = 0.7;
        this.cameraOffsetX = (this.canvas.width * 0.15);
        this.cameraOffsetY = (this.canvas.height * 0.15);
        
        document.getElementById('cameraEffect').classList.add('active');
        
        setTimeout(() => {
            this.createUltimateExplosion();
            
            this.gameSpeed = 1.5;
            this.cameraZoom = 1.2;
            this.cameraOffsetX = -(this.canvas.width * 0.1);
            this.cameraOffsetY = -(this.canvas.height * 0.1);
            
            document.getElementById('screenFire').classList.add('active');
            
            this.ultimate.autoShootInterval = setInterval(() => {
                if (this.gameState === 'playing' && this.ultimate.active) {
                    this.autoShoot();
                }
            }, 100);
            
            document.getElementById('ultimateTimer').style.display = 'block';
            document.getElementById('ultimateIcon').style.display = 'none';
            document.getElementById('ultimateCircle').classList.add('active');
            document.getElementById('ultimateOverlay').classList.add('active');
            
            this.ultimate.timerInterval = setInterval(() => {
                this.updateUltimateTimer();
            }, 100);
            
            setTimeout(() => {
                this.cameraZoom = 1;
                this.cameraOffsetX = 0;
                this.cameraOffsetY = 0;
                document.getElementById('cameraEffect').classList.remove('active');
            }, 500);
        }, 2000);
    }

    createUltimateExplosion() {
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 1,
                color: '#ff0000',
                size: Math.random() * 8 + 4
            });
        }
        
        this.effects.push({
            type: 'shockwave',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 0,
            maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.8,
            life: 1,
            color: '#ff4444'
        });
    }

    updateUltimateTimer() {
        if (!this.ultimate.active) return;
        
        const timeLeft = Math.ceil((this.ultimate.endTime - Date.now()) / 1000);
        document.getElementById('ultimateTimer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(this.ultimate.timerInterval);
        }
    }

    deactivateUltimate() {
        this.ultimate.active = false;
        this.ultimate.endTime = 0;
        this.gameSpeed = 1;
        
        if (this.ultimate.autoShootInterval) {
            clearInterval(this.ultimate.autoShootInterval);
            this.ultimate.autoShootInterval = null;
        }
        
        if (this.ultimate.timerInterval) {
            clearInterval(this.ultimate.timerInterval);
            this.ultimate.timerInterval = null;
        }
        
        document.getElementById('ultimateCircle').classList.remove('active');
        document.getElementById('ultimateOverlay').classList.remove('active');
        document.getElementById('screenFire').classList.remove('active');
        document.getElementById('ultimateTimer').style.display = 'none';
        document.getElementById('ultimateIcon').style.display = 'block';
        
        this.cameraZoom = 1;
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        
        document.getElementById('cameraEffect').classList.remove('active');
        
        this.showNotification('УЛЬТИМЕЙТ ЗАКОНЧИЛСЯ', 'Продолжайте сражаться!');
    }

    autoShoot() {
        if (this.power >= 5) {
            const damage = 1 + this.upgrades.damage;
            const bulletCount = this.passives.bulletCount;
            
            for (let i = 0; i < bulletCount; i++) {
                const offset = (i - (bulletCount - 1) / 2) * 15;
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2 + offset,
                    y: this.player.y,
                    width: 4,
                    height: 15,
                    speed: 12,
                    color: '#ff00ff',
                    damage: damage,
                    trail: []
                });
            }
            
            this.power -= 5;
            
            this.createMuzzleFlash(this.player.x + this.player.width / 2, this.player.y);
            this.createLaserBeam(this.player.x + this.player.width / 2, this.player.y);
            this.createEnergyWave(this.player.x + this.player.width / 2, this.player.y);
        }
    }

    updatePlayerTransformation() {
        if (this.level >= 10 && !this.playerTransformation.level10) {
            this.playerTransformation.level10 = true;
            this.activateTransformation(10);
        }
        
        if (this.level >= 20 && !this.playerTransformation.level20) {
            this.playerTransformation.level20 = true;
            this.activateTransformation(20);
        }
        
        if (this.level >= 30 && !this.playerTransformation.level30) {
            this.playerTransformation.level30 = true;
            this.activateTransformation(30);
        }
        
        if (this.level >= 40 && !this.playerTransformation.level40) {
            this.playerTransformation.level40 = true;
            this.activateTransformation(40);
        }
        
        if (this.level >= 50 && !this.playerTransformation.level50) {
            this.playerTransformation.level50 = true;
            this.player.shape = 'spikedTriangle';
            this.activateTransformation(50);
        }
        
        if (this.level >= 60 && !this.playerTransformation.level60) {
            this.playerTransformation.level60 = true;
            this.player.shape = 'doubleSpikedTriangle';
            this.activateTransformation(60);
        }
        
        if (this.playerTransformation.level40) {
            this.player.speed = (8 + (this.upgrades.speed * 2)) * 2;
        }
    }

    activateTransformation(level) {
        this.audio.transformation.currentTime = 0;
        this.audio.transformation.volume = this.settings.sfxVolume;
        this.audio.transformation.play();
        
        document.getElementById('transformationEffect').classList.add('active');
        
        this.createTransformationParticles();
        
        let message = '';
        switch(level) {
            case 10:
                message = 'Выстрел в правый верхний угол разблокирован!';
                break;
            case 20:
                message = 'Выстрел в левый верхний угол разблокирован!';
                break;
            case 30:
                message = 'Автонаводящиеся выстрелы разблокированы!';
                break;
            case 40:
                message = 'x2 скорость и x2 урон активированы!';
                break;
            case 50:
                message = 'Новая форма: Треугольник с шипами! Автонаводящиеся шипы разблокированы!';
                break;
            case 60:
                message = 'Улучшенная форма: Двойные шипы! +1 автонаводящийся шип!';
                break;
        }
        
        this.showNotification(`ТРАНСФОРМАЦИЯ УРОВНЯ ${level}!`, message);
        
        setTimeout(() => {
            document.getElementById('transformationEffect').classList.remove('active');
        }, 3000);
    }

    createTransformationParticles() {
        const particlesContainer = document.getElementById('transformationParticles');
        particlesContainer.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#00f3ff';
            particle.style.borderRadius = '50%';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animation = `dropFall ${Math.random() * 2 + 1}s linear infinite`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    updateUltimateDisplay() {
        if (!this.ultimate.unlocked) return;
        
        const ultimateFill = document.getElementById('ultimateFill');
        const ultimateCircle = document.getElementById('ultimateCircle');
        
        const fillPercentage = (this.ultimate.charge / this.ultimate.maxCharge) * 100;
        ultimateFill.style.height = `${fillPercentage}%`;
        
        if (this.ultimate.charge >= this.ultimate.maxCharge && !this.ultimate.active) {
            ultimateCircle.classList.add('ready');
        } else {
            ultimateCircle.classList.remove('ready');
        }
    }

    handlePlayerHit() {
        if (this.tempBonuses.immunity.active) return;
        
        this.lives--;
        
        if (isNaN(this.lives) || this.lives < 0) {
            this.lives = 0;
        }
        
        if (this.passives.coinConversion) {
            this.coins += 10;
        }
        
        if (this.passives.speedBoostOnHit) {
            this.activateSpeedBoost(20, 1.4);
            this.activateImmunity(5);
        }
        
        if (this.passives.damageBoostOnHit) {
            this.activateDamageBoost(30, 2.0);
        }
        
        if (this.passives.healthRegenChance > 0 && Math.random() < this.passives.healthRegenChance) {
            this.lives = Math.min(50, this.lives + 1);
            this.showNotification('ВОССТАНОВЛЕНИЕ!', '+1 жизнь!');
        }
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.showNotification('ПОПАДАНИЕ!', `-1 жизнь! Осталось: ${this.lives}`);
        }
    }

    updateTempBonuses() {
        const now = Date.now();
        
        Object.keys(this.tempBonuses).forEach(bonus => {
            if (this.tempBonuses[bonus].active && now > this.tempBonuses[bonus].endTime) {
                this.tempBonuses[bonus].active = false;
            }
        });
    }

    activateSpeedBoost(duration, multiplier) {
        this.tempBonuses.speedBoost = {
            active: true,
            endTime: Date.now() + duration * 1000,
            multiplier: multiplier
        };
    }

    activateDamageBoost(duration, multiplier) {
        this.tempBonuses.damageBoost = {
            active: true,
            endTime: Date.now() + duration * 1000,
            multiplier: multiplier
        };
    }

    activateCoinMultiplier(duration, multiplier) {
        this.tempBonuses.coinMultiplier = {
            active: true,
            endTime: Date.now() + duration * 1000,
            multiplier: multiplier
        };
    }

    activateImmunity(duration) {
        this.tempBonuses.immunity = {
            active: true,
            endTime: Date.now() + duration * 1000
        };
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                color: color || '#ff4444',
                size: Math.random() * 4 + 2
            });
        }
        
        this.effects.push({
            type: 'flash',
            x: x,
            y: y,
            radius: 0,
            maxRadius: 50,
            life: 1,
            color: color || '#ff4444'
        });
    }

    createHitEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0.5,
                color: '#ffffff',
                size: Math.random() * 2 + 1
            });
        }
    }

    createPowerUp(x, y) {
        const types = [
            { color: '#00ff88', type: 'health', value: 1 },
            { color: '#ffaa00', type: 'power', value: 50 },
            { color: '#ff00ff', type: 'coin', value: 50 }
        ];
        
        const powerUp = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push({
            x: x,
            y: y,
            width: 20,
            height: 20,
            speed: 2,
            color: powerUp.color,
            type: powerUp.type,
            value: powerUp.value
        });
    }

    collectPowerUp(powerUp) {
        switch(powerUp.type) {
            case 'health':
                this.lives = Math.min(50, this.lives + powerUp.value);
                this.showNotification('УЛУЧШЕНИЕ!', '+1 жизнь!');
                break;
            case 'power':
                this.power = Math.min(100, this.power + powerUp.value);
                this.showNotification('ЭНЕРГИЯ!', '+50% энергии!');
                break;
            case 'coin':
                this.coins += powerUp.value;
                this.showNotification('МОНЕТЫ!', `+${powerUp.value} монет!`);
                break;
        }
        
        this.audio.powerUp.currentTime = 0;
        this.audio.powerUp.volume = this.settings.sfxVolume;
        this.audio.powerUp.play();
        
        this.createCollectionEffect(powerUp.x, powerUp.y, powerUp.color);
    }

    createCollectionEffect(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * this.gameSpeed;
            particle.y += particle.vy * this.gameSpeed;
            particle.life -= 0.02;
            return particle.life > 0;
        });
    }

    updateEngineParticles() {
        this.player.engineParticles = this.player.engineParticles.filter(particle => {
            particle.x += particle.vx * this.gameSpeed;
            particle.y += particle.vy * this.gameSpeed;
            particle.life -= 0.05;
            return particle.life > 0 && particle.y < this.canvas.height;
        });
    }

    updateLaserBeams() {
        this.laserBeams = this.laserBeams.filter(beam => {
            beam.height += 10 * this.gameSpeed;
            beam.life -= 0.1;
            return beam.life > 0 && beam.height < beam.maxHeight;
        });
    }

    updateEnergyWaves() {
        this.energyWaves = this.energyWaves.filter(wave => {
            wave.radius += 5 * this.gameSpeed;
            wave.life -= 0.05;
            return wave.life > 0 && wave.radius < wave.maxRadius;
        });
    }

    updateBulletTrails() {
        this.bulletTrails = this.bulletTrails.filter(trail => {
            trail.life -= 0.1;
            return trail.life > 0;
        });
    }

    updateShipGlows() {
        this.shipGlows = this.shipGlows.filter(glow => {
            glow.life -= 0.05;
            return glow.life > 0;
        });
    }

    updateEnemyHits() {
        this.enemyHits = this.enemyHits.filter(hit => {
            hit.life -= 0.1;
            return hit.life > 0;
        });
    }

    updateEffects() {
        this.effects = this.effects.filter(effect => {
            effect.life -= 0.03;
            return effect.life > 0;
        });
    }

    levelUp() {
        this.level++;
        this.cardSystem.levelsSinceLastCard++;
        this.stats.highestLevel = Math.max(this.stats.highestLevel, this.level);
        
        if (this.cardSystem.levelsSinceLastCard >= 5 && (this.level % 2 === 0 || this.cardSystem.levelsSinceLastCard >= 10)) {
            this.showCardSelection();
            this.cardSystem.levelsSinceLastCard = 0;
        } else {
            this.showNotification('НОВЫЙ УРОВЕНЬ!', `Уровень ${this.level} достигнут!`);
        }
        
        this.lives = Math.min(50, this.lives + 1);
        this.power = 100;
    }

    showCardSelection() {
        this.gameState = 'cardSelection';
        document.getElementById('cardSelection').style.display = 'flex';
        
        const cardsContainer = document.getElementById('cardsContainer');
        cardsContainer.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const card = this.generateRandomCard();
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.rarity}`;
            cardElement.innerHTML = `
                <div class="card-rarity">${this.getRarityName(card.rarity)}</div>
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.title}</div>
                <div class="card-description">${card.description}</div>
                <div class="card-effect">${card.effect}</div>
            `;
            
            cardElement.addEventListener('click', () => {
                this.selectCard(card);
            });
            
            cardsContainer.appendChild(cardElement);
        }
    }

    generateRandomCard() {
        const rarities = Object.keys(this.cardSystem.cardRarities);
        let selectedRarity = 'common';
        
        const rand = Math.random() * 100;
        let cumulative = 0;
        
        for (const rarity of rarities) {
            cumulative += this.cardSystem.cardRarities[rarity];
            if (rand <= cumulative) {
                selectedRarity = rarity;
                break;
            }
        }
        
        const cards = {
            common: [
                { icon: '❤️', title: 'Доп. Жизнь', description: 'Получите дополнительную жизнь', effect: '+1 к максимальному здоровью', type: 'health' },
                { icon: '⚡', title: 'Усиление Урона', description: 'Увеличивает ваш урон', effect: '+5% к урону', type: 'damage', value: 0.05 },
                { icon: '🚀', title: 'Ускорение', description: 'Увеличивает скорость корабля', effect: '+10% к скорости', type: 'speed', value: 0.1 }
            ],
            rare: [
                { icon: '💥', title: 'Мощный Удар', description: 'Значительное усиление урона', effect: '+10% к урону', type: 'damage', value: 0.1 },
                { icon: '🌪️', title: 'Скоростной Поток', description: 'Большое увеличение скорости', effect: '+15% к скорости', type: 'speed', value: 0.15 },
                { icon: '💰', title: 'Золотая Лихорадка', description: 'Временное увеличение дохода', effect: '+15% к монетам на 2 минуты', type: 'coinMultiplier', value: 1.15, duration: 120 }
            ],
            epic: [
                { icon: '🔫', title: 'Двойной Выстрел', description: 'Стреляйте двумя пулями одновременно', effect: '+1 пуля к выстрелу', type: 'bulletCount', value: 1 },
                { icon: '⚡', title: 'Сверхскорость', description: 'Экстремальное увеличение скорости', effect: '+20% к скорости', type: 'speed', value: 0.2 },
                { icon: '💥', title: 'Разрушитель', description: 'Огромное усиление урона', effect: '+20% к урону', type: 'damage', value: 0.2 },
                { icon: '❤️', title: 'Живучий', description: 'Дополнительная стойкость', effect: '+2 к максимальному здоровью', type: 'health', value: 2 }
            ],
            legendary: [
                { icon: '💎', title: 'Алхимик', description: 'Превращайте полученный урон в монеты', effect: 'При получении урона +10 монет', type: 'passive', passive: 'coinConversion' },
                { icon: '🌪️', title: 'Берсерк', description: 'Ярость при получении урона', effect: 'При уроне +40% скорости и иммунитет на 5 сек', type: 'passive', passive: 'speedBoostOnHit' },
                { icon: '🔥', title: 'Мститель', description: 'Месть за каждую рану', effect: 'При уроне +100% урона на 30 сек', type: 'passive', passive: 'damageBoostOnHit' }
            ],
            mythic: [
                { icon: '🔫', title: 'Тройной Огонь', description: 'Невероятная огневая мощь', effect: '+2 пули к выстрелу', type: 'bulletCount', value: 2 },
                { icon: '⚡', title: 'Абсолютная Сила', description: 'Максимальное усиление характеристик', effect: '+35% к урону и скорости', type: 'combo', damage: 0.35, speed: 0.35 },
                { icon: '✨', title: 'Феникс', description: 'Шанс воскреснуть из пепла', effect: '15% шанс восстановить 1 жизнь при уроне', type: 'passive', passive: 'healthRegen', value: 0.15 }
            ]
        };
        
        const availableCards = cards[selectedRarity];
        const selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        
        return {
            rarity: selectedRarity,
            ...selectedCard
        };
    }

    getRarityName(rarity) {
        const names = {
            common: 'Обычная',
            rare: 'Редкая',
            epic: 'Эпическая',
            legendary: 'Легендарная',
            mythic: 'Мифическая'
        };
        return names[rarity];
    }

    selectCard(card) {
        this.audio.cardSelect.currentTime = 0;
        this.audio.cardSelect.volume = this.settings.sfxVolume;
        this.audio.cardSelect.play();
        
        this.applyCardEffect(card);
        
        document.getElementById('cardSelection').style.display = 'none';
        
        this.showResumeTimer();
    }

    applyCardEffect(card) {
        let message = '';
        
        switch(card.type) {
            case 'health':
                this.lives = Math.min(50, this.lives + card.value);
                message = `+${card.value} к здоровью!`;
                break;
            case 'damage':
                this.upgrades.damage += card.value;
                message = `+${Math.floor(card.value * 100)}% к урону!`;
                break;
            case 'speed':
                this.upgrades.speed += card.value;
                message = `+${Math.floor(card.value * 100)}% к скорости!`;
                break;
            case 'coinMultiplier':
                this.activateCoinMultiplier(card.duration, card.value);
                message = `+${Math.floor((card.value - 1) * 100)}% к монетам на ${card.duration} сек!`;
                break;
            case 'bulletCount':
                this.passives.bulletCount += card.value;
                message = `+${card.value} пуля к выстрелу!`;
                break;
            case 'passive':
                this.passives[card.passive] = card.value !== undefined ? card.value : true;
                message = `Активирована пассивка: ${card.title}!`;
                break;
            case 'combo':
                this.upgrades.damage += card.damage;
                this.upgrades.speed += card.speed;
                message = `+${Math.floor(card.damage * 100)}% урона и +${Math.floor(card.speed * 100)}% скорости!`;
                break;
            case 'healthRegen':
                this.passives.healthRegenChance = card.value;
                message = `Шанс восстановления здоровья: ${Math.floor(card.value * 100)}%!`;
                break;
        }
        
        this.showNotification(`ПОЛУЧЕНО: ${card.rarity.toUpperCase()}`, `${card.title}\n${message}`);
    }

    showResumeTimer() {
        const timerElement = document.getElementById('resumeTimer');
        timerElement.style.display = 'block';
        
        if (this.resumeTimer) {
            clearInterval(this.resumeTimer);
        }
        
        this.resumeTimerCount = 3;
        timerElement.textContent = this.resumeTimerCount;
        
        this.resumeTimer = setInterval(() => {
            this.resumeTimerCount--;
            timerElement.textContent = this.resumeTimerCount;
            
            if (this.resumeTimerCount <= 0) {
                clearInterval(this.resumeTimer);
                timerElement.style.display = 'none';
                
                this.gameState = 'playing';
                
                if (!this.gameLoopRunning) {
                    this.gameLoop();
                }
            }
        }, 1000);
    }

    gameOver() {
        this.stats.totalScore += this.score;
        
        this.updatePlayerScore(this.score, this.level);
        
        this.saveGameData();
        
        this.gameState = 'gameOver';
        this.gameLoopRunning = false;
        
        this.showNotification('ИГРА ОКОНЧЕНА', `Ваш счет: ${this.score}`);
        
        setTimeout(() => {
            this.showMainMenu();
        }, 3000);
    }

    buyUpgrade(type) {
        const prices = {
            damage: 500,
            shield: 300,
            speed: 400,
            energy: 600,
            ultimate: 1000
        };

        if (this.coins >= prices[type]) {
            this.coins -= prices[type];
            this.upgrades[type]++;
            
            if (type === 'ultimate') {
                this.ultimate.unlocked = true;
                this.showNotification('УЛЬТИМЕЙТ РАЗБЛОКИРОВАН!', 'Убейте 75 врагов для активации!');
            } else {
                this.showNotification('УЛУЧШЕНИЕ!', `${type} улучшено!`);
            }
            
            this.updateStatsUI();
            this.updateCoinsDisplay();
        } else {
            this.showNotification('НЕДОСТАТОЧНО', 'Не хватает монет!');
        }
    }

    showNotification(title, text) {
        const notification = document.getElementById('notification');
        const titleElement = document.getElementById('notificationTitle');
        const textElement = document.getElementById('notificationText');
        
        titleElement.textContent = title;
        textElement.textContent = text;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    render() {
        this.ctx.save();
        
        if (this.cameraZoom !== 1 || this.cameraOffsetX !== 0 || this.cameraOffsetY !== 0) {
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.scale(this.cameraZoom, this.cameraZoom);
            this.ctx.translate(-this.canvas.width / 2 + this.cameraOffsetX, -this.canvas.height / 2 + this.cameraOffsetY);
        }
        
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderEffects();
        this.renderLaserBeams();
        this.renderEnergyWaves();
        this.renderBulletTrails();
        this.renderShipGlows();
        this.renderEnemyHits();

        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.color;
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowColor = powerUp.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.enemyBullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.beginPath();
            this.ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            
            if (enemy.type === 'armored') {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                this.ctx.fillStyle = '#555555';
                this.ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, enemy.height - 10);
            } else if (enemy.type === 'medic') {
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(enemy.x + enemy.width/2 - 5, enemy.y + enemy.height/2 - 10, 10, 20);
                this.ctx.fillRect(enemy.x + enemy.width/2 - 10, enemy.y + enemy.height/2 - 5, 20, 10);
            } else if (enemy.type === 'mage') {
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(enemy.x + enemy.width/2 - 8, enemy.y + enemy.height/2 - 2, 16, 4);
                this.ctx.fillRect(enemy.x + enemy.width/2 - 2, enemy.y + enemy.height/2 - 8, 4, 16);
            } else if (enemy.type === 'mechanic') {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.fillRect(enemy.x + 10, enemy.y + 10, enemy.width - 20, enemy.height - 20);
            } else {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
            
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            const healthPercent = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(enemy.x - 5, enemy.y - 15, enemy.width + 10, 6);
            this.ctx.fillStyle = healthPercent > 0.6 ? '#00ff88' : healthPercent > 0.3 ? '#ffaa00' : '#ff4444';
            this.ctx.fillRect(enemy.x - 5, enemy.y - 15, (enemy.width + 10) * healthPercent, 6);
        });

        this.bosses.forEach(boss => {
            this.ctx.fillStyle = boss.color;
            
            if (boss.type === 'boss') {
                this.ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
                this.ctx.fillStyle = '#ff8888';
                this.ctx.fillRect(boss.x + 10, boss.y + 10, boss.width - 20, boss.height - 20);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(boss.x + boss.width/2 - 15, boss.y + boss.height/2 - 5, 30, 10);
                this.ctx.fillRect(boss.x + boss.width/2 - 5, boss.y + boss.height/2 - 15, 10, 30);
            } else if (boss.type === 'doubleBoss') {
                this.ctx.beginPath();
                this.ctx.arc(boss.x + boss.width/2, boss.y + boss.height/2, boss.width/2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ffaa88';
                this.ctx.beginPath();
                this.ctx.arc(boss.x + boss.width/2, boss.y + boss.height/2, boss.width/3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.shadowColor = boss.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            const healthPercent = boss.health / boss.maxHealth;
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(boss.x - 10, boss.y - 20, boss.width + 20, 8);
            this.ctx.fillStyle = healthPercent > 0.6 ? '#00ff88' : healthPercent > 0.3 ? '#ffaa00' : '#ff4444';
            this.ctx.fillRect(boss.x - 10, boss.y - 20, (boss.width + 20) * healthPercent, 8);
        });

        this.bullets.forEach(bullet => {
            bullet.trail.forEach((point, index) => {
                const alpha = index / bullet.trail.length;
                this.ctx.fillStyle = `rgba(0, 243, 255, ${alpha * 0.5})`;
                this.ctx.fillRect(point.x, point.y, bullet.width, bullet.height);
            });
            
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });

        this.homingBullets.forEach(bullet => {
            bullet.trail.forEach((point, index) => {
                const alpha = index / bullet.trail.length;
                this.ctx.fillStyle = `rgba(255, 0, 255, ${alpha * 0.5})`;
                this.ctx.fillRect(point.x, point.y, bullet.width, bullet.height);
            });
            
            this.ctx.fillStyle = bullet.color;
            this.ctx.beginPath();
            this.ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.spikes.forEach(spike => {
            spike.trail.forEach((point, index) => {
                const alpha = index / spike.trail.length;
                this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.5})`;
                this.ctx.fillRect(point.x, point.y, spike.width, spike.height);
            });
            
            this.ctx.fillStyle = spike.color;
            this.ctx.beginPath();
            this.ctx.moveTo(spike.x + spike.width/2, spike.y);
            this.ctx.lineTo(spike.x, spike.y + spike.height);
            this.ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.shadowColor = spike.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        if (this.player) {
            this.shipGlows.forEach(glow => {
                const alpha = glow.life * 0.3;
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = glow.color;
                this.ctx.fillRect(glow.x, glow.y, glow.width, glow.height);
                this.ctx.globalAlpha = 1;
            });

            const pulseScale = 1 + Math.sin(this.player.pulse) * 0.05;
            this.ctx.save();
            this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
            this.ctx.scale(pulseScale, pulseScale);
            this.ctx.translate(-(this.player.x + this.player.width/2), -(this.player.y + this.player.height/2));
            
            this.ctx.fillStyle = this.player.color;
            
            if (this.player.shape === 'triangle') {
                this.ctx.beginPath();
                this.ctx.moveTo(this.player.x + this.player.width/2, this.player.y);
                this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
                this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
                this.ctx.closePath();
                this.ctx.fill();
            } else if (this.player.shape === 'spikedTriangle') {
                this.ctx.beginPath();
                this.ctx.moveTo(this.player.x + this.player.width/2, this.player.y);
                this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
                this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.fillStyle = '#ffff00';
                this.ctx.beginPath();
                this.ctx.moveTo(this.player.x + this.player.width/2, this.player.y - 10);
                this.ctx.lineTo(this.player.x + this.player.width/2 - 5, this.player.y);
                this.ctx.lineTo(this.player.x + this.player.width/2 + 5, this.player.y);
                this.ctx.closePath();
                this.ctx.fill();
            } else if (this.player.shape === 'doubleSpikedTriangle') {
                this.ctx.beginPath();
                this.ctx.moveTo(this.player.x + this.player.width/2, this.player.y);
                this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
                this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.fillStyle = '#ffff00';
                for (let i = 0; i < 2; i++) {
                    const offset = i === 0 ? -15 : 15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.player.x + this.player.width/2 + offset, this.player.y - 10);
                    this.ctx.lineTo(this.player.x + this.player.width/2 + offset - 5, this.player.y);
                    this.ctx.lineTo(this.player.x + this.player.width/2 + offset + 5, this.player.y);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }

            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(this.player.x + this.player.width/2 - 10, this.player.y + 20, 20, 10);
            this.ctx.fillRect(this.player.x + 5, this.player.y + this.player.height - 15, 10, 10);
            this.ctx.fillRect(this.player.x + this.player.width - 15, this.player.y + this.player.height - 15, 10, 10);

            this.ctx.shadowColor = this.player.color;
            this.ctx.shadowBlur = 20;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            this.ctx.restore();

            this.player.engineParticles.forEach(particle => {
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color;
                this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
                this.ctx.globalAlpha = 1;
            });
        }

        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            this.ctx.globalAlpha = 1;
        });

        this.ctx.restore();
        
        this.renderUI();
    }

    renderEffects() {
        this.effects.forEach(effect => {
            if (effect.type === 'flash') {
                const radius = effect.radius + (effect.maxRadius - effect.radius) * (1 - effect.life);
                const gradient = this.ctx.createRadialGradient(
                    effect.x, effect.y, 0,
                    effect.x, effect.y, radius
                );
                gradient.addColorStop(0, effect.color);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.globalAlpha = effect.life;
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(effect.x - radius, effect.y - radius, radius * 2, radius * 2);
                this.ctx.globalAlpha = 1;
            } else if (effect.type === 'shockwave') {
                const radius = effect.radius + (effect.maxRadius - effect.radius) * (1 - effect.life);
                const gradient = this.ctx.createRadialGradient(
                    effect.x, effect.y, 0,
                    effect.x, effect.y, radius
                );
                gradient.addColorStop(0, effect.color);
                gradient.addColorStop(0.5, 'rgba(255, 68, 68, 0.5)');
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.globalAlpha = effect.life;
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(effect.x - radius, effect.y - radius, radius * 2, radius * 2);
                this.ctx.globalAlpha = 1;
            }
        });
    }

    renderLaserBeams() {
        this.laserBeams.forEach(beam => {
            const alpha = beam.life;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = beam.color;
            this.ctx.fillRect(beam.x - beam.width/2, beam.y - beam.height, beam.width, beam.height);
            this.ctx.globalAlpha = 1;
        });
    }

    renderEnergyWaves() {
        this.energyWaves.forEach(wave => {
            const alpha = wave.life;
            const gradient = this.ctx.createRadialGradient(
                wave.x, wave.y, 0,
                wave.x, wave.y, wave.radius
            );
            gradient.addColorStop(0, wave.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(wave.x - wave.radius, wave.y - wave.radius, wave.radius * 2, wave.radius * 2);
            this.ctx.globalAlpha = 1;
        });
    }

    renderBulletTrails() {
        this.bulletTrails.forEach(trail => {
            const alpha = trail.life;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = trail.color;
            this.ctx.fillRect(trail.x, trail.y, trail.width, trail.height);
            this.ctx.globalAlpha = 1;
        });
    }

    renderShipGlows() {
        this.shipGlows.forEach(glow => {
            const alpha = glow.life * 0.3;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = glow.color;
            this.ctx.fillRect(glow.x, glow.y, glow.width, glow.height);
            this.ctx.globalAlpha = 1;
        });
    }

    renderEnemyHits() {
        this.enemyHits.forEach(hit => {
            const alpha = hit.life;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = hit.color;
            this.ctx.fillRect(hit.x, hit.y, hit.width, hit.height);
            this.ctx.globalAlpha = 1;
        });
    }

    renderUI() {
        const uiElements = [
            { text: `SCORE: ${this.score}`, x: 20, y: 30, color: '#00f3ff' },
            { text: `LEVEL: ${this.level}`, x: 20, y: 60, color: '#ff00ff' },
            { text: `LIVES: ${this.lives}`, x: 20, y: 90, color: '#00ff88' }
        ];

        uiElements.forEach(element => {
            this.ctx.fillStyle = element.color;
            this.ctx.font = '16px Orbitron';
            this.ctx.fillText(element.text, element.x, element.y);
            
            this.ctx.shadowColor = element.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(element.text, element.x, element.y);
            this.ctx.shadowBlur = 0;
        });

        const energyWidth = 200;
        const energyHeight = 10;
        const energyX = this.canvas.width - energyWidth - 20;
        const energyY = 30;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(energyX, energyY, energyWidth, energyHeight);

        this.ctx.fillStyle = this.power > 20 ? '#00f3ff' : '#ff4444';
        this.ctx.fillRect(energyX, energyY, energyWidth * (this.power / 100), energyHeight);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Orbitron';
        this.ctx.fillText(`ENERGY: ${Math.floor(this.power)}%`, energyX, energyY - 5);

        let bonusY = 70;
        Object.keys(this.tempBonuses).forEach(bonus => {
            if (this.tempBonuses[bonus].active) {
                const timeLeft = Math.ceil((this.tempBonuses[bonus].endTime - Date.now()) / 1000);
                let bonusText = '';
                
                switch(bonus) {
                    case 'coinMultiplier':
                        bonusText = `💰 x${this.tempBonuses[bonus].multiplier} (${timeLeft}s)`;
                        break;
                    case 'speedBoost':
                        bonusText = `🚀 +${Math.floor((this.tempBonuses[bonus].multiplier - 1) * 100)}% (${timeLeft}s)`;
                        break;
                    case 'damageBoost':
                        bonusText = `💥 +${Math.floor((this.tempBonuses[bonus].multiplier - 1) * 100)}% (${timeLeft}s)`;
                        break;
                    case 'immunity':
                        bonusText = `🛡️ Иммунитет (${timeLeft}s)`;
                        break;
                }
                
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.font = '12px Orbitron';
                this.ctx.fillText(bonusText, energyX, bonusY);
                bonusY += 20;
            }
        });
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = isNaN(this.lives) ? 0 : Math.max(0, this.lives);
        document.getElementById('level').textContent = this.level;
        document.getElementById('power').textContent = Math.floor(this.power) + '%';
    }

    updateStatsUI() {
        document.getElementById('totalScore').textContent = this.stats.totalScore;
        document.getElementById('totalKills').textContent = this.stats.totalKills;
        document.getElementById('highestLevel').textContent = this.stats.highestLevel;
        
        const minutes = Math.floor(this.stats.playTime / 60);
        const seconds = this.stats.playTime % 60;
        document.getElementById('playTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updateCoinsDisplay() {
        document.getElementById('coinsCount').textContent = this.coins;
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseMenu').style.display = 'flex';
            this.audio.background.pause();
            if (this.settings.jazzMusic) {
                this.audio.jazz.pause();
            }
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseMenu').style.display = 'none';
            if (this.settings.jazzMusic) {
                this.audio.jazz.play();
            } else {
                this.audio.background.play();
            }
        }
    }

    saveGameData() {
        const gameData = {
            stats: this.stats,
            upgrades: this.upgrades,
            coins: this.coins,
            passives: this.passives,
            ultimateUnlocked: this.ultimate.unlocked,
            playerTransformation: this.playerTransformation
        };
        localStorage.setItem('cosmicDefenderSave', JSON.stringify(gameData));
    }

    loadGameData() {
        const savedData = localStorage.getItem('cosmicDefenderSave');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.stats = gameData.stats || this.stats;
            this.upgrades = gameData.upgrades || this.upgrades;
            this.coins = gameData.coins || 0;
            this.passives = gameData.passives || this.passives;
            this.ultimate.unlocked = gameData.ultimateUnlocked || false;
            this.playerTransformation = gameData.playerTransformation || this.playerTransformation;
        }
    }

    gameLoop() {
        this.gameLoopRunning = true;
        
        this.update();
        this.render();
        this.updateEffects();
        this.updateCursorDisplay();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            requestAnimationFrame(() => this.gameLoop());
        } else {
            this.gameLoopRunning = false;
        }
    }
}

let game;
window.addEventListener('load', () => {
    game = new CosmicDefenderPro();
});
