# GRUNTZ: REBOOTED — Game Design Document

## 1. Game title

**GRUNTZ: REBOOTED**

## 2. Original game

*Gruntz* (1999)

## 3. Game concept

A Digital Grunt is trapped in a corrupted computer mainframe. Across three sectors, the player reads the environment, chooses physical tools and digital abilities, manipulates system infrastructure, recovers Core Fragments, and escapes escalating security before confronting the system's guardian.

## 4. Reimagination and connection to the original

The project retains the inspiration's small controllable character, top-down puzzle spaces, tool-mediated problem solving, environmental interactions, hazards, and objective-based progression. It changes the setting, terminology, mechanics, level layouts, characters, and presentation: the player is a digital construct in a damaged mainframe, fragments replace the original objectives, and system tools interact with digital obstacles and security.

The computer setting makes the puzzle vocabulary cohesive: switches and terminals manipulate doors, bridges, and lasers; fragments trigger security escalation; abilities affect electronic enemies. The strategic relationship between a character, a chosen tool, and the environment keeps the connection recognizable without recreating the original game.

## 5. Genre

Puzzle-Strategy / Top-Down Adventure

## 6. Core gameplay loop

**Explore → Observe → Find a tool or ability → Solve a puzzle → Manipulate the environment → Recover a Core Fragment → Survive security escalation → Reach the exit**

## 7. Player

The player controls a Digital Grunt with movement and three health points. Movement uses keyboard controls and responsive velocity-based physics. The Grunt can interact with nearby stations and terminals, use a carried physical tool, and activate digital abilities. Damage causes temporary invulnerability and feedback; loss of all health ends the run and offers a level retry.

## 8. Tools and abilities

The physical-tool system allows the Grunt to carry one active tool, selected from a nearby Tool Station:

- **Data Hammer:** breaks designated corrupted walls.
- **Void Shovel:** clears designated soft-data obstacles.
- **EMP Glove:** enables the EMP ability and can be discharged using the tool control.
- **Glitch Decoy:** deploys a signal that lures nearby enemies.

Digital abilities:

- **Shield [1]:** provides temporary protection, then recharges.
- **EMP [2]:** requires the EMP Glove and temporarily disables nearby drones, glitch creatures, lasers, and hazards; it can affect the guardian in the appropriate phase.
- **Hack [3]:** hacks a nearby available terminal and supports contextual interaction with the guardian. **E** is also used for interaction.
- **Glitch [4]:** stuns or reverses nearby threats and can damage the guardian in its vulnerable phase.

Abilities with cooldowns communicate readiness in the HUD. EMP is shown as unavailable when its required tool is not equipped.

## 9. Puzzle mechanics

- **Switches:** activate once when stepped on and trigger configured targets.
- **Doors:** block routes until opened by a switch, terminal, or security event.
- **Terminals:** are hacked at close range to control configured devices or perform the final purge.
- **Lasers and hazards:** damage the player while dangerous; some can be disabled temporarily or permanently.
- **Tool Stations:** present a configured selection of physical tools and allow the player to swap their active tool.
- **Environmental obstacles:** corrupted walls require the Data Hammer; soft-data blocks require the Void Shovel; inactive holo-bridges are impassable until activated.
- **Enemy avoidance:** movement, route choice, Shield, EMP, Glitch, and Decoy offer different ways to manage threats. Combat is contextual rather than a general attack system.

## 10. Levels

### Level 1 — Boot Sector

- **Purpose:** introduce movement, tool stations, switches, terminals, and environmental tool use.
- **Main mechanics:** open a security door with a switch, select a tool, break a corrupted wall, hack a terminal, and cross a holo-bridge.
- **Objective:** recover one Core Fragment and reach the exit.
- **Difficulty progression:** a guided first puzzle leads into fragment collection, which activates a laser security response.

### Level 2 — Firewall Factory

- **Purpose:** build strategic tool selection and route planning.
- **Main mechanics:** two fragment routes, lasers, hazards, a terminal, and drone/glitch enemies; tool stations offer multiple tools.
- **Objective:** recover two Core Fragments and reach the exit.
- **Difficulty progression:** the first fragment activates additional security; the second can deploy a hunter drone.

### Level 3 — Core Breach

