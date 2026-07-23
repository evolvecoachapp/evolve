# Architecture Diagrams

**Project:** EVOLVE  
**Version:** 0.6.0  
**Status:** Living Document  
**Last Updated:** 2026-07-23  
**Purpose:** Index of subsystem architecture diagrams and DI / Composition Root docs.  
**Source of Truth:** Partial — summary diagrams live in linked docs.

## Primary diagrams

- [ARCHITECTURE.md](../ARCHITECTURE.md) — AI Workout Pipeline + Composition Root + Decision Intelligence + Workout/Rest Runtime + Domain Events + Performance Engine + Achievement Engine + Athlete History + Recovery Intelligence + Insight Engine + Coach Intelligence + Conversation Orchestrator + Prompt Builder + Prompt Composition Engine + AI Provider Abstraction + OpenAI Provider + AI Execution Pipeline + Streaming Foundation + Tool Calling Foundation + Domain Tool Adapters + Response Formatter + Action Engine + Tool Runtime + Agent Framework + Agent Runtime + Workout Agent + Nutrition Agent + Recovery Agent + Coach Agent + Conversation Memory dependency flow
- [COMPOSITION_ROOT.md](../COMPOSITION_ROOT.md) — Composition Root, Dependency Graph, Factories, DI, Service Lifecycle
- [DECISION_INTELLIGENCE.md](../DECISION_INTELLIGENCE.md) — Decision graph, explainability, execution reports, Coach AI preparation
- [WORKOUT_RUNTIME.md](../WORKOUT_RUNTIME.md) — Live WorkoutSession execution state, session lifecycle, runtime state model
- [REST_RUNTIME.md](../REST_RUNTIME.md) — Deterministic rest periods, time model, state machine, future timer integration
- [DOMAIN_EVENTS.md](../DOMAIN_EVENTS.md) — Immutable domain events, Event Stream, subscriber interfaces, future consumers
- [PERFORMANCE_ENGINE.md](../PERFORMANCE_ENGINE.md) — Single-session performance snapshots, metric model, future trend analysis placeholder
- [ACHIEVEMENT_ENGINE.md](../ACHIEVEMENT_ENGINE.md) — Achievement Engine, Personal Records, future milestones/gamification placeholders
- [ATHLETE_HISTORY.md](../ATHLETE_HISTORY.md) — Athlete History domain, History Model, offline sync + Timeline UI placeholders
- [RECOVERY_INTELLIGENCE.md](../RECOVERY_INTELLIGENCE.md) — Recovery Intelligence domain, Recovery Metrics, Future Readiness Model placeholder
- [INSIGHT_ENGINE.md](../INSIGHT_ENGINE.md) — Insight Engine domain, Insight Model, Future Coach Integration placeholder
- [COACH_INTELLIGENCE.md](../COACH_INTELLIGENCE.md) — Coach Intelligence domain, Coaching Context, Future Prompt Builder / AI Provider placeholders
- [CONVERSATION_ORCHESTRATOR.md](../CONVERSATION_ORCHESTRATOR.md) — Conversation Orchestrator domain, Conversation Context, handoff to Prompt Composition
- [PROMPT_BUILDER.md](../PROMPT_BUILDER.md) — Prompt Builder domain, Prompt Package composition from Conversation Context, handoff to Future AI Provider
- [PROMPT_COMPOSITION.md](../PROMPT_COMPOSITION.md) — Prompt Composition Engine, Prompt Package, handoff to AI Provider Abstraction
- [AI_PROVIDER_ABSTRACTION.md](../AI_PROVIDER_ABSTRACTION.md) — AI Provider Abstraction, Provider Registry, Future OpenAI Integration, Future Multi-provider Support
- [OPENAI_PROVIDER.md](../OPENAI_PROVIDER.md) — OpenAI Provider, Provider Flow, Configuration, Future Streaming Support
- [AI_EXECUTION_PIPELINE.md](../AI_EXECUTION_PIPELINE.md) — AI Execution Pipeline, Execution Lifecycle, Future Retry / Tool Calling
- [STREAMING_FOUNDATION.md](../STREAMING_FOUNDATION.md) — Streaming Foundation, Stream Lifecycle, Future Tool Calling Integration
- [TOOL_CALLING_FOUNDATION.md](../TOOL_CALLING_FOUNDATION.md) — Tool Calling Foundation, Tool Registry, Execution Flow, Future Domain Tool Integration
- [DOMAIN_TOOL_ADAPTERS.md](../DOMAIN_TOOL_ADAPTERS.md) — Domain Tool Adapters, Adapter Flow, Tool Integration, Future Adapter Extensions
- [RESPONSE_FORMATTER.md](../RESPONSE_FORMATTER.md) — Response Formatter, Coach Response, Formatting Pipeline, UI / Action Engine
- [ACTION_ENGINE.md](../ACTION_ENGINE.md) — Action Engine, ActionPlan, Action Planning, Execution Pipeline contracts
- [ACTION_PLANNING.md](../ACTION_PLANNING.md) — Action Planning planners, selectors, policies
- [TOOL_RUNTIME.md](../TOOL_RUNTIME.md) — Tool Runtime Engine, Execution Pipeline, Execution Flow
- [AGENT_FRAMEWORK.md](../AGENT_FRAMEWORK.md) — Agent Framework contracts, registry, factory, public API
- [AGENT_LIFECYCLE.md](../AGENT_LIFECYCLE.md) — Agent Framework lifecycle / state machine
- [AGENT_REGISTRY.md](../AGENT_REGISTRY.md) — Agent / capability / role / metadata registries
- [WORKOUT_AGENT.md](../WORKOUT_AGENT.md) — Workout Agent, reasoning / planning layers, WorkoutAgentResult
- [NUTRITION_AGENT.md](../NUTRITION_AGENT.md) — Nutrition Agent, domain gateway / capability selector, NutritionAgentResult
- [RECOVERY_AGENT.md](../RECOVERY_AGENT.md) — Recovery Agent, reasoning / planning layers, RecoveryAgentResult
- [COACH_AGENT.md](../COACH_AGENT.md) — Coach Agent (meta-agent), coordinator / merger, CoachAgentResult
- [CONVERSATION_MEMORY.md](../CONVERSATION_MEMORY.md) — Conversation Memory Foundation, lifecycle / categories / timeline / future persistence
- [AGENT_RUNTIME.md](../AGENT_RUNTIME.md) — Agent Runtime Foundation (registry, selection, execution entry point)
- [WORKOUT_INTELLIGENCE.md](../WORKOUT_INTELLIGENCE.md) — Workout Domain vs Workout Agent split
- [NUTRITION_INTELLIGENCE.md](../NUTRITION_INTELLIGENCE.md) — Nutrition Domain vs Nutrition Agent split
- [AI_SYSTEM.md](../AI_SYSTEM.md) — Coach + mobile AI runtime pipeline
- [INTEGRATION_TESTING.md](../INTEGRATION_TESTING.md) — Integration framework (fixtures, builders, assertions, scenarios, goldens)

Deep reference: [EVOLVE_ARCHITECTURE.md](../../.cursor/rules/EVOLVE_ARCHITECTURE.md).

