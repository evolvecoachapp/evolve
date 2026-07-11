"""Shared, stateless helper utilities with no domain-specific knowledge."""

from app.utils.pagination import Page, clamp_pagination
from app.utils.text import slugify

__all__ = ["Page", "clamp_pagination", "slugify"]
