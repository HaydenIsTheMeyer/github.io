let player, platforms, coins, score = 0, level = 0;
const levels = [
    { name: "About Me", content: "Hi, I’m John Doe, a Web Developer with a passion for interactive design." },
    { name: "Skills", content: "JavaScript - 90%<br>HTML/CSS - 85%<br>Phaser - 80%<br>React - 75%<br>Node.js - 70%" },
    { name: "Experience", content: "Software Dev at TechCorp, 2020-2023: Built XYZ.<br>Freelancer, 2018-2020: Various projects." },
    { name: "Projects", content: "Project X: Interactive CV [Link].<br>Project Y: Web Game [Link].<br>Project Z: Portfolio [Link]." },
    { name: "Contact", content: "Email: john.doe@example.com<br>LinkedIn: linkedin.com/in/johndoe<br>GitHub: github.com/johndoe" }
];

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 1000 } }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('ground', 'assets/ground.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.image('bg-hills', 'assets/hills.png');
    this.load.on('complete', () => {
        document.body.style.background = 'none'; // Remove gradient once loaded
    });
}

function create() {
    // Background
    this.add.image(0, 0, 'bg-hills').setOrigin(0).setScrollFactor(0.5);

    // Platforms
    platforms = this.physics.add.staticGroup();
    generatePlatforms(this); // Call to generate multi-level platforms

    // Player
    player = this.physics.add.sprite(100, window.innerHeight - 100, 'player');
    player.setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    // Animations
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    // Coins
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 4,
        setXY: { x: 200, y: 100, stepX: 150 }
    });
    coins.children.iterate(coin => coin.setBounceY(0.5));
    this.physics.add.collider(coins, platforms);
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Camera
    this.cameras.main.setBounds(0, 0, window.innerWidth * 2, window.innerHeight);
    this.cameras.main.startFollow(player);

    // Mobile Controls
    document.getElementById('left-btn').addEventListener('mousedown', () => player.setVelocityX(-160));
    document.getElementById('left-btn').addEventListener('mouseup', () => player.setVelocityX(0));
    document.getElementById('right-btn').addEventListener('mousedown', () => player.setVelocityX(160));
    document.getElementById('right-btn').addEventListener('mouseup', () => player.setVelocityX(0));
    document.getElementById('jump-btn').addEventListener('mousedown', () => {
        if (player.body.touching.down) player.setVelocityY(-500);
    });

    // Popup Close
    document.getElementById('close-btn').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'none';
        checkLevelCompletion(this);
    });

    // Set initial level display
    document.getElementById('level').textContent = `Level: ${levels[level].name}`;
}

function update() {
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('walk', true);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('walk', true);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
        player.anims.play('idle', true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
    }
}

function collectCoin(player, coin) {
    coin.disableBody(true, true);
    score += 1;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('popup-content').innerHTML = levels[level].content;
    document.getElementById('popup').style.display = 'block';
}

function checkLevelCompletion(scene) {
    if (coins.countActive(true) === 0 && level < levels.length - 1) {
        level++;
        document.getElementById('level').textContent = `Level: ${levels[level].name}`;
        scene.cameras.main.shake(200);

        // Reset and regenerate for the next level
        platforms.clear(true, true); // Clear old platforms
        generatePlatforms(scene); // Generate new platforms
        player.setPosition(100, window.innerHeight - 100); // Reset player position

        // Reset coins
        coins = scene.physics.add.group({
            key: 'coin',
            repeat: 4,
            setXY: { x: player.x + 200, y: 100, stepX: 150 }
        });
        coins.children.iterate(coin => coin.setBounceY(0.5));
        scene.physics.add.collider(coins, platforms);
        scene.physics.add.overlap(player, coins, collectCoin, null, scene);
    }
}

function generatePlatforms(scene) {
    const levelHeight = 120; // Max jump height friendly
    let x = 0, y = window.innerHeight - 32;

    // Create a ground base
    for (let i = 0; i < window.innerWidth * 2; i += 128) {
        platforms.create(i, window.innerHeight - 32, 'ground').setScale(2).refreshBody();
    }

    // Generate floating platforms
    for (let i = 0; i < 10; i++) {
        x += 200 + Math.random() * 200; // Random horizontal spacing
        y = window.innerHeight - 32 - levelHeight * (Math.floor(Math.random() * 3) + 1); // Random height

        // Ensure platforms stay within jumpable range and on-screen
        y = Math.max(200, Math.min(window.innerHeight - 32, y));

        platforms.create(x, y, 'ground').setScale(1.5).refreshBody();
    }
}