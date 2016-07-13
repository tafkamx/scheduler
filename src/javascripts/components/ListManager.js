import Widget from '../lib/widget';
import ListItem from './ListItem';

export default class ListManager extends Widget {
  constructor(config) {
    super(config);
    this._itemsCounter = 0;
    this._handlers = {
      _itemClickHandler: this._itemClickHandler.bind(this)
    };
    Array.from(this.element.querySelectorAll('.ListItem')).forEach((el, index) => {
      this.registerItem.call(this, el, this.data.itemsData[index]);
    }, this);
  }

  /* Register a new ListItem.
   * @public
   * @param {HTMLElement} el - the ListItem DOM element.
   * @param {Object} data - ListItem data
   * @return {ListItem}
   */
  registerItem(el, data) {
    let options = {
      name: `item_${this._itemsCounter++}`
    };

    if (el instanceof HTMLElement) options.element = el;
    if (data) options.data = data;

    const item = new ListItem(options);
    this.appendChild(item).bind('click', this._handlers._itemClickHandler);

    return item;
  }

  _itemClickHandler(ev) {
    if (ev.target.active) return;

    this.children.forEach(el => {
      el.deactivate();
    });

    ev.target.activate();

    this.dispatch('itemClicked', {
      item: ev.target
    });
  }
}
