# The T.S. Archive

A personal cinema archive by [0lqc](https://letterboxd.com/0lqc/). Browse the [public site](https://0lqc-go.github.io/the-ts-archive/) for film awards by decade and curated film lists.

## Edit the archive

- [content/catalog.json](content/catalog.json) controls the homepage. Register each edition or list here. `featuredEdition` selects the featured awards link, while `homeCover` independently sets the homepage photograph, credit and crop. Each edition keeps its own cover.
- [content/2020-2026.json](content/2020-2026.json) holds the 2020–2026 ballot, film links, stills, and quotes.
- [assets/films](assets/films/) holds film artwork. Record any new still's width and height in the edition's `media.sizes`, and give the source or curator credit in `stills`.
- `media.films` defines the poster and landscape image for each film file. `content/artwork-variants.json` lists optimized sizes for responsive loading; the original images remain the main references. Every new edition automatically inherits the shared cinematic/compact layouts, award index and film dossiers.

In an edition, `chapters` groups awards. Each award has a unique `id`, a `name`, a `winner`, and a `nominees` array. `winner` and the entries in `nominees` refer to film IDs in `films`. Award order follows the order in the file. Optional `editorial.interludes` keys match award IDs.

To add a decade, copy the structure of the current edition into a new file under `content/`. Add its ID, display title, years, description, cover, and content path to `editions` in the catalog. Optional spotlights use `performances` and `actors`. To add an Oscar Snubs companion, add the edition's `snubs` array and register a list with `kind: "snubs"` and that edition ID in the catalog.

For a standalone list, add a catalog item with a unique `id`, `title`, `description`, and `content` path. An optional `cover` appears at the top. The content file can be as short as:

```json
{
  "items": [
    {
      "title": "TÁR",
      "year": 2022,
      "url": "https://letterboxd.com/film/tar-2022/",
      "poster": "assets/films/tar-2022-poster.webp",
      "note": "Cate Blanchett as Lydia Tár."
    }
  ]
}
```

## Preview and publish

Assemble a preview by copying `1-Site/` to a temporary site directory, and copy the WebP files from `2-Artwork/films/` into `assets/films/` only when the destination doesn't already exist. Serve that directory over HTTP and check the changed edition or list and its homepage link.

The existing GitHub Pages workflow assembles and deploys the public site after a reviewed change reaches `main`.

To edit with [Claude Code](https://code.claude.com/docs/en/claude-code-on-the-web), connect GitHub in Claude and select `0lqc-go/the-ts-archive`. Ask it to change the content files on a branch and open a pull request for your review. Repository write access is controlled by GitHub. The public site has no editing or sign-in interface.

Film artwork belongs to its respective rights holders.
