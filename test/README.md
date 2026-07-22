# Test conventions

Shared helpers live in [`helper.ts`](./helper.ts); the editor mock lives in
[`__mock__/obsidian.ts`](./__mock__/obsidian.ts).

## Multi-line fixtures: the `` _t`` `` tag

Write multi-line string fixtures with the `_t` tagged template so the first line
lines up with the rest instead of being jammed against the opening backtick.

```ts
const input = _t`
## Section
text
`;
// => "## Section\ntext"
```

Rules:

- **Removes exactly one leading and one trailing newline** — the line breaks that
  sit against the opening/closing backticks. Nothing else is touched.
- **No indentation is stripped** (unlike `dedent`/`trimIndent`). `\t`/space
  indentation and even whitespace-only trailing lines survive verbatim.
- **Put the content and BOTH backticks at column 0.** Write meaningful
  indentation as `\t` escapes:

  ```ts
  const input = _t`
  ### Section
  - parent
  \t- child
  `;
  // => "### Section\n- parent\n\t- child"
  ```

  Because only the newline is removed, an *indented* closing backtick would leave
  its indentation in the string. Keep backticks at column 0.

- Using `\t` escapes (not real tabs) means source lines carry no leading
  whitespace, so an editor's auto-indent cannot silently corrupt a fixture.

## Fixture naming

Fixture line text is placeholder-only: use single lowercase letters `a`, `b`,
`c`, … in line order. The heading level is shown by the `#` markers alone — never
encode a level or role in the text (`Section`, `intro`, `h2`), so a re-leveled
line stays readable. Select by line number.

## Test the real command, not a rebuilt copy

Drive the actual command class end-to-end and assert the resulting document.
Do **not** reconstruct the production logic (levels, change-composition, guards)
inside the test — such a test passes even when the command is wired wrong.

```ts
import { cursor, range, runCommand } from "./helper";

expect(
	runCommand(new InsertHeadingAtCurrentLevel(DEFAULT_SETTINGS), input, [cursor(1)]),
).toBe(_t`
## Section
## text
`);
```

- `runCommand(command, input, selections)` runs `command.editorCallback` against a
  `MockEditor` seeded with `input` + `selections`, then returns the document text.
- `cursor(line)` is a collapsed cursor; `range(start, end)` is an inclusive
  selection. Pass an array to exercise scattered multi-cursors.
- Sanity-check that a new test actually bites: temporarily break the code path
  (e.g. flip a `+1` to `+2`), confirm the test fails, then revert.

## Passing a mock without `as`

Operations type their `editorCallback` parameter as `MinimumEditor` in
[`src/utils/editorChange.ts`](../src/utils/editorChange.ts) — a `Pick` of the few
`Editor` methods they use, rather than obsidian's full `Editor`. The real
`Editor` is assignable to it, so runtime is unchanged, while `MockEditor`
satisfies it structurally and can be passed with no cast. When an operation
starts using a new editor method, add it to `MinimumEditor` and to `MockEditor`.
