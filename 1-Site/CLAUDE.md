# Editing The T.S. Archive

This is a static cinema archive hosted on GitHub Pages. Read [README.md](README.md) for the content format and local preview.

- Change `content/catalog.json` to add an edition or film list to the homepage. Put the selections in a separate JSON file under `content/`.
- To change winners, nominees, quotes, or a category still, edit that edition's content file. A winner is the explicit `winner` entry. Preserve the curator's order and choices unless asked to change them.
- Put site artwork under `assets/films/`. For a still, check the performer and scene against the award, preserve the source ratio, and record credit and dimensions.
- Keep all paths relative to the site root so the site works at its GitHub Pages project URL. Verify the homepage and the changed page over HTTP.
- Keep drafts and private material outside this public repository. Propose changes on a branch or pull request for the curator to review.
