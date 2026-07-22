import { createPromptContext } from "../../../conversation/testSupport/fixtures";
import { receiveComposedPromptContext } from "../receiveComposedPromptContext";
import { PromptBuilderError } from "../receiveComposedPromptContext";

describe("receiveComposedPromptContext", () => {
  it("accepts a valid composed PromptContext", () => {
    const context = createPromptContext();
    expect(receiveComposedPromptContext(context)).toBe(context);
  });

  it("rejects invalid composed PromptContext", () => {
    const context = createPromptContext();
    const invalid = {
      ...context,
      athlete: {
        ...context.athlete,
        consistencyScore: 2,
      },
    };

    expect(() => receiveComposedPromptContext(invalid)).toThrow(
      PromptBuilderError,
    );
  });
});
