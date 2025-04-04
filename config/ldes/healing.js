export const getHealingConfig = async () => {
  return {
    // this is the name of a stream, you can have multiple streams in the config,
    // the healing process will check them one by one sequentially
    public: {
      graphFilter:
        "?g <http://mu.semte.ch/vocabularies/ext/ownedBy> ?bestuurseenheid",
      entities: {
        "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm": {
          healingPredicates: [
            "http://purl.org/dc/terms/modified",
            "http://purl.org/dc/terms/created",
            "http://www.w3.org/ns/adms#status"
          ],
          instanceFilter: `OPTIONAL { ?s <http://www.w3.org/ns/adms#status> ?status. }
        FILTER(!BOUND(?status) || ?status != <http://lblod.data.gift/concepts/9bd8d86d-bb10-4456-a84e-91e9507c374c>)`,
        },
        "http://www.w3.org/ns/adms#Status": [
          "http://purl.org/dc/terms/modified",
          "http://www.w3.org/2004/02/skos/core#prefLabel"
        ],
        "http://www.w3.org/ns/activitystreams#Tombstone": {
          healingPredicates: ["http://purl.org/dc/terms/modified"],
          healingFilter: `FILTER NOT EXISTS {
            GRAPH ?h {
             ?s a ?otherType.
             FILTER(?otherType != <http://www.w3.org/ns/activitystreams#Tombstone>)
            }
            ?h <http://mu.semte.ch/vocabularies/ext/ownedBy> ?org.
          }`,
        },
      },
      graphsToExclude: ["http://mu.semte.ch/graphs/besluiten-consumed"],
      graphTypesToExclude: ["http://mu.semte.ch/vocabularies/ext/FormHistory"],
    },
    abb: {
      entities: {
        "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm": {
          healingPredicates: [
            "http://purl.org/dc/terms/modified",
            "http://purl.org/dc/terms/created",
            "http://www.w3.org/ns/adms#status"
          ]
        },
        "http://www.w3.org/ns/adms#Status": [
          "http://purl.org/dc/terms/modified",
          "http://www.w3.org/2004/02/skos/core#prefLabel"
        ]
      },
      graphsToExclude: ["http://mu.semte.ch/graphs/besluiten-consumed"],
      graphTypesToExclude: ["http://mu.semte.ch/vocabularies/ext/FormHistory"],
    },
  };
};