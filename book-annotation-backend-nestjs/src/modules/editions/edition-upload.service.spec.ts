import { Test, TestingModule } from '@nestjs/testing';
import { EditionUploadService } from './edition-upload.service';

describe('EditionUploadService', () => {
  let service: EditionUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditionUploadService],
    }).compile();

    service = module.get<EditionUploadService>(EditionUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
