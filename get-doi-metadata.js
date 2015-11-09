'use strict';

var urlEncode = require('urlencode');
var R = require('ramda');
var Q = require('q');
var utils = require('./utils.js');
var getJQueryWindow = utils.getJQueryWindow;
var getRequest = utils.getRequest;

const SEARCH_URL = 'https://scholar.google.com/scholar?hl=en&q=';

function getCiteId(searchResult) {
  console.log(searchResult.html());
  const citLink = searchResult.find('>.gs_ri>.gs_fl>a[aria-controls=gs_cit]');
  const match = /^return\sgs_ocit\(event,'(.*?)'/.exec(citLink.attr('onclick'));
  const citeId = match && match[1];

  if(!citeId) throw new Error('Google citeId not found');

  return citeId;
}

function getCiteUrl(citeId) {
  return `https://scholar.google.com/scholar?q=info:${citeId}:scholar.google.com/&output=cite&scirp=0&hl=en`;
}

var getBibTexLinkContent = (w) => w.$('a.gs_citi').first().attr('href');

function getPropertyFromBibTeX(bib, property) {
  var match = new RegExp(`${property}=\{(.*?)\}`).exec(bib);
  return (match && match[1]) || '';
}

function getMetadataFromBibTeX(bib) {
  var getProperty = R.partial(getPropertyFromBibTeX, [bib]);

  return ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year']
  .map((attr) => R.compose(R.objOf(attr), getProperty)(attr))
  .reduce(R.merge, {});
}

var getCiteBibTeXInfoFromSearchResult = R.pipeP(
  Q.when,
  getCiteId,
  getCiteUrl,
  getJQueryWindow,
  getBibTexLinkContent,
  R.concat('https://scholar.google.com'),
  getRequest,
  getMetadataFromBibTeX
);

module.exports = function getDoiMetadata(doi) {
  var getResults = (w) => w.$('#gs_ccl > .gs_r');

  return [
    urlEncode,
    R.concat(SEARCH_URL),
    getJQueryWindow,
    //(w) => { console.log(w.document.body.innerHTML); return w; },
    getResults
  ]
  .reduce(Q.when, Q(doi))
  .then((results) => Q.all([
      Q.when({ doi: doi, nResults: results.length }),
      getCiteBibTeXInfoFromSearchResult(results.first())
  ]))
  .spread(
    R.merge,
    (err) => new Error(`Doi: ${doi}, error: ${err.message}`)
  );
}
