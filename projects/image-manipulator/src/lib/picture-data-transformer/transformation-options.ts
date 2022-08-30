export class TransformationOptions {
  private resize: { pixelsX: number; pixelsY: number } | null;
  private inputData: Blob | ImageData | string | null;
  private outputFormat: 'blob' | 'imageData' | 'base64';

  private changed = true;
  constructor(data: {
    resize: { pixelsX: number; pixelsY: number } | null;
    inputData: Blob | ImageData | string | null;
    outputFormat: 'blob' | 'imageData' | 'base64';
  }) {
    this.resize = data.resize;
    this.inputData = data.inputData;
    this.outputFormat = data.outputFormat;
  }

  public isComplete(): boolean {
    return this.inputData != null;
  }

  public hasChanged(): boolean {
    const hasChanged = this.changed;
    this.changed = false;
    return hasChanged;
  }

  public getResize() {
    return this.resize;
  }
  public getInputData() {
    return this.inputData;
  }
  public getInputDataSafe(): Blob | ImageData | string {
    if (this.inputData == null) {
      throw new Error('Fehler beim Abrufen der Bilddaten.');
    }
    return this.inputData;
  }
  public getOutputFormat() {
    return this.outputFormat;
  }

  public setResize(r: TransformationOptions['resize']) {
    this.resize = r;
    this.changed = true;
  }

  public setInputData(i: TransformationOptions['inputData']) {
    this.inputData = i;
    this.changed = true;
  }

  public setOutputFormat(of: TransformationOptions['outputFormat']) {
    this.outputFormat = of;
    this.changed = true;
  }
}
