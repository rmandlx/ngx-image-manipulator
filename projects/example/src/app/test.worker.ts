/// <reference lib="webworker" />

import { initWebWorker } from 'image-manipulator';
import { ConcreteImageManipulator } from './concrete-manipulator';

initWebWorker(new ConcreteImageManipulator());
