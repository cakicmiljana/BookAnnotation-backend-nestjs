import { Controller } from '@nestjs/common';
import { BooksService } from 'src/services/books/books.service';

@Controller('books')
export class BooksController {

    constructor(private readonly booksService: BooksService) {
    }

}
