# Publishing Coursekit

How a new person gets Coursekit, and what the maintainer has to keep in place.

## The pieces

| Piece | Where it lives | What it is for |
|---|---|---|
| Plugin | `plugin/` (marketplace file in `.claude-plugin/`) | Skills `coursekit-setup`, `coursekit-player`, `coursekit-design`. Holds only text, JSON and images, which is what the directory accepts |
| Player page | `plugin/skills/coursekit-player/coursekit-player-page.txt` (the HTML page stored as text, because the directory accepts only text files) plus `player-code-N.txt` (each under the directory's 256 KiB inspection limit), built by `node player/build.js` | Published into each person's own account by the setup skill |
| Python pack | pack artifact listed in `runtimes/registry.json` | Copied into a player so Python runs in the page |
| Landing page | `site/index.html` | The front door: what Coursekit is, the plugin step, the one button |

## What a new person does

1. Adds the plugin (Customize → Plugins → Add marketplace → `Bangreedy-2/course-kit`). Once the plugin is in Claude's directory this becomes one Install press, and Claude can offer it in the chat.
2. Presses "Set up Coursekit" on the landing page. That opens Claude with the request typed in (`https://claude.ai/new?q=…`); they press send.
3. Opens the player.

There is no link that installs a plugin, so step 1 cannot be removed, only shortened by the directory listing.

## Maintainer checklist

- The repository is public and `main` holds the current `plugin/` (the marketplace reads the default branch).
- The Python pack artifact is shared so that anyone with the link can open it. It declares no capabilities, so public sharing is allowed.
- The landing page is published somewhere public: as a public artifact, and/or with GitHub Pages serving `site/`.
- After changing the player: `node player/build.js`, commit, and bump `version` in `plugin/.claude-plugin/plugin.json`. People update with "Update" on the marketplace and then "set up Coursekit" again, which republishes the page to their existing player.

## Directory listing

Submit at https://claude.ai/directory/manage → Submit new → Plugin bundle. Source: this repository, plugin path `plugin`. Before submitting, run `claude plugin validate ./plugin`. The directory needs a LICENSE (in `plugin/` or the repository root) and reads the icon at `plugin/.claude-plugin/icon.png` once, at first save.

Listing text to reuse:

- **Name:** Coursekit
- **Tagline:** Say what you want to learn. Get a whole course that checks your work.
- **Description:** Coursekit publishes a private course player into your Claude account. Describe a goal and Claude plans a week-by-week programme around your time and deadline, writes lessons with checked practice, runs and tests your code, drills you from memory and keeps your progress on every device. A tutor inside each lesson sees where you are and can reshape the course on request.
- **Data handling:** courses and progress are stored in the person's own artifact database; nothing is sent to any server of ours.


## Not proven yet

- Copying the Python pack from the pack artifact into another account's player.


## The local runner (not public)

`runner/` holds an experimental runner that lets a player run code on the owner's own computer. It is not listed in the marketplace file and no public text mentions it, because the plugin directory accepts local servers only from Verified organizations. The player the plugin ships is built without the link to it (`/*ADDON<*/ … /*>ADDON*/` in `player/src/run.js`); the full build is `player/dist/coursekit-player.html` and the copy in `runner/skills/coursekit-runner-connect/`.