- **Purpose:** combine tool choice, environmental puzzles, security management, and a final guardian encounter.
- **Main mechanics:** multiple routes, doors, platforms, lasers, hazards, enemies, Surge Node switches, and a Core Purge terminal.
- **Objective:** recover three Core Fragments, defeat the Corrupted Core Guardian, and enter the System Core.
- **Difficulty progression:** fragment recovery activates security and awakens the guardian; the player must then solve the boss sequence.

## 11. Enemy system

Security Drones patrol between configured points and chase the player within a detection radius. A drone can be distracted by a nearby Glitch Decoy, disabled by EMP, or disrupted by Glitch. Glitch Creatures seek the player at close range, return toward their home position at a distance, and can also be lured, stunned, reversed, or disabled. Contact with active enemies damages the player. Enemies are threats to navigate and manipulate, not targets in a conventional combat loop.

## 12. Boss

The Corrupted Core Guardian is the final encounter in Core Breach:

1. **Armored patrol:** activate two Surge Node switches to reduce its protection and move into the next phase.
2. **Aggressive core:** use EMP or Glitch near the guardian to overload it twice; the guardian can pursue the player.
3. **Shield down:** hack the nearby Core Purge terminal to defeat it.

Stuns, invulnerability windows, visible health/phase feedback, and status hints communicate the encounter state.

## 13. Progression

Each sector tracks its required Core Fragments. Recovering fragments may trigger configured security escalations, including activating lasers, opening doors, spawning enemies, or awakening the guardian. A sector exit unlocks after its fragment requirement is met and, in the final sector, after the guardian is defeated. Sector completion leads to the next sector; defeating the guardian and entering the final exit triggers the victory state and System Core restoration screen. The player can restart after death.

## 14. UI / UX

The HUD presents health, current tool, sector navigation, fragment count, exit/security state, and system controls. It also shows the current objective, contextual prompts, ability readiness/cooldowns, and boss phase/status when applicable. Tool stations provide a selection modal. Pause, restart, sector-completion, game-over, and victory screens support the main game flow. Compact on-screen movement and interaction controls support touch-sized layouts.

## 15. Controls

| Input | Action |
| --- | --- |
| WASD / Arrow Keys | Move |
| E | Interact with a station or environmental object; hack a nearby terminal |
| Space | Use the equipped physical tool |
| 1 | Shield |
| 2 | EMP (requires EMP Glove) |
| 3 | Hack |
| 4 | Glitch |
| Esc | Pause / resume; close the tool modal |

On-screen controls supplement keyboard input.

## 16. Visual direction

The game uses a dark navy mainframe, grid-based motherboard floors, server-rack walls, and cyan/teal interface elements. Amber marks tools and objectives; red identifies locks and hazards. Generated pixel-inspired sprites, compact monospace in-world labels, and subtle scanlines support a retro-digital atmosphere.

## 17. Audio direction

Sound effects and looping menu, level, and boss patterns are synthesized at runtime with the Web Audio API. Distinct tonal cues accompany switches, doors, pickups, damage, abilities, tools, security alerts, enemy detection, boss hits, and victory. A mute control is provided. There are no bundled audio files in the project.

## 18. Technology

The implementation uses TypeScript, React, Phaser, Vite, Tailwind CSS, Lucide React icons, and the browser Web Audio API. The repository imports the React, Phaser, and Lucide packages in the game; other declared packages are not listed here as implemented gameplay technologies.

## 19. Originality

New project systems include a mainframe setting and visual vocabulary, the single-active-physical-tool selection system, tool-specific obstacles, contextual digital abilities, fragment-triggered security escalation, decoy-based enemy luring, and a three-phase guardian encounter. The game's levels, characters, interface, generated visuals, event logic, and synthesized audio implement this reinterpretation; they are not a reproduction of the original's levels or assets.

## 20. Assets and licensing

The repository contains runtime-generated Phaser graphics and synthesized audio, but no bundled image or audio files. The UI imports Lucide icons, and the HTML requests three Google Fonts. The repository does not include asset-specific attribution or license records for those external resources. Their source/license details must be verified before distribution. See [ASSETS_CREDITS.md](./ASSETS_CREDITS.md).

## 21. Hackathon deliverable

The project provides a playable web game and supporting documentation. The hosted build URL and final screenshots are placeholders in the README and should be replaced with the submitted build and captures.
