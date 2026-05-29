// Blackjack.js — Full Blackjack: Split, Double Down, Insurance, Natural BJ (3:2), Halloween theme

class BlackjackGameManager {
    constructor(gameEnv) {
        this.gameEnv      = gameEnv;
        this.money        = 1000;
        this.currentBet   = 0;
        this.goalMoney    = 10000;
        this.gameActive   = false;
        this.overlay      = null;
        this.roundInProgress = false;
        this.onWin        = null;
        this.achievements = new Set();
        this.winStreak    = 0;
    }

    startGame() {
        if (this.gameActive) return;
        this.gameActive = true;
        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'blackjack-overlay';
        this.overlay.style.cssText = `
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(5, 0, 18, 0.97);
            z-index: 10000;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            padding: 20px; box-sizing: border-box;
            opacity: 0; transition: opacity 0.8s ease-in-out;
        `;

        if (this.gameEnv && this.gameEnv.canvas) {
            this.gameEnv.canvas.style.transition = 'opacity 0.8s ease-in-out';
            this.gameEnv.canvas.style.opacity = '0';
        }

        const gameContainer = document.createElement('div');
        gameContainer.id = 'embedded-blackjack';
        gameContainer.style.cssText = `
            width: 95%; max-width: 960px;
            background: transparent; padding: 24px;
            border-radius: 15px;
            box-shadow: 0 0 50px rgba(107, 10, 201, 0.5);
        `;

        const moneyDisplay = document.createElement('div');
        moneyDisplay.id = 'money-display';
        moneyDisplay.style.cssText = `
            font-size: 22px; font-weight: bold; color: #00cc44;
            text-align: center; margin-bottom: 16px;
        `;
        moneyDisplay.innerHTML = `Current Money: $${this.money} | Goal: $${this.goalMoney}`;

        const instructions = document.createElement('div');
        instructions.style.cssText = `
            background: linear-gradient(135deg, #2a0050, #500010);
            padding: 14px; border-radius: 8px; margin-bottom: 16px;
            color: #e0c0ff; font-weight: bold; text-align: center;
            border: 1px solid #6b0ac9;
            box-shadow: 0 0 18px rgba(107,10,201,0.35);
        `;
        instructions.innerHTML = `
            🎃 HAUNTED CASINO BLACKJACK 🎃<br>
            <span style="font-size:13px; color:#cc9900; font-weight:normal;">
                Split pairs &nbsp;•&nbsp; Double Down &nbsp;•&nbsp; Buy Insurance &nbsp;•&nbsp;
                Natural Blackjack pays <strong>3:2</strong> &nbsp;•&nbsp; Reach $10,000 to escape!
            </span>
        `;

        gameContainer.appendChild(moneyDisplay);
        gameContainer.appendChild(instructions);
        this.overlay.appendChild(this.createParallaxBackground());
        this.overlay.appendChild(gameContainer);
        document.body.appendChild(this.overlay);

        setTimeout(() => { this.overlay.style.opacity = '1'; }, 50);
        this.loadBlackjackHTML(gameContainer);
    }

