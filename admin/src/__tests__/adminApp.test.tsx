import { render, screen, within } from "@testing-library/react";
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

const health = {
  status: "ok",
  api: "online",
  database: "connected",
  version: "0.6.0",
};

const sampleUser = {
  ...adminSession,
  birth_date: null,
  gender: null,
  height_cm: null,
  current_weight_kg: null,
  target_weight_kg: null,
  activity_level: "moderate",
  goal: "strength",
  is_active: true,
  is_verified: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deleted_at: null,
};

const athleteUser = {
  ...sampleUser,
  id: "user-2",
  email: "athlete@evolve.app",
  username: "athlete",
  first_name: "Alex",
  last_name: "Athlete",
  is_superuser: false,
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
      const path = url.split("?")[0];
      if (path.endsWith("/api/v1/admin/me")) {
        return jsonResponse(adminSession);
      }
      if (path.endsWith("/api/v1/admin/dashboard")) {
        return jsonResponse(dashboard);
      }
      if (path.endsWith("/api/v1/admin/health")) {
        return jsonResponse(health);
      }
      if (path.endsWith("/api/v1/admin/users")) {
        return jsonResponse({ items: [sampleUser], total: 1, limit: 8, offset: 0 });
      }
      if (path.endsWith("/api/v1/admin/session") && init?.method === "DELETE") {
        return jsonResponse(undefined, 204);
      }
      return jsonResponse({ detail: "not found" }, 404);
    });

    const user = userEvent.setup();
    renderApp("/");
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Log out" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  test("dashboard shows a loading state then renders summary counts", async () => {
    setTokens("access-token", "refresh-token");
    let resolveDashboard: ((value: Response) => void) | undefined;
    const dashboardPromise = new Promise<Response>((resolve) => {
      resolveDashboard = resolve;
    });

    mockFetch((url) => {
      const path = url.split("?")[0];
      if (path.endsWith("/api/v1/admin/me")) {
        return jsonResponse(adminSession);
      }
      if (path.endsWith("/api/v1/admin/dashboard")) {
        return dashboardPromise;
      }
      if (path.endsWith("/api/v1/admin/health")) {
        return jsonResponse(health);
      }
      if (path.endsWith("/api/v1/admin/users")) {
        return jsonResponse({ items: [sampleUser], total: 1, limit: 8, offset: 0 });
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
    const summary = screen.getByLabelText("Platform summary");
    expect(within(summary).getByText("Workout logs")).toBeInTheDocument();
    expect(within(summary).getByText("40")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent users" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "System status" })).toBeInTheDocument();
    expect(screen.getByText("online")).toBeInTheDocument();
    expect(screen.getByLabelText("Quick links")).toBeInTheDocument();
  });

  test("dashboard error state can be retried", async () => {
    setTokens("access-token", "refresh-token");
    let failDashboard = true;
    mockFetch((url) => {
      const path = url.split("?")[0];
      if (path.endsWith("/api/v1/admin/me")) {
        return jsonResponse(adminSession);
      }
      if (path.endsWith("/api/v1/admin/dashboard")) {
        if (failDashboard) {
          return jsonResponse({ detail: "boom" }, 500);
        }
        return jsonResponse(dashboard);
      }
      if (path.endsWith("/api/v1/admin/health")) {
        return jsonResponse(health);
      }
      if (path.endsWith("/api/v1/admin/users")) {
        return jsonResponse({ items: [sampleUser], total: 1, limit: 8, offset: 0 });
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

const exercise = {
  id: "ex-1",
  name: "Goblet Squat",
  slug: "goblet-squat",
  description: "A squat.",
  instructions: null,
  difficulty_level: "beginner",
  category: "compound",
  video_url: null,
  image_url: null,
  is_active: true,
  muscle_groups: [{ id: "mg-1", name: "Quads", slug: "quads", description: null, is_primary: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }],
  equipment: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const emptyPage = { items: [], total: 0, limit: 20, offset: 0 };

function adminAuthed(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  return (url: string, init?: RequestInit) => {
    const path = url.split("?")[0];
    if (path.endsWith("/api/v1/admin/me")) {
      return jsonResponse(adminSession);
    }
    return handler(url, init);
  };
}

describe("EVOLVE Admin feature management", () => {
  afterEach(() => {
    clearTokens();
    jest.restoreAllMocks();
  });

  test("exercises route renders the catalog heading and sidebar link", async () => {
    setTokens("access-token", "refresh-token");
    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/exercises?")) {
        return jsonResponse({ items: [exercise], total: 1, limit: 20, offset: 0 });
      }
      if (url.endsWith("/api/v1/admin/muscle-groups")) {
        return jsonResponse([]);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/exercises");
    expect(await screen.findByRole("heading", { name: "Exercises" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exercises" })).toBeInTheDocument();
    expect(await screen.findByText("Goblet Squat")).toBeInTheDocument();
    expect(screen.getByText("compound")).toBeInTheDocument();
  });

  test("exercises list shows a loading state then an empty catalog", async () => {
    setTokens("access-token", "refresh-token");
    let resolveList: ((value: Response) => void) | undefined;
    const listPromise = new Promise<Response>((resolve) => {
      resolveList = resolve;
    });

    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/exercises?")) {
        return listPromise;
      }
      if (url.endsWith("/api/v1/admin/muscle-groups")) {
        return jsonResponse([]);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/exercises");
    expect(await screen.findByText("Loading exercises")).toBeInTheDocument();

    resolveList?.((await jsonResponse(emptyPage)) as Response);
    expect(await screen.findByText("No exercises")).toBeInTheDocument();
    expect(screen.getByText("Create an exercise to populate the catalog.")).toBeInTheDocument();
  });

  test("exercises error state can be retried", async () => {
    setTokens("access-token", "refresh-token");
    let failList = true;
    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/exercises?")) {
        if (failList) {
          return jsonResponse({ detail: "boom" }, 500);
        }
        return jsonResponse({ items: [exercise], total: 1, limit: 20, offset: 0 });
      }
      if (url.endsWith("/api/v1/admin/muscle-groups")) {
        return jsonResponse([]);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    const user = userEvent.setup();
    renderApp("/exercises");
    expect(await screen.findByText("Exercises unavailable")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");

    failList = false;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Goblet Squat")).toBeInTheDocument();
  });

  test("exercise detail renders catalog fields", async () => {
    setTokens("access-token", "refresh-token");
    mockFetch(adminAuthed((url) => {
      if (url.endsWith("/api/v1/admin/exercises/ex-1")) {
        return jsonResponse(exercise);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/exercises/ex-1");
    expect(await screen.findByRole("heading", { name: "Goblet Squat" })).toBeInTheDocument();
    expect(screen.getByText("goblet-squat")).toBeInTheDocument();
    expect(screen.getByText("Quads (primary)")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("creating an exercise succeeds and creating with a server error shows a safe message", async () => {
    setTokens("access-token", "refresh-token");
    let createFails = true;
    const created = { ...exercise, id: "ex-2", name: "Romanian Deadlift", slug: "romanian-deadlift" };
    mockFetch(adminAuthed((url, init) => {
      if (url.endsWith("/api/v1/admin/muscle-groups") && init?.method === "POST") {
        return jsonResponse({
          id: "mg-2",
          name: "Romanian Deadlift group",
          slug: "romanian-deadlift-group",
          description: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }, 201);
      }
      if (url.endsWith("/api/v1/admin/muscle-groups")) {
        return jsonResponse([]);
      }
      if (url.endsWith("/api/v1/admin/exercises") && init?.method === "POST") {
        if (createFails) {
          return jsonResponse({ detail: "invalid" }, 422);
        }
        return jsonResponse(created, 201);
      }
      if (url.includes("/api/v1/admin/exercises?")) {
        return jsonResponse({
          items: createFails ? [] : [created],
          total: createFails ? 0 : 1,
          limit: 20,
          offset: 0,
        });
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    const user = userEvent.setup();
    renderApp("/exercises");
    expect(await screen.findByText("No exercises")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Romanian Deadlift");
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please check the form and try again.");

    createFails = false;
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findByText("Romanian Deadlift")).toBeInTheDocument();
  });

  test("deactivate confirmation can be cancelled and then confirmed", async () => {
    setTokens("access-token", "refresh-token");
    let current = { ...exercise };
    mockFetch(adminAuthed((url, init) => {
      if (url.endsWith("/api/v1/admin/exercises/ex-1/deactivate") && init?.method === "POST") {
        current = { ...current, is_active: false };
        return jsonResponse(current);
      }
      if (url.endsWith("/api/v1/admin/exercises/ex-1")) {
        return jsonResponse(current);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    const user = userEvent.setup();
    renderApp("/exercises/ex-1");
    expect(await screen.findByRole("heading", { name: "Goblet Squat" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(await screen.findByRole("heading", { name: "Deactivate exercise" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("heading", { name: "Deactivate exercise" })).not.toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    expect(await screen.findByText("Inactive")).toBeInTheDocument();
  });

  test("nutrition route renders an empty read-only meal list", async () => {
    setTokens("access-token", "refresh-token");
    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/meals?")) {
        return jsonResponse(emptyPage);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/nutrition");
    expect(await screen.findByRole("heading", { name: "Nutrition" })).toBeInTheDocument();
    expect(await screen.findByText("No meals")).toBeInTheDocument();
  });

  test("coach route renders an empty conversation list", async () => {
    setTokens("access-token", "refresh-token");
    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/conversations?")) {
        return jsonResponse(emptyPage);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/coach");
    expect(await screen.findByRole("heading", { name: "Coach" })).toBeInTheDocument();
    expect(await screen.findByText("No conversations")).toBeInTheDocument();
  });
});

describe("EVOLVE Admin operations UX", () => {
  afterEach(() => {
    clearTokens();
    jest.restoreAllMocks();
  });

  test("users list shows loading then an empty directory", async () => {
    setTokens("access-token", "refresh-token");
    let resolveList: ((value: Response) => void) | undefined;
    const listPromise = new Promise<Response>((resolve) => {
      resolveList = resolve;
    });
    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/users?")) {
        return listPromise;
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/users");
    expect(await screen.findByText("Loading users")).toBeInTheDocument();
    resolveList?.((await jsonResponse({ items: [], total: 0, limit: 20, offset: 0 })) as Response);
    expect(await screen.findByText("No users yet")).toBeInTheDocument();
  });

  test("users error state can be retried", async () => {
    setTokens("access-token", "refresh-token");
    let failList = true;
    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/users?")) {
        if (failList) {
          return jsonResponse({ detail: "boom" }, 500);
        }
        return jsonResponse({ items: [sampleUser], total: 1, limit: 20, offset: 0 });
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    const user = userEvent.setup();
    renderApp("/users");
    expect(await screen.findByText("Users unavailable")).toBeInTheDocument();
    failList = false;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("admin")).toBeInTheDocument();
  });

  test("users search and status filter request the matching query params", async () => {
    setTokens("access-token", "refresh-token");
    const requested: string[] = [];
    mockFetch(adminAuthed((url) => {
      if (url.includes("/api/v1/admin/users?")) {
        requested.push(url);
        if (url.includes("is_active=false")) {
          return jsonResponse({ items: [], total: 0, limit: 20, offset: 0 });
        }
        if (url.includes("q=ada")) {
          return jsonResponse({ items: [sampleUser], total: 1, limit: 20, offset: 0 });
        }
        return jsonResponse({ items: [sampleUser, athleteUser], total: 2, limit: 20, offset: 0 });
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    const user = userEvent.setup();
    renderApp("/users");
    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(screen.getByText("athlete")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search"), "ada");
    await user.click(screen.getByRole("button", { name: "Filter" }));
    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(screen.queryByText("athlete")).not.toBeInTheDocument();
    expect(requested.some((url) => url.includes("q=ada"))).toBe(true);

    await user.selectOptions(screen.getByLabelText("Status"), "inactive");
    await user.click(screen.getByRole("button", { name: "Filter" }));
    expect(await screen.findByText("No matching users")).toBeInTheDocument();
    expect(requested.some((url) => url.includes("is_active=false"))).toBe(true);
  });

  test("user status mutation requires confirmation and shows success or failure", async () => {
    setTokens("access-token", "refresh-token");
    let current = { ...athleteUser };
    let failStatus = true;
    mockFetch(adminAuthed((url, init) => {
      const path = url.split("?")[0];
      if (path.endsWith("/api/v1/admin/users/user-2/status") && init?.method === "PATCH") {
        if (failStatus) {
          return jsonResponse({ detail: "boom" }, 500);
        }
        current = { ...current, is_active: false };
        return jsonResponse(current);
      }
      if (path.endsWith("/api/v1/admin/users/user-2")) {
        return jsonResponse(current);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    const user = userEvent.setup();
    renderApp("/users/user-2");
    expect(await screen.findByRole("heading", { name: "athlete" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(await screen.findByRole("heading", { name: "Deactivate account" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("heading", { name: "Deactivate account" })).not.toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    let dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
    expect(screen.getByText("Active")).toBeInTheDocument();

    failStatus = false;
    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Deactivate" }));
    expect(await screen.findByText("Account deactivated.")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  test("self-deactivation control stays disabled", async () => {
    setTokens("access-token", "refresh-token");
    mockFetch(adminAuthed((url) => {
      if (url.split("?")[0].endsWith("/api/v1/admin/users/admin-1")) {
        return jsonResponse(sampleUser);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/users/admin-1");
    expect(await screen.findByRole("heading", { name: "admin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivate" })).toBeDisabled();
    expect(screen.getByText("You cannot deactivate your own administrator account.")).toBeInTheDocument();
  });

  test("system health renders sanitized API and database status", async () => {
    setTokens("access-token", "refresh-token");
    mockFetch(adminAuthed((url) => {
      if (url.endsWith("/api/v1/admin/health")) {
        return jsonResponse(health);
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    renderApp("/system");
    expect(await screen.findByRole("heading", { name: "System" })).toBeInTheDocument();
    const snapshot = await screen.findByLabelText("System health");
    expect(within(snapshot).getByText("ok")).toBeInTheDocument();
    expect(within(snapshot).getByText("online")).toBeInTheDocument();
    expect(within(snapshot).getByText("connected")).toBeInTheDocument();
    expect(within(snapshot).getByText("0.6.0")).toBeInTheDocument();
    expect(screen.getByText(/never include JWT secrets/i)).toBeInTheDocument();
  });

  test("creating an exercise shows success feedback after a valid save", async () => {
    setTokens("access-token", "refresh-token");
    const created = { ...exercise, id: "ex-3", name: "Push Press", slug: "push-press" };
    let createdOnce = false;
    mockFetch(adminAuthed((url, init) => {
      if (url.endsWith("/api/v1/admin/muscle-groups") && init?.method === "POST") {
        return jsonResponse({
          id: "mg-3",
          name: "Push Press group",
          slug: "push-press-group",
          description: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }, 201);
      }
      if (url.endsWith("/api/v1/admin/muscle-groups")) {
        return jsonResponse([]);
      }
      if (url.endsWith("/api/v1/admin/exercises") && init?.method === "POST") {
        createdOnce = true;
        return jsonResponse(created, 201);
      }
      if (url.includes("/api/v1/admin/exercises?")) {
        return jsonResponse({
          items: createdOnce ? [created] : [],
          total: createdOnce ? 1 : 0,
          limit: 20,
          offset: 0,
        });
      }
      return jsonResponse({ detail: "not found" }, 404);
    }));

    const user = userEvent.setup();
    renderApp("/exercises");
    expect(await screen.findByText("No exercises")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Name"), "Push Press");
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findByText("Exercise created.")).toBeInTheDocument();
    expect(screen.getByText("Push Press")).toBeInTheDocument();
  });
});
