const URI_BASE = 'http://data.lblod.info/form-data/nodes/';

module.exports = {
  name: 'e-inclusion/accountability/missing-types-extractor',
  execute: async (store, graphs, lib, source) => {
    const {$rdf, mu, sudo} = lib;

    const RDF_TYPE = new $rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const SUBSIDIE = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/');
    const HAS_ADDITIONAL_ACTION = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/e-inclusion/has-additional-action/');

    const hasAdditionalAction = new $rdf.NamedNode(URI_BASE + mu.uuid());

    store.add($rdf.sym(source.uri), SUBSIDIE('hasAdditionalAction'), $rdf.sym(hasAdditionalAction), graphs.additions);
    store.add($rdf.sym(hasAdditionalAction), RDF_TYPE, HAS_ADDITIONAL_ACTION('FormData'), graphs.additions);
  }
}