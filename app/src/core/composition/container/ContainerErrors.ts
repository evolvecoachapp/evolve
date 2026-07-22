/**
 * Typed errors raised by ApplicationContainer validation and resolution.
 */

export class ContainerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContainerError";
  }
}

export class DuplicateRegistrationError extends ContainerError {
  constructor(public readonly token: string) {
    super(`Service already registered: ${token}`);
    this.name = "DuplicateRegistrationError";
  }
}

export class MissingRegistrationError extends ContainerError {
  constructor(public readonly token: string) {
    super(`Service not registered: ${token}`);
    this.name = "MissingRegistrationError";
  }
}

export class CircularDependencyError extends ContainerError {
  constructor(public readonly cycle: readonly string[]) {
    super(`Circular dependency detected: ${cycle.join(" → ")}`);
    this.name = "CircularDependencyError";
  }
}

export class ContainerFrozenError extends ContainerError {
  constructor(message = "Container is frozen; late registration is not allowed") {
    super(message);
    this.name = "ContainerFrozenError";
  }
}

export class InvalidResolutionError extends ContainerError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidResolutionError";
  }
}

export class DependencyValidationError extends ContainerError {
  constructor(
    message: string,
    public readonly issues: readonly string[] = [],
  ) {
    super(
      issues.length > 0 ? `${message}: ${issues.join("; ")}` : message,
    );
    this.name = "DependencyValidationError";
  }
}
