---
name: coursekit-runner-connect
description: Connect a Coursekit player to the Coursekit runner on this computer, so courses can run code in locally installed languages. Use when someone has added the coursekit-runner plugin, says "connect the runner", or a course shows that it needs this computer and has no Connect button.
---

# Connect the player to the runner

The Coursekit plugin publishes the player without access to any local server. This skill gives one player that access. Do it once per player.

1. List the person's artifacts and find the one titled "Coursekit". If there is none, tell them to set up Coursekit first.
2. Read the artifact. Republish the same page, unchanged, to the same URL with the capabilities it already has plus:

```json
"mcp": { "servers": [{ "server": "host:coursekit", "tools": ["runner_info", "run_code"] }] }
```

   Capabilities are declared as a full set, so restate every one the player already had. Leave its other files alone: files not named in a publish are kept.
3. Tell the person to open the player in the Claude desktop app and press "Connect" in the course's note. The page asks once for permission, and each course must be allowed once before its first Run.

The runner executes only what the player sends when the learner presses Run. The language itself must be installed on the computer; the runner reports which ones it finds.
