# Unity WebGL build goes here

Drop your Unity **WebGL build output** directly into this folder so that the
game's entry file ends up at:

```
public/game/index.html
```

A typical Unity WebGL build folder contains:

```
public/game/
├── index.html
├── Build/
│   ├── <name>.loader.js
│   ├── <name>.data        (or .data.gz / .data.br)
│   ├── <name>.framework.js
│   └── <name>.wasm
└── TemplateData/
```

## Build settings in Unity (important)

In **Player Settings → Publishing Settings**, do ONE of these so the build
loads without extra server config:

- **Compression Format = Disabled** (simplest — larger files), or
- **Compression Format = Gzip/Brotli** *with* **Decompression Fallback = ON**.

## Turn it on

Once the files are in place, open `src/blogData.js`, find the `unity` section's
`game` object, and set:

```js
ready: true,
```

Then commit, push, and rebuild (see DEPLOYMENT.md). The demo will replace the
"coming soon" placeholder in the **Blog → Unity Development** tab.

## Size note

WebGL builds are often 20–80 MB. If it makes the repo too heavy, tell Claude and
we'll `.gitignore` this folder and copy the build to the server directly instead
of committing it.
