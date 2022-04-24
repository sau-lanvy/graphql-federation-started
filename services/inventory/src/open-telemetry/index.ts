// Import required symbols
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from "@opentelemetry/node";
import { SimpleSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/tracing";
import { Resource } from '@opentelemetry/resources';

import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

// Register server-related instrumentation
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new GraphQLInstrumentation()
  ]
});

// Initialize provider and identify this particular service
// (in this case, we're implementing a federated gateway)
const provider = new NodeTracerProvider({
  resource: Resource.default().merge(new Resource({
    // Replace with any string to identify this service in your system
    "service.name": "inventory-service",
  })),
});

// Configure a test exporter to print all traces to the console
const consoleExporter = new ConsoleSpanExporter();

// Configure an exporter that pushes all traces to Zipkin
// (This assumes Zipkin is running on localhost at the 
// default port of 9411)
const zipkinExporter = new ZipkinExporter({
  url: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
});
provider.addSpanProcessor(
  new SimpleSpanProcessor(zipkinExporter)
);

// Register the provider to begin tracing
provider.register();

