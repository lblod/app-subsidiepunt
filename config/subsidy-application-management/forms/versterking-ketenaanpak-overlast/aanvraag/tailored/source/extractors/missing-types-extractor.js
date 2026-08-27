const URI_BASE = 'http://data.lblod.info/form-data/nodes/';

module.exports = {
  name: 'versterking-ketenaanpak-overlast/aanvraag/missing-types-extractor',
  execute: async (store, graphs, lib, source) => {
    const {$rdf, mu, sudo} = lib;

    const RDF_TYPE = new $rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const SCHEMA = new $rdf.Namespace('http://schema.org/');
    const SUBSIDIE = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/');
    const EXT = new $rdf.Namespace('http://mu.semte.ch/vocabularies/ext/');

    const BIJLAGE_DOCUMENT = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/bijlageDocument/');
    const FINANCING_PARTNER = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/financingPartner/');
    const SUBSIDIE_BEDRAG_LISTING_UNIT = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/subsidieBedragListingUnit/');

    const contactPoint = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const politicalResponsibleContactPoint = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const subsidieBedragListingUnit = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const financingPartner = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const bijlageDocument = new $rdf.NamedNode(URI_BASE + mu.uuid());

    store.add($rdf.sym(source.uri), SCHEMA('contactPoint'), $rdf.sym(contactPoint), graphs.additions);
    store.add($rdf.sym(contactPoint), RDF_TYPE, SCHEMA('ContactPoint'), graphs.additions);

    store.add($rdf.sym(source.uri), EXT('politicalResponsibleContactPoint'), $rdf.sym(politicalResponsibleContactPoint), graphs.additions);
    store.add($rdf.sym(politicalResponsibleContactPoint), RDF_TYPE, EXT('PoliticalResponsibleContactPoint'), graphs.additions);

    store.add($rdf.sym(source.uri), SUBSIDIE('subsidieBedragListingUnit'), $rdf.sym(subsidieBedragListingUnit), graphs.additions);
    store.add($rdf.sym(subsidieBedragListingUnit), RDF_TYPE, SUBSIDIE_BEDRAG_LISTING_UNIT('FormData'), graphs.additions);

    store.add($rdf.sym(source.uri), EXT('financingPartner'), $rdf.sym(financingPartner), graphs.additions);
    store.add($rdf.sym(financingPartner), RDF_TYPE, FINANCING_PARTNER('FormData'), graphs.additions);

    store.add($rdf.sym(source.uri), SUBSIDIE('bijlageDocument'), $rdf.sym(bijlageDocument), graphs.additions);
    store.add($rdf.sym(bijlageDocument), RDF_TYPE, BIJLAGE_DOCUMENT('FormData'), graphs.additions);
  }
}
