import deltaProducerDumpFilePublisher from './delta-producer-dump-file-publisher';
import deltaProducerPublicationGraphMaintainerSubsidies from './delta-producer-publication-graph-maintainer-subsidies';
import deltaProducerReportGenerator from './delta-producer-report-generator';
import downloadUrl from './download-url';
import errorAlert from './error-alert';
import jobsController from './jobs-controller';
import resource from './resource';

export default [
  ...deltaProducerDumpFilePublisher,
  ...deltaProducerPublicationGraphMaintainerSubsidies,
  ...deltaProducerReportGenerator,
  ...downloadUrl,
  ...errorAlert,
  ...jobsController,
  ...resource
];
