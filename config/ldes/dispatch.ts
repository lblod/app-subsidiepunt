import { moveTriples } from "../support";
import { sparqlEscapeUri } from "mu";
import { querySudo } from "@lblod/mu-auth-sudo";

export default async function dispatch(changesets) {
  // TODO: we could bundle the changesets with a sleep or something, sparql-parser can help here. 
  // NOTE:
  //    In case we delete the resource complelety, the healing will take care of this.
  //    It's a lot of boilerplate to create tombstones based on (internal) deltas,
  //     so we defer that to another step.
  const subjects = new Set();
  for (const changeset of changesets) {
    changeset.inserts.forEach((entry) => subjects.add(entry.subject.value));
    changeset.deletes.forEach((entry) => subjects.add(entry.subject.value));
  }

  if(![...subjects].length) {
    return
  }

  const safeSubjects = getSafeSubjects(subjects).join('\n');

  // Note omitting Concepts for now, since it doesn't move that much and healing can take care
  const data = [ ... await constructSubsidieMaatregelConsumptieData(safeSubjects),
                 ... await constructParticipationData(safeSubjects),
                 ... await constructOrganizationData(safeSubjects),
                 ... await constructTombstoneData(safeSubjects),
                 ... await constructConceptData(safeSubjects)
               ];

  await moveTriples([ { inserts: data } ]);
}

/********************************************************
 * HELPERS
 ********************************************************/
function getSafeSubjects(subjects) {
  return Array.from(subjects)
    .map((subject) => {
      return sparqlEscapeUri(subject);
    });
}

function cleanupBindings(bindings) {
  if(bindings?.length) {
    return bindings.map(({ s, p, o }) => {
      return { subject: s, predicate: p, object: o };
    });
  } else return [];
}

async function constructSubsidieMaatregelConsumptieData(safeSubjects) {
  const queryStr = `
    CONSTRUCT {
      ?target a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>;
        ?p ?o.
    }
    WHERE {
      VALUES ?target { ${safeSubjects} }
      VALUES ?p {
        <http://www.w3.org/ns/adms#status>
        <http://purl.org/dc/terms/modified>
        <http://data.europa.eu/m8g/hasParticipation>
      }
      GRAPH ?g {
        ?target a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>;
          ?p ?o.
       }
      FILTER(?g NOT IN (
        <http://mu.semte.ch/graphs/transformed-ldes-data>,
        <http://mu.semte.ch/graphs/ldes-dump>
      ))
   }`;

  const { results: { bindings } } = await querySudo(queryStr);
  return cleanupBindings(bindings);
}

async function constructParticipationData(safeSubjects) {
  const queryStr = `
    CONSTRUCT {
      ?target a <http://data.europa.eu/m8g/Participation>;
        ?p ?o.
    }
    WHERE {
      VALUES ?target { ${safeSubjects} }
      VALUES ?p {
          <http://data.europa.eu/m8g/role>
      }
      GRAPH ?g {
        ?target a <http://data.europa.eu/m8g/Participation>;
          ?p ?o.
      }
      FILTER(?g NOT IN (
         <http://mu.semte.ch/graphs/transformed-ldes-data>,
         <http://mu.semte.ch/graphs/ldes-dump>
       ))
   }`;

  const { results: { bindings } } = await querySudo(queryStr);
  return cleanupBindings(bindings);
}

async function constructOrganizationData(safeSubjects) {
  const queryStr = `
    CONSTRUCT {
      ?target a <http://www.w3.org/ns/org#Organization>;
        ?p ?o.
    }
    WHERE {
      VALUES ?target { ${safeSubjects} }
      VALUES ?p {
          <http://data.europa.eu/m8g/playsRole>
      }
      GRAPH ?g {
        ?target a <http://www.w3.org/ns/org#Organization>;
          ?p ?o.
      }
      FILTER(?g NOT IN (
         <http://mu.semte.ch/graphs/transformed-ldes-data>,
         <http://mu.semte.ch/graphs/ldes-dump>
       ))
   }`;

  const { results: { bindings } } = await querySudo(queryStr);
  return cleanupBindings(bindings);
}

async function constructTombstoneData(safeSubjects) {
  const queryStr = `
    CONSTRUCT {
      ?target a <http://www.w3.org/ns/activitystreams#Tombstone>;
        ?p ?o.
    }
    WHERE {
      VALUES ?target { ${safeSubjects} }
      GRAPH ?g {
        ?target a <http://www.w3.org/ns/activitystreams#Tombstone>;
          ?p ?o.
      }
      FILTER(?g NOT IN (
         <http://mu.semte.ch/graphs/transformed-ldes-data>,
         <http://mu.semte.ch/graphs/ldes-dump>
       ))
   }`;

  const { results: { bindings } } = await querySudo(queryStr);
  return cleanupBindings(bindings);
}

async function constructConceptData(safeSubjects) {
  const queryStr = `
    CONSTRUCT {
      ?target a <http://www.w3.org/2004/02/skos/core#Concept>;
        ?p ?o.
    }
    WHERE {

      VALUES ?target { ${safeSubjects} }

      VALUES ?p {
        <http://www.w3.org/2004/02/skos/core#prefLabel>
      }
      VALUES ?scheme {
        <http://lblod.data.gift/concept-schemes/94818b96-5b18-48b8-a125-1e6825b6b724>
        <http://lblod.data.gift/concept-schemes/f7274d7f-31d5-4b02-aca8-b96481115651>
      }

      GRAPH ?g {
        ?target a <http://www.w3.org/2004/02/skos/core#Concept>;
          ?p ?o.
      }

      ?target <http://www.w3.org/2004/02/skos/core#inScheme> ?scheme.

      FILTER(?g NOT IN (
         <http://mu.semte.ch/graphs/transformed-ldes-data>,
         <http://mu.semte.ch/graphs/ldes-dump>
       ))
   }`;

  const { results: { bindings } } = await querySudo(queryStr);
  return cleanupBindings(bindings);
}