    createParallaxBackground() {
        const style = document.createElement('style');
        style.id = 'bj-parallax-style';
        style.textContent = `
            @keyframes bjDrift0 {
                0%   { transform: translateY(110vh) translateX(0px)   rotate(0deg);   }
                100% { transform: translateY(-10vh)  translateX(30px)  rotate(360deg); }
            }
            @keyframes bjDrift1 {
                0%   { transform: translateY(110vh) translateX(0px)   rotate(0deg);    }
                100% { transform: translateY(-10vh)  translateX(-20px) rotate(-240deg); }
            }
            @keyframes bjDrift2 {
                0%   { transform: translateY(110vh) translateX(0px)  rotate(0deg);   }
                100% { transform: translateY(-10vh)  translateX(15px) rotate(180deg); }
            }
        `;
        document.head.appendChild(style);
        this._parallaxStyle = style;

        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            overflow: hidden; pointer-events: none; z-index: 0;
        `;

        const layers = [
            { count: 7,  fontSize: 52, opacity: 0.030, duration: 24, anim: 'bjDrift0' },
            { count: 13, fontSize: 30, opacity: 0.055, duration: 15, anim: 'bjDrift1' },
            { count: 20, fontSize: 17, opacity: 0.085, duration: 9,  anim: 'bjDrift2' },
        ];
        const suits = ['♠', '♥', '♦', '♣'];

        layers.forEach(layer => {
            for (let i = 0; i < layer.count; i++) {
                const suit = suits[Math.floor(Math.random() * suits.length)];
                const el   = document.createElement('span');
                el.textContent = suit;
                const delay = -(Math.random() * layer.duration);
                el.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 96}%;
                    top: 100%;
                    font-size: ${layer.fontSize}px;
                    color: ${suit === '♥' || suit === '♦' ? '#c0392b' : '#e0c0ff'};
                    opacity: ${layer.opacity};
                    animation: ${layer.anim} ${layer.duration}s ${delay.toFixed(2)}s linear infinite;
                    user-select: none;
                `;
                container.appendChild(el);
            }
        });

        return container;
    }

    updateMoneyDisplay() {
        const el = document.getElementById('money-display');
        if (!el) return;
        const color = this.money >= 0 ? '#00cc44' : '#cc0000';
        const text  = this.money >= 0 ? `$${this.money}` : `-$${Math.abs(this.money)} (DEBT)`;
        el.innerHTML = `
            <span style="color:${color}">Current Money: ${text}</span>
            &nbsp;|&nbsp;
            <span style="color:#e0c0ff;">Goal: $${this.goalMoney}</span>
        `;
    }

    loadBlackjackHTML(container) {
        container.innerHTML += `
            <style>
                /* ── Halloween card / UI styles ── */
                @keyframes bjBorderCycle {
                    0%   { border-color:#6b0ac9; box-shadow:0 0 14px #6b0ac9; }
                    33%  { border-color:#8b0000; box-shadow:0 0 14px #8b0000; }
                    66%  { border-color:#00cc44; box-shadow:0 0 14px #00cc44; }
                    100% { border-color:#6b0ac9; box-shadow:0 0 14px #6b0ac9; }
                }
                @keyframes bjBloodPulse {
                    0%,100% { box-shadow:0 0 18px #8b0000; }
                    50%     { box-shadow:0 0 36px #cc00cc; }
                }
                #embedded-blackjack .bj-card {
                    display:inline-flex; align-items:center; justify-content:center;
                    background:#f0eeee; border:2px solid #444; border-radius:8px;
                    padding:6px 10px; margin:3px; font-size:20px; font-weight:bold;
                    min-width:48px; min-height:40px;
                    box-shadow:2px 2px 6px rgba(0,0,0,0.6);
                }
                #embedded-blackjack .bj-hand-box {
                    border-radius:10px; padding:12px; flex:1; min-width:180px;
                }
                #embedded-blackjack .bj-hand-active {
                    border:3px solid #6b0ac9;
                    animation: bjBorderCycle 3s infinite;
                }
                #embedded-blackjack .bj-hand-done {
                    border:3px solid #444; opacity:0.55;
                }
                #embedded-blackjack .bj-btn {
                    padding:11px 18px; font-size:15px; font-weight:bold;
                    border:none; border-radius:8px; cursor:pointer;
                    transition:transform 0.1s, opacity 0.15s; margin:4px;
                }
                #embedded-blackjack .bj-btn:hover:not(:disabled) { transform:scale(1.06); }
                #embedded-blackjack .bj-btn:disabled { opacity:0.28; cursor:not-allowed; transform:none; }
            </style>

            <!-- ── Help modal ── -->
            <div id="bj-help-modal" style="
                display:none; position:fixed; top:0; left:0; width:100%; height:100%;
                background:rgba(0,0,0,0.75); z-index:20000;
                justify-content:center; align-items:center;">
                <div style="
                    background:linear-gradient(160deg,#0e0020,#1a0008);
                    border:2px solid #6b0ac9; border-radius:16px;
                    padding:30px 36px; max-width:580px; width:90%;
                    max-height:85vh; overflow-y:auto;
                    box-shadow:0 0 40px rgba(107,10,201,0.6);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                        <h2 style="color:#e0c0ff;margin:0;font-size:22px;text-shadow:0 0 10px #6b0ac9;">
                            🃏 How to Play Haunted Blackjack
                        </h2>
                        <button id="bj-help-close" style="
                            background:#3d0066;color:#e0c0ff;border:1px solid #6b0ac9;
                            border-radius:8px;padding:6px 14px;cursor:pointer;font-size:15px;font-weight:bold;">
                            ✕ Close
                        </button>
                    </div>
                    <div style="color:#ccc;font-size:14px;line-height:1.7;">
                        <p style="color:#00cc44;font-weight:bold;font-size:15px;margin:0 0 6px 0;">🎯 Goal</p>
                        <p style="margin:0 0 14px 0;">
                            Beat the dealer by getting closer to <strong style="color:white;">21</strong> without going over.
                            Start with <strong style="color:#00cc44;">$1,000</strong> and reach
                            <strong style="color:#ffcc00;">$10,000</strong> to escape the casino!
                        </p>
                        <p style="color:#cc99ff;font-weight:bold;font-size:15px;margin:0 0 6px 0;">🂡 Card Values</p>
                        <ul style="margin:0 0 14px 0;padding-left:18px;">
                            <li><strong style="color:white;">2–10</strong> — face value</li>
                            <li><strong style="color:white;">J, Q, K</strong> — worth 10</li>
                            <li><strong style="color:white;">Ace (A)</strong> — worth 11, drops to 1 if you'd bust</li>
                        </ul>
                        <p style="color:#cc99ff;font-weight:bold;font-size:15px;margin:0 0 6px 0;">🕹️ Basic Actions</p>
                        <ul style="margin:0 0 14px 0;padding-left:18px;">
                            <li><strong style="color:#00cc44;">Hit</strong> — take another card</li>
                            <li><strong style="color:#8b0000;">Stand</strong> — keep your hand; dealer plays</li>
                        </ul>
                        <p style="color:#cc99ff;font-weight:bold;font-size:15px;margin:0 0 6px 0;">⬆️ Double Down</p>
                        <p style="margin:0 0 14px 0;">
                            Available on your <em>first two cards only</em>. Doubles your bet, deals you exactly one
                            more card, then stands automatically. High risk, high reward.
                        </p>
                        <p style="color:#cc99ff;font-weight:bold;font-size:15px;margin:0 0 6px 0;">✂️ Split</p>
                        <p style="margin:0 0 14px 0;">
                            If your first two cards have the <em>same value</em> (e.g. two 8s, or any two 10-value cards),
                            you can split them into two separate hands. A second equal bet is placed automatically.
                            You play each hand one at a time.
                        </p>
                        <p style="color:#cc99ff;font-weight:bold;font-size:15px;margin:0 0 6px 0;">☠️ Insurance</p>
                        <p style="margin:0 0 14px 0;">
                            Offered when the dealer shows an <strong style="color:white;">Ace</strong>.
                            You can bet up to <em>half your current bet</em> as insurance.
                            If the dealer has Blackjack, insurance pays <strong style="color:#ffcc00;">2:1</strong>
                            and you break even. If not, you lose the insurance bet and the game continues normally.
                        </p>
                        <p style="color:#cc99ff;font-weight:bold;font-size:15px;margin:0 0 6px 0;">🎰 Natural Blackjack</p>
                        <p style="margin:0 0 14px 0;">
                            An Ace + any 10-value card on your first two cards is a
                            <strong style="color:#ffcc00;">Natural Blackjack</strong> — it pays
                            <strong style="color:#00cc44;">3:2</strong> (e.g. bet $100, win $150).
                            If the dealer also has Blackjack, it's a <em>push</em> and your bet is returned.
                        </p>
                        <p style="color:#cc99ff;font-weight:bold;font-size:15px;margin:0 0 6px 0;">🤝 Push</p>
                        <p style="margin:0 0 0 0;">
                            If you and the dealer tie, your bet is returned — no one wins.
                        </p>
                    </div>
                </div>
            </div>

            <!-- ── Betting area ── -->
            <div id="bj-betting-area" style="
                background:linear-gradient(135deg,#180030,#300010);
                padding:18px; border-radius:8px; margin-bottom:16px;
                text-align:center; border:1px solid #6b0ac9;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <span style="color:#e0c0ff;font-weight:bold;font-size:17px;text-shadow:0 0 8px #6b0ac9;">
                        🕷️ Choose Your Bet
                    </span>
                    <button id="bj-help-open-bet" class="bj-btn"
                        style="background:#3d0066;color:#cc99ff;border:1px solid #6b0ac9;padding:7px 14px;font-size:13px;">
                        ❓ How to Play
                    </button>
                </div>
                <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
                    <button class="bet-btn bj-btn" data-bet="100"  style="background:#3d0066;color:#cc99ff;">$100</button>
                    <button class="bet-btn bj-btn" data-bet="500"  style="background:#002244;color:#99ccff;">$500</button>
                    <button class="bet-btn bj-btn" data-bet="1000" style="background:#553300;color:#ffcc66;">$1,000</button>
                    <button class="bet-btn bj-btn" data-bet="2500" style="background:#660000;color:#ff9999;">$2,500</button>
                    <button class="bet-btn bj-btn" data-bet="5000" style="background:#4d0000;color:#ff6666;">$5,000</button>
                    <button class="bet-btn bj-btn" data-bet="all"
                        style="background:#1a001a;color:#ff00ff;border:1px solid #ff00ff;">ALL IN 💀</button>
                </div>
                <p id="bj-bet-message" style="color:#cc99ff; margin-top:12px; font-size:15px;">
                    Choose a bet to summon the cards!
                </p>
            </div>

            <!-- ── Active game area ── -->
            <div id="bj-game-container" style="display:none;">
                <div style="background:#150025; padding:10px; border-radius:8px;
                            margin-bottom:12px; text-align:center;">
                    <p id="bj-bet-display" style="color:#cc99ff;font-size:18px;font-weight:bold;margin:0;">
                        Current Bet: $0
                    </p>
                </div>

                <!-- Insurance offer -->
                <div id="bj-insurance-dialog" style="
                    display:none; background:linear-gradient(135deg,#002200,#330000);
                    border:2px solid #8b0000; border-radius:10px; padding:14px;
                    margin-bottom:12px; text-align:center;
                    animation: bjBloodPulse 2s infinite;">
                    <p style="color:#ffcc00;font-weight:bold;font-size:17px;margin:0 0 8px 0;">
                        ☠️ Dealer shows an Ace! Buy Insurance?
                    </p>
                    <p style="color:#ccc;font-size:13px;margin:0 0 10px 0;">
                        Pays <strong>2:1</strong> if dealer has Blackjack. Max: $<span id="bj-ins-max">0</span>
                    </p>
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button id="bj-ins-yes" class="bj-btn"
                            style="background:#006600;color:white;">
                            Buy Insurance ($<span id="bj-ins-amount">0</span>)
                        </button>
                        <button id="bj-ins-no" class="bj-btn"
                            style="background:#660000;color:white;">
                            No Thanks
                        </button>
                    </div>
                </div>

                <!-- Dealer -->
                <div style="margin-bottom:12px;">
                    <h2 style="color:#e0c0ff;font-size:19px;margin-bottom:6px;">
                        👻 Dealer: <span id="bj-dealer-score">0</span>
                    </h2>
                    <div id="bj-dealer-cards" style="display:flex;flex-wrap:wrap;"></div>
                </div>

                <!-- Player hands (flex row, supports split) -->
                <div id="bj-player-hands" style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px;">
                    <div id="bj-hand-0" class="bj-hand-box bj-hand-active">
                        <h3 style="color:#00cc44;font-size:17px;margin:0 0 6px 0;">
                            🃏 Your Hand: <span id="bj-h0-score">0</span>
                        </h3>
                        <div id="bj-h0-cards" style="display:flex;flex-wrap:wrap;"></div>
                    </div>
                    <div id="bj-hand-1" class="bj-hand-box bj-hand-done" style="display:none;">
                        <h3 style="color:#ffcc00;font-size:17px;margin:0 0 6px 0;">
                            🃏 Split Hand: <span id="bj-h1-score">0</span>
                        </h3>
                        <div id="bj-h1-cards" style="display:flex;flex-wrap:wrap;"></div>
                    </div>
                </div>

               <!-- Controls -->
               <div id="bj-controls" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">
                   <button id="bj-hit"    class="bj-btn" style="background:#006622;color:white;">Hit 👊</button>
                   <button id="bj-stand"  class="bj-btn" style="background:#8b0000;color:white;">Stand ✋</button>
                   <button id="bj-split"  class="bj-btn" style="background:#3d0066;color:#cc99ff;display:none;">Split ✂️</button>
                   <button id="bj-double" class="bj-btn" style="background:#664400;color:#ffcc66;">Double Down ⬆️</button>
                   <button id="bj-newbet" class="bj-btn" style="background:#003344;color:#99ccff;display:none;">New Bet 🎲</button>
                   <button id="bj-help-open-game" class="bj-btn" style="background:#3d0066;color:#cc99ff;border:1px solid #6b0ac9;">❓ Help</button>
                   <button id="bj-exit"   class="bj-btn" style="background:#330000;color:#ff6666;">Exit Casino 🚪</button>
               </div>


                <p id="bj-message" style="color:white;font-weight:bold;text-align:center;
                    font-size:17px;min-height:26px;"></p>
            </div>
        `;
        this.initializeBlackjack();
    }

    initializeBlackjack() {
        setTimeout(() => {
            // ── DOM refs ──────────────────────────────────────────────────────
            const bettingArea   = document.getElementById('bj-betting-area');
            const gameContainer = document.getElementById('bj-game-container');
            const dealerCardsEl = document.getElementById('bj-dealer-cards');
            const dealerScoreEl = document.getElementById('bj-dealer-score');
            const messageEl     = document.getElementById('bj-message');
            const betMessage    = document.getElementById('bj-bet-message');
            const betDisplay    = document.getElementById('bj-bet-display');
            const insDialog     = document.getElementById('bj-insurance-dialog');
            const insMax        = document.getElementById('bj-ins-max');
            const insAmountEl   = document.getElementById('bj-ins-amount');

           const hitBtn    = document.getElementById('bj-hit');
           const standBtn  = document.getElementById('bj-stand');
           const splitBtn  = document.getElementById('bj-split');
           const doubleBtn = document.getElementById('bj-double');
           const newBetBtn = document.getElementById('bj-newbet');
           const exitBtn   = document.getElementById('bj-exit');
           const insYes    = document.getElementById('bj-ins-yes');
           const insNo     = document.getElementById('bj-ins-no');

            const helpModal    = document.getElementById('bj-help-modal');
            const helpOpenBet  = document.getElementById('bj-help-open-bet');
            const helpOpenGame = document.getElementById('bj-help-open-game');
            const helpClose    = document.getElementById('bj-help-close');

            const openHelp  = () => { helpModal.style.display = 'flex'; };
            const closeHelp = () => { helpModal.style.display = 'none'; };

            helpOpenBet.addEventListener ('click', openHelp);
            helpOpenGame.addEventListener('click', openHelp);
            helpClose.addEventListener   ('click', closeHelp);
            helpModal.addEventListener('click', (e) => { if (e.target === helpModal) closeHelp(); });

           // ── Game state ────────────────────────────────────────────────────
           let deck             = [];
           let hands            = [[]];   // hands[0] always exists; split adds hands[1]
           let bets             = [0];
           let dealerHand       = [];
           let currentHandIdx   = 0;
           let handsDone        = [false];
           let doubleUsed       = [false];
           let roundOver        = false;
           let insuranceBet     = 0;


            // ── Deck helpers ──────────────────────────────────────────────────
            const createDeck = () => {
                const suits  = ['♠','♥','♦','♣'];
                const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
                const d = [];
                for (const s of suits) for (const v of values) d.push({ value: v, suit: s });
                return shuffleDeck(d);
            };

            const shuffleDeck = (d) => {
                for (let i = d.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [d[i], d[j]] = [d[j], d[i]];
                }
                return d;
            };

            const faceValue = (card) => {
                if (['J','Q','K'].includes(card.value)) return 10;
                if (card.value === 'A') return 11;
                return parseInt(card.value);
            };

            const calcHand = (hand) => {
                let val = 0, aces = 0;
                for (const c of hand) { val += faceValue(c); if (c.value === 'A') aces++; }
                while (val > 21 && aces-- > 0) val -= 10;
                return val;
            };

            const isNaturalBJ = (hand) => hand.length === 2 && calcHand(hand) === 21;

            // For split eligibility: treat 10/J/Q/K as the same "10" group
            const splitKey = (card) => (['J','Q','K'].includes(card.value) ? '10' : card.value);

            // ── Rendering ─────────────────────────────────────────────────────
            const makeCard = (card, hidden = false) => {
                const el = document.createElement('div');
                el.className = 'bj-card';
                if (hidden) {
                    el.textContent = '🂠';
                    el.style.color = '#555';
                } else {
                    el.textContent = `${card.value}${card.suit}`;
                    el.style.color = (card.suit === '♥' || card.suit === '♦') ? '#cc0000' : '#111';
                }
                return el;
            };

            const renderHand = (idx) => {
                const cardsEl = document.getElementById(`bj-h${idx}-cards`);
                const scoreEl = document.getElementById(`bj-h${idx}-score`);
                if (!cardsEl || !scoreEl) return;
                cardsEl.innerHTML = '';
                for (const c of hands[idx]) cardsEl.appendChild(makeCard(c));
                scoreEl.textContent = calcHand(hands[idx]);
            };

           const renderDealer = (revealAll = false) => {
               dealerCardsEl.innerHTML = '';
               dealerHand.forEach((c, i) => dealerCardsEl.appendChild(makeCard(c, !revealAll && i > 0)));
               dealerScoreEl.textContent = revealAll
                   ? calcHand(dealerHand)
                   : faceValue(dealerHand[0]);
           };


            const setActiveHand = (idx) => {
                [0, 1].forEach(i => {
                    const box = document.getElementById(`bj-hand-${i}`);
                    if (!box) return;
                    box.className = `bj-hand-box ${i === idx ? 'bj-hand-active' : 'bj-hand-done'}`;
                });
            };

            // ── Button state helpers ──────────────────────────────────────────
            const refreshActionButtons = () => {
                const hand = hands[currentHandIdx];
                if (!hand) return;

                const canHit    = !roundOver;
                const canStand  = !roundOver;
                const canDouble = !roundOver
                    && hand.length === 2
                    && !doubleUsed[currentHandIdx]
                    && this.money >= bets[currentHandIdx];
                const canSplit  = !roundOver
                    && hand.length === 2
                    && splitKey(hand[0]) === splitKey(hand[1])
                    && hands.length === 1
                    && this.money >= bets[0];


               hitBtn.disabled   = !canHit;
               standBtn.disabled = !canStand;
               doubleBtn.disabled = !canDouble;
               splitBtn.style.display  = canSplit ? 'inline-block' : 'none';
               newBetBtn.style.display = 'none';
           };


            const showNewBetButton = () => {
                newBetBtn.style.display = 'inline-block';
                hitBtn.disabled = standBtn.disabled = doubleBtn.disabled = true;
                splitBtn.style.display = 'none';
            };

            // ── Round flow ────────────────────────────────────────────────────
            const startRound = () => {
                this.roundInProgress = true;
                roundOver      = false;
                currentHandIdx = 0;
                insuranceBet   = 0;


               deck        = createDeck();
               hands       = [[deck.pop(), deck.pop()]];
               bets        = [this.currentBet];
               handsDone   = [false];
               doubleUsed  = [false];
               dealerHand  = [deck.pop(), deck.pop()];

                const h1 = document.getElementById('bj-hand-1');
                if (h1) h1.style.display = 'none';
                setActiveHand(0);

                renderHand(0);
                renderDealer(false);
                insDialog.style.display = 'none';
                messageEl.style.color   = 'white';

                if (dealerHand[0].value === 'A') {
                    offerInsurance();
                    return;
                }

                if (isNaturalBJ(hands[0])) {
                    resolveNaturalBJ();
                    return;
                }

                refreshActionButtons();
                messageEl.textContent = `You have ${calcHand(hands[0])}. Hit, Stand, or use a special action.`;
            };

            // ── Insurance ─────────────────────────────────────────────────────
            const offerInsurance = () => {
                const max = Math.floor(bets[0] / 2);
                insMax.textContent      = max;
                insAmountEl.textContent = max;
                insDialog.style.display = 'block';
                hitBtn.disabled = standBtn.disabled = doubleBtn.disabled = true;
                splitBtn.style.display = 'none';
                messageEl.textContent  = '☠️ Dealer shows an Ace — buy insurance?';
            };

            const resolveInsurance = (buy) => {
                insDialog.style.display = 'none';

                if (buy) {
                    insuranceBet = Math.floor(bets[0] / 2);
                    this.money  -= insuranceBet;
                    this.updateMoneyDisplay();
                    betDisplay.textContent = `Current Bet: $${bets[0]} (+$${insuranceBet} insurance)`;
                }

                if (isNaturalBJ(dealerHand)) {
                    renderDealer(true);
                    if (buy) {
                        this.money += insuranceBet * 3;
                        messageEl.textContent = `☠️ Dealer Blackjack! Insurance pays 2:1 — you break even.`;
                        messageEl.style.color = '#ffcc00';
                    } else {
                        messageEl.textContent = `☠️ Dealer Blackjack! You lose $${bets[0]}.`;
                        messageEl.style.color = '#cc0000';
                    }
                    this.updateMoneyDisplay();
                    endAllRounds([{ handIdx: 0, result: 'loss' }]);
                    return;
                }

                if (isNaturalBJ(hands[0])) {
                    resolveNaturalBJ();
                    return;
                }

                refreshActionButtons();
                messageEl.textContent = `You have ${calcHand(hands[0])}. Hit, Stand, or use a special action.`;
            };

            // ── Natural Blackjack (3:2 payout) ────────────────────────────────
            const resolveNaturalBJ = () => {
                renderDealer(true);
                if (isNaturalBJ(dealerHand)) {
                    this.money += bets[0];
                    messageEl.textContent = `🤝 Both have Blackjack! Push — bet returned.`;
                    messageEl.style.color = '#ffcc00';
                } else {
                    const winnings = Math.floor(bets[0] * 1.5);
                    this.money += bets[0] + winnings;
                    messageEl.textContent = `🎉 BLACKJACK! You win $${winnings}! (3:2 payout)`;
                    messageEl.style.color = '#00cc44';
                    this.unlockAchievement('natural_bj', '♠', 'Natural Blackjack!', 'Got 21 on your first two cards!');
                }
                this.updateMoneyDisplay();
                roundOver = true;
                this.roundInProgress = false;
                showNewBetButton();
                checkWinLoss();
            };

           // ── Player actions ────────────────────────────────────────────────
           const hit = () => {
               if (roundOver) return;
               const hand = hands[currentHandIdx];
               hand.push(deck.pop());
               doubleUsed[currentHandIdx] = true; // can't double after hitting
               renderHand(currentHandIdx);
               splitBtn.style.display = 'none';
               refreshActionButtons();


               const val = calcHand(hand);
               if (val > 21) {
                   messageEl.textContent = hands.length > 1
                       ? `💀 Hand ${currentHandIdx + 1} busted with ${val}!`
                       : `💀 Bust! You went over 21.`;
                   messageEl.style.color = '#cc0000';
                   advanceHand();
               } else if (val === 21) {
                   messageEl.textContent = `21! Auto-standing.`;
                   messageEl.style.color = '#00cc44';
                   advanceHand();
               } else {
                   messageEl.textContent = `You have ${val}. Hit or Stand?`;
                   messageEl.style.color = 'white';
               }
           };


           const stand = () => {
               if (roundOver) return;
               messageEl.textContent = `Standing on ${calcHand(hands[currentHandIdx])}.`;
               messageEl.style.color = 'white';
               advanceHand();
           };


            const doubleDown = () => {
                if (roundOver) return;
                const hand = hands[currentHandIdx];
                if (hand.length !== 2 || doubleUsed[currentHandIdx] || this.money < bets[currentHandIdx]) return;

                this.money -= bets[currentHandIdx];
                bets[currentHandIdx] *= 2;
                doubleUsed[currentHandIdx] = true;
                this.updateMoneyDisplay();
                betDisplay.textContent = `Current Bet: $${bets[currentHandIdx]} (Doubled!)`;

                hand.push(deck.pop());
                renderHand(currentHandIdx);
                splitBtn.style.display = 'none';
                refreshActionButtons();

                const val = calcHand(hand);
                messageEl.textContent = val > 21
                    ? `💀 Bust after Double Down! ${val}.`
                    : `⬆️ Double Down — you have ${val}. Standing automatically.`;
                messageEl.style.color = val > 21 ? '#cc0000' : '#ffcc00';
                advanceHand();
            };

            const split = () => {
                const hand = hands[0];
                if (hands.length > 1 || hand.length !== 2) return;
                if (splitKey(hand[0]) !== splitKey(hand[1])) return;
                if (this.money < bets[0]) return;

                this.money -= bets[0];
                this.updateMoneyDisplay();

                hands = [
                    [hand[0], deck.pop()],
                    [hand[1], deck.pop()]
                ];
                bets       = [bets[0], bets[0]];
                handsDone  = [false, false];
                doubleUsed = [false, false];
                currentHandIdx = 0;

                const h1El = document.getElementById('bj-hand-1');
                if (h1El) h1El.style.display = 'block';
                renderHand(0);
                renderHand(1);
                setActiveHand(0);
                refreshActionButtons();

                messageEl.textContent = `✂️ Split! Playing Hand 1 first — you have ${calcHand(hands[0])}.`;
                messageEl.style.color = '#cc99ff';
            };

            // ── Advance to next hand or dealer ────────────────────────────────
            const advanceHand = () => {
                handsDone[currentHandIdx] = true;

                if (hands.length > 1 && currentHandIdx === 0) {
                    currentHandIdx = 1;
                    setActiveHand(1);
                    refreshActionButtons();
                    const val = calcHand(hands[1]);
                    messageEl.textContent = `Now playing Split Hand 2 — you have ${val}.`;
                    messageEl.style.color = '#ffcc00';
                    if (val >= 21) advanceHand();
                } else {
                    dealerPlay();
                }
            };

           // ── Dealer plays ──────────────────────────────────────────────────
           const dealerPlay = () => {
               roundOver = true;
               hitBtn.disabled = standBtn.disabled = doubleBtn.disabled = true;
               splitBtn.style.display = 'none';
               renderDealer(true);


                while (calcHand(dealerHand) < 17) dealerHand.push(deck.pop());
                renderDealer(true);

                const dealerVal = calcHand(dealerHand);
                const results = hands.map((hand, i) => {
                    const pv = calcHand(hand);
                    if (pv > 21)        return { handIdx: i, result: 'loss' };
                    if (dealerVal > 21) return { handIdx: i, result: 'win'  };
                    if (pv > dealerVal) return { handIdx: i, result: 'win'  };
                    if (pv < dealerVal) return { handIdx: i, result: 'loss' };
                    return { handIdx: i, result: 'push' };
                });

                endAllRounds(results);
            };

            // ── Resolve all hands ─────────────────────────────────────────────
            const endAllRounds = (results) => {
                roundOver = true;
                this.roundInProgress = false;
                const moneyBefore = this.money;

                let totalGain = 0;
                const msgs = [];

                results.forEach(({ handIdx, result }) => {
                    const bet = bets[handIdx] !== undefined ? bets[handIdx] : bets[0];
                    if (result === 'win') {
                        this.money += bet * 2;
                        totalGain  += bet;
                        msgs.push(hands.length > 1 ? `Hand ${handIdx + 1}: WIN +$${bet}` : `🎉 You Win! +$${bet}`);
                    } else if (result === 'push') {
                        this.money += bet;
                        msgs.push(hands.length > 1 ? `Hand ${handIdx + 1}: Push` : `🤝 Push — bet returned.`);
                    } else {
                        msgs.push(hands.length > 1 ? `Hand ${handIdx + 1}: LOSS -$${bet}` : `😢 You Lost $${bet}`);
                    }
                });

                const anyWin  = results.some(r => r.result === 'win');
                const allLoss = results.every(r => r.result === 'loss');
                if (anyWin)       this.winStreak++;
                else if (allLoss) this.winStreak = 0;

                this.updateMoneyDisplay();
                messageEl.textContent = msgs.join('  |  ');
                messageEl.style.color = totalGain > 0 ? '#00cc44' : allLoss ? '#cc0000' : '#ffcc00';

                this.checkAchievements(results, hands, bets, moneyBefore);
                if (totalGain > 0) this.triggerWinConfetti();
                else if (allLoss)  this.triggerLossShake();
                showNewBetButton();
                checkWinLoss();
            };

            // ── Win / loss conditions ─────────────────────────────────────────
            const checkWinLoss = () => {
                if (this.money >= this.goalMoney) {
                    setTimeout(() => {
                        this.exitGame();
                        if (typeof this.onWin === 'function') this.onWin();
                    }, 2000);
                } else if (this.money <= 0) {
                    setTimeout(() => {
                        messageEl.textContent += '  |  💀 Out of chips! Exit and try again.';
                    }, 900);
                }
            };

           // ── New bet / reset ───────────────────────────────────────────────
           const newBet = () => {
               gameContainer.style.display = 'none';
               bettingArea.style.display   = 'block';
               betMessage.textContent      = "Choose a bet to summon the cards!";
               betMessage.style.color      = '#cc99ff';
               this.currentBet = 0;
               betDisplay.textContent = 'Current Bet: $0';
               roundOver = false;
               insuranceBet = 0;
               // Reset hand display
               const h1El = document.getElementById('bj-hand-1');
               if (h1El) h1El.style.display = 'none';
           };


            // ── Bet buttons ───────────────────────────────────────────────────
            document.querySelectorAll('.bet-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const raw    = btn.dataset.bet;
                    const amount = raw === 'all' ? this.money : parseInt(raw);

                    if (this.money <= 0) {
                        betMessage.textContent = '💀 Out of chips! Exit and try again.';
                        betMessage.style.color = '#cc0000';
                        return;
                    }
                    if (amount > this.money) {
                        betMessage.textContent = `Not enough chips! You only have $${this.money}`;
                        betMessage.style.color = '#cc0000';
                        return;
                    }

                    this.currentBet  = amount;
                    this.money      -= amount;
                    this.updateMoneyDisplay();
                    betDisplay.textContent = `Current Bet: $${this.currentBet}`;
                    bettingArea.style.display   = 'none';
                    gameContainer.style.display = 'block';
                    startRound();
                });
            });

           // ── Control listeners ─────────────────────────────────────────────
           hitBtn.addEventListener   ('click', hit);
           standBtn.addEventListener ('click', stand);
           splitBtn.addEventListener ('click', split);
           doubleBtn.addEventListener('click', doubleDown);
           newBetBtn.addEventListener('click', newBet);
           exitBtn.addEventListener  ('click', () => this.exitGame());
           insYes.addEventListener   ('click', () => resolveInsurance(true));
           insNo.addEventListener    ('click', () => resolveInsurance(false));

        }, 100);
    }

    // ── Win / loss effects ────────────────────────────────────────────────────

    triggerWinConfetti() {
        if (!document.getElementById('bj-confetti-style')) {
            const style = document.createElement('style');
            style.id = 'bj-confetti-style';
            style.textContent = `
                @keyframes bjConfettiFall {
                    0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
                    100% { transform: translateY(108vh)  rotate(540deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        const colors = ['#f39c12','#e74c3c','#2ecc71','#3498db','#9b59b6','#ffcc00','#e0c0ff','#cc00cc'];
        for (let i = 0; i < 70; i++) {
            const el       = document.createElement('div');
            const size     = 6 + Math.random() * 9;
            const isRect   = Math.random() > 0.45;
            const delay    = Math.random() * 1.2;
            const duration = 1.8 + Math.random() * 1.4;

            el.style.cssText = `
                position: fixed;
                top: 0;
                left: ${Math.random() * 100}%;
                width: ${size}px;
                height: ${isRect ? size * 2.5 : size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${isRect ? '2px' : '50%'};
                z-index: 20002;
                pointer-events: none;
                animation: bjConfettiFall ${duration}s ${delay}s ease-in forwards;
            `;
            document.body.appendChild(el);
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, (delay + duration + 0.2) * 1000);
        }
    }

    triggerLossShake() {
        if (!this.overlay) return;

        if (!document.getElementById('bj-shake-style')) {
            const style = document.createElement('style');
            style.id = 'bj-shake-style';
            style.textContent = `
                @keyframes bjShake {
                    0%,100% { transform: translateX(0); }
                    10%     { transform: translateX(-14px); }
                    25%     { transform: translateX(14px); }
                    40%     { transform: translateX(-10px); }
                    55%     { transform: translateX(10px); }
                    70%     { transform: translateX(-6px); }
                    85%     { transform: translateX(6px); }
                }
            `;
            document.head.appendChild(style);
        }

        this.overlay.style.animation = 'bjShake 0.5s ease-out';
        this.overlay.addEventListener('animationend', () => {
            if (this.overlay) this.overlay.style.animation = '';
        }, { once: true });
    }

    // ── Achievement system ────────────────────────────────────────────────────

    unlockAchievement(key, icon, title, sub) {
        if (this.achievements.has(key)) return;
        this.achievements.add(key);
        this.showAchievement(icon, title, sub);
    }

    checkAchievements(results, hands, bets, moneyBefore) {
        const anyWin = results.some(r => r.result === 'win');
        const allWin = results.every(r => r.result === 'win');

        if (anyWin && !this.achievements.has('first_win'))
            this.unlockAchievement('first_win', '🎰', 'First Win!', 'You beat the dealer for the first time.');

        if (this.winStreak >= 3 && !this.achievements.has('on_fire'))
            this.unlockAchievement('on_fire', '🔥', 'On Fire!', '3 winning rounds in a row!');

        if (anyWin && moneyBefore <= 200 && !this.achievements.has('ghost_mode'))
            this.unlockAchievement('ghost_mode', '👻', 'Ghost Mode', 'Won a hand with $200 or less left!');

        if (anyWin && bets.some(b => b >= 5000) && !this.achievements.has('high_roller'))
            this.unlockAchievement('high_roller', '🐋', 'High Roller', 'Won a hand with a $5,000+ bet!');

        if (this.money >= 5000 && !this.achievements.has('halfway'))
            this.unlockAchievement('halfway', '💰', 'Halfway There!', 'Reached $5,000 — keep going!');

        if (hands.length > 1 && allWin && !this.achievements.has('split_win'))
            this.unlockAchievement('split_win', '🃏', 'Split & Win!', 'Won both hands of a split!');
    }

    showAchievement(icon, title, sub) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px; right: -340px;
            width: 300px;
            background: linear-gradient(135deg, #1a0035, #2a0010);
            border: 2px solid #6b0ac9;
            border-radius: 14px;
            padding: 14px 18px;
            z-index: 20001;
            box-shadow: 0 0 24px rgba(107,10,201,0.75);
            transition: right 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; align-items: center; gap: 14px;
            font-family: monospace;
        `;
        toast.innerHTML = `
            <div style="font-size:36px; flex-shrink:0;">${icon}</div>
            <div>
                <div style="color:#ffcc00; font-size:11px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">
                    Achievement Unlocked
                </div>
                <div style="color:#e0c0ff; font-size:16px; font-weight:bold; margin:2px 0;">${title}</div>
                <div style="color:#888; font-size:12px;">${sub}</div>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => { toast.style.right = '20px'; }, 50);
        setTimeout(() => {
            toast.style.transition = 'right 0.35s ease-in';
            toast.style.right = '-340px';
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
        }, 3800);
    }

    exitGame() {
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            if (this.gameEnv && this.gameEnv.canvas) {
                this.gameEnv.canvas.style.opacity = '1';
            }
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    document.body.removeChild(this.overlay);
                }
                this.overlay = null;
            }, 800);
        }
        this.gameActive   = false;
        this.money        = 1000;
        this.currentBet   = 0;
        this.achievements = new Set();
        this.winStreak    = 0;
        if (this._parallaxStyle && this._parallaxStyle.parentNode) {
            this._parallaxStyle.parentNode.removeChild(this._parallaxStyle);
            this._parallaxStyle = null;
        }
    }

    resetLevel() {
        this.money = 1000;
        this.exitGame();
        window.location.reload();
    }
}

export default BlackjackGameManager;
