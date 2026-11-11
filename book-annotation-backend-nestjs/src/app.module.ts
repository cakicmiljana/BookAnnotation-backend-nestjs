import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { UsersModule } from './modules/users/users.module';
import { WorksModule } from './modules/works/works.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PreferencesModule,
    WorksModule,
    EditionsModule,
    LibraryModule,
    AnnotationsModule,
    NotesModule,
    BookmarksModule,
    SearchModule,
    AnalysisModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
