;;;;;;;;;;;;;;;;;;;
;;; delta messenger
(in-package :delta-messenger)

(add-delta-logger)
(add-delta-messenger "http://deltanotifier/")

;;;;;;;;;;;;;;;;;
;;; configuration
(in-package :client)
(setf *log-sparql-query-roundtrip* t)
(setf *backend* "http://virtuoso:8890/sparql")

(in-package :server)
(setf *log-incoming-requests-p* t)

;;;;;;;;;;;;;;;;;
;;; access rights
(in-package :acl)

(defparameter *access-specifications* nil)
(defparameter *graphs* nil)
(defparameter *rights* nil)

;; Prefixes used in the constraints below (not in the SPARQL queries)
(define-prefixes
    :prov "http://www.w3.org/ns/prov#"
    :ext "http://mu.semte.ch/vocabularies/ext/"
    :besluit "http://data.vlaanderen.be/ns/besluit#"
    :euvoc "http://publications.europa.eu/ontology/euvoc#"
    :org "http://www.w3.org/ns/org#"
    :skos "http://www.w3.org/2004/02/skos/core#"
    :subsidie "http://lblod.data.gift/vocabularies/subsidie/"
    :ns "http://data.vlaanderen.be/ns/subsidie#"
    :m8g "http://data.europa.eu/m8g/"
    :foaf "http://xmlns.com/foaf/0.1/"
    :adms "http://www.w3.org/ns/adms#"
    :schema "http://schema.org/"
    :ontology "https://www.gleif.org/ontology/Base/"
    :nfo "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#"
    :reporting "http://lblod.data.gift/vocabularies/reporting/"
    :cogs "http://vocab.deri.ie/cogs#"
    :core "http://open-services.net/ns/core#"
    :dcat "http://www.w3.org/ns/dcat#")

(type-cache::add-type-for-prefix "http://mu.semte.ch/sessions/" "http://mu.semte.ch/vocabularies/session/Session")

(define-graph public ("http://mu.semte.ch/graphs/public")
    ("prov:Location" -> _)
    ("ext:BestuurseenheidClassificatieCode" -> _)
    ("besluit:Bestuursorgaan" -> _)
    ("ext:BestuursorgaanClassificatieCode" -> _)
    ("euvoc:Country" -> _)
    ("besluit:Bestuurseenheid" -> _)
    ("org:Organization" -> _)
    ("ext:OrganizationClassificationCode" -> _)
    ("skos:ConceptScheme" -> _)
    ("skos:Concept" -> _)
    ("subsidie:SubsidiemaatregelConsumptieStatus" -> _)
    ("ns:SubsidiemaatregelAanbod" -> _)
    ("subsidie:SubsidiemaatregelAanbodReeks" -> _)
    ("subsidie:ApplicationFlow" -> _)
    ("subsidie:ApplicationStep" -> _)
    ("ns:Subsidieprocedurestap" -> _)
    ("subsidie:DeadlineExtension" -> _)
    ("m8g:PeriodOfTime" -> _)
    ("m8g:Criterion" -> _)
    ("m8g:RequirementGroup" -> _)
    ("m8g:CriterionRequirement" -> _)
    ("m8g:Requirement" -> _))

(define-graph org ("http://mu.semte.ch/graphs/organizations/")
    ("foaf:Person" -> _)
    ("foaf:OnlineAccount" -> _)
    ("adms:Identifier" -> _))

(define-graph organizations-subsidies ("http://mu.semte.ch/graphs/organizations/")
    ("subsidie:ApplicationForm" -> _)
    ("ns:SubsidiemaatregelConsumptie" -> _)
    ("ns:Aanvraag" -> _)
    ("schema:MonetaryAmount" -> _)
    ("m8g:Participation" -> _)
    ("schema:BankAccount" -> _)
    ("ontology:Period" -> _)
    ("m8g:PeriodOfTime" -> _)
    ("subsidie:ApplicationFormTable" -> _)
    ("ext:ApplicationFormEntry" -> _)
    ("subsidie:EngagementTable" -> _)
    ("ext:EngagementEntry" -> _)
    ("schema:ContactPoint" -> _)
    ("nfo:FileDataObject" -> _)
    ("besluit:Bestuurseenheid" -> "m8g:playsRole")
    ("org:Organization" -> "m8g:playsRole")
    ("ns:SubsidiemaatregelAanbod" -> "m8g:playsRole")
    ("subsidie:SubsidiemaatregelAanbodReeks" -> "m8g:playsRole"))

