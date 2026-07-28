import {
  createAthleteIdentityService,
  type AthleteIdentityService,
} from "../../../features/athlete-identity/services/AthleteIdentityService";

export interface AthleteIdentityFactoryDeps {
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly service?: AthleteIdentityService;
}

export const AthleteIdentityFactory = {
  create(deps: AthleteIdentityFactoryDeps = {}): AthleteIdentityService {
    return (
      deps.service ??
      createAthleteIdentityService({
        clock: deps.clock,
        version: deps.version,
        schemaVersion: deps.schemaVersion,
      })
    );
  },
} as const;
