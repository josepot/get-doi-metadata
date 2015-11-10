'use strict';

const R = require('ramda');
const Q = require('q');
const getRequest = require('../utils.js').getRequest;
const properties =
  ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];

const getBibTexLinkContent = (w) => w.$('a.gs_citi').first().attr('href');

function getPropertyFromBibTeX(bib, property) {
  const match = new RegExp(`${property}=\{(.*?)\}`).exec(bib);
  return (match && match[1]) || '';
}

function getMetadataFromBibTeX(bib) {
  const getProperty = R.partial(getPropertyFromBibTeX, [bib]);

  return properties
  .map((attr) => R.compose(R.objOf(attr), getProperty)(attr))
  .reduce(R.merge, {});
}

const loadCiteMetadata = R.pipeP(
  Q.when,
  getBibTexLinkContent,
  R.concat('https://scholar.google.com'),
  getRequest,
  getMetadataFromBibTeX
);

module.exports = loadCiteMetadata;
