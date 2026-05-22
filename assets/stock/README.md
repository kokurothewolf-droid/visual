# Stock photos

Drop image files in this folder, then add an entry for each one in `manifest.json`. Daybook will show them in the **Stock** tab of the image picker so users can pick from your curated library.

## Entry format

Each entry in `manifest.json` → `photos[]`:

| Field      | Required | Notes                                                                 |
| ---------- | -------- | --------------------------------------------------------------------- |
| `file`     | yes      | Filename (in this folder). Relative path — e.g. `"cereal.jpg"`.       |
| `title`    | yes      | Caption shown under the tile.                                         |
| `category` | no       | `routine \| hygiene \| school \| social \| food \| calm`. Used for the Stock-tab category filter. |
| `tags`     | no       | Array of words the search field matches against. Lowercase preferred. |
| `credit`   | no       | Attribution shown in the inspector and printed alongside the image.   |

## Image guidelines

- **Format**: JPG or PNG. JPG is fine for photos.
- **Size**: ~800×800px is plenty. Anything larger just costs bandwidth.
- **Aspect**: Square or 4:3 works best with the step-card layout.
- **Naming**: Use lowercase + hyphens. `kids-toothbrush.jpg` beats `Kids Toothbrush.JPG`.

After adding files + manifest entries, commit and push — GitHub Pages will redeploy automatically.

## Tip — copying photos in bulk

If you have a folder of photos already named correctly, you can scaffold a starter manifest with one shell line:

```bash
cd assets/stock
ls *.jpg | jq -R '{file: ., title: (.|gsub("\\.[^.]+$"; "")|gsub("-"; " "))}' | jq -s '{photos: .}' > manifest.json
```

Then hand-edit titles, categories, and tags.
