import { moveTriples } from "../support";
import { Changeset } from "../types";
import { sparqlEscapeUri, sparqlEscapeString, sparqlEscape } from "mu";
import { querySudo } from "@lblod/mu-auth-sudo";
import { addData, getConfigFromEnv } from "@lblod/ldes-producer";
import { LDES_FRAGMENTER } from "../environment";


export const bindingToTriple = (binding) =>
  `${sparqlEscapeUri(binding.s.value)} ${sparqlEscapeUri(
    binding.p.value
)} ${sparqlEscapeObject(binding.o)} .`;


const datatypeNames = {
  "http://www.w3.org/2001/XMLSchema#dateTime": "dateTime",
  "http://www.w3.org/2001/XMLSchema#date": "date",
  "http://www.w3.org/2001/XMLSchema#decimal": "decimal",
  "http://www.w3.org/2001/XMLSchema#integer": "int",
  "http://www.w3.org/2001/XMLSchema#float": "float",
  "http://www.w3.org/2001/XMLSchema#boolean": "bool",
};

const sparqlEscapeObject = (bindingObject): string => {
  const escapeType = datatypeNames[bindingObject.datatype] || "string";
  if (bindingObject.datatype === "http://www.w3.org/2001/XMLSchema#dateTime") {
    // sparqlEscape formats it slightly differently and then the comparison breaks in healing
    const safeValue = `${bindingObject.value}`;
    return `${sparqlEscapeString(safeValue.split('"').join(""))}^^xsd:dateTime`;
  }
  return bindingObject.type === "uri"
    ? sparqlEscapeUri(bindingObject.value)
    : sparqlEscape(bindingObject.value, escapeType);
};

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
                 ... await constructTombstoneData(safeSubjects)
               ];

  let newData = data.join('\n');
  const safeData = `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n${newData}`;

  await addData(getConfigFromEnv(), {
        contentType: "text/turtle",
        folder: "public",
        body: safeData,
        fragmenter: LDES_FRAGMENTER,
      });


  //await moveTriples([ { inserts: data } ]);
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
    return bindings.map((binding) => {
      return bindingToTriple(binding);
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
          <http://purl.org/dc/terms/modified>
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
          <http://purl.org/dc/terms/modified>
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
