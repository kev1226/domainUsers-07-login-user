import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { KafkaServices } from './kafka-constants';

export const kafkaClientConfig: ClientsModuleOptions = [
  {
    name: KafkaServices.USER_LOGIN_SERVICE,
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'auth-service-login', brokers: ['3.232.44.31:9092'] },
      consumer: { groupId: 'auth-service-login-client-group' },
    },
  },
];
