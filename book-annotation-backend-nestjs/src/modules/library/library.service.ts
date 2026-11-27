import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLibraryItemResponse } from '../../dtos/library/get-library-item.response';
import { toLibraryItemResponse } from '../../mappers/library-item.mapper';
import { Edition } from '../../models/edition';
import { LibraryEntry } from '../../models/library-entry';
import { EditionsService } from '../editions/editions.service';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryEntry)
    private readonly libraryRepository: Repository<LibraryEntry>,
    private readonly editionsService: EditionsService,
  ) {}

  // The first item is the one shown "On your reading desk".
  async findAll(userId: number): Promise<GetLibraryItemResponse[]> {
    const entries = await this.libraryRepository
      .createQueryBuilder('entry')
      .innerJoinAndSelect('entry.edition', 'edition')
      .innerJoinAndSelect('edition.work', 'work')
      .where('entry.userId = :userId', { userId })
      .orderBy('entry.lastOpenedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('entry.addedAt', 'DESC')
      .getMany();

    return entries.map((entry) => toLibraryItemResponse(entry, userId));
  }

  // Adding an edition that is already in the library returns the existing entry.
  async add(userId: number, editionId: number): Promise<GetLibraryItemResponse> {
    const edition = await this.editionsService.findAccessibleEdition(
      editionId,
      userId,
    );
    const entry = await this.findOrPrepareEntry(userId, edition);
    const saved = await this.libraryRepository.save(entry);

    return toLibraryItemResponse(saved, userId);
  }

  // Removes only the library entry; the user's annotations and notes stay.
  async remove(userId: number, editionId: number): Promise<void> {
    await this.libraryRepository.delete({ userId, editionId });
  }

  // Called by the reader on open and when the reading location changes.
  // Creates the entry if the edition is not in the library yet.
  async updatePosition(
    userId: number,
    editionId: number,
    offset: number,
  ): Promise<GetLibraryItemResponse> {
    const edition = await this.editionsService.findAccessibleEdition(
      editionId,
      userId,
    );
    if (offset > edition.contentLength) {
      throw new BadRequestException(
        `offset must not be greater than ${edition.contentLength}`,
      );
    }

    const entry = await this.findOrPrepareEntry(userId, edition);
    entry.lastPosition = offset;
    entry.lastOpenedAt = new Date();
    const saved = await this.libraryRepository.save(entry);

    return toLibraryItemResponse(saved, userId);
  }

  // Returns the existing entry, or a new one that is not saved yet.
  private async findOrPrepareEntry(
    userId: number,
    edition: Edition,
  ): Promise<LibraryEntry> {
    const existing = await this.libraryRepository.findOneBy({
      userId,
      editionId: edition.id,
    });
    const entry =
      existing ??
      this.libraryRepository.create({
        userId,
        editionId: edition.id,
        lastPosition: 0,
        lastOpenedAt: null,
      });

    entry.edition = edition;
    return entry;
  }
}
