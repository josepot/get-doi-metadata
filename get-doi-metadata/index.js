'use strict';

const R = require('ramda');
const utils = require('../utils.js');
const convergeP = utils.convergeP;
const when = utils.when;

const loadSearchResultsFromDoi = require('./load-search-results-from-doi.js');
const loadCiteFromSearchResult = require('./load-cite-from-search-result.js');
const loadCiteMetadata = require('./load-cite-metadata.js');

const getFirstCiteMetadataEntriesFromResults = R.pipeP(
  (x) => when(x.first()),
  loadCiteFromSearchResult,
  loadCiteMetadata
);

const getDoiMetadata = convergeP( R.mergeAll, [
  R.objOf('doi'),
  R.pipeP(
    loadSearchResultsFromDoi,
    convergeP( R.mergeAll, [
      R.compose(R.objOf('nResults'), R.prop('length')),
      getFirstCiteMetadataEntriesFromResults
    ])
  )
]);

module.exports = (doi) => getDoiMetadata(doi).catch((err) => {
  throw new Error(`${doi}\tError: ${err.message}`);
});
