import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingPreferences } from '../../models/reading-preferences';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingPreferences])],
  controllers: [PreferencesController],
  providers: [PreferencesService],
})
export class PreferencesModule {}