(define-graph sessions ("http://mu.semte.ch/graphs/sessions")
    ("http://mu.semte.ch/vocabularies/session/Session" -> _))

(define-graph admin-subsidiedatabank ("http://mu.semte.ch/graphs/subsidiedatabank")
    ("subsidie:ApplicationForm" -> _)
    ("ns:SubsidiemaatregelConsumptie" -> _)
    ("ns:Aanvraag" -> _)
    ("schema:MonetaryAmount" -> _)
    ("m8g:Participation" -> _)
    ("schema:BankAccount" -> _)
    ("ontology:Period" -> _)
    ("m8g:PeriodOfTime" -> _)
    ("subsidie:ApplicationFormTable" -> _)
    ("ext:ApplicationFormEntry" -> _)
    ("subsidie:EngagementTable" -> _)
    ("ext:EngagementEntry" -> _)
    ("schema:ContactPoint" -> _)
    ("nfo:FileDataObject" -> _))

(define-graph admin-sessions ("http://mu.semte.ch/graphs/public")
    ("foaf:OnlineAccount" -> _))

(define-graph admin ("http://mu.semte.ch/graphs/organizations/141d9d6b-54af-4d17-b313-8d1c30bc3f5b/LoketAdmin")
    ("reporting:Report" -> _)
    ("cogs:Job" -> _)
    ("core:Error" -> _)
    ("nfo:DataContainer" -> _)
    ("nfo:FileDataObject" -> _))

(define-graph producer ("http://redpencil.data.gift/id/deltas/producer/")
    ("nfo:FileDataObject" -> _)
    ("dcat:Dataset" -> _)
    ("dcat:Distribution" -> _))

(supply-allowed-group "public")

(supply-allowed-group "logged-in-or-impersonating"
    :parameters ("session_group")
    :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
            PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
            SELECT DISTINCT ?session_group WHERE {
                {
                    <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group.
                } UNION {
                    <SESSION_ID> ext:originalSessionGroup/mu:uuid ?session_group.
                }
            }")

(supply-allowed-group "subsidiepunt-gebruiker"
    :parameters ("session_group" "session_role")
    :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
            PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
            SELECT DISTINCT ?session_group ?session_role WHERE {
                <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                            ext:sessionRole ?session_role.
                FILTER( ?session_role = \"SubsidiepuntGebruiker\" )
            }")

(supply-allowed-group "admin"
    :parameters ()
    :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
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
            LIMIT 1")

(supply-allowed-group "subsidiedatabank-gebruiker"
    :parameters ()
    :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
            PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
            SELECT DISTINCT ?session_group ?session_role WHERE {
                <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                            ext:sessionRole ?session_role.
                FILTER( ?session_role = \"SubsidiedatabankGebruiker\" )
            }")

(supply-allowed-group "delta-producer"
    :parameters ("group_name")
    :query "PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
            SELECT DISTINCT ?group_name WHERE {
                <SESSION_ID> muAccount:account ?onlineAccount.

                ?onlineAccount  a foaf:OnlineAccount.

                ?agent a foaf:Agent;
                    foaf:account ?onlineAccount.

                ?group foaf:member ?agent;
                    foaf:name ?group_name.
            }")

(grant (read)
    :to-graph (public)
    :for-allowed-group "public")

(grant (read)
    :to-graph (org)
    :for-allowed-group "logged-in-or-impersonating")

(grant (read write)
    :to-graph (organizations-subsidies)
    :for-allowed-group "subsidiepunt-gebruiker")

(grant (read write)
    :to-graph (sessions)
    :for-allowed-group "admin")

(grant (read)
    :to-graph (admin-subsidiedatabank)
    :for-allowed-group "subsidiedatabank-gebruiker")

(grant (read write)
    :to-graph (admin-sessions)
    :for-allowed-group "admin")

(grant (read write)
    :to-graph (admin)
    :for-allowed-group "admin")

(grant (read)
    :to-graph (producer)
    :for-allowed-group "delta-producer")
