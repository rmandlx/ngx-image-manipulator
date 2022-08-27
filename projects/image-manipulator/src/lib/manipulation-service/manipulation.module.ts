import {
  IMAGEMANIPULATION_WEBWORKER_FACTORY,
  ManipulationService,
  MANIPULATOR_CLASS,
} from './manipulation.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Class } from '../helper/class';
import { ImageManipulator } from './image-manipulator';

@NgModule({
  declarations: [],
  imports: [],
  providers: [],
  bootstrap: [],
})
export class ManipulationModule {
  static forRoot<T extends ImageManipulator>(
    workerFactory: () => Worker,
    manipulatorClass: Class<T>
  ): ModuleWithProviders<ManipulationModule> {
    return {
      ngModule: ManipulationModule,
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
