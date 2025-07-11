alias Acl.Accessibility.Always, as: AlwaysAccessible
alias Acl.Accessibility.ByQuery, as: AccessByQuery
#alias Acl.GraphSpec.Constraint.Resource.AllPredicates, as: AllPredicates
alias Acl.GraphSpec.Constraint.Resource.NoPredicates, as: NoPredicates
alias Acl.GraphSpec.Constraint.ResourceFormat, as: ResourceFormatConstraint
alias Acl.GraphSpec.Constraint.Resource, as: ResourceConstraint
alias Acl.GraphSpec, as: GraphSpec
alias Acl.GroupSpec, as: GroupSpec
alias Acl.GroupSpec.GraphCleanup, as: GraphCleanup

defmodule Acl.UserGroups.Config do
  defp access_by_role( group_string ) do
    %AccessByQuery{
      vars: ["session_group","session_role"],
      query: sparql_query_for_access_role( group_string ) }
  end

  defp access_by_role_for_single_graph( group_string ) do
    %AccessByQuery{
      vars: [],
      query: sparql_query_for_access_role( group_string ) }
  end


  defp sparql_query_for_access_role( group_string ) do
    "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    SELECT DISTINCT ?session_group ?session_role WHERE {
      <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                   ext:sessionRole ?session_role.
      FILTER( ?session_role = \"#{group_string}\" )
    }"
  end

  defp access_sensitive_delta_producer_data() do
    %AccessByQuery{
      vars: [ "group_name" ],
      query: "
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
        SELECT DISTINCT ?group_name WHERE {
          <SESSION_ID> muAccount:account ?onlineAccount.

          ?onlineAccount  a foaf:OnlineAccount.

          ?agent a foaf:Agent;
            foaf:account ?onlineAccount.

          ?group foaf:member ?agent;
            foaf:name ?group_name.
        }"
      }
  end

  defp is_admin() do
    %AccessByQuery{
      vars: [],
      query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      SELECT DISTINCT ?session_role WHERE {
        VALUES ?session_role {
          \"SubsidiepuntAdmin\"
        }
        VALUES ?session_id {
          <SESSION_ID>
        }
        {
          ?session_id ext:sessionRole ?session_role .
        } UNION {
          ?session_id ext:originalSessionRole ?session_role .
        }
      }
      LIMIT 1"
      }
  end

  def user_groups do
    # These elements are walked from top to bottom.  Each of them may
    # alter the quads to which the current query applies.  Quads are
    # represented in three sections: current_source_quads,
    # removed_source_quads, new_quads.  The quads may be calculated in
    # many ways.  The useage of a GroupSpec and GraphCleanup are
    # common.
    [
      # // PUBLIC
      %GroupSpec{
        name: "public",
        useage: [:read],
        access: %AlwaysAccessible{}, # TODO: Should be only for logged in users
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/public",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://www.w3.org/ns/prov#Location",
                        "http://mu.semte.ch/vocabularies/ext/BestuurseenheidClassificatieCode",
                        "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan",
                        "http://mu.semte.ch/vocabularies/ext/BestuursorgaanClassificatieCode",
                        "http://publications.europa.eu/ontology/euvoc#Country",
                        "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                        "http://www.w3.org/ns/org#Organization",
                        "http://mu.semte.ch/vocabularies/ext/OrganizationClassificationCode",
                        "http://www.w3.org/2004/02/skos/core#ConceptScheme",
                        "http://www.w3.org/2004/02/skos/core#Concept",
                        "http://lblod.data.gift/vocabularies/subsidie/SubsidiemaatregelConsumptieStatus",
                        "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelAanbod",
                        "http://lblod.data.gift/vocabularies/subsidie/SubsidiemaatregelAanbodReeks",
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationFlow",
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationStep",
                        "http://data.vlaanderen.be/ns/subsidie#Subsidieprocedurestap",
                        "http://data.europa.eu/m8g/PeriodOfTime",
                        "http://data.europa.eu/m8g/Criterion",
                        "http://data.europa.eu/m8g/RequirementGroup",
                        "http://data.europa.eu/m8g/CriterionRequirement",
                        "http://data.europa.eu/m8g/Requirement"
                      ]
                    } },
                  %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/sessions",
                    constraint: %ResourceFormatConstraint{
                      resource_prefix: "http://mu.semte.ch/sessions/"
                    } } ] },

      # // ORGANIZATION HAS POSSIBLY DUPLICATE USER DATA
      %GroupSpec{
        name: "org",
        useage: [:read],
        access: %AccessByQuery{
          vars: ["session_group"],
          query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
                  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
                  SELECT DISTINCT ?session_group WHERE {
                    {
                      <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group.
                    } UNION {
                      <SESSION_ID> ext:originalSessionGroup/mu:uuid ?session_group.
                    }
                  }" },
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://xmlns.com/foaf/0.1/Person",
                        "http://xmlns.com/foaf/0.1/OnlineAccount",
                        "http://www.w3.org/ns/adms#Identifier",
                      ] } } ] },
      # // SUBSIDIES
      %GroupSpec{
        name: "o-subs-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "SubsidiepuntGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm",
                        "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie",
                        "http://data.vlaanderen.be/ns/subsidie#Aanvraag",
                        "http://schema.org/MonetaryAmount",
                        "http://data.europa.eu/m8g/Participation",
                        "http://schema.org/BankAccount",
                        "https://www.gleif.org/ontology/Base/Period",
                        "http://data.europa.eu/m8g/PeriodOfTime",
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationFormTable",
                        "http://mu.semte.ch/vocabularies/ext/ApplicationFormEntry",
                        "http://lblod.data.gift/vocabularies/subsidie/EngagementTable",
                        "http://mu.semte.ch/vocabularies/ext/EngagementEntry",
                        "http://schema.org/ContactPoint",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                      ] } },
                      %GraphSpec{
                        graph: "http://mu.semte.ch/graphs/organizations/",
                        constraint: %ResourceConstraint{
                          resource_types: [
                            "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                            "http://www.w3.org/ns/org#Organization",
                            # Sometimes a very specific list of organisations should be able submit for a subsidy.
                            # This is unfortunatly the most elegant way.
                            "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelAanbod",
                            "http://lblod.data.gift/vocabularies/subsidie/SubsidiemaatregelAanbodReeks"
                          ],
                          predicates: %NoPredicates{
                            except: [
                              "http://data.europa.eu/m8g/playsRole"
                            ] } } } ]
      },

      # // Admin users
      %GroupSpec{
        name: "o-admin-sessions-rwf",
        useage: [:read, :write, :read_for_write],
        access: is_admin(),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/sessions",
            constraint: %ResourceFormatConstraint{
              resource_prefix: "http://mu.semte.ch/sessions/"
            }
          },
        ]
      },

      %GroupSpec{
        name: "o-admin-subsidiedatabank-r",
        useage: [:read],
        access: access_by_role_for_single_graph( "SubsidiedatabankGebruiker" ),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/subsidiedatabank",
            constraint: %ResourceConstraint {
               resource_types: [
                "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm",
                "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie",
                "http://data.vlaanderen.be/ns/subsidie#Aanvraag",
                "http://schema.org/MonetaryAmount",
                "http://data.europa.eu/m8g/Participation",
                "http://schema.org/BankAccount",
                "https://www.gleif.org/ontology/Base/Period",
                "http://data.europa.eu/m8g/PeriodOfTime",
                "http://lblod.data.gift/vocabularies/subsidie/ApplicationFormTable",
                "http://mu.semte.ch/vocabularies/ext/ApplicationFormEntry",
                "http://lblod.data.gift/vocabularies/subsidie/EngagementTable",
                "http://mu.semte.ch/vocabularies/ext/EngagementEntry",
                "http://schema.org/ContactPoint",
                "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
              ]
            }
          },
        ]
      },

      %GroupSpec{
        name: "o-admin-sessions-rwf",
        useage: [:read_for_write],
        access: is_admin(),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/public",
            constraint: %ResourceConstraint {
              resource_types: [
                "http://xmlns.com/foaf/0.1/OnlineAccount"
                ],
            }
          },
        ]
      },

      # LOKETADMIN
      %GroupSpec{
        name: "o-admin-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role("LoketAdmin"),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/organizations/",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://lblod.data.gift/vocabularies/reporting/Report",
                "http://vocab.deri.ie/cogs#Job",
                "http://open-services.net/ns/core#Error",
                "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer"
              ]
            }
          }
        ]
      },

      %GroupSpec{
        name: "o-persons-sensitive-deltas-rwf",
        useage: [ :read ],
        access: access_sensitive_delta_producer_data(),
        graphs: [ %GraphSpec{
                    graph: "http://redpencil.data.gift/id/deltas/producer/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                        "http://www.w3.org/ns/dcat#Dataset",
                        "http://www.w3.org/ns/dcat#Distribution",
                      ] } } ] },

      # // USER HAS NO DATA
      # this was moved to org instead.
      # perhaps move some elements to public when needed for demo
      # purposes.

      # // CLEANUP
      #
      %GraphCleanup{
        originating_graph: "http://mu.semte.ch/application",
        useage: [:write],
        name: "clean"
      }
    ]
  end
end
