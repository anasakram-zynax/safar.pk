import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
    checkHealth() {
        return {
            status: 'ok',
            service: 'safar-pk-api',
            timestamp: new Date().toISOString(),
        }
    }
}
