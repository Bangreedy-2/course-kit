---
name: coursekit-runner-connect
description: Connect a Coursekit player to the Coursekit runner on this computer, so courses can run code in locally installed languages. Use when someone has added the coursekit-runner plugin, says "connect the runner", or a course shows that it needs this computer and has no Connect button.
---

# Connect the player to the runner

The Coursekit plugin publishes a player that has no link to any local server. This skill replaces that page with the full player, which can reach the Coursekit runner, and gives it access. Do it once per player, and again after the Coursekit plugin updates the player.

1. List the person's artifacts and find the one titled "Coursekit". If there is none, tell them to set up Coursekit first. Read the artifact so you know its capabilities.
2. The full page is stored beside this file as [coursekit-player-page.txt](coursekit-player-page.txt) (a text file holding the complete HTML page). Copy it byte for byte to a working file named `coursekit-player.html`, without reading it into the conversation or changing it. Publish that copy to the player's URL, together with every `player-code-N.txt` file from this folder, each under its own name beside the page (the `files` map). Declare the capabilities the player already has plus:

```json
"mcp": { "servers": [{ "server": "host:coursekit", "tools": ["runner_info", "run_code"] }] }
```

   Capabilities are declared as a full set, so restate every one the player already had (normally `db`, `user`, `sample`, `downloads`, `assets`, `desktop`). Leave its other files alone: files not named in a publish are kept, and courses and progress live in the database.
3. Tell the person to open the player in the Claude desktop app and press "Connect" in the course's note. The page asks once for permission, and each course must be allowed once before its first Run.

The runner executes only what the player sends when the learner presses Run. The language itself must be installed on the computer; the runner reports which ones it finds.
