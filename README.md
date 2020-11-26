# El Camino Rápido 🚗💨
Gulp TypeScript and ES10 setup for fast fronted web development

*El Camino Rápido* is a very simple [Gulp setup](https://github.com/stamat/el-camino-rapido/blob/main/gulpfile.js) that does a lot of work for your frontend development needs. Inspired by [Jekyll](https://jekyllrb.com/), which is pretty obvious, but this setup and static generator is way faster and relying only on Node.js.

## Features

* **TypeScript and ES10 support with code bundling** - using Rollup.js and generating browser ready IIFE format
* **JSHint for your ES10 code**
* **Resolving NPM TS/JS and SASS/CSS dependencies** - for easy importing
* **Nunjucks for templating your markup and static page generation**
* **YAML data files** - just like you would use them in [Jekyll](https://jekyllrb.com/)
* **Local server with watch functionality and LiveReload** - auto refreshes your changes
* **JS and CSS bundling and minification with sourcemaps**

## Usage

Using a terminal clone this repo, `cd` to the directory and install the [dependencies](#dependencies) by running:

```bash
npm install
```

### Running the server

```bash
gulp serve
```

This command will build the code, start the server on http://localhost:4040 and initiate watchers. Your changes will automatically refresh the page you are looking at.

You can use an optional argument `--sourcemap` to generate sourcemaps for your JS and CSS bundles.

### Build for production

```bash
gulp build --production --sourcemap
```

This command with it's optional arguments `--production` and `--sourcemap` will minify the code and generate sourcemaps respectively.

## Directory Structure
```
.
├── _data
│   └── content.yml
├── _markup
│   ├── _layouts
│   ├── _partials
│   └── index.html
├── _sass
│   └── main.scss
├── _scripts
│   ├── js
│   ├── ts
│   └── main.ts
├── _site/assets
│   ├── images
│   ├── css
│   └── js
├── package.json
└── gulpfile.js
```

### _data
Currently contains only one content YAML file. You can use it to add copy to your templates and pages.

### _markup
Has two sub directories that will be ignored when pages are generated `_layouts` and `_partials`

Store your layouts in `_layouts` and your partials in `_partials`.

You can add your directories here containing other pages that will be moved to `_site` directory following the directory structure within `_markup`.

### _sass
The home of your SCSS and CSS files, you can go wild with directory structure within.

`main.scss` is the index file where all of your SCSS and CSS should be imported.

### _scripts
The home of your TS and JS scripts, you can go wild with directory structure within as well.

`main.ts` is the index file where all of your TS and JS should be imported.

There are two directories within `js` and `ts`, they are optional and here just for presentational purposes.

### _site
Is the home for static generated markup and JS, CSS bundles. Add your images here too! 🌄

## Dependencies

Check [package.json](https://github.com/stamat/el-camino-rapido/blob/e27599e3a92b888f23e4916e5929225ade8d815b/package.json#L13)!

## Tested with

* **Node v10.16.0**
* **NPM v6.14.8**

## To Do:
* [ ] Flexible JSON manifest file for limitless output customisation
* [ ] JSON config file for basic settings
* [ ] Node 14+ ready
* [ ] Multiple _data/**/*.yml file support for each page
