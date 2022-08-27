import { NgModule } from '@angular/core';
import { ImageManipulatorComponent } from './image-manipulator.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ImageManipulatorComponent],
  imports: [CommonModule],
  providers: [],
  exports: [ImageManipulatorComponent],
})
export class ImageManipulatorModule {}
