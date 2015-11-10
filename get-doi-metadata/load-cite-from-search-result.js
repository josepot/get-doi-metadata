'use strict';

const R = require('ramda');
const Q = require('q');
const getJQueryWindow = require('../utils.js').getJQueryWindow;

function getCiteId(searchResult) {
  const citeLinkPath = '> .gs_ri > .gs_fl > a[aria-controls=gs_cit]';
  const citeIdMatcherRegex = /^return\sgs_ocit\(event,'(.*?)'/;
  const citeLinkOnClickAttr = searchResult.find(citeLinkPath).attr('onclick');
  const match = citeIdMatcherRegex.exec(citeLinkOnClickAttr);
  const citeId = match && match[1];

  if(!citeId) throw new Error('Google citeId not found');

  return citeId;
}

function getCiteUrl(citeId) {
  return `https://scholar.google.com/scholar?q=info:${citeId}:scholar.google.com/&output=cite&scirp=0&hl=en`;
}

const loadCiteFromSearchResult = R.pipeP(
  Q.when,
  getCiteId,
  getCiteUrl,
  getJQueryWindow
);

module.exports = loadCiteFromSearchResult;
