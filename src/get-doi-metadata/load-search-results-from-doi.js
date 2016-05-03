'use strict';

const R = require('ramda');
const urlEncode = require('urlencode');
const utils = require('../utils.js');
const getJQueryWindow = utils.getJQueryWindow;
const when = utils.when;

const SEARCH_URL = '/scholar?hl=en&q=';

const loadSearchResultsFromDoi = R.pipeP(
  when,
  urlEncode,
  R.concat(SEARCH_URL),
  getJQueryWindow
);

module.exports = loadSearchResultsFromDoi;
