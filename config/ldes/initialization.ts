export const initialization = {
  public: {
    "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie": {
      graphFilter: `
        FILTER(?g NOT IN (
          <http://mu.semte.ch/graphs/transformed-ldes-data>,
          <http://mu.semte.ch/graphs/ldes-dump>
        ))
      `,
      filter: `
        VALUES ?p {
          <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
          <http://www.w3.org/ns/adms#status>
          <http://purl.org/dc/terms/modified>
          <http://data.europa.eu/m8g/hasParticipation>
        }
      `,
    },
    "http://www.w3.org/2004/02/skos/core#Concept": {
      graphFilter: `
        FILTER(?g NOT IN (
          <http://mu.semte.ch/graphs/transformed-ldes-data>,
          <http://mu.semte.ch/graphs/ldes-dump>
        ))
      `,
      // Only filter the status relevant for the SubsidiemaatregelConsumptie, and Roles
      filter: `
        VALUES ?scheme {
          <http://lblod.data.gift/concept-schemes/94818b96-5b18-48b8-a125-1e6825b6b724>
          <http://lblod.data.gift/concept-schemes/f7274d7f-31d5-4b02-aca8-b96481115651>
        }

        VALUES ?p {
          <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
          <http://www.w3.org/2004/02/skos/core#prefLabel>
        }

        ?s <http://www.w3.org/2004/02/skos/core#inScheme> ?scheme.
       `
    },
    "http://www.w3.org/ns/org#Organization": {
      graphFilter: `
        FILTER(?g NOT IN (
          <http://mu.semte.ch/graphs/transformed-ldes-data>,
          <http://mu.semte.ch/graphs/ldes-dump>
        ))
      `,
      filter: `
        VALUES ?p {
          <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
          <http://data.europa.eu/m8g/playsRole>
        }
      `
    },
    "http://data.europa.eu/m8g/Participation": {
      graphFilter: `
        FILTER(?g NOT IN (
          <http://mu.semte.ch/graphs/transformed-ldes-data>,
          <http://mu.semte.ch/graphs/ldes-dump>
        ))
      `,
      filter: `
        VALUES ?p {
          <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>
          <http://data.europa.eu/m8g/role>
        }
      `
    }
  }
};
