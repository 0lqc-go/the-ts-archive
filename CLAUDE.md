# Editing The T.S. Archive

The public [archive](https://0lqc-go.github.io/the-ts-archive/) is built from this repository and hosted on GitHub Pages.

- Edit `1-Site/content/catalog.json` to register a decade or a film list. Save its awards or list entries in a separate JSON file in `1-Site/content/`. The [content guide](1-Site/README.md) describes the format. Its paths are relative to `1-Site/`.
- An award's `winner` is explicit. Preserve the curator's winners, nominees, and order unless asked to change them.
- Put new film artwork in `1-Site/assets/films/`. The publishing workflow also includes the existing WebP files directly under `2-Artwork/films/`. When replacing one of those images, the copy in `1-Site/assets/films/` takes precedence. In content, reference either location as `assets/films/<filename>`.
- Check each still against its film and award. Preserve its aspect ratio, record the source credit, and add the dimensions to the edition's `media.sizes`.
- For a local preview, copy the contents of `1-Site/` to a temporary folder and copy `2-Artwork/films/*.webp` into its `assets/films/` without overwriting files already there. Serve the temporary folder over HTTP. Verify the home page and the changed edition or list.
- Propose changes for review before merging to `main`. The [publishing workflow](.github/workflows/pages.yml) deploys changes on `main` automatically. Keep drafts and private files out of this public repository.
