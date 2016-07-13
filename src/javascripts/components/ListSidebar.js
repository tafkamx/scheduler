import Widget from '../lib/widget';

export default class ListSidebar extends Widget {
  constructor(config) {
    super(config);
    this._cacheElements();
  }

  _cacheElements() {
    const emptyElement = this.element.querySelector('.ListSidebar__empty');
    if (emptyElement) this.emptyElement = emptyElement;
  }

  update(widget) {
    if (this.active === false) this.activate();
    this.infoElement.update(widget);
  }
}
