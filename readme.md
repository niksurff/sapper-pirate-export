# Sapper Pirate Export

Pirate-grade config free static site generator, powered by Sapper.

> !! This is a prototype. It should work. Use at your own risk. Try it. Feedback is welcome !!

## What is Sapper Pirate Export?

**Sapper Pirate Export** builds static exports from your [Sapper](https://sapper.svelte.technology/) app. Think `next export` for Sapper but without the configuration overhead.

## Getting Started

### Get `sapper-template`

Follow [this guide](https://github.com/sveltejs/sapper#get-started) for bootstrapping your Sapper app with [`sapper-template`](https://github.com/sveltejs/sapper-template).

### Install `sapper-pirate-export`

Install the module inside your newly created app folder.

```shell
npm i sapper-pirate-export@alpha
```

### Add npm script

Add the export script to your `package.json`. Optionally, activate the debug mode.

```json
"scripts": {
    "export": "sapper build & npm run sapper-pirate-export",
    "export:debug": "sapper build && cross-env DEBUG=sapper-pirate-export* npm run sapper-pirate-export"
}
```

### Add middleware

We need to hook into the server to make sure we don't ~~miss server-side requests~~ need configuration.

Extend `server.js` like so:

```javascript
const exportMiddleware = require("sapper-pirate-export/middleware")

// ...

app.use(static("assets"))
app.use(exportMiddleware())
app.use(sapper)

// ...
```

### Fix server-side fetches

For now, the exporter needs proper file extensions to work with non HTML files.

Find the `fetch` requests inside your routes and add `.json` to the path.

```javascript
// ./routes/blog/index.html

// notice the .json extension
return fetch(`/api/blog.json`)

//./routes/blog/[slug].html

// same here
return fetch(`/api/blog/${slug}.json`)
```

### Finally, pirate export

run `npm run export`. Files will be exported into `.pirates/`.

Test the export with something like `npx serve .pirates`

## How Does is Work?

The script runs the server in a child process. It requests known routes such as `/` and crawls HTML responses for internal links. Then repeats the process while saving response bodies to disk.

Meanwhile the server middleware is sending all requested urls back to the script which includes server-side fetched API requests. After filtering out the already visited sites, the process is repeated until the responses and messages stop.

All static files such as assets and JavaScript chunks just get copied over.

Of course [this wasn't my idea](https://github.com/sveltejs/sapper/issues/9)!

## Roadmap

1. Get feedback.
2. Test it.
3. Improve it.
4. Use it.

If there is continued interest and a feature like this isn't [built into Sapper core](https://github.com/sveltejs/sapper/issues/9) I'll keep maintaining this project casually.
