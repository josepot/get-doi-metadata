'use strict';

const R = require('ramda');
const urlEncode = require('urlencode');
const utils = require('../utils.js');
const getJQueryWindow = utils.getJQueryWindow;
const when = utils.when;

const SEARCH_URL = 'https://scholar.google.com/scholar?hl=en&q=';
const getResultEntries = (w) => w.$('#gs_ccl > .gs_r');

const loadSearchResultsFromDoi = R.pipeP(
  when,
  urlEncode,
  R.concat(SEARCH_URL),
  getJQueryWindow,
  getResultEntries
);

module.exports = loadSearchResultsFromDoi;
