import { addData, getConfigFromEnv } from "@lblod/ldes-producer";
import { rm } from "fs/promises";

const INPUT_GRAPH = process.env.INPUT_GRAPH || "http://mu.semte.ch/graphs/subsidies";
const LDES_FOLDER = process.env.LDES_FOLDER || "ldes-subsidies";
const LDES_FRAGMENTER = process.env.LDES_FRAGMENTER;

const ENV_DEFAULTS = {
    FOLDER_DEPTH: "1",
    PAGE_RESOURCES_COUNT: "50",
    LDES_STREAM_PREFIX: "http://data.lblod.info/streams/op/",
    TIME_TREE_RELATION_PATH: "http://www.w3.org/ns/prov#generatedAtTime",
    CACHE_SIZE: "10",
    DATA_FOLDER: "/project/data/ldes-feed"
};

Object.entries(ENV_DEFAULTS).forEach(([key, value]) => {
    process.env[key] = process.env[key] || value;
});

async function main() {
    try {
        const ldesProducerConfig = getConfigFromEnv();
        await deleteDirectory(process.env.DATA_FOLDER);
        const count = await getTotalCount();
        const limit = 10000;
        const totalPages = calculatePages(count, limit);
        console.log("count:", count, "total pages:", totalPages);

        let triples = "";
        for (let page = 1; page <= totalPages; page++) {
            triples += await getGraphTriples(page, limit);
            showProgress(page, totalPages);
        }

        if (triples.length) {
            await addData(ldesProducerConfig, {
                contentType: "text/turtle",
                folder: LDES_FOLDER,
                body: triples,
                fragmenter: LDES_FRAGMENTER,
            });
        }
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

function calculatePages(totalCount, limit) {
    return Math.ceil(totalCount / limit);
}

async function getTotalCount() {
    const countQuery = `
        PREFIX adms: <http://www.w3.org/ns/adms#>
        PREFIX subsidie: <http://data.vlaanderen.be/ns/subsidie#>

        SELECT (COUNT(distinct *) AS ?count)
        WHERE {
          GRAPH <${INPUT_GRAPH}>{
            ?s ?p ?o.
            FILTER EXISTS {
              ?s a ?type.
              FILTER (?type IN (
                subsidie:SubsidiemaatregelConsumptie
              )) 
            }
          }
        }
    `;

    try {
        const response = await fetch(
            `${process.env.MU_SPARQL_ENDPOINT}?query=${encodeURIComponent(countQuery)}`,
            {
                method: "POST",
                headers: { Accept: "application/sparql-results+json" },
            }
        );

        const result = await response.json();
        return parseInt(result.results.bindings[0].count.value, 10);
    } catch (error) {
        console.error("Error in getTotalCount function:", error);
        throw error;
    }
}

async function getGraphTriples(page, limit) {
    const offset = (page - 1) * limit;
    const query = `
        PREFIX adms: <http://www.w3.org/ns/adms#>
        PREFIX subsidie: <http://data.vlaanderen.be/ns/subsidie#>

        CONSTRUCT {?s adms:status ?status} WHERE {
          SELECT distinct ?s ?p ?o WHERE {
             GRAPH <${INPUT_GRAPH}> {
                ?s a subsidie:SubsidiemaatregelConsumptie; adms:status ?status.
             }
          } ORDER BY ?s ?p ?o
        }
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    console.log(query);

    try {
        return await fetchNTriples(query);
    } catch (error) {
        console.error("Error in getGraphTriples function:", error);
        throw error;
    }
}

async function deleteDirectory(path) {
    try {
        await rm(path, { recursive: true, force: true });
    } catch (error) {
        console.error(`Error while deleting directory ${path}:`, error);
    }
}

async function fetchNTriples(query) {
    try {
        const response = await fetch(
            `${process.env.MU_SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=${encodeURIComponent("text/plain")}`,
            {
                method: "POST",
                headers: { Accept: "text/plain" },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Error in fetchNTriples function:", error);
        throw error;
    }
}

function showProgress(currentPage, totalPages) {
    const progress = ((currentPage / totalPages) * 100).toFixed(2);
    console.log(`Progress: ${progress}% (${currentPage}/${totalPages} pages)`);
}

main().catch(error => {
    console.error("Unhandled error in main execution:", error);
    process.exit(1);
});