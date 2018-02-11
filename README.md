# ESDox
ESDox is a simple jsdoc 3 generator based on [jsdox](https://github.com/sutoiku/jsdox).

It pulls documentation tags based on a subset of [jsdoc 3](https://usejsdoc.org/) from your javascript files and 
generates [github-flavored markdown](https://guides.github.com/features/mastering-markdown/) files.

Relies on the [JSDoc3 parser](https://github.com/mrjoelkemp/jsdoc3-parser) to get the full AST including comments.

Compared to JSDox, ESDox incorporates updated dependencies with support for ES6/7 features, generates more nicely-formatted
documentation, and intends to support a more comprehensive set of JSDoc3's tags.

# Usage
ESDox can be used as a module or from the command line.

### As a Node Module
```javascript
const esdox = require("esdox").main;
esdox({input:["src","lib","index.js"],output:"docs/"})
  .then(() => /* whatever you want to do after */);
```

### CLI Options
```bash
esdox -h # see help for full options
esdox --output docs src lib index.js
```

# Resources
* Github [repo](https://github.com/nphyx/esdox)
* [Changelog](https://github.com/nphyx/esdox/blob/master/CHANGES.md)
* Issue [tracker](https://github.com/nphyx/esdox/issues)
* Contribute by [reading the guidelines](https://github.com/nphyx/esdox/blob/master/Contributing.md) and creating [pull requests](https://github.com/nphyx/esdox/pulls)!
* Run the test suite using `npm test`

# Original JSDox author and contributors
* Pascal Belloncle (psq, Original author)
* Sam Blowes (blowsie)
* Todd Henderson (thenderson21)
* Nic Jansma (nicjansma)
* Joel Kemp (mrjoelkemp)
* Ron Korving (ronkorving)
* Mike MacMillan (mmacmillan)
* Michael Martin-Smucker (mlms13)
* Akeem McLennon (bluelaguna)
* Gabor Sar (gaborsar)
* Marc Trudel (stelcheck)
* Anselm Stordeur (anselmstordeur)
* Vladimir de Turckheim (vdeturckheim)

# License
See LICENSE.md.
