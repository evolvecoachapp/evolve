"""The contract future domain AI engines implement.

No concrete engine exists yet — the Nutrition Engine and Recovery Engine
are Sprint 4.3+, the Progress Analyzer is later still, and the Workout
Engine's rule-based deliverable was already satisfied by the (non-AI)
``WorkoutResolutionService`` (see Decision 006 in ``docs/DECISIONS.md``).
This module exists so :class:`~app.ai.orchestrator.AIOrchestrator` has a
stable registration contract to code against now; its engine registry is
empty until a Sprint actually implements one.
"""

from typing import Protocol, runtime_checkable

from app.ai.contracts import EngineInput, EngineOutput


@runtime_checkable
class AIEngine(Protocol):
    """Structural contract for a single coaching-domain AI engine.

    Per ``EVOLVE_ARCHITECTURE.md`` §4's "Engine Interaction Rules":
    engines never call API routes, receive only typed (Pydantic) input,
    and are stateless per invocation — any context an engine needs comes
    in via :class:`~app.ai.contracts.EngineInput`, never from
    instance/module state.
    """

    name: str

    def handle(self, engine_input: EngineInput) -> EngineOutput:
        """Handle one request and return a typed result.

        Synchronous and deterministic-in-shape (no network I/O of its
        own beyond what it's explicitly given), matching every other
        service/repository in the codebase; only the Orchestrator's LLM
        call is async.
        """
        ...
