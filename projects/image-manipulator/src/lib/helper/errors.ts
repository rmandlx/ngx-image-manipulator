export class TransformationCancelledError extends Error {
  constructor(message: string, public readonly progress: number) {
    super(message);
  }
}
