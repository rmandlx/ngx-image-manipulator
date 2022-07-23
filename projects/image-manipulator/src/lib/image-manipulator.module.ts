import { ModuleWithProviders, NgModule } from '@angular/core';
import { ImageManipulatorComponent } from './image-manipulator.component';
import { CommonModule } from '@angular/common';
import { IMAGEMANIPULATION_WEBWORKER_FACTORY } from './helper/worker-factory';

@NgModule({
  declarations: [ImageManipulatorComponent],
  imports: [CommonModule],
  exports: [ImageManipulatorComponent],
})
export class ImageManipulatorModule {
  static forRoot(
    workerFactory: () => Worker
  ): ModuleWithProviders<ImageManipulatorModule> {
    return {
      providers: [
        {
          provide: IMAGEMANIPULATION_WEBWORKER_FACTORY,
          useValue: workerFactory,
        },
      ],
      ngModule: ImageManipulatorModule,
    };
  }
}
