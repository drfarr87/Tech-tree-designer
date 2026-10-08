# Tech Tree Designer

GitHub Pages-ready PWA for designing the GameDev technology tree.

## Shared data model

The editor code and the civilization data are separate:

- `app.js` contains the editor behavior.
- `data/china-tech-tree.json` is the canonical shared China tree in the repository.
- Browser `localStorage` remains the working autosave so in-progress edits are not lost.

On startup the app loads the repository JSON, then restores the local working copy if one exists. Missing canonical nodes are merged into older local saves without overwriting locally edited nodes.

The header shows whether the browser copy still has local changes that are not represented by the repository baseline.

## Saving changes back to GitHub

GitHub Pages cannot safely contain a personal access token, so the public app does not commit directly to the repository.

1. Edit the tree normally. Changes autosave in the browser.
2. Click **Export Snapshot** to download `china-tech-tree.json`.
3. Commit that file to `data/china-tech-tree.json` in this repository, or provide it to a GameDev chat with GitHub access and ask it to sync the snapshot.
4. Once the repository file is updated, all chats and devices can inspect the same canonical tree.

**Reset to Repo** discards unsynced browser edits and reloads the repository baseline.

## Publish

1. Keep GitHub Pages set to **Deploy from a branch**.
2. Branch: **main**, folder: **/(root)**.
3. Open the published URL in Safari on iPhone.
4. Share → Add to Home Screen → enable **Open as Web App** → Add.

The service worker uses a network-first strategy for the canonical tree JSON so repository updates can propagate without embedding GitHub credentials.

## Relationship types

The tree distinguishes two different kinds of links:

- **Dependencies / unlocks** use `deps` and render as solid lines.
- **Unit upgrade paths** use `upgradeFrom` and render as dashed arrowed lines.
- **Production obsolescence** uses `replacesProductionOf` so replacing an old trainable unit is explicit rather than inferred from prerequisites.

Current ranged progression records Stone Thrower → Slinger and Stone Thrower/Slinger → Simple Bowman as upgrade paths. Slinger removes Stone Thrower from new production once available; Simple Bowman removes both Stone Thrower and Slinger from new production once available.
