import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PictureDataTransformerComponent } from './picture-data-transformer';
import { ImageManipulatorComponent } from './manipulation-component';
import {
  IMAGEMANIPULATION_WEBWORKER_FACTORY,
  ImageManipulator,
  ManipulationService,
  MANIPULATOR_CLASS,
} from './manipulation-service';
import { Class } from './helper/class';

@NgModule({
  declarations: [PictureDataTransformerComponent, ImageManipulatorComponent],
  imports: [CommonModule],
  providers: [],
  exports: [PictureDataTransformerComponent, ImageManipulatorComponent],
})
export class ImageManipulationModule {
  static forRoot<T extends ImageManipulator>(
    workerFactory: () => Worker,
    manipulatorClass: Class<T>
  ): ModuleWithProviders<ImageManipulationModule> {
    return {
      ngModule: ImageManipulationModule,
      providers: [
        ManipulationService,
        {
          provide: IMAGEMANIPULATION_WEBWORKER_FACTORY,
          useValue: workerFactory,
        },
        { provide: MANIPULATOR_CLASS, useValue: manipulatorClass },
      ],
    };
  }
}
