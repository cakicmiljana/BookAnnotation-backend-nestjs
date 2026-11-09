import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnotationsModule } from './modules/annotations/annotations.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { EditionsModule } from './modules/editions/editions.module';
import { LibraryModule } from './modules/library/library.module';
import { NotesModule } from './modules/notes/notes.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { UsersModule } from './modules/users/users.module';
import { WorksModule } from './modules/works/works.module';

@Module({
  imports: [
    UsersModule,
    WorksModule,
    EditionsModule,
    AnnotationsModule,
    NotesModule,
    PreferencesModule,
    BookmarksModule,
    LibraryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
