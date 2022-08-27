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
  @Input()
  set pictureData(data: string | Blob | ImageData | null) {
    this._pictureData = data;
    if (this._pictureData instanceof Blob) {
      const objurl = URL.createObjectURL(data);
      this.imgElementSrc = this.sanitizer.bypassSecurityTrustUrl(objurl);
    }
  }
  public _pictureData: string | Blob | ImageData | null = null;

  @Output()
  public readyToTransform: EventEmitter<void> = new EventEmitter<void>();

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
      this.readyToTransform.next();
    };
  }

  public async startTransform(
    transform: (data: ImageData) => Promise<ImageData>,
    progress: Observable<number>
  ): Promise<void> {
    if (this._transformedImageData == null) {
      throw new Error('No image data available for transformation.');
    }

    progress.subscribe((progress) => (this.currentProgress = progress));
    const finishedData = await transform(this._transformedImageData);
    this.canvasElement.width = finishedData.width;
    this.canvasElement.height = finishedData.height;
    this.canvasElementContext.putImageData(finishedData, 0, 0);
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
