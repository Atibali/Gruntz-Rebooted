import Phaser from 'phaser';

export class AssetGenerator {
  public static generateAll(scene: Phaser.Scene) {
    if (scene.textures.exists('player_idle')) return;

    const g = scene.make.graphics({ x: 0, y: 0 }, false);

    // 1. Floor Tile (48x48) - Dark Computer Motherboard Grid
    g.clear();
    g.fillStyle(0x0b1320, 1);
    g.fillRect(0, 0, 48, 48);
    g.lineStyle(1, 0x16243a, 1);
    g.strokeRect(0.5, 0.5, 47, 47);
    // Subtle circuit trace
    g.lineStyle(1, 0x1d314d, 0.7);
    g.beginPath();
    g.moveTo(8, 24);
    g.lineTo(20, 24);
    g.lineTo(26, 18);
    g.lineTo(40, 18);
    g.strokePath();
    g.fillStyle(0x233b5c, 0.9);
    g.fillCircle(8, 24, 2);
    g.fillCircle(40, 18, 2);
    g.generateTexture('tile_floor', 48, 48);

    // 2. Void / Data Chasm Tile (48x48)
    g.clear();
    g.fillStyle(0x03060c, 1);
    g.fillRect(0, 0, 48, 48);
    g.lineStyle(1, 0x0f1a2c, 0.5);
    g.strokeRect(4, 4, 40, 40);
    g.strokeRect(12, 12, 24, 24);
    g.generateTexture('tile_void', 48, 48);

    // 3. Wall Tile (48x48) - Reinforced Silicon Server Block
    g.clear();
    g.fillStyle(0x1e293b, 1);
    g.fillRect(0, 0, 48, 48);
    // Top bevel
    g.fillStyle(0x334155, 1);
    g.fillRect(2, 2, 44, 10);
    // Inner face
    g.fillStyle(0x0f172a, 1);
    g.fillRect(6, 14, 36, 28);
    // Server rack vents & amber status LED
    g.fillStyle(0x1e293b, 1);
    g.fillRect(10, 18, 28, 4);
    g.fillRect(10, 26, 28, 4);
    g.fillRect(10, 34, 18, 4);
    g.fillStyle(0xf59e0b, 0.9);
    g.fillRect(33, 34, 5, 4);
    g.lineStyle(2, 0x475569, 1);
    g.strokeRect(1, 1, 46, 46);
    g.generateTexture('tile_wall', 48, 48);

    // 4. Digital Grunt - Player Idle & Step (40x40)
    // Retro-digital golem grunt with amber visor, emerald core, chunky pixel boots
    const drawGrunt = (key: string, stepOffset: number) => {
      g.clear();
      // Shadow
      g.fillStyle(0x000000, 0.45);
      g.fillEllipse(20, 35, 26, 10);
      // Boots
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(8, 28 + stepOffset, 9, 8, 2);
      g.fillRoundedRect(23, 28 - stepOffset, 9, 8, 2);
      // Torso / Chunky Gruntz Chassis
      g.fillStyle(0x10b981, 1);
      g.fillRoundedRect(7, 11, 26, 20, 5);
      g.lineStyle(2, 0x059669, 1);
      g.strokeRoundedRect(7, 11, 26, 20, 5);
      // Chest Data Core
      g.fillStyle(0x064e3b, 1);
      g.fillRect(13, 21, 14, 7);
      g.fillStyle(0x34d399, 1);
      g.fillRect(15, 23, 10, 3);
      // Visor / Expressive Gruntz Eyes
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(10, 13, 20, 7, 2);
      g.fillStyle(0xfbbf24, 1);
      g.fillRect(13, 15, 5, 4);
      g.fillRect(22, 15, 5, 4);
      // Antenna
      g.lineStyle(2, 0x34d399, 1);
      g.lineBetween(20, 4, 20, 11);
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(20, 4, 3);
      g.generateTexture(key, 40, 40);
    };
    drawGrunt('player_idle', 0);
    drawGrunt('player_walk1', 2);
    drawGrunt('player_walk2', -2);

    // 5. Switch OFF & Switch ON (44x44)
    const drawSwitch = (key: string, active: boolean) => {
      g.clear();
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(4, 4, 36, 36, 6);
      g.lineStyle(2, active ? 0x10b981 : 0xf59e0b, 1);
      g.strokeRoundedRect(4, 4, 36, 36, 6);
      // Corner bolts
      g.fillStyle(0x64748b, 1);
      g.fillCircle(9, 9, 2);
      g.fillCircle(35, 9, 2);
      g.fillCircle(9, 35, 2);
      g.fillCircle(35, 35, 2);
      // Pressure pad
      g.fillStyle(active ? 0x10b981 : 0xd97706, 0.9);
      g.fillRoundedRect(11, 11, 22, 22, 4);
      g.fillStyle(0x0f172a, 0.7);
      g.fillRect(16, 19, 12, 6);
      g.generateTexture(key, 44, 44);
    };
    drawSwitch('switch_off', false);
    drawSwitch('switch_on', true);

    // 6. Door Locked (Red 🔴) & Door Open (Green 🟢) (48x48)
    g.clear();
    g.fillStyle(0x334155, 1);
    g.fillRect(0, 0, 48, 48);
    // Hazard stripes
    g.fillStyle(0xef4444, 0.9);
    g.fillRect(4, 6, 40, 8);
    g.fillRect(4, 34, 40, 8);
    // Center blast lock
    g.fillStyle(0x0f172a, 1);
    g.fillRect(6, 16, 36, 16);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(24, 24, 6);
    g.lineStyle(2, 0xf87171, 1);
    g.strokeRect(1, 1, 46, 46);
    g.generateTexture('door_locked', 48, 48);

    g.clear();
    g.fillStyle(0x0b1320, 1);
    g.fillRect(0, 0, 48, 48);
    // Retracted door side rails
    g.fillStyle(0x1e293b, 1);
    g.fillRect(0, 0, 8, 48);
    g.fillRect(40, 0, 8, 48);
    g.fillStyle(0x10b981, 0.9);
    g.fillCircle(4, 24, 3);
    g.fillCircle(44, 24, 3);
    g.lineStyle(1, 0x10b981, 0.35);
    g.strokeRect(8, 4, 32, 40);
    g.generateTexture('door_open', 48, 48);

    // 7. Terminal Offline & Online (44x44)
    const drawTerminal = (key: string, hacked: boolean) => {
      g.clear();
      // Base desk
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(4, 6, 36, 34, 5);
      g.lineStyle(2, hacked ? 0x10b981 : 0x38bdf8, 1);
      g.strokeRoundedRect(4, 6, 36, 34, 5);
      // Monitor CRT screen
      g.fillStyle(0x090d16, 1);
      g.fillRect(8, 10, 28, 16);
      // Screen scanlines/code
      g.fillStyle(hacked ? 0x10b981 : 0x38bdf8, 1);
      g.fillRect(11, 13, 14, 3);
      g.fillRect(11, 18, 20, 2);
      g.fillRect(11, 22, 10, 2);
      // Keyboard deck
      g.fillStyle(0x475569, 1);
      g.fillRect(10, 29, 24, 7);
      g.generateTexture(key, 44, 44);
    };
    drawTerminal('terminal_offline', false);
    drawTerminal('terminal_online', true);

    // 8. Data Shard (36x36) - Glowing Golden/Emerald Octahedron Crystal
    g.clear();
    g.fillStyle(0xf59e0b, 0.25);
    g.fillCircle(18, 18, 16);
    g.fillStyle(0xfbbf24, 1);
    g.fillTriangle(18, 3, 31, 18, 18, 33);
    g.fillStyle(0xf59e0b, 1);
    g.fillTriangle(18, 3, 5, 18, 18, 33);
    g.fillStyle(0xfef3c7, 0.9);
    g.fillTriangle(18, 8, 25, 18, 18, 28);
    g.lineStyle(1.5, 0xffffff, 0.9);
    g.strokeCircle(18, 18, 14);
    g.generateTexture('data_shard', 36, 36);

    // 9. Moving Platform / Holo-Bridge (48x48)
    g.clear();
    g.fillStyle(0x065f46, 0.85);
    g.fillRoundedRect(2, 2, 44, 44, 6);
    g.lineStyle(2, 0x34d399, 1);
    g.strokeRoundedRect(2, 2, 44, 44, 6);
    g.lineStyle(1, 0x6ee7b7, 0.6);
    g.lineBetween(8, 16, 40, 16);
    g.lineBetween(8, 24, 40, 24);
    g.lineBetween(8, 32, 40, 32);
    g.generateTexture('platform_active', 48, 48);

    g.clear();
    g.fillStyle(0x03060c, 1);
    g.fillRect(0, 0, 48, 48);
    g.lineStyle(1.5, 0x334155, 0.6);
    g.strokeRoundedRect(6, 6, 36, 36, 4);
    g.generateTexture('platform_inactive', 48, 48);

    // 10. Electronic Floor Hazard Trap (44x44)
    g.clear();
    g.fillStyle(0x1e1b2e, 1);
    g.fillRoundedRect(4, 4, 36, 36, 4);
    g.lineStyle(2, 0xef4444, 0.9);
    g.strokeRoundedRect(4, 4, 36, 36, 4);
    // Spikes / High voltage nodes
    g.fillStyle(0xef4444, 1);
    g.fillTriangle(14, 10, 19, 20, 9, 20);
    g.fillTriangle(30, 10, 35, 20, 25, 20);
    g.fillTriangle(22, 22, 27, 34, 17, 34);
    g.generateTexture('hazard_active', 44, 44);

    g.clear();
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(4, 4, 36, 36, 4);
    g.lineStyle(1, 0x475569, 0.8);
    g.strokeRoundedRect(4, 4, 36, 36, 4);
    g.fillStyle(0x334155, 1);
    g.fillCircle(14, 16, 3);
    g.fillCircle(30, 16, 3);
    g.fillCircle(22, 28, 3);
    g.generateTexture('hazard_disabled', 44, 44);

    // 11. Exit Portal Locked & Unlocked (56x56)
    const drawExit = (key: string, unlocked: boolean) => {
      g.clear();
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(28, 28, 25);
      g.lineStyle(3, unlocked ? 0x10b981 : 0xef4444, 1);
      g.strokeCircle(28, 28, 24);
      g.lineStyle(2, unlocked ? 0x34d399 : 0x64748b, 0.8);
      g.strokeCircle(28, 28, 17);
      g.fillStyle(unlocked ? 0x10b981 : 0x7f1d1d, unlocked ? 0.75 : 0.5);
      g.fillCircle(28, 28, 11);
      g.generateTexture(key, 56, 56);
    };
    drawExit('exit_locked', false);
    drawExit('exit_unlocked', true);

    // 12. Security Drone (40x40)
    const drawDrone = (key: string, disabled: boolean) => {
      g.clear();
      // Rotor arms
      g.lineStyle(3, 0x64748b, 1);
      g.lineBetween(6, 6, 34, 34);
      g.lineBetween(34, 6, 6, 34);
      // Rotors
      g.fillStyle(disabled ? 0x334155 : 0x94a3b8, 1);
      g.fillCircle(7, 7, 5);
      g.fillCircle(33, 7, 5);
      g.fillCircle(7, 33, 5);
      g.fillCircle(33, 33, 5);
      // Central chassis
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(20, 20, 11);
      g.lineStyle(2, disabled ? 0x38bdf8 : 0xef4444, 1);
      g.strokeCircle(20, 20, 11);
      // Eye sensor
      g.fillStyle(disabled ? 0x475569 : 0xef4444, 1);
      g.fillCircle(20, 20, 5);
      g.generateTexture(key, 40, 40);
    };
    drawDrone('enemy_drone', false);
    drawDrone('enemy_drone_disabled', true);

    // 13. Glitch Creature (40x40)
    const drawGlitch = (key: string, stunned: boolean) => {
      g.clear();
      // Jagged corrupted voxel silhouette
      g.fillStyle(stunned ? 0x475569 : 0xe11d48, 0.9);
      g.fillRect(6, 8, 28, 24);
      g.fillStyle(stunned ? 0x64748b : 0xf43f5e, 1);
      g.fillRect(10, 4, 20, 28);
      // Glitch offset bars
      g.fillStyle(stunned ? 0x38bdf8 : 0xfbbf24, 1);
      g.fillRect(4, 14, 8, 4);
      g.fillRect(28, 22, 8, 4);
      // Eyes
      g.fillStyle(0x090d16, 1);
      g.fillRect(12, 12, 6, 6);
      g.fillRect(22, 12, 6, 6);
      g.fillStyle(stunned ? 0x38bdf8 : 0xffffff, 1);
      g.fillRect(14, 14, 3, 3);
      g.fillRect(24, 14, 3, 3);
      g.generateTexture(key, 40, 40);
    };
    drawGlitch('enemy_glitch', false);
    drawGlitch('enemy_glitch_stunned', true);

    // 14. Corrupted Core Guardian Boss (84x84)
    const drawBoss = (key: string, vulnerable: boolean) => {
      g.clear();
      // Outer armored octagon ring
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(42, 42, 38);
      g.lineStyle(4, vulnerable ? 0x10b981 : 0xef4444, 1);
      g.strokeCircle(42, 42, 38);
      // Inner core plates
      g.fillStyle(0x0f172a, 1);
      g.fillRect(18, 18, 48, 48);
      g.lineStyle(2, vulnerable ? 0xfbbf24 : 0xf43f5e, 1);
      g.strokeRect(18, 18, 48, 48);
      // Central AI Core Eye
      g.fillStyle(vulnerable ? 0x10b981 : 0xe11d48, 1);
      g.fillCircle(42, 42, 15);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(42, 42, 6);
      g.generateTexture(key, 84, 84);
    };
    drawBoss('boss_normal', false);
    drawBoss('boss_vulnerable', true);

    // 15. Particle dot (8x8)
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRect(1, 1, 6, 6);
    g.generateTexture('particle_square', 8, 8);

    g.destroy();
  }
}
