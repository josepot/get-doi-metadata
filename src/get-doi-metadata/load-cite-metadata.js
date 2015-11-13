'use strict';

const R = require('ramda');
const utils = require('../utils.js');
const when = utils.when;
const getRequest = utils.getRequest;

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
  when,
  getBibTexLinkContent,
  getRequest,
  getMetadataFromBibTeX
);

module.exports = loadCiteMetadata;
