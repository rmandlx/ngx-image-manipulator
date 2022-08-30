import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PictureDataTransformerComponent } from './picture-data-transformer';

@NgModule({
  declarations: [PictureDataTransformerComponent],
  imports: [CommonModule],
  providers: [],
  exports: [PictureDataTransformerComponent],
})
export class ImageManipulationModule {}
