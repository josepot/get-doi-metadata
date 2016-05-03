'use strict';

const R = require('ramda');
const utils = require('../utils.js');
const convergeP = utils.convergeP;
const when = utils.when;

const loadSearchResultsFromDoi = require('./load-search-results-from-doi.js');
const loadCiteFromSearchResult = require('./load-cite-from-search-result.js');
const loadCiteMetadata = require('./load-cite-metadata.js');
const logger = require('../logger.js');

const getFirstCiteMetadataEntriesFromResults = R.pipeP(
  (x) => when(x.first()),
  loadCiteFromSearchResult,
  loadCiteMetadata
);

let html = '';
const getDoiMetadata = convergeP(R.merge, [
  R.objOf('doi'),
  R.pipeP(
    loadSearchResultsFromDoi,
    R.tap((w) => { html = w.document.documentElement.outerHTML; }),
    (w) => w.$('#gs_ccl > .gs_r'),
    convergeP( R.merge, [
      R.compose(R.objOf('nResults'), R.prop('length')),
      getFirstCiteMetadataEntriesFromResults
    ])
  )
]);

module.exports = (doi) => getDoiMetadata(doi).catch((err) => {
  logger.error('Failed getDoiMetadata', { doi: doi, err: err.message, html: html });
  throw new Error(`${doi}\tError: ${err.message}`);
});
