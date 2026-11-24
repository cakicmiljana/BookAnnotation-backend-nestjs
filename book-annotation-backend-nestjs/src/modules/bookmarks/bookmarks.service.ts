import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkResponse } from '../../dtos/bookmarks/bookmark.response';
import { CreateBookmarkDto } from '../../dtos/bookmarks/create-bookmark.dto';
import { toBookmarkResponse } from '../../mappers/bookmark.mapper';
import { Bookmark } from '../../models/bookmark';
import { EditionsService } from '../editions/editions.service';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarksRepository: Repository<Bookmark>,
    private readonly editionsService: EditionsService,
  ) {}

  async findForEdition(
    userId: number,
    editionId: number,
  ): Promise<BookmarkResponse[]> {
    await this.editionsService.findAccessibleEdition(editionId, userId);

    const bookmarks = await this.bookmarksRepository.find({
      where: { userId, editionId },
      order: { offset: 'ASC' },
    });
    return bookmarks.map(toBookmarkResponse);
  }

  // The reader toggles bookmarks, so adding one that already exists is not an
  // error: the existing bookmark is returned.
  async create(
    userId: number,
    editionId: number,
    dto: CreateBookmarkDto,
  ): Promise<BookmarkResponse> {
    const edition = await this.editionsService.findAccessibleEdition(editionId, userId);
    
    if (dto.offset > edition.contentLength) {
      throw new BadRequestException(
        `offset must not be greater than ${edition.contentLength}`,
      );
    }

    const existing = await this.bookmarksRepository.findOneBy({
      userId,
      editionId,
      offset: dto.offset,
    });
    if (existing) {
      return toBookmarkResponse(existing);
    }

    const bookmark = this.bookmarksRepository.create({
      userId,
      editionId,
      offset: dto.offset,
      label: dto.label ?? null,
    });
    const saved = await this.bookmarksRepository.save(bookmark);
    return toBookmarkResponse(saved);
  }

  async remove(userId: number, bookmarkId: number): Promise<void> {
    const bookmark = await this.bookmarksRepository.findOneBy({id: bookmarkId, userId});
    if (!bookmark) {
      throw new NotFoundException(`Bookmark ${bookmarkId} was not found`);
    }
    await this.bookmarksRepository.delete({ id: bookmark.id });
  }
}
