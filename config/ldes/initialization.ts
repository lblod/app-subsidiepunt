export const initialization = {
  public: {
    "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie": {
      filter: `
        VALUES ?p {
          <http://www.w3.org/ns/adms#status>
        }
      `,
    },
    "http://www.w3.org/2004/02/skos/core#Concept": {
      // Only filter the status relevant for the SubsidiemaatregelConsumptie
      filter: `
        ?s <http://www.w3.org/2004/02/skos/core#inScheme> <http://lblod.data.gift/concept-schemes/f7274d7f-31d5-4b02-aca8-b96481115651>
      `
    }
  }
};
