/**
 * Quantum Orbit - Game Engine
 * HTML5 Canvas + Web Audio API + Mobile Optimization
 */

// --- Audio Synthesizer Class ---
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        
        // Music sequencer variables
        this.sequencerInterval = null;
        this.currentStep = 0;
        this.bpm = 124;
        this.musicGain = null;
        
        // Load settings
        this.sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    }

    init() {
        if (this.ctx) return;
        
        // Initialize AudioContext safely
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        
        try {
            this.ctx = new AudioContextClass();
            
            // Create main gain node for music
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // keep music quiet & ambient
            this.musicGain.connect(this.ctx.destination);
            
            if (this.musicEnabled) {
                this.startMusic();
            }
        } catch (e) {
            console.warn("Web Audio API failed to initialize:", e);
        }
    }

    resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        localStorage.setItem('sfxEnabled', this.sfxEnabled);
        return this.sfxEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('musicEnabled', this.musicEnabled);
        
        if (this.musicEnabled) {
            this.init();
            this.startMusic();
        } else {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    // Play a procedurally generated crash/explosion sound
    playCrash() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resumeContext();
        
        const now = this.ctx.currentTime;
        
        // Low boom oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.8);
        
        // Low-pass filter to make it deep
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 0.8);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.85);

        // Noise burst for debris crackle
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.3);
    }

    // Play a synthesized collection chime (golden spark)
    playCollect() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resumeContext();
        
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        
        // High crystalline bells
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.setValueAtTime(1320, now + 0.08); // E6
        
        osc2.frequency.setValueAtTime(1760, now); // A6
        osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.15); // Rising glide
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.25);
    }

    // Play orbit transition / switch sound
    playOrbitSwitch() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resumeContext();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
        
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.07);
    }

    // Play Supernova trigger burst sound
    playSupernovaTrigger() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resumeContext();
        
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 1.0);
        filter.Q.setValueAtTime(8, now);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 1.4);
    }

    // Start background synthwave music loops
    startMusic() {
        this.stopMusic();
        if (!this.ctx) return;
        this.resumeContext();
        
        const stepDuration = 60 / this.bpm / 2; // Eighth notes
        
        // Simple bass progression: A -> F -> C -> G
        const progression = [
            [55, 110], // A1, A2
            [55, 110],
            [43.65, 87.3], // F1, F2
            [43.65, 87.3],
            [65.41, 130.8], // C2, C3
            [65.41, 130.8],
            [49.00, 98.0], // G1, G2
            [49.00, 98.0]
        ];

        // Arpeggio notes (Pentatonic scale A minor: A, C, D, E, G)
        const leadPattern = [
            220, 261.63, 329.63, 392, 440, 523.25, 587.33, 659.25,
            587.33, 523.25, 440, 392, 329.63, 293.66, 261.63, 220
        ];

        this.sequencerInterval = setInterval(() => {
            if (!this.ctx || this.ctx.state === 'suspended') return;
            const now = this.ctx.currentTime;
            
            // 1. Play deep bass note on every other step
            if (this.currentStep % 2 === 0) {
                const chordIdx = Math.floor(this.currentStep / 2) % progression.length;
                const frequencies = progression[chordIdx];
                
                frequencies.forEach((freq) => {
                    const bassOsc = this.ctx.createOscillator();
                    const bassGain = this.ctx.createGain();
                    
                    bassOsc.type = 'triangle';
                    bassOsc.frequency.setValueAtTime(freq, now);
                    
                    bassGain.gain.setValueAtTime(0.04, now);
                    bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);
                    
                    bassOsc.connect(bassGain);
                    bassGain.connect(this.musicGain);
                    
                    bassOsc.start(now);
                    bassOsc.stop(now + stepDuration * 1.9);
                });
            }
            
            // 2. Play ambient light synth arpeggio on eighth notes
            if (Math.random() > 0.15) { // Add atmospheric variance
                const leadFreq = leadPattern[(this.currentStep * 3) % leadPattern.length];
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();
                const leadFilter = this.ctx.createBiquadFilter();
                
                leadOsc.type = 'sine';
                leadOsc.frequency.setValueAtTime(leadFreq, now);
                
                // Add soft vibrato
                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.value = 6; // 6Hz frequency modulation
                lfoGain.gain.value = 4; // width
                lfo.connect(lfoGain);
                lfoGain.connect(leadOsc.frequency);
                
                leadFilter.type = 'lowpass';
                leadFilter.frequency.setValueAtTime(2000, now);
                
                leadGain.gain.setValueAtTime(0.015, now);
                leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.95);
                
                lfo.start(now);
                leadOsc.connect(leadFilter);
                leadFilter.connect(leadGain);
                leadGain.connect(this.musicGain);
                
                leadOsc.start(now);
                lfo.stop(now + stepDuration);
                leadOsc.stop(now + stepDuration);
            }
            
            this.currentStep = (this.currentStep + 1) % 16;
            
        }, stepDuration * 1000);
    }

    stopMusic() {
        if (this.sequencerInterval) {
            clearInterval(this.sequencerInterval);
            this.sequencerInterval = null;
        }
    }
}

