'use strict';

const R = require('ramda');
const Q = require('q');
const convergeP = require('../utils.js').convergeP;

const loadSearchResultsFromDoi = require('./load-search-results-from-doi.js');
const loadCiteFromSearchResult = require('./load-cite-from-search-result.js');
const loadCiteMetadata = require('./load-cite-metadata.js');

module.exports = function getDoiMetadata(doi) {
  const getDoiEntry = R.always({ doi : doi });
  const getNResultsEntry = R.compose(R.objOf('nResults'), R.prop('length'));
  const getFirstCiteMetadataEntriesFromResults = R.pipeP(
    Q.when,
    (x) => x.first(),
    loadCiteFromSearchResult,
    loadCiteMetadata
  );

  return loadSearchResultsFromDoi(doi)
  .then(
    convergeP(
      R.mergeAll, [
        getDoiEntry,
        getNResultsEntry,
        getFirstCiteMetadataEntriesFromResults
      ]
    ),
    (err) => new Error(`Doi: ${doi}, error: ${err.message}`)
  );
}
