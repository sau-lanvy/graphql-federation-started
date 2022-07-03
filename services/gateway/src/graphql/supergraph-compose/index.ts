import resolvable from "@josephg/resolvable";
import { composeAndValidate } from "@apollo/federation";
import { DocumentNode, parse } from "graphql";
import { logger } from "../../logger";
import { loadServiceListWithTypeDefs } from "./loadServiceTypeDefinitions";
import { ServiceTypeDefinition } from "./type";

export interface ComposeOptions {
	pollIntervalInMs?: number;
	shouldUsePubSub?: boolean;
}

export interface ServiceDefinition {
	name: string;
	url: string;
	typeDefs: DocumentNode;
}

type State =
	| { phase: "initialized" }
	| { phase: "polling"; pollingPromise?: Promise<void> }
	| { phase: "stopped" };

export class SupergraphCompose {
	private config: ComposeOptions;
	private serviceSdlCache: Map<string, string> = new Map();
	private timerRef: NodeJS.Timeout | null = null;
	private state: State;
	private update?: any;
	private pollIntervalInMs: Number = 10_000;

	constructor(options: ComposeOptions) {
		this.config = options;
		this.state = { phase: "initialized" };
	}

	public async initialize({ update }: any) {
		this.update = update;
		let initialSupergraphSdl: string | undefined = undefined;

		try {
			initialSupergraphSdl = await this.updateSupergraphSdl();
		} catch (e) {
			this.logUpdateFailure(e);
			throw e;
		}

        // Start polling after we resolve the first supergraph
        if (!this.config.shouldUsePubSub && this.config.pollIntervalInMs 
            && this.config.pollIntervalInMs >= this.pollIntervalInMs) {
            this.beginPolling();
        }

        return {
            // on init, this supergraphSdl should never actually be `null`.
            // `this.updateSupergraphSdl()` will only return null if the schema hasn't
            // changed over the course of an _update_.
            supergraphSdl: initialSupergraphSdl!,
            cleanup: async () => {
              if (this.state.phase === 'polling') {
                await this.state.pollingPromise;
              }
              this.state = { phase: 'stopped' };
              if (this.timerRef) {
                clearTimeout(this.timerRef);
                this.timerRef = null;
              }
            },
        };
	}

	private async loadServiceDefinitions() {
		let isNewSchema = false;
		const serviceList: ServiceTypeDefinition[] = await loadServiceListWithTypeDefs();

		if (!serviceList || !serviceList.length) {
			throw new Error(
				"Tried to load services from the remote schema registry but none provided"
			);
		}

		// for each service, fetch its introspection schema
		const serviceDefinitions = serviceList.map(
			(service: ServiceTypeDefinition) => {
				const previousDefinition = this.serviceSdlCache.get(
					service.name
				);
				// this lets us know if any downstream service has changed
				// and we need to recalculate the schema
				if (previousDefinition !== service.type_defs) {
					isNewSchema = true;
				}
				this.serviceSdlCache.set(service.name, service.type_defs);

				return {
					name: service.name,
					url: service.url,
					typeDefs: parse(service.type_defs),
				};
			}
		);

		return { serviceDefinitions, isNewSchema };
	}

	private createSupergraphFromSubgraphList(subgraphs: ServiceDefinition[]) {
		const compositionResult = composeAndValidate(subgraphs);

		if (compositionResult.errors) {
			const { errors } = compositionResult;
			throw Error(
				"A valid schema couldn't be composed. The following composition errors were found:\n" +
					errors.map((e) => "\t" + e.message).join("\n")
			);
		} else {
			const { supergraphSdl } = compositionResult;
			return supergraphSdl;
		}
	}

	private async updateSupergraphSdl() {
		logger.info(
			`Start update Supergraph: ${this.state.phase} - ${this.config.pollIntervalInMs}`
		);
		const result = await this.loadServiceDefinitions();
		if (!result.isNewSchema) {
			return undefined;
		}

		const supergraphSdl = this.createSupergraphFromSubgraphList(
			result.serviceDefinitions!
		);

		return supergraphSdl;
	}

	private beginPolling() {
		this.state = { phase: "polling" };
		this.poll();
	}

	// eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
	private poll() {
		this.timerRef = setTimeout(async () => {
			if (this.state.phase === "polling") {
				const pollingPromise = resolvable();

				this.state.pollingPromise = pollingPromise;
				try {
					const maybeNewSupergraphSdl =
						await this.updateSupergraphSdl();
					if (maybeNewSupergraphSdl) {
						this.update?.(maybeNewSupergraphSdl);
					}
				} catch (e) {
					this.logUpdateFailure(e);
				}
				pollingPromise.resolve();
			}

			this.poll();
		}, this.config.pollIntervalInMs!);
	}

	private logUpdateFailure(e: any) {
		logger.error(
			`SupergraphCompose failed to update supergraph with the following error: ${
				e.message ?? e
			}`
		);
	}
}
