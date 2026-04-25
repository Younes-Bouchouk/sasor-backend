import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './domains/users/users.module';
import { AuthModule } from './domains/auth/auth.module';
import {EventModule} from './domains/event/event.module'
import { FollowsModule } from './domains/follows/follows.module';
import { EventsMessagesModule } from './domains/events-messages/events-messages.module';
import { EventsInvitationsModule } from './domains/events-invitations/events-invitations.module';
import { SearchModule } from './search/search.module';
import { PaymentsModule } from './domains/payments/payments.module';

@Module({
    imports: [
       ConfigModule.forRoot({
            isGlobal: true
        }),
        UsersModule, 
        FollowsModule,
        AuthModule,
        EventModule,
        EventsMessagesModule,
        EventsInvitationsModule,
        SearchModule,
        PaymentsModule
    ],
    controllers: [AppController],
})
export class AppModule {}