const synth = new SoundSynth();

// --- Game Engine Implementation ---

const GameStates = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.state = GameStates.MENU;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore') || '0', 10);
        this.multiplier = 1;
        this.comboProgress = 0; // 0 to 100
        this.supernovaEnergy = 0; // 0 to 100
        this.isSupernova = false;
        this.supernovaTimer = 0;
        this.supernovaDuration = 360; // frames (~6 seconds at 60 FPS)
        
        // System stats
        this.sparksCollected = 0;
        this.startTime = 0;
        this.playTime = 0;
        this.maxComboReached = 1;
        this.screenShake = 0;
        
        // Resolution & scale
        this.dpr = window.devicePixelRatio || 1;
        this.width = 0;
        this.height = 0;
        this.center = { x: 0, y: 0 };
        this.scaleDimension = 0; // dynamically calculated min dimension
        
        // Gameplay radius properties
        this.orbitRadiusOuter = 0;
        this.orbitRadiusInner = 0;
        
        // Player properties
        this.player = {
            angle: 0,
            radius: 0,
            targetRadius: 0,
            size: 8,
            speed: 0.035, // angular velocity
            color: '#00f0ff',
            direction: 1 // 1: clockwise, -1: counter-clockwise
        };
        
        // Control touch state
        this.isTouchActive = false;
        
        // Game lists
        this.obstacles = [];
        this.sparks = [];
        this.particles = [];
        this.stars = [];
        
        // Settings & Spawning parameters
        this.difficultyLevel = 1;
        this.spawnTimer = 0;
        this.sparkSpawnTimer = 0;
        this.lastFrameTime = 0;
        
        // DOM overlays
        this.dom = {
            hud: document.getElementById('hud'),
            hudScore: document.getElementById('hud-score'),
            hudMultiplier: document.getElementById('hud-multiplier'),
            hudComboFill: document.getElementById('hud-combo-fill'),
            hudPowerFill: document.getElementById('hud-power-fill'),
            overlayContainer: document.getElementById('overlay-container'),
            screenMenu: document.getElementById('screen-main-menu'),
            screenPause: document.getElementById('screen-pause'),
            screenGameOver: document.getElementById('screen-game-over'),
            menuHighScore: document.getElementById('menu-high-score'),
            finalScore: document.getElementById('final-score'),
            maxCombo: document.getElementById('max-combo'),
            sparksCollected: document.getElementById('sparks-collected'),
            timeSurvived: document.getElementById('time-survived'),
            newHighScoreBanner: document.getElementById('new-high-score-banner'),
            btnPlay: document.getElementById('btn-play'),
            btnPause: document.getElementById('btn-pause'),
            btnResume: document.getElementById('btn-resume'),
            btnRestartPaused: document.getElementById('btn-restart-paused'),
            btnQuitPaused: document.getElementById('btn-quit-paused'),
            btnRetry: document.getElementById('btn-retry'),
            btnQuit: document.getElementById('btn-quit'),
            btnToggleSFX: document.getElementById('btn-toggle-sfx'),
            btnToggleMusic: document.getElementById('btn-toggle-music')
        };
        
        this.initDOM();
        this.resize();
        this.createStars();
        
        window.addEventListener('resize', () => this.resize());
        
        // Setup initial sound configs in UI
        this.updateSoundButtons();
        
        // Kickoff the loop
        requestAnimationFrame((t) => this.loop(t));
    }

    initDOM() {
        // Initial setup for displays
        this.dom.menuHighScore.textContent = this.formatScore(this.highScore);
        
        // Attach event listeners
        this.dom.btnPlay.addEventListener('click', () => this.startGame());
        this.dom.btnPause.addEventListener('click', (e) => {
            e.stopPropagation();
            this.pauseGame();
        });
        this.dom.btnResume.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resumeGame();
        });
        
        this.dom.btnRestartPaused.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startGame();
        });
        
        this.dom.btnQuitPaused.addEventListener('click', (e) => {
            e.stopPropagation();
            this.quitToMenu();
        });
        
        this.dom.btnRetry.addEventListener('click', () => this.startGame());
        this.dom.btnQuit.addEventListener('click', () => this.quitToMenu());
        
        // Settings Toggles
        this.dom.btnToggleSFX.addEventListener('click', (e) => {
            e.stopPropagation();
            const state = synth.toggleSFX();
            this.updateSoundButtons();
            if (state) synth.playOrbitSwitch();
        });
        
        this.dom.btnToggleMusic.addEventListener('click', (e) => {
            e.stopPropagation();
            synth.toggleMusic();
            this.updateSoundButtons();
            synth.playOrbitSwitch();
        });
        
        // Gameplay input handlers
        // Touch events
        window.addEventListener('touchstart', (e) => this.handleInputStart(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleInputEnd(e), { passive: false });
        window.addEventListener('touchcancel', (e) => this.handleInputEnd(e), { passive: false });
        
        // Mouse clicks
        window.addEventListener('mousedown', (e) => {
            // Check if clicking on UI buttons
            if (e.target.closest('button') || e.target.closest('.menu-screen')) return;
            this.handleInputStart(e);
        });
        window.addEventListener('mouseup', (e) => this.handleInputEnd(e));
        
        // Keyboard spacebar
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInputStart(e);
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.handleInputEnd(e);
            }
        });
    }

    updateSoundButtons() {
        this.dom.btnToggleSFX.innerHTML = `<span class="icon">🔊</span> SFX: ${synth.sfxEnabled ? 'ON' : 'OFF'}`;
        this.dom.btnToggleSFX.classList.toggle('btn-secondary', synth.sfxEnabled);
        this.dom.btnToggleSFX.classList.toggle('btn-danger', !synth.sfxEnabled);
        
        this.dom.btnToggleMusic.innerHTML = `<span class="icon">🎵</span> MUSIC: ${synth.musicEnabled ? 'ON' : 'OFF'}`;
        this.dom.btnToggleMusic.classList.toggle('btn-secondary', synth.musicEnabled);
        this.dom.btnToggleMusic.classList.toggle('btn-danger', !synth.musicEnabled);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        
        this.center = { x: this.width / 2, y: this.height / 2 };
        this.scaleDimension = Math.min(this.width, this.height);
        
        // Recalculate orbits scaled to screensize
        this.orbitRadiusOuter = this.scaleDimension * 0.34;
        this.orbitRadiusInner = this.scaleDimension * 0.17;
        this.player.size = Math.max(6, this.scaleDimension * 0.015);
        
        // Re-scale obstacles and sparks already on canvas
        this.obstacles.forEach(o => o.recalculateScale(this.scaleDimension));
        this.sparks.forEach(s => s.recalculateScale(this.scaleDimension));
    }

    // Input hooks
    handleInputStart(e) {
        if (this.state !== GameStates.PLAYING) return;
        
        if (e && e.cancelable) {
            e.preventDefault();
        }
        
        this.isTouchActive = true;
        this.player.targetRadius = this.orbitRadiusInner;
        synth.playOrbitSwitch();
        
        // Create quick contraction puff particles
        this.createPuffParticles(this.player.radius, this.player.angle);
    }

    handleInputEnd(e) {
        if (this.state !== GameStates.PLAYING) return;
        
        this.isTouchActive = false;
        this.player.targetRadius = this.orbitRadiusOuter;
        synth.playOrbitSwitch();
        
        // Create quick expansion puff particles
        this.createPuffParticles(this.player.radius, this.player.angle);
    }

    // Gameplay loops & flow controls
    startGame() {
        synth.init();
        synth.resumeContext();
        
        this.score = 0;
        this.multiplier = 1;
        this.maxComboReached = 1;
        this.comboProgress = 0;
        this.supernovaEnergy = 0;
        this.isSupernova = false;
        this.sparksCollected = 0;
        this.startTime = Date.now();
        this.playTime = 0;
        this.difficultyLevel = 1;
        this.obstacles = [];
        this.sparks = [];
        this.particles = [];
        
        this.player.angle = 0;
        this.player.radius = this.orbitRadiusOuter;
        this.player.targetRadius = this.orbitRadiusOuter;
        this.isTouchActive = false;
        this.spawnTimer = 0;
        this.sparkSpawnTimer = 0;
        
        this.state = GameStates.PLAYING;
        
        // Update UI
        this.updateHUD();
        this.dom.hud.classList.remove('hidden');
        
        this.transitionScreen(this.dom.screenMenu, null);
        this.transitionScreen(this.dom.screenPause, null);
        this.transitionScreen(this.dom.screenGameOver, null);
        this.dom.overlayContainer.classList.add('hidden');
        
        synth.playOrbitSwitch();
    }

    pauseGame() {
        if (this.state !== GameStates.PLAYING) return;
        this.state = GameStates.PAUSED;
        
        this.dom.overlayContainer.classList.remove('hidden');
        this.transitionScreen(null, this.dom.screenPause);
        
        synth.playOrbitSwitch();
    }

    resumeGame() {
        if (this.state !== GameStates.PAUSED) return;
        this.state = GameStates.PLAYING;
        
        this.dom.overlayContainer.classList.add('hidden');
        this.transitionScreen(this.dom.screenPause, null);
        
        synth.playOrbitSwitch();
    }

    gameOver() {
        this.state = GameStates.GAMEOVER;
        
        synth.playCrash();
        this.screenShake = 30; // Strong screen shake on death
        
        this.playTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        // Calculate high score
        let isNewRecord = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore.toString());
            isNewRecord = true;
        }
        
        // Update Game Over UI fields
        this.dom.finalScore.textContent = this.formatScore(this.score);
        this.dom.maxCombo.textContent = `${this.maxComboReached}x`;
        this.dom.sparksCollected.textContent = this.sparksCollected;
        this.dom.timeSurvived.textContent = `${this.playTime}s`;
        this.dom.menuHighScore.textContent = this.formatScore(this.highScore);
        
        if (isNewRecord) {
            this.dom.newHighScoreBanner.classList.remove('hidden');
        } else {
            this.dom.newHighScoreBanner.classList.add('hidden');
        }
        
        // Display Game Over Overlay
        this.dom.hud.classList.add('hidden');
        this.dom.overlayContainer.classList.remove('hidden');
        this.transitionScreen(null, this.dom.screenGameOver);
        
        // Death explosion particles
        const pCount = 50;
        const px = this.center.x + Math.cos(this.player.angle) * this.player.radius;
        const py = this.center.y + Math.sin(this.player.angle) * this.player.radius;
        for (let i = 0; i < pCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push(new Particle(
                px, py,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.5 ? '#00f0ff' : '#ff0055',
                Math.random() * 4 + 2,
                Math.random() * 30 + 30
            ));
        }
    }

    quitToMenu() {
        this.state = GameStates.MENU;
        this.dom.hud.classList.add('hidden');
        this.dom.overlayContainer.classList.remove('hidden');
        
        this.transitionScreen(this.dom.screenPause, this.dom.screenMenu);
        this.transitionScreen(this.dom.screenGameOver, this.dom.screenMenu);
        
        synth.playOrbitSwitch();
    }

    transitionScreen(fromScreen, toScreen) {
        if (fromScreen) {
            fromScreen.classList.remove('active');
            setTimeout(() => {
                fromScreen.classList.add('hidden');
            }, 300);
        }
        if (toScreen) {
            toScreen.classList.remove('hidden');
            // Force redraw/reflow before activating transition
            toScreen.offsetHeight; 
            toScreen.classList.add('active');
        }
    }

    formatScore(score) {
        return score.toString().padStart(4, '0');
    }

    updateHUD() {
        this.dom.hudScore.textContent = this.formatScore(this.score);
        this.dom.hudMultiplier.textContent = `${this.multiplier}x`;
        this.dom.hudComboFill.style.width = `${this.comboProgress}%`;
        this.dom.hudPowerFill.style.width = `${this.supernovaEnergy}%`;
        
        if (this.isSupernova) {
            this.dom.hudPowerFill.classList.add('active');
        } else {
            this.dom.hudPowerFill.classList.remove('active');
        }
    }

    // Starfield Parallax initialization
    createStars() {
        this.stars = [];
        const count = 100;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.5,
                depth: Math.random() * 0.5 + 0.2, // speed factor for parallax
                alpha: Math.random() * 0.8 + 0.2
            });
        }
    }

    createPuffParticles(radius, angle) {
        const px = this.center.x + Math.cos(angle) * radius;
        const py = this.center.y + Math.sin(angle) * radius;
        for (let i = 0; i < 8; i++) {
            const a = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            const spd = (Math.random() - 0.5) * 2;
            this.particles.push(new Particle(
                px, py,
                Math.cos(a) * spd,
                Math.sin(a) * spd,
                'rgba(0, 240, 255, 0.4)',
                Math.random() * 2 + 1,
                15
            ));
        }
    }

    // Trigger full invincible Supernova mode
    triggerSupernova() {
        this.isSupernova = true;
        this.supernovaTimer = this.supernovaDuration;
        synth.playSupernovaTrigger();
        this.screenShake = 15;
        
        // Spawn ring particles
        const steps = 36;
        const px = this.center.x + Math.cos(this.player.angle) * this.player.radius;
        const py = this.center.y + Math.sin(this.player.angle) * this.player.radius;
        for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            const speed = 4;
            this.particles.push(new Particle(
                px, py,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffd700',
                3,
                40
            ));
        }
    }

    // --- Core Game Loop ---
    loop(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const dt = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame((t) => this.loop(t));
    }

    // Engine updates
    update(dt) {
        this.updateParticles();
        this.updateStars();
        
        if (this.state !== GameStates.PLAYING) return;
        
        // 1. Move Player
        // Interpolate current radius to target radius (outer vs inner)
        this.player.radius += (this.player.targetRadius - this.player.radius) * 0.15;
        
        // Conserve angular speed: faster orbit when closer to the star
        const currentSpeedFactor = this.player.radius === this.orbitRadiusInner ? 1.4 : 1.0;
        this.player.angle += this.player.speed * currentSpeedFactor * this.player.direction;
        if (this.player.angle > Math.PI * 2) this.player.angle -= Math.PI * 2;
        if (this.player.angle < 0) this.player.angle += Math.PI * 2;
        
        // Emit player trail particles
        if (Math.random() > 0.3) {
            const px = this.center.x + Math.cos(this.player.angle) * this.player.radius;
            const py = this.center.y + Math.sin(this.player.angle) * this.player.radius;
            // exhaust particle offset opposite to travel direction
            const exhaustAngle = this.player.angle - (0.05 * this.player.direction);
            const ex = this.center.x + Math.cos(exhaustAngle) * this.player.radius;
            const ey = this.center.y + Math.sin(exhaustAngle) * this.player.radius;
            
            this.particles.push(new Particle(
                ex, ey,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                this.isSupernova ? '#ffd700' : '#00f0ff',
                Math.random() * 3 + 1,
                this.isSupernova ? 40 : 25
            ));
        }
        
        // 2. Manage Supernova state
        if (this.isSupernova) {
            this.supernovaTimer--;
            this.supernovaEnergy = (this.supernovaTimer / this.supernovaDuration) * 100;
            if (this.supernovaTimer <= 0) {
                this.isSupernova = false;
                this.supernovaEnergy = 0;
            }
        }
        
        // Decrease combo meter slowly over time
        if (this.comboProgress > 0 && !this.isSupernova) {
            this.comboProgress -= 0.15;
            if (this.comboProgress <= 0) {
                this.comboProgress = 0;
                this.multiplier = 1;
            }
        }
        
        // 3. Spawn Entities
        this.spawnTimer += 1;
        // Spawning rates increase slightly with score difficulty
        this.difficultyLevel = 1 + Math.floor(this.score / 500);
        const spawnDelay = Math.max(35, 80 - this.difficultyLevel * 6);
        
        if (this.spawnTimer >= spawnDelay) {
            this.spawnTimer = 0;
            this.spawnObstacle();
        }
        
        this.sparkSpawnTimer += 1;
        const sparkSpawnDelay = Math.max(60, 120 - this.difficultyLevel * 2);
        if (this.sparkSpawnTimer >= sparkSpawnDelay) {
            this.sparkSpawnTimer = 0;
            this.spawnSpark();
        }
        
        // 4. Update & Clean Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.update();
            
            // Delete if out of bounds (too far away from center)
            const dist = Math.hypot(obs.x - this.center.x, obs.y - this.center.y);
            if (dist > this.scaleDimension * 0.95 && obs.isInsidePlayfield) {
                this.obstacles.splice(i, 1);
                continue;
            }
            if (dist < this.scaleDimension * 0.8) {
                obs.isInsidePlayfield = true; // Mark as inside so edge spawn deletion doesn't trigger immediately
            }
            
            // Check collision with player
            const px = this.center.x + Math.cos(this.player.angle) * this.player.radius;
            const py = this.center.y + Math.sin(this.player.angle) * this.player.radius;
            const collDist = Math.hypot(obs.x - px, obs.y - py);
            
            if (collDist < (obs.size + this.player.size)) {
                if (this.isSupernova) {
                    // Destroy obstacle in Supernova mode
                    this.obstacles.splice(i, 1);
                    synth.playCrash();
                    this.score += 50 * this.multiplier;
                    this.screenShake = 6;
                    
                    // Create explosion particles
                    for (let p = 0; p < 12; p++) {
                        const a = Math.random() * Math.PI * 2;
                        const s = Math.random() * 3 + 1;
                        this.particles.push(new Particle(obs.x, obs.y, Math.cos(a)*s, Math.sin(a)*s, '#ff5500', Math.random()*3+1, 20));
                    }
                } else {
                    // Crash! Game over
                    this.gameOver();
                    return;
                }
            }
        }
        
        // 5. Update & Clean Sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            
            // Magnet effect if Supernova mode is active
            if (this.isSupernova) {
                const px = this.center.x + Math.cos(this.player.angle) * this.player.radius;
                const py = this.center.y + Math.sin(this.player.angle) * this.player.radius;
                const distToPlayer = Math.hypot(spark.x - px, spark.y - py);
                
                if (distToPlayer < this.scaleDimension * 0.3) {
                    // Pull spark toward player
                    const dx = px - spark.x;
                    const dy = py - spark.y;
                    spark.x += (dx / distToPlayer) * 7;
                    spark.y += (dy / distToPlayer) * 7;
                }
            }
            
            spark.update();
            
            // Check collision with player
            const px = this.center.x + Math.cos(this.player.angle) * this.player.radius;
            const py = this.center.y + Math.sin(this.player.angle) * this.player.radius;
            const collDist = Math.hypot(spark.x - px, spark.y - py);
            
            if (collDist < (spark.size + this.player.size)) {
                // Collect Spark!
                this.sparks.splice(i, 1);
                this.sparksCollected++;
                synth.playCollect();
                
                // Score and multiplier updates
                this.score += 10 * this.multiplier;
                
                // Update combo
                this.comboProgress += 25; // 4 collections to raise multiplier
                if (this.comboProgress >= 100) {
                    this.comboProgress = 0;
                    this.multiplier++;
                    if (this.multiplier > this.maxComboReached) {
                        this.maxComboReached = this.multiplier;
                    }
                }
                
                // Update Supernova power
                if (!this.isSupernova) {
                    this.supernovaEnergy += 10; // 10 sparks to trigger
                    if (this.supernovaEnergy >= 100) {
                        this.supernovaEnergy = 100;
                        this.triggerSupernova();
                    }
                }
                
                // Splash collection particles
                for (let p = 0; p < 12; p++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = Math.random() * 4 + 1;
                    this.particles.push(new Particle(
                        spark.x, spark.y,
                        Math.cos(a) * s,
                        Math.sin(a) * s,
                        '#ffd700',
                        Math.random() * 3 + 1,
                        20
                    ));
                }
                
                continue;
            }
            
            // Remove if spark has expired
            if (spark.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }
        
        // Slowly increment survival score
        if (Math.random() < 0.08) {
            this.score += 1 * this.multiplier;
        }
        
        this.updateHUD();
        
        // Screen shake decay
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }
    }

    // Entity Spawning Logic
    spawnObstacle() {
        const types = ['radial', 'orbiting', 'sweeper'];
        const choice = types[Math.floor(Math.random() * types.length)];
        
        if (choice === 'radial') {
            // Radial asteroid: flies from outer edge, straight through center
            const spawnAngle = Math.random() * Math.PI * 2;
            const distance = this.scaleDimension * 0.8;
            
            // Start at canvas relative outer boundaries
            const x = this.center.x + Math.cos(spawnAngle) * distance;
            const y = this.center.y + Math.sin(spawnAngle) * distance;
            
            // Target center with slight variance
            const variance = (Math.random() - 0.5) * 40;
            const targetX = this.center.x + variance;
            const targetY = this.center.y + variance;
            
            const angleToTarget = Math.atan2(targetY - y, targetX - x);
            const baseSpeed = Math.random() * 2 + 1.5;
            const speed = baseSpeed + (this.difficultyLevel * 0.25);
            
            const vx = Math.cos(angleToTarget) * speed;
            const vy = Math.sin(angleToTarget) * speed;
            
            const size = Math.random() * 8 + 6;
            
            this.obstacles.push(new Obstacle(x, y, vx, vy, size, 'radial', this.scaleDimension));
        } 
        else if (choice === 'orbiting') {
            // Orbiting debris belt segment: spawns in inner or outer orbit, rotating in opposite direction
            const orbits = [this.orbitRadiusInner, this.orbitRadiusOuter];
            const chosenOrbit = orbits[Math.floor(Math.random() * orbits.length)];
            
            // Spawn at random angle
            const spawnAngle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 0.01 + 0.01) + (this.difficultyLevel * 0.001);
            
            // Run opposite direction to the player
            const dir = -this.player.direction;
            
            const size = Math.random() * 6 + 5;
            
            const obs = new Obstacle(0, 0, 0, 0, size, 'orbiting', this.scaleDimension);
            obs.orbitRadius = chosenOrbit;
            obs.orbitAngle = spawnAngle;
            obs.orbitSpeed = speed;
            obs.orbitDirection = dir;
            obs.center = this.center;
            obs.updatePosition();
            
            this.obstacles.push(obs);
        }
        else {
            // Sweeper asteroid: flies in a straight line cutting across the orbits
            const side = Math.floor(Math.random() * 4);
            let x, y;
            const dist = this.scaleDimension * 0.8;
            
            if (side === 0) { // Top
                x = Math.random() * this.width;
                y = this.center.y - dist;
            } else if (side === 1) { // Right
                x = this.center.x + dist;
                y = Math.random() * this.height;
            } else if (side === 2) { // Bottom
                x = Math.random() * this.width;
                y = this.center.y + dist;
            } else { // Left
                x = this.center.x - dist;
                y = Math.random() * this.height;
            }
            
            // Shoot towards a point near the player's current quadrant
            const playerX = this.center.x + Math.cos(this.player.angle) * this.player.radius;
            const playerY = this.center.y + Math.sin(this.player.angle) * this.player.radius;
            const targetX = playerX + (Math.random() - 0.5) * 80;
            const targetY = playerY + (Math.random() - 0.5) * 80;
            
            const angleToTarget = Math.atan2(targetY - y, targetX - x);
            const speed = (Math.random() * 1.5 + 1.2) + (this.difficultyLevel * 0.15);
            
            const vx = Math.cos(angleToTarget) * speed;
            const vy = Math.sin(angleToTarget) * speed;
            const size = Math.random() * 7 + 5;
            
            this.obstacles.push(new Obstacle(x, y, vx, vy, size, 'sweeper', this.scaleDimension));
        }
    }

    spawnSpark() {
        const orbits = [this.orbitRadiusInner, this.orbitRadiusOuter];
        const chosenOrbit = orbits[Math.floor(Math.random() * orbits.length)];
        
        // Spawn ahead of the player's general direction
        const offset = Math.PI / 2 + Math.random() * Math.PI; // Spawn opposite or ahead
        const angle = this.player.angle + offset * this.player.direction;
        
        const x = this.center.x + Math.cos(angle) * chosenOrbit;
        const y = this.center.y + Math.sin(angle) * chosenOrbit;
        
        const size = Math.max(4, this.scaleDimension * 0.008);
        
        this.sparks.push(new Spark(x, y, size, this.scaleDimension));
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateStars() {
        // Slow star drift to give speed sensation
        this.stars.forEach(star => {
            const speed = 0.4 * star.depth;
            // Drift stars towards left-bottom
            star.x -= speed;
            star.y += speed * 0.5;
            
            // Wrap around
            if (star.x < 0) {
                star.x = this.width;
                star.y = Math.random() * this.height;
            }
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    }

    // --- Drawing routines ---
    draw() {
        // Apply screen shake
        this.ctx.save();
        if (this.screenShake > 0.1) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
        }
        
        // 1. Clear background (slight alpha trails to create particle speed sensation)
        this.ctx.fillStyle = '#0a0813';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 2. Draw Stars
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // 3. Draw orbits (rings)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        this.ctx.lineWidth = 2;
        
        // Outer orbit ring
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, this.orbitRadiusOuter, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Inner orbit ring
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, this.orbitRadiusInner, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 4. Draw Gravity Star (Center Sun)
        const pulse = Math.sin(Date.now() * 0.003) * 5;
        const starRadius = Math.max(20, this.scaleDimension * 0.04) + pulse;
        
        // Radial star glow gradient
        const glowGrad = this.ctx.createRadialGradient(
            this.center.x, this.center.y, starRadius * 0.3,
            this.center.x, this.center.y, starRadius * 1.5
        );
        glowGrad.addColorStop(0, '#ff0055');
        glowGrad.addColorStop(0.3, '#7a00ff');
        glowGrad.addColorStop(1, 'rgba(122, 0, 255, 0)');
        
        this.ctx.fillStyle = glowGrad;
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, starRadius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Solid core
        this.ctx.fillStyle = '#ff0055';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff0055';
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, starRadius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset shadow
        
        // 5. Draw Particles
        this.particles.forEach(p => p.draw(this.ctx));
        
        // 6. Draw Sparks
        this.sparks.forEach(s => s.draw(this.ctx));
        
        // 7. Draw Obstacles
        this.obstacles.forEach(o => o.draw(this.ctx));
        
        // 8. Draw Player
        const px = this.center.x + Math.cos(this.player.angle) * this.player.radius;
        const py = this.center.y + Math.sin(this.player.angle) * this.player.radius;
        
        this.ctx.save();
        this.ctx.translate(px, py);
        
        // Rotate player facing its orbital trajectory velocity
        const trajectoryAngle = this.player.angle + (Math.PI / 2) * this.player.direction;
        this.ctx.rotate(trajectoryAngle);
        
        // Player body - glowing wedge
        this.ctx.fillStyle = this.isSupernova ? '#ffd700' : '#00f0ff';
        this.ctx.shadowBlur = this.isSupernova ? 20 : 12;
        this.ctx.shadowColor = this.isSupernova ? '#ffd700' : '#00f0ff';
        
        this.ctx.beginPath();
        // Triangle shape facing forward
        this.ctx.moveTo(0, -this.player.size);
        this.ctx.lineTo(-this.player.size * 0.7, this.player.size * 0.7);
        this.ctx.lineTo(this.player.size * 0.7, this.player.size * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
        
        this.ctx.restore(); // Restore from shake translation
    }
}

// --- Class Definitions for Game Objects ---

// Spark Collectible Entity
class Spark {
    constructor(x, y, size, scaleDimension) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.baseSize = size;
        this.pulseSeed = Math.random() * 100;
        this.life = 400; // auto-expire frames
        this.opacity = 1;
    }

    recalculateScale(scaleDimension) {
        this.size = Math.max(4, scaleDimension * 0.008);
        this.baseSize = this.size;
    }

    update() {
        this.life--;
        // Fade out at end of life
        if (this.life < 60) {
            this.opacity = this.life / 60;
        }
    }

    draw(ctx) {
        const sizePulse = this.baseSize * (1 + 0.25 * Math.sin(Date.now() * 0.01 + this.pulseSeed));
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        
        // Golden diamond star shape
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - sizePulse * 1.3);
        ctx.lineTo(this.x + sizePulse * 0.8, this.y);
        ctx.lineTo(this.x, this.y + sizePulse * 1.3);
        ctx.lineTo(this.x - sizePulse * 0.8, this.y);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Obstacle (Asteroid) Entity
class Obstacle {
    constructor(x, y, vx, vy, size, type, scaleDimension) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.baseSize = size;
        this.type = type; // 'radial', 'orbiting', 'sweeper'
        this.isInsidePlayfield = false; // Prevents premature edge deletion
        this.rotAngle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.05;
        
        // Properties used strictly for orbiting obstacles
        this.orbitRadius = 0;
        this.orbitAngle = 0;
        this.orbitSpeed = 0;
        this.orbitDirection = 1;
        this.center = null;
    }

    recalculateScale(scaleDimension) {
        // Scaled to the game dimensions
        const ratio = this.baseSize / Math.max(600, window.innerWidth);
        this.size = Math.max(4, scaleDimension * 0.015);
    }

    updatePosition() {
        if (!this.center) return;
        this.x = this.center.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.center.y + Math.sin(this.orbitAngle) * this.orbitRadius;
    }

    update() {
        this.rotAngle += this.rotSpeed;
        
        if (this.type === 'orbiting') {
            this.orbitAngle += this.orbitSpeed * this.orbitDirection;
            this.updatePosition();
        } else {
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotAngle);
        
        // Draw jagged rock asteroid shape
        ctx.fillStyle = '#ff5500';
        ctx.shadowColor = '#ff5500';
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        const pts = 7;
        for (let i = 0; i < pts; i++) {
            const angle = (i / pts) * Math.PI * 2;
            // jagged edges variance
            const variance = 0.8 + (Math.sin(i * 1.5 + this.rotAngle * 0.2) + 1) * 0.15;
            const r = this.size * variance;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Particle System Entity
class Particle {
    constructor(x, y, vx, vy, color, size, maxLife) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = maxLife;
        this.maxLife = maxLife;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Start Game system onload
window.addEventListener('load', () => {
    new Game();
});
