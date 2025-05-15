export type HealingConfig = Awaited<ReturnType<typeof getHealingConfig>>;
export const getHealingConfig = async () => {
  return {
    public: {
      graphsToExclude: [
        "http://mu.semte.ch/graphs/transformed-ldes-data",
        "http://mu.semte.ch/graphs/ldes-dump"
      ],
      entities: {
        "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie": {
          healingPredicates: [
          "http://purl.org/dc/terms/modified"
          ]
        },
        "http://data.europa.eu/m8g/Participation": {
          healingPredicates: [
            "http://purl.org/dc/terms/modified"
          ],
        },
        "http://www.w3.org/ns/org#Organization": {
          healingPredicates: [
          "http://purl.org/dc/terms/modified"
          ]
        },
        "http://www.w3.org/2004/02/skos/core#Concept": {
          healingPredicates: [
            "http://purl.org/dc/terms/modified",
            "http://www.w3.org/2004/02/skos/core#prefLabel"
          ],
          instanceFilter: `
            VALUES ?scheme {
              <http://lblod.data.gift/concept-schemes/94818b96-5b18-48b8-a125-1e6825b6b724>
              <http://lblod.data.gift/concept-schemes/f7274d7f-31d5-4b02-aca8-b96481115651>
            }

            ?s <http://www.w3.org/2004/02/skos/core#inScheme> ?scheme.
          `
        }
      }
    }
  };
}
