const contactInfoExtractor = require('./extractors/contact-info-extractor');
const missingTypesExtractor = require('./extractors/missing-types-extractor');

const extractor = {
  name: 'climate-subsidy/opvolgmoment-2027/proposal-as-source',
  execute: async (store, graphs, lib, form) => {
    const { mu, sudo } = lib;
    // Resolve the original proposal directly: skipped intermediate forms are not required.
    const { results } = await sudo.querySudo(`
      PREFIX dct: <http://purl.org/dc/terms/>
      SELECT DISTINCT ?proposalForm WHERE {
        GRAPH ?g {
          ?consumption dct:source ${mu.sparqlEscapeUri(form.uri)} ;
            dct:source ?proposalForm .
          ?proposalForm dct:isPartOf <http://lblod.data.info/id/subsidie-application-flow-steps/c50d7726-4880-43e2-b098-c356722a3096> .
        }
      }
    `);

    // Keep the contact fields editable even if an old dossier has no proposal data.
    const proposal = results.bindings[0]?.proposalForm.value;
    if (proposal) {
      await contactInfoExtractor.execute(store, graphs, lib, form, { uri: proposal });
    }
  }
};

module.exports = [extractor, missingTypesExtractor];
