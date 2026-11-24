# Roadmap

Coursekit has five parts. They are built in this order, each as its own reviewable change.

1. **Engine and content split.** The learning app reads any course pack; the machine learning programme becomes the first pack. *(done)*
2. **Second pack on a non-code topic,** to prove the app works for any subject, not only programming.
3. **Local helper.** A small program on your computer that serves the app, saves progress to files (so it survives clearing the browser and can sync between machines), and runs heavy code on your own hardware: a local Jupyter kernel with your GPU, any library and large data.
4. **AI bridge (MCP server) and the Ask button.** Connects Claude Desktop, claude.ai or Claude Code on your normal subscription to the helper. Your AI can read the lesson you are on and your progress, explain, quiz you, run and check your code, and create or edit courses. The Ask button copies the current context into your AI chat. No API keys; local models are optional.
5. **Course generator.** "Build a course on X from these files": your AI writes a pack in this format, validates it with `tools/pack.js`, and it appears in the app.
6. **Plugins.** Runtimes and widgets as add-ons a pack switches on: Python (in the browser or on the local helper), JavaScript, SQL, maths and diagrams, flashcard import.
7. **One-command install and docs,** so anyone can set it up from this repository with their own AI subscription.
