/// <reference lib="webworker" />

import { initWebWorker } from 'ngx-image-manipulator';
import { ConcreteImageManipulator } from './concrete-manipulator';

initWebWorker(new ConcreteImageManipulator());
