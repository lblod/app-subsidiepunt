const URI_BASE = 'http://data.lblod.info/form-data/nodes/';

module.exports = {
  name: 'roma-experten-netwerk/aanvraag/missing-types-extractor',
  execute: async (store, graphs, lib, source) => {
    const {$rdf, mu} = lib;

    const RDF_TYPE = new $rdf.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const SCHEMA = new $rdf.Namespace('http://schema.org/');
    const SUBSIDIE = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/');

    const OVERZICHT_ERKENNINGEN = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/overzichtErkenningen/');
    const BEGROTING_DOCUMENT = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/begrotingDocument/');
    const JAARREKENING_ORGANISATIE = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/jaarrekeningOrganisatie/');
    const BIJLAGE_DOCUMENT = new $rdf.Namespace('http://lblod.data.gift/vocabularies/subsidie/bijlageDocument/');

    const sourceNode = $rdf.sym(source.uri);
    const contactPoint = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const overzichtErkenningen = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const begrotingDocument = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const jaarrekeningOrganisatie = new $rdf.NamedNode(URI_BASE + mu.uuid());
    const bijlageDocument = new $rdf.NamedNode(URI_BASE + mu.uuid());

    store.add(sourceNode, SCHEMA('contactPoint'), $rdf.sym(contactPoint), graphs.additions);
    store.add($rdf.sym(contactPoint), RDF_TYPE, SCHEMA('ContactPoint'), graphs.additions);

    store.add(sourceNode, SUBSIDIE('overzichtErkenningen'), $rdf.sym(overzichtErkenningen), graphs.additions);
    store.add($rdf.sym(overzichtErkenningen), RDF_TYPE, OVERZICHT_ERKENNINGEN('FormData'), graphs.additions);

    store.add(sourceNode, SUBSIDIE('begrotingDocument'), $rdf.sym(begrotingDocument), graphs.additions);
    store.add($rdf.sym(begrotingDocument), RDF_TYPE, BEGROTING_DOCUMENT('FormData'), graphs.additions);

    store.add(sourceNode, SUBSIDIE('jaarrekeningOrganisatie'), $rdf.sym(jaarrekeningOrganisatie), graphs.additions);
    store.add($rdf.sym(jaarrekeningOrganisatie), RDF_TYPE, JAARREKENING_ORGANISATIE('FormData'), graphs.additions);

    store.add(sourceNode, SUBSIDIE('bijlageDocument'), $rdf.sym(bijlageDocument), graphs.additions);
    store.add($rdf.sym(bijlageDocument), RDF_TYPE, BIJLAGE_DOCUMENT('FormData'), graphs.additions);
  }
};
