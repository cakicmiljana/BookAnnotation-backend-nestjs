import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from '../../models/note';
import { EditionsModule } from '../editions/editions.module';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), EditionsModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
