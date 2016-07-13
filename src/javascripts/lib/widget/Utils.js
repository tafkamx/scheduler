import Widget from './';

export function mix(...modules) {
  let desc;
  let _Mix = class {};

  //if extending Widget
  if (modules.filter((module) => module.name === 'Widget').length) {
    modules.splice(modules.indexOf(Widget), 1);
    _Mix = class extends Widget {};
  }

  modules.map(module => {
    Object.getOwnPropertyNames(module.prototype).map(key => {
      if (key !== 'constructor' && key !== 'name') {
        desc = Object.getOwnPropertyDescriptor(module.prototype, key);
        Object.defineProperty(_Mix.prototype, key, desc);
      }
    });
  });

  return _Mix;
}
