import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryEntry } from '../../models/library-entry';
import { EditionsModule } from '../editions/editions.module';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
  imports: [TypeOrmModule.forFeature([LibraryEntry]), EditionsModule],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
