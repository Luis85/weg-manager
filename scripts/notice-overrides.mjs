// @ts-check

/**
 * Licence facts for bundled packages whose own files do not state them, for
 * `scripts/third-party-notices.mjs`. An entry fills only what the package leaves out: `license`
 * is used when `package.json` has no `license` field (and must equal it when it has one, so a
 * stale entry fails the build), `copyright` or `text` is used when the package ships no licence
 * file. A licence file in the package always wins. Every entry names its evidence.
 *
 * @typedef {{ license: string; copyright: string } | { license: string; text: string }} Override
 * @type {Record<string, Override>}
 */
export const OVERRIDES = {
  // vaul-vue 0.4.1 has no `license` field in package.json and ships no licence file (its tarball
  // holds README.md and dist/ only). The repository, which package.json names as
  // https://github.com/Elliot-Alexander/vaul-vue, carries a LICENSE file with the MIT text and
  // the line "Copyright (c) 2025 unovue"; it is the same at `main` and at the commit the 0.4.1
  // tarball records (gitHead 1b1f6dfdba6a775410508884097443d35c9a8690), read on 2026-11-22.
  // Nuxt UI pulls it in for its Drawer component, which the plugin does not use, so it is not in
  // the bundle today; the entry is here for the day a Drawer is.
  "vaul-vue": { license: "MIT", copyright: "Copyright (c) 2025 unovue" },

  // @iconify-json/lucide holds the Lucide icons as data. Its package.json says "ISC" and its
  // info.json names the licence ("ISC", https://github.com/lucide-icons/lucide/blob/main/LICENSE)
  // and the author "Lucide Contributors", but the package ships no licence file. The text below
  // is that LICENSE file of the lucide-icons/lucide repository at `main`, read on 2026-11-22:
  // ISC for Lucide, and the MIT licence of Feather for the icons derived from it (the plugin
  // bundles some of them, for example arrow-left, check, info, lock and trash-2).
  "@iconify-json/lucide": {
    license: "ISC",
    text: `ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
  },
};
