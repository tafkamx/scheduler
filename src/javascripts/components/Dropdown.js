import Widget from '../lib/widget';
import KEYCODES from '../constants/keycodes';

export default class Dropdown extends Widget {
  static _createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'Dropdown__backdrop';
    document.body.appendChild(backdrop);

    Dropdown.backdrop = backdrop;
    Dropdown.backdrop.addEventListener('click', Dropdown.backdropClickHandler);
    Dropdown.backdropCreated = true;
  }

  static backdropClickHandler() {
    Dropdown.activeDropdown.deactivate();
  }

  static keyUpHandler(ev) {
    if (ev.which === KEYCODES.ESC) {
      ev.preventDefault();
      Dropdown.activeDropdown.deactivate();
    }
  }

  constructor(config) {
    super(config);
    this._handlers = {};
    this._cacheElements()._bindEvents();

    if (Dropdown.backdropCreated === false) {
      Dropdown._createBackdrop();
    }
  }

  _cacheElements() {
    this.headElement = this.element.querySelector('.Dropdown__head');
    this.bodyElement = this.element.querySelector('.Dropdown__body');
    return this;
  }

  _bindEvents() {
    this._handlers.clickHandler = this.clickHandler.bind(this);
    this.headElement.addEventListener('click', this._handlers.clickHandler);
  }

  clickHandler() {
    if (this.active) this.deactivate();
    else this.activate();
  }

  activate() {
    super.activate();
    this.bodyElement.setAttribute('aria-hidden', !this.active);
    Dropdown.backdrop.classList.add('active');
    Dropdown.activeDropdown = this;

    document.addEventListener('keyup', Dropdown.keyUpHandler);
  }

  deactivate() {
    super.deactivate();
    this.bodyElement.setAttribute('aria-hidden', !this.active);
    Dropdown.backdrop.classList.remove('active');
    Dropdown.activeDropdown = null;

    document.removeEventListener('keyup', Dropdown.keyUpHandler);
  }

  destroy() {
    this.headElement.removeEventListener('click', this._handlers.clickHandler);
    this._handlers = null;
    super.destroy();
  }
}

Dropdown.backdropCreated = false;
Dropdown.activeDropdown = null;
