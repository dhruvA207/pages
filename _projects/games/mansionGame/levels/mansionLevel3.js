import GameEnvBackground from '@assets/js/GameEnginev1.1/essentials/GameEnvBackground.js';
import Player from '@assets/js/GameEnginev1.1/essentials/Player.js';
import DialogueSystem from '@assets/js/GameEnginev1.1/essentials/DialogueSystem.js';
import Barrier from './Barrier.js';
import BlackjackGameManager from './Blackjack.js';
import TriggerZone from './TriggerZone.js';
import MansionLevel4 from './mansionLevel4.js';
import MansionLevelMain from './mansionLevelMain.js';

console.log("🎮 mansionLevel3.js loaded!");

// Halloween palette
const HEX = {
    purple:    '#6b0ac9',
    blood:     '#8b0000',
    green:     '#00cc44',
    pumpkin:   '#cc6600',
    magenta:   '#cc00cc',
    ghostWhite:'#e0c0ff',
};

class MansionLevel3 {
    constructor(gameEnv) {
        console.log("🎮 MansionLevel3 constructor started");

        let width  = gameEnv.innerWidth;
        let height = gameEnv.innerHeight;
        let path   = gameEnv.path;

        this.gameEnv          = gameEnv;
        this.blackjackManager = new BlackjackGameManager(gameEnv);
        this.blackjackManager.onWin = () => this.winLevel();

        this.inMainZone          = false;
        this.mainPromptVisible   = false;
        this.lockedPromptVisible = false;
        this.mainPromptEl        = null;
        this.lockedPromptEl      = null;
        this.spriteMenuVisible   = false;
        this.spriteMenuEl        = null;
        this.spriteHintEl        = null;
        this.spriteButtonGrid    = null;
        this.currentSpriteIndex  = 0;

        // Casino background (same sprite as level 4)
        const image_data_background = {
            name: 'background',
            greeting: "Welcome to the Haunted Casino! Win $10,000 to escape!",
            src: path + "/images/projects/mansionGame/image_lvl4.png",
            pixels: { height: 1280, width: 720 }
        };

        const MC_SCALE_FACTOR = 6;
        const sprite_data_mc = {
            id: 'Spook',
            greeting: "Hi, I am Spook.",
            src: path + "/images/projects/mansionGame/spookMcWalk.png",
            SCALE_FACTOR: MC_SCALE_FACTOR,
            STEP_FACTOR: 800,
            ANIMATION_RATE: 10,
            INIT_POSITION: { x: (width / 2 - width / (5 * MC_SCALE_FACTOR)), y: height - (height / MC_SCALE_FACTOR) },
            pixels: { height: 2400, width: 3600 },
            orientation: { rows: 2, columns: 3 },
            down:      { row: 1, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3, rotate:  Math.PI / 16 },
            downLeft:  { row: 0, start: 0, columns: 3, rotate: -Math.PI / 16 },
            left:      { row: 0, start: 0, columns: 3 },
            right:     { row: 1, start: 0, columns: 3 },
            up:        { row: 1, start: 0, columns: 3 },
            upLeft:    { row: 0, start: 0, columns: 3, rotate:  Math.PI / 16 },
            upRight:   { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
            hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        this.spriteOptions = [
            {
                label: 'Spook',
                src: path + "/images/projects/mansionGame/spookMcWalk.png",
                pixels: { height: 2400, width: 3600 },
                SCALE_FACTOR: 6,
                ANIMATION_RATE: 10,
                orientation: { rows: 2, columns: 3 },
                down:      { row: 1, start: 0, columns: 3 },
                downRight: { row: 1, start: 0, columns: 3, rotate:  Math.PI / 16 },
                downLeft:  { row: 0, start: 0, columns: 3, rotate: -Math.PI / 16 },
                left:      { row: 0, start: 0, columns: 3 },
                right:     { row: 1, start: 0, columns: 3 },
                up:        { row: 1, start: 0, columns: 3 },
                upLeft:    { row: 0, start: 0, columns: 3, rotate:  Math.PI / 16 },
                upRight:   { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 }
            },
            {
                label: 'Mummy Boy',
                src: path + "/images/projects/mansionGame/mummy_boy.png",
                pixels: { height: 192, width: 144 },
                SCALE_FACTOR: 6,
                ANIMATION_RATE: 12,
                orientation: { rows: 4, columns: 3 },
                down:      { row: 0, start: 0, columns: 3 },
                downRight: { row: 0, start: 0, columns: 3 },
                downLeft:  { row: 0, start: 0, columns: 3 },
                left:      { row: 1, start: 0, columns: 3 },
                right:     { row: 2, start: 0, columns: 3 },
                up:        { row: 3, start: 0, columns: 3 },
                upLeft:    { row: 1, start: 0, columns: 3 },
                upRight:   { row: 2, start: 0, columns: 3 }
            },
            {
                label: 'Ghost Runner',
                src: path + "/images/projects/mansionGame/full_anims_spook.png",
                pixels: { width: 1500, height: 120 },
                SCALE_FACTOR: 5,
                ANIMATION_RATE: 20,
                orientation: { rows: 2, columns: 25 },
                down:      { row: 1, start: 0, columns: 3 },
                downRight: { row: 1, start: 0, columns: 3, mirror: true, rotate: Math.PI / 16 },
                downLeft:  { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
                left:      { row: 1, start: 0, columns: 3 },
                right:     { row: 1, start: 0, columns: 3, mirror: true },
                up:        { row: 1, start: 0, columns: 3 },
                upLeft:    { row: 0, start: 0, columns: 3, rotate: Math.PI / 16 },
                upRight:   { row: 1, start: 0, columns: 3, mirror: true, rotate: -Math.PI / 16 }
            }
        ];

        // Main (center spotlight) table trigger zone
        const mainZoneData = {
            x: width * 0.35,
            y: height * 0.10,
            width:  width  * 0.30,
            height: height * 0.45,
            color: 'rgba(107, 10, 201, 0.12)',
            visible: false,
            onEnter: () => {
                this.inMainZone = true;
                this.showMainPrompt();
            },
            onExit: () => {
                this.inMainZone = false;
                this.hideMainPrompt();
            }
        };

        // Locked side tables (4 outer tables visible in the sprite)
        const lockedMessages = [
            "👻 The ghost dealer isn't at this table right now!",
            "🦇 The bats have claimed this table for the night!",
            "🕸️ This table is tangled in cobwebs — come back never!",
            "☠️ The skeleton croupier called in sick. Table closed!"
        ];

        // Positions estimated from image_lvl4.png layout:
        //  upper-left, upper-right, lower-left, lower-right
        const lockedZoneConfigs = [
            { x: width * 0.02, y: height * 0.04, w: width * 0.25, h: height * 0.42, msg: lockedMessages[0] },
            { x: width * 0.68, y: height * 0.04, w: width * 0.25, h: height * 0.42, msg: lockedMessages[1] },
            { x: width * 0.02, y: height * 0.53, w: width * 0.25, h: height * 0.42, msg: lockedMessages[2] },
            { x: width * 0.68, y: height * 0.53, w: width * 0.25, h: height * 0.42, msg: lockedMessages[3] },
        ];

        const lockedZones = lockedZoneConfigs.map(cfg => ({
            x: cfg.x, y: cfg.y,
            width: cfg.w, height: cfg.h,
            color: 'rgba(139, 0, 0, 0.08)',
            visible: false,
            onEnter: () => this.showLockedPrompt(cfg.msg),
            onExit:  () => this.hideLockedPrompt()
        }));

        this.tableCollisionZones = lockedZoneConfigs.map((cfg) => ({
            x: cfg.x + (cfg.w * 0.22),
            y: cfg.y + (cfg.h * 0.22),
            width: cfg.w * 0.56,
            height: cfg.h * 0.38
        }));

        const barrierData = [
            { x: 0,          y: 0,           width: width, height: 20,    visible: false },
            { x: 0,          y: height - 20, width: width, height: 20,    visible: false },
            { x: 0,          y: 0,           width: 20,    height: height, visible: false },
            { x: width - 20, y: 0,           width: 20,    height: height, visible: false }
        ];

        this.classes = [
            { class: GameEnvBackground, data: image_data_background },
            { class: Player,            data: sprite_data_mc },
            { class: TriggerZone,       data: mainZoneData },
            ...lockedZones.map(data => ({ class: TriggerZone, data })),
            ...barrierData.map(data  => ({ class: Barrier,    data }))
        ];

        // Spooky background music
        this.backgroundMusic = new Audio(path + '/assets/sounds/mansionGame/SpookieDookie.mp3');
        this.backgroundMusic.loop   = true;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.play().catch(() => {});

        this.createSpriteMenu();
        this.setupKeyListener();
        console.log("✅ MansionLevel3 (casino) constructor completed");
    }

    setupKeyListener() {
        this.keyHandler = (e) => {
            if (e.key && e.key.toLowerCase() === 'q') {
                e.preventDefault();
                this.toggleSpriteMenu();
                return;
            }

            if (e.keyCode === 69 && this.inMainZone && !this.blackjackManager.gameActive) {
                this.blackjackManager.startGame();
                this.hideMainPrompt();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    getPlayer() {
        return this.gameEnv?.gameObjects?.find((obj) => obj instanceof Player) || null;
    }

    applySpriteOption(spriteOption) {
        const player = this.getPlayer();
        if (!player || !spriteOption) return;

        this.currentSpriteIndex = this.spriteOptions.findIndex((option) => option.label === spriteOption.label);
        if (this.currentSpriteIndex < 0) {
            this.currentSpriteIndex = 0;
        }

        player.data.src = spriteOption.src;
        player.data.pixels = { ...spriteOption.pixels };
        player.data.SCALE_FACTOR = spriteOption.SCALE_FACTOR;
        player.data.ANIMATION_RATE = spriteOption.ANIMATION_RATE;
        player.data.orientation = { ...spriteOption.orientation };

        [
            'down',
            'downRight',
            'downLeft',
            'left',
            'right',
            'up',
            'upLeft',
            'upRight'
        ].forEach((direction) => {
            player.data[direction] = spriteOption[direction]
                ? { ...spriteOption[direction] }
                : { row: 0, start: 0, columns: 1 };
        });

        player.spriteData = player.data;
        player.scaleFactor = spriteOption.SCALE_FACTOR;
        player.animationRate = spriteOption.ANIMATION_RATE;
        player.frameIndex = 0;
        player.frameCounter = 0;
        player.direction = 'down';
        player.resize();

        if (!player.spriteSheet) {
            player.spriteSheet = new Image();
        }

        player.spriteReady = false;
        player.spriteSheet.onload = () => {
            player.spriteReady = true;
            player.resize();
        };
        player.spriteSheet.src = spriteOption.src;

        this.refreshSpriteMenuButtons();
    }

    createSpriteMenu() {
        this.removeSpriteMenu();

        this.spriteMenuEl = document.createElement('div');
        this.spriteMenuEl.id = 'mansion-level3-sprite-menu';
        this.spriteMenuEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 300px;
            padding: 20px;
            border-radius: 16px;
            background: rgba(10, 4, 24, 0.95);
            border: 2px solid ${HEX.purple};
            color: ${HEX.ghostWhite};
            font-family: monospace;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
            z-index: 10000;
            display: none;
        `;

        const menuTitle = document.createElement('div');
        menuTitle.textContent = 'Choose your haunted sprite';
        menuTitle.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            color: ${HEX.ghostWhite};
        `;

        const menuText = document.createElement('div');
        menuText.textContent = 'Press Q to close, or click a character below.';
        menuText.style.cssText = `
            font-size: 12px;
            margin-bottom: 14px;
            color: #cbb7ff;
        `;

        this.spriteButtonGrid = document.createElement('div');
        this.spriteButtonGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, minmax(120px, 1fr));
            gap: 10px;
        `;

        this.spriteOptions.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = option.label;
            button.dataset.spriteLabel = option.label;
            button.style.cssText = `
                padding: 10px 12px;
                border-radius: 10px;
                border: 1px solid ${HEX.purple};
                background: #24113f;
                color: ${HEX.ghostWhite};
                cursor: pointer;
                font-family: monospace;
                font-size: 13px;
            `;

            button.addEventListener('click', () => {
                this.applySpriteOption(option);
                this.hideSpriteMenu();
            });

            this.spriteButtonGrid.appendChild(button);
        });

        this.spriteMenuEl.appendChild(menuTitle);
        this.spriteMenuEl.appendChild(menuText);
        this.spriteMenuEl.appendChild(this.spriteButtonGrid);
        document.body.appendChild(this.spriteMenuEl);

        this.spriteHintEl = document.createElement('div');
        this.spriteHintEl.id = 'mansion-level3-sprite-hint';
        this.spriteHintEl.textContent = 'Press Q to swap characters';
        this.spriteHintEl.style.cssText = `
            position: fixed;
            left: 16px;
            bottom: 16px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(10, 4, 24, 0.88);
            color: ${HEX.ghostWhite};
            font-family: monospace;
            font-size: 12px;
            z-index: 9998;
            border: 1px solid rgba(107, 10, 201, 0.85);
        `;
        document.body.appendChild(this.spriteHintEl);

        this.refreshSpriteMenuButtons();
    }

    refreshSpriteMenuButtons() {
        if (!this.spriteButtonGrid) return;

        Array.from(this.spriteButtonGrid.children).forEach((button, index) => {
            const isActive = index === this.currentSpriteIndex;
            button.style.background = isActive ? HEX.green : '#24113f';
            button.style.color = isActive ? '#04110a' : HEX.ghostWhite;
            button.style.borderColor = isActive ? HEX.green : HEX.purple;
        });
    }

    toggleSpriteMenu() {
        if (this.spriteMenuVisible) {
            this.hideSpriteMenu();
            return;
        }

        this.showSpriteMenu();
    }

    showSpriteMenu() {
        if (!this.spriteMenuEl) return;
        this.spriteMenuVisible = true;
        this.refreshSpriteMenuButtons();
        this.spriteMenuEl.style.display = 'block';
    }

    hideSpriteMenu() {
        if (!this.spriteMenuEl) return;
        this.spriteMenuVisible = false;
        this.spriteMenuEl.style.display = 'none';
    }

    removeSpriteMenu() {
        this.spriteMenuVisible = false;

        if (this.spriteMenuEl?.parentNode) {
            this.spriteMenuEl.parentNode.removeChild(this.spriteMenuEl);
        }

        if (this.spriteHintEl?.parentNode) {
            this.spriteHintEl.parentNode.removeChild(this.spriteHintEl);
        }

        this.spriteMenuEl = null;
        this.spriteHintEl = null;
        this.spriteButtonGrid = null;
    }

    // TODO: Part 3 (Main table prompt) — Group Member 3
    // showMainPrompt(), hideMainPrompt()

    // ─── Locked table prompt ──────────────────────────────────────────────────

    showLockedPrompt(message) {
        if (this.lockedPromptVisible) return;
        this.lockedPromptVisible = true;

        this.lockedPromptEl = document.createElement('div');
        this.lockedPromptEl.id = 'locked-table-prompt-l3';
        this.lockedPromptEl.style.cssText = `
            position: fixed;
            top: 38%; left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(5, 0, 18, 0.95);
            border: 3px solid ${HEX.blood};
            border-radius: 15px;
            padding: 25px 40px;
            z-index: 9999;
            text-align: center;
            box-shadow: 0 0 30px ${HEX.blood}, 0 0 60px rgba(139,0,0,0.3);
            animation: l3LockedPulse 2s infinite;
        `;

        this.lockedPromptEl.innerHTML = `
            <style>
                @keyframes l3LockedPulse {
                    0%,100% { box-shadow: 0 0 25px ${HEX.blood};  }
                    50%     { box-shadow: 0 0 45px ${HEX.magenta}; }
                }
            </style>
            <div style="font-size:44px; margin-bottom:10px;">⛔</div>
            <h3 style="color:${HEX.blood}; font-size:24px; margin:0 0 10px 0;
                       text-shadow:0 0 8px ${HEX.blood};">TABLE CLOSED</h3>
            <p style="color:${HEX.ghostWhite}; font-size:17px; margin:0 0 10px 0;">${message}</p>
            <p style="color:#888; font-size:13px; margin:0;">Walk away to dismiss</p>
        `;

        document.body.appendChild(this.lockedPromptEl);
    }

    hideLockedPrompt() {
        if (!this.lockedPromptVisible) return;
        this.lockedPromptVisible = false;
        if (this.lockedPromptEl && this.lockedPromptEl.parentNode) {
            this.lockedPromptEl.parentNode.removeChild(this.lockedPromptEl);
        }
        this.lockedPromptEl = null;
    }

    enforceTableCollisions() {
        const player = this.getPlayer();
        if (!player || !this.tableCollisionZones?.length) return;

        const hitboxWidthPercent = (player.hitbox && player.hitbox.widthPercentage) || 1;
        const hitboxHeightPercent = (player.hitbox && player.hitbox.heightPercentage) || 1;
        const hitboxWidth = player.width * hitboxWidthPercent;
        const hitboxHeight = player.height * hitboxHeightPercent;
        const hitboxX = player.position.x + (player.width - hitboxWidth) / 2;
        const hitboxY = player.position.y + (player.height - hitboxHeight);

        for (const zone of this.tableCollisionZones) {
            const isColliding = !(
                hitboxX > zone.x + zone.width ||
                hitboxX + hitboxWidth < zone.x ||
                hitboxY > zone.y + zone.height ||
                hitboxY + hitboxHeight < zone.y
            );

            if (!isColliding) continue;

            const overlapLeft = (hitboxX + hitboxWidth) - zone.x;
            const overlapRight = (zone.x + zone.width) - hitboxX;
            const overlapTop = (hitboxY + hitboxHeight) - zone.y;
            const overlapBottom = (zone.y + zone.height) - hitboxY;
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft) {
                player.position.x -= overlapLeft;
                if (player.velocity) player.velocity.x = Math.min(0, player.velocity.x || 0);
            } else if (minOverlap === overlapRight) {
                player.position.x += overlapRight;
                if (player.velocity) player.velocity.x = Math.max(0, player.velocity.x || 0);
            } else if (minOverlap === overlapTop) {
                player.position.y -= overlapTop;
                if (player.velocity) player.velocity.y = Math.min(0, player.velocity.y || 0);
            } else {
                player.position.y += overlapBottom;
                if (player.velocity) player.velocity.y = Math.max(0, player.velocity.y || 0);
            }
        }
    }

    // ─── Level lifecycle ──────────────────────────────────────────────────────

    update() {
        this.enforceTableCollisions();

        // Re-hide main prompt if blackjack became active
        if (this.blackjackManager.gameActive && this.mainPromptVisible) {
            this.hideMainPrompt();
        }
    }

    winLevel() {
        console.log("🎉 Level 3 Casino — Won!");

        // Unlock level 4 for the lobby
        localStorage.setItem('mansionGame_level4_unlocked', 'true');

        const dialogueSystem = new DialogueSystem();
        dialogueSystem.showDialogue(
            'You won $10,000 at the haunted casino! The spirits are impressed... deeper into the mansion you go!',
            'Victory!',
            this.gameEnv.path + '/images/projects/mansionGame/key_lvl3.png'
        );
        dialogueSystem.addButtons([
            {
                text: 'Continue to Level 4',
                primary: true,
                action: () => {
                    dialogueSystem.closeDialogue();
                    if (this.gameEnv && this.gameEnv.gameControl) {
                        const gc = this.gameEnv.gameControl;
                        gc.levelClasses = [MansionLevel4];
                        gc.currentLevelIndex = 0;
                        gc.isPaused = false;
                        gc.transitionToLevel();
                    }
                }
            },
            {
                text: 'Return to Lobby',
                primary: false,
                action: () => {
                    dialogueSystem.closeDialogue();
                    if (this.gameEnv && this.gameEnv.gameControl) {
                        const gc = this.gameEnv.gameControl;
                        gc.levelClasses = [MansionLevelMain];
                        gc.currentLevelIndex = 0;
                        gc.isPaused = false;
                        gc.transitionToLevel();
                    }
                }
            }
        ]);
    }

    destroy() {
        console.log("🧹 MansionLevel3 cleanup...");
        document.removeEventListener('keydown', this.keyHandler);
        this.hideMainPrompt();
        // TODO: Part 2 (Locked side tables cleanup — hideLockedPrompt call) — Group Member 2
        this.removeSpriteMenu();
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
}

export default MansionLevel3;
