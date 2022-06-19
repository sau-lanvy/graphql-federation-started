const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const {
  Instrumentation,
  registerInstrumentations,
} = require('@opentelemetry/instrumentation');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

const { GraphQLInstrumentation } = require('@opentelemetry/instrumentation-graphql');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { Resource } = require('@opentelemetry/resources');
const { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');

const GraphNodeType = {
  Router: 'router',
  Subgraph: 'subgraph',
}

const ExporterType = {
  Console: 'console',
  Zipkin: 'zipkin',
  Collector: 'collector',
}

module.exports = class ApolloOpenTelemetry {

  constructor(props) {
    this.props = props;

    if (props.debug) {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }
  }

  setupInstrumentation() {
    const name = this.props.name ?? this.props.type;
    const resource = new Resource({
      'service.name': name,
    });

    const instrumentations = [];
    switch (this.props.type) {
      case GraphNodeType.Router:
        instrumentations.push( new HttpInstrumentation() );
        instrumentations.push( new ExpressInstrumentation() );
        break;

      case GraphNodeType.Subgraph:
        instrumentations.push( new HttpInstrumentation() );
        instrumentations.push( new ExpressInstrumentation() );
        instrumentations.push(
          new GraphQLInstrumentation({
            allowValues: true,
            depth: 10,
          }),
        );
        break;

      default:
        throw new Error(`unknown graph node type: '${this.props.type}'`);
    }

    registerInstrumentations({
      instrumentations: [instrumentations],
    });
    const provider = new NodeTracerProvider({
      resource: Resource.default().merge(resource),
    });

    const exporter = this.props.exporter;
    const exporterType = exporter?.type ?? ExporterType.Console;
    const host = exporter?.host ?? 'localhost';

    switch (exporterType) {
      case ExporterType.Console:
        const consoleExporter = new ConsoleSpanExporter();
        provider.addSpanProcessor(
          new SimpleSpanProcessor(consoleExporter),
        );

        break;

      case ExporterType.Zipkin:
        const zipkinPort = exporter?.port ?? '9411';

        const zipkinExporter = new ZipkinExporter({
          url: `http://${host}:${zipkinPort}/api/v2/spans`,
        });
        provider.addSpanProcessor(
          new SimpleSpanProcessor(zipkinExporter),
        );

        break;

      case ExporterType.Collector:
        const collectorPort = exporter?.port ?? '4318';

        const collectorTraceExporter = new OTLPTraceExporter({
          url: `http://${host}:${collectorPort}/v1/traces`,
        });
        provider.addSpanProcessor(
          new BatchSpanProcessor(collectorTraceExporter, {
            maxQueueSize: 1000,
            scheduledDelayMillis: 1000,
          }),
        );
        break;

      default:
        throw new Error(`unknown exporter type: '${exporterType}'`);
    }
    provider.register();
  }
}