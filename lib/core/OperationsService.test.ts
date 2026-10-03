import { OperationsService } from './OperationsService';

describe('OperationsService', () => {
  it('should return telemetry', async () => {
    const opsService = new OperationsService();
    const telemetry = await opsService.getTelemetry();
    expect(telemetry.databaseStatus).toBe('HEALTHY');
    expect(telemetry.dlqSize).toBeGreaterThanOrEqual(0);
  });
});
