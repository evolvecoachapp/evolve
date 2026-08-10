import { validateDashboardProjectionInput } from "../validation";
import { DashboardProjectionValidationError } from "../validation/DashboardProjectionValidationError";
import {
  createTestWorkspace,
  FIXED_DASHBOARD_IDENTITY,
} from "../testSupport/fixtures";

describe("dashboard-projection validation", () => {
  it("accepts valid workspace and identity", () => {
    const workspace = createTestWorkspace();

    expect(() =>
      validateDashboardProjectionInput({
        workspace,
        identity: FIXED_DASHBOARD_IDENTITY,
      }),
    ).not.toThrow();
  });

  it("rejects missing workspace", () => {
    expect(() =>
      validateDashboardProjectionInput({
        workspace: null,
        identity: FIXED_DASHBOARD_IDENTITY,
      }),
    ).toThrow(DashboardProjectionValidationError);
  });

  it("rejects duplicate workspace id", () => {
    const workspace = createTestWorkspace();

    expect(() =>
      validateDashboardProjectionInput({
        workspace,
        identity: FIXED_DASHBOARD_IDENTITY,
        projectedWorkspaceIds: [workspace.id],
      }),
    ).toThrow(DashboardProjectionValidationError);
  });

  it("rejects missing identity", () => {
    const workspace = createTestWorkspace();

    expect(() =>
      validateDashboardProjectionInput({
        workspace,
        identity: null,
      }),
    ).toThrow(DashboardProjectionValidationError);
  });
});
