---
name: sync-doc
description: Sync LEADS.md and MESSAGES.md to the "BNC Group Lead Pipeline" Claude Doc (Lead Pipeline and Messages tabs). Run after every send or tracker change.
---

# Sync the doc

Doc: https://claude.ai/code/artifact/0996846a-bfff-4980-bc6f-e801b8b7ac2e. One write is capped at 32KB, so always go through an upload.

For each file:

| File | Tab file id |
|---|---|
| LEADS.md | 544e9a87-83a6 |
| MESSAGES.md | e4a2687f-7eb3 |

1. Artifact publish with url = doc link, file_path = the file, asset: true. Note the asset id.
2. Claude Docs `batch` on the project: one op creating a blob with payload {"asset": "<asset id>"}. Note the blob id. (Don't reference $lid in the same batch.)
3. Claude Docs `create` (separate call, not inside batch): object node, engine prose, parent file <tab file id>, source from blob/<blob id> as markdown. Note the node id.
4. Claude Docs `update`: ref file <tab file id>, payload patch set ["content"] to {"kind":"node","id":"<node id>"}.

If a step errors, write the fix into this skill so it never happens twice.
