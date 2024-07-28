const describeIf = (condition, ...args) =>
    condition ? describe(...args) : describe.skip(...args);


describeIf(process.env.TEST_INTEGRATION, "run integration tests", () => {
  test("this is a dummy integration test", async () => {
    await new Promise(res => setTimeout(res, 1000));
    expect(1).toBe(2);
  });
});
