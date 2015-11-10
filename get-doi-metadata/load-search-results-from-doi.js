'use strict';

const urlEncode = require('urlencode');
const R = require('ramda');
const Q = require('q');
const getJQueryWindow = require('../utils.js').getJQueryWindow;

const SEARCH_URL = 'https://scholar.google.com/scholar?hl=en&q=';
const getResultEntries = (w) => w.$('#gs_ccl > .gs_r');

const loadSearchResultsFromDoi = R.pipeP(
  Q.when,
  urlEncode,
  R.concat(SEARCH_URL),
  getJQueryWindow,
  getResultEntries
);

module.exports = loadSearchResultsFromDoi;
