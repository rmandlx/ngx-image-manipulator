import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-image-manipulator',
  templateUrl: './image-manipulator.component.html',
  styleUrls: ['./image-manipulator.component.css'],
})
export class ImageManipulatorComponent implements AfterViewInit {
  /**
   * The given data can be a base64 string, a Blob/File or ImageData.
   * In all cases you should wait with starting the transform, until the readyToTransform Event has
   * emitted true, which means that the internal conversion of the input data to ImageData is finished.
   * Important: This method is not safe from XSS Injection. You should not pass untrusted strings to this method!
   */
  @Input()
  set pictureData(data: string | Blob | ImageData | null) {
    this._pictureData = data;
    this._transformedImageData = null;
    this.readyToTransform.next(false);

    // In the cases of Blob and Base64 string a HTML IMG element is used for conversion to ImageData
    // We set the imgElementSrc to given data and in the onload event of the HTML IMG element we draw the HTML IMG element to a canvas
    // From the canvas we can then retrieve the ImageData
    if (this._pictureData == null) {
      // Do nothing
      return;
    } else if (this._pictureData instanceof Blob) {
      //TODO: Cleanup objurl!
      const objurl = URL.createObjectURL(data);
      this.imgElementSrc = this.sanitizer.bypassSecurityTrustUrl(objurl);
    } else if (typeof this._pictureData === 'string') {
      if (this._pictureData.includes(';base64')) {
        this.imgElementSrc = this.sanitizer.bypassSecurityTrustUrl(
          this._pictureData
        );
      } else {
        //prepend the necessary metadata to the string
        this.imgElementSrc = this.sanitizer.bypassSecurityTrustUrl(
          'data:image;base64,' + this._pictureData
        );
      }
    } else if (this._pictureData instanceof ImageData) {
      // If we already get correct ImageData, we just set it here
      this._transformedImageData = this._pictureData;
      this.readyToTransform.next(true);
    }
  }

  @Input()
  public hide: boolean = true;

  @Output()
  public readyToTransform: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  public finishedTransform: EventEmitter<ImageData> = new EventEmitter<ImageData>();

  public _pictureData: string | Blob | ImageData | null = null;
  public imgElementSrc: string | SafeUrl = '';
  public _transformedImageData: ImageData | null = null;

  @ViewChild('imgElement')
  public _imageElement: ElementRef<HTMLImageElement> | null = null;
  @ViewChild('canvasHelper')
  public _canvasHelper: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('canvasElement')
  public _canvasElement: ElementRef<HTMLCanvasElement> | null = null;

  private currentProgress: number = 0;

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    if (this._imageElement == null) {
      throw new Error('Img Element was not loaded');
    }

    //
    this._imageElement.nativeElement.onload = () => {
      this.canvasHelper.width = this.imageElement.width;
      this.canvasHelper.height = this.imageElement.height;
      this.canvasHelperContext.drawImage(this.imageElement, 0, 0);
      this._transformedImageData = this.canvasHelperContext.getImageData(
        0,
        0,
        this.canvasHelper.width,
        this.canvasHelper.height
      );
      this.readyToTransform.next(true);
    };
  }

  public async startTransform(
    transform: (data: ImageData) => Promise<ImageData>,
    progress: Observable<number>
  ): Promise<void> {
    if (this._transformedImageData == null) {
      throw new Error('No image data available for transformation.');
    }

    this.currentProgress = 0;
    const subscription = progress.subscribe(
      (progress) => (this.currentProgress = progress)
    );
    const finishedData = await transform(this._transformedImageData);
    this.canvasElement.width = finishedData.width;
    this.canvasElement.height = finishedData.height;
    this.canvasElementContext.putImageData(finishedData, 0, 0);
    this.finishedTransform.next(finishedData);
    subscription.unsubscribe();
  }

  public getCurrentProgress(): number {
    return this.currentProgress;
  }

  private get canvasElement(): HTMLCanvasElement {
    if (this._canvasElement == null) {
      throw new Error('Could not retrieve Canvas Helper.');
    }
    return this._canvasElement.nativeElement;
  }

  private get canvasElementContext(): CanvasRenderingContext2D {
    const context = this.canvasElement.getContext('2d');
    if (context == null) {
      throw new Error('Could not retrieve Canvas Helper Context.');
    }
    return context;
  }

  private get canvasHelper(): HTMLCanvasElement {
    if (this._canvasHelper == null) {
      throw new Error('Could not retrieve Canvas Helper Context');
    }
    return this._canvasHelper.nativeElement;
  }

  private get canvasHelperContext(): CanvasRenderingContext2D {
    const context = this.canvasHelper.getContext('2d');
    if (context == null) {
      throw new Error('Could not retrieve Canvas Helper Context.');
    }
    return context;
  }

  private get imageElement(): HTMLImageElement {
    if (this._imageElement == null) {
      throw new Error('Could not retrieve Image Helper.');
    }
    return this._imageElement.nativeElement;
  }
}
