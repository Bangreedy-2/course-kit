---
name: coursekit-setup
description: Set up Coursekit for someone in one go - publish their private course player, add Python, check it, and hand over the link. Use when someone says "set up Coursekit", "install Coursekit", "I want Coursekit", or wants to learn something with a course and has no player yet.
---

# Set up Coursekit

The person may know nothing about Coursekit. Do the whole setup yourself, in this order, and keep your messages to them short and free of jargon. Do not ask them to choose anything: the defaults below are right for a first setup. They will see approval prompts for publishing; say once that those are expected.

Coursekit needs a paid Claude plan. If publishing an artifact is refused for plan reasons, say so plainly and stop.

## 1. Find or publish the player

List the person's artifacts and look for one titled "Coursekit". If it exists, read it and treat this as an update: publish the new page to that same URL (step 2 and 3 still apply).

Otherwise take `../coursekit-player/coursekit-player-page.txt` (a text file holding the complete HTML page), copy it byte for byte to a working file named `coursekit-player.html`, and publish that copy **unchanged** as a new artifact, title "Coursekit", icon "book", together with every `player-code-N.txt` file from that same folder, each published under its own name beside the page (the `files` map). The page loads its code from those files. Use these capabilities (on an update, keep any others the player already has):

```json
{
  "db": {}, "user": {}, "sample": {}, "downloads": true, "assets": {}
}
```

Never edit the page. Courses are data inside it, not changes to the file.

## 2. Add Python

Follow "Runtime packs" in the `coursekit-player` skill: copy the Python pack from its pack artifact into the player in two publishes of under 60 MB each. If the copy is refused or the pack does not match its pinned checksum, finish the setup anyway and tell the person that Python exercises will work once the pack is added; everything else works without it.

## 3. Check it

Read `py/pyodide-lock.json` from the player artifact once to confirm the pack arrived. Write one welcome note into the player's database so the person sees the setup worked: document `cmd~welcome` in collection `data/users/me` with

```json
{ "kind": "cmd", "status": "new", "op": "notify", "text": "Coursekit is ready. Press “New course” and say what you want to learn." }
```

## 4. Hand over

Open the player for them and reply with three lines at most:

- the link, and that it is private to them and works on their phone too;
- what to do first: press "New course" and describe what they want to learn, with their weekly time and any deadline;
- that the first time they press Ask or create a course, the page asks once for permission to use Claude.

Offer to pin it to their sidebar. Do not explain packs or records unless they ask.

## What runs code

Python and JavaScript run inside the page. A course in any other language still works: it teaches with predict-the-output practice and tasks the learner runs on their own computer and pastes back. Do not promise that the page runs other languages.
