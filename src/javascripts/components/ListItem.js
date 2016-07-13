import Widget from '../lib/widget';

export default class ListItem extends Widget {
  constructor(config) {
    super(config);
    this._bindEvents();
  }

  _bindEvents() {
    this._handlers = {
      clickHandler: this.clickHandler.bind(this)
    };
    this.element.addEventListener('click', this._handlers.clickHandler);
  }

  clickHandler(e) {
    const target = e.target;
    if (this.active) return;
    if (target.tagName !== 'INPUT') {
      return this.dispatch('click');
    }
  }

  destroy() {
    this.element.removeEventListener('click', this._handlers.clickHandler);
    this._handlers = null;
    super.destroy();
  }
}
