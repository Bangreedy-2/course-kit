# Connect your AI tutor

Coursekit uses the AI subscription you already have. There are no API keys to create or pay for.

There are two ways to bring your AI in. They work together.

## 1. The Ask button (any AI chat)

Every page has an **Ask** button, and every exercise has its own. It writes a message that tells the AI where you are: the course, the lesson or exercise, your answer so far, or the last error in your notebook. Add your question, press **Copy and open Claude**, and paste. This works in claude.ai, the Claude apps, or any other assistant, with or without the helper.

The button opens `https://claude.ai/new` by default. To open a different chat, change the `coursekit-ask-url` line in `app/index.html`.

## 2. The Coursekit tools (Claude Desktop, Claude Code)

The Coursekit MCP server (`helper/mcp_server.py`) gives your AI direct access to your courses. It can:

- see where you are in the app right now, including your answer and the expected one (it is told to give hints first);
- read your progress and notice what took you several tries;
- run Python on your computer, with your libraries and GPU, to check your code or show an idea;
- create a new course, or edit and extend an existing one, and validate it.

It runs on your computer and talks to your AI app over stdio. Seeing where you are and running code need the helper (`python3 helper/coursekit.py`) to be running; reading and editing courses work without it.

### Claude Code

```sh
claude mcp add coursekit -- python3 /full/path/to/course-kit/helper/mcp_server.py
```

### Claude Desktop

Open Settings → Developer → Edit Config and add:

```json
{
  "mcpServers": {
    "coursekit": {
      "command": "python3",
      "args": ["/full/path/to/course-kit/helper/mcp_server.py"]
    }
  }
}
```

On Windows use `"command": "python"` and a path like `"C:\\Users\\you\\course-kit\\helper\\mcp_server.py"`. Restart Claude Desktop afterwards.

### Other MCP clients

Any client that can run a local stdio MCP server works the same way: the command is `python3 helper/mcp_server.py`. Set `COURSEKIT_HOME` if you started the helper with `--home`, and `COURSEKIT_PACKS` if your packs are outside this repository (the server also picks up the helper's `--packs` while the helper runs).

### claude.ai in a browser

The web version of claude.ai connects to remote MCP servers only, not to programs on your computer. Use the Ask button there.

## What to say

- "Help me with what I'm working on in Coursekit." (or use the `tutor` prompt)
- "Why is my answer to this exercise wrong? Hints only."
- "Run my notebook's last cell on my GPU and explain the error."
- "Which lessons should I review this week, based on my progress?"
- "Add three more practice items to the logistic regression lesson."
- "Build a course on Spanish for beginners, 4 weeks, 3 hours a week." (or use the `build-course` prompt)

## Tools

| Tool | What it does |
|---|---|
| `get_current_context` | where you are in the app, with the lesson text and the expected answer for the AI |
| `list_courses`, `get_course`, `get_lesson` | read courses |
| `get_progress` | your saved progress in a course |
| `get_format_guide` | the course pack format |
| `read_course_file`, `write_course_file` | read and change files inside a course folder (Markdown, JSON, CSV, text only) |
| `create_course`, `validate_course` | start a new course and check one for mistakes |
| `run_python` | run code through the helper on your computer |
