var registry: { [name: string]: string } = {};

export default registry;

export function register(name: string, value: string): any {
  return function (target: any) {
    console.log('Applied decorator: ' + JSON.stringify(target));
    registry[name] = value;
  };
}

export function retrieve(): { [name: string]: string } {
  return registry;
}
