import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { databaseConfig } from './config/database.config';
import { validateEnvironment } from './config/env.validation';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { AnnotationsModule } from './modules/annotations/annotations.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { EditionsModule } from './modules/editions/editions.module';
import { HealthModule } from './modules/health/health.module';
import { LibraryModule } from './modules/library/library.module';
import { NotesModule } from './modules/notes/notes.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { SearchModule } from './modules/search/search.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { WorksModule } from './modules/works/works.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    PreferencesModule,
    WorksModule,
    EditionsModule,
    UploadModule,
    LibraryModule,
    AnnotationsModule,
    NotesModule,
    BookmarksModule,
    SearchModule,
    AnalysisModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Every route needs a valid token unless it is marked with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
