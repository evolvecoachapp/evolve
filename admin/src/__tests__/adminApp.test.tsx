import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { App } from "../App";
import { AuthProvider } from "../auth/AuthContext";
import { clearTokens, setTokens } from "../auth/tokenStore";

const adminSession = {
  id: "admin-1",
  email: "admin@evolve.app",
  username: "admin",
  first_name: "Ada",
  last_name: "Admin",
  is_superuser: true,
};

const dashboard = {
  users: { total: 12, active: 10, inactive: 2, superusers: 1 },
  activity: {
    workout_logs: 40,
    meal_logs: 18,
    recovery_check_ins: 9,
    goals: 6,
    progress_entries: 4,
    conversations: 3,
  },
};

function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
    json: async () => body,
  } as Response);
}

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

function mockFetch(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  jest.spyOn(globalThis, "fetch").mockImplementation(((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    return Promise.resolve(handler(url, init));
  }) as typeof fetch);
}

describe("EVOLVE Admin foundation", () => {
  afterEach(() => {
    clearTokens();
    jest.restoreAllMocks();
  });

  test("protected admin routing redirects anonymous users to login", async () => {
    renderApp("/");
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Dashboard" })).not.toBeInTheDocument();
  });

  test("login failure shows a safe error and stays on the login page", async () => {
    mockFetch(() => jsonResponse({ detail: "nope" }, 401));
    const user = userEvent.setup();
    renderApp("/login");

    await user.type(screen.getByLabelText("Email"), "user@evolve.app");
    await user.type(screen.getByLabelText("Password"), "WrongPass1!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  test("logout returns the administrator to login", async () => {
    setTokens("access-token", "refresh-token");
    mockFetch((url, init) => {
      if (url.endsWith("/api/v1/admin/me")) {
        return jsonResponse(adminSession);
      }
      if (url.endsWith("/api/v1/admin/dashboard")) {
        return jsonResponse(dashboard);
      }
      if (url.endsWith("/api/v1/admin/session") && init?.method === "DELETE") {
        return jsonResponse(undefined, 204);
      }
      return jsonResponse({ detail: "not found" }, 404);
    });

    const user = userEvent.setup();
    renderApp("/");
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  test("dashboard shows a loading state then renders summary counts", async () => {
    setTokens("access-token", "refresh-token");
    let resolveDashboard: ((value: Response) => void) | undefined;
    const dashboardPromise = new Promise<Response>((resolve) => {
      resolveDashboard = resolve;
    });

    mockFetch((url) => {
      if (url.endsWith("/api/v1/admin/me")) {
        return jsonResponse(adminSession);
      }
      if (url.endsWith("/api/v1/admin/dashboard")) {
        return dashboardPromise;
      }
      return jsonResponse({ detail: "not found" }, 404);
    });

    renderApp("/");
    expect(await screen.findByText("Loading dashboard")).toBeInTheDocument();

    resolveDashboard?.(
      (await jsonResponse(dashboard)) as Response,
    );
    expect(await screen.findByText("Total users")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Workout logs")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  test("dashboard error state can be retried", async () => {
    setTokens("access-token", "refresh-token");
    let failDashboard = true;
    mockFetch((url) => {
      if (url.endsWith("/api/v1/admin/me")) {
        return jsonResponse(adminSession);
      }
      if (url.endsWith("/api/v1/admin/dashboard")) {
        if (failDashboard) {
          return jsonResponse({ detail: "boom" }, 500);
        }
        return jsonResponse(dashboard);
      }
      return jsonResponse({ detail: "not found" }, 404);
    });

    const user = userEvent.setup();
    renderApp("/");
    expect(await screen.findByText("Dashboard unavailable")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");

    failDashboard = false;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Total users")).toBeInTheDocument();
  });
});
