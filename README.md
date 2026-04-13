<<<<<<< HEAD
# T00lz Dev Tools — OpenClaw Plugin

> 8 essential developer utilities from [t00lz.com](https://t00lz.com), available directly in your OpenClaw AI assistant.

All processing is **100% local** — no data ever leaves your machine.

---

## Tools Included

| Tool | What you say | What it does |
|------|-------------|--------------|
| `json_format` | "format this JSON" / "minify this JSON" | Beautify or minify JSON with error reporting |
| `json_validate` | "validate this JSON" | Check JSON syntax with exact line/col errors |
| `base64` | "encode this to base64" / "decode this base64" | Base64 encode or decode any string |
| `generate_password` | "generate a 24-char password with symbols" | Cryptographically secure password generator |
| `markdown_to_html` | "convert this markdown to HTML" | Full Markdown → HTML conversion |
| `word_count` | "count words in this text" | Words, chars, sentences, reading time |
| `case_convert` | "convert to snake_case" / "make this title case" | 7 case formats including camel, kebab, snake |
| `text_diff` | "diff these two texts" | Line-by-line diff with +/- summary |

---

## Install

```bash
openclaw plugins install @t00lzcom/dev-tools
```

Or from source:

```bash
openclaw plugins install ./t00lz-dev-tools
```

## Configuration

Add to your OpenClaw config (optional):

```json5
{
  plugins: {
    entries: {
      "t00lz-dev-tools": {
        enabled: true,
        config: {
          passwordDefaultLength: 24,   // default: 20
          passwordDefaultSymbols: true // default: true
        }
      }
    }
  }
}
```

## Example Usage

Once installed, just talk to your OpenClaw agent naturally:

```
You: format this JSON for me: {"name":"alice","age":30}
Agent: {
  "name": "alice",
  "age": 30
}

You: generate a strong 32-character password
Agent: Password: kR7!mXq2#vLp9@wNsZ4$bJcTdYeF8&uA
       Strength: 💪 Strong

You: convert "hello world from t00lz" to camelCase
Agent: helloWorldFromT00lz

You: how many words in this paragraph? [paste text]
Agent: Words: 142 | Characters: 891 | Reading time: 43s
```

## Contributing

Issues and PRs welcome at [github.com/t00lzcom/openclaw-dev-tools](https://github.com/t00lzcom/openclaw-dev-tools).

For more free developer tools, visit **[t00lz.com](https://t00lz.com)**.

## License

MIT
=======
# openclaw-dev-tools
>>>>>>> ce029e83180314ddb384a40a94bbd727f698c599
