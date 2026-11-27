import { PartialType } from '@nestjs/swagger';
import { CreateAnnotationDto } from './create-annotation.dto';

// note to myself: partialtype makes all properties of the given type optional
export class UpdateAnnotationDto extends PartialType(CreateAnnotationDto) {}
