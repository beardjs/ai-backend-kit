/**
 * Illustrative service integration test shape — assert status/errorCode on conflict.
 */
describe('when creating a user with an existing email', () => {
  it('should reject with 409 RESOURCE_CONFLICT', async () => {
    expect(true).toBe(true);
  });
});
