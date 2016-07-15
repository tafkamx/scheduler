import Widget from '../lib/widget';
import Dropdown from '../components/Dropdown';
import ListManager from '../components/ListManager';
import ListSidebar from '../components/ListSidebar';
import ListSidebarInfoBranch from '../components/ListSidebarInfoBranch';

class BranchesIndex extends Widget {
  constructor(config) {
    super(config);
    this._handlers = {};
    this._setup()._bindEvents();
    return this;
  }

  /* Register the children widgets.
   * @private
   * @return {BranchesIndex}
   */
  _setup() {
    Array.from(this.element.querySelectorAll('.Dropdown')).forEach((el, index) => {
      this.appendChild(new Dropdown({
        name: `dropdown_${index}`,
        element: el
      }));
    }, this);

    this.appendChild(new ListManager({
      name: 'listManager',
      element: this.element.querySelector('.ListWrapper'),
      data: {
        itemsData: this.data.branches
      }
    }));

    this.appendChild(new ListSidebar({
      name: 'listSidebar',
      element: this.element.querySelector('.ListSidebar'),
    })).appendChild(new ListSidebarInfoBranch({
      name: 'infoElement'
    })).render(this.listSidebar.element);

    return this;
  }

  /* Register the DOM events and/or CustomEvents it listen to.
   * @private
   * @listens {ListManager.ListItem.Click}
   */
  _bindEvents() {
    this._handlers._listManagerItemClickedHandler = this._listManagerItemClickedHandler.bind(this);
    this.listManager.bind('ListManager.ListItem.Click', this._handlers._listManagerItemClickedHandler);
  }

  /* Handles the click on ListItems.
   * @private
   * @param {Object} ev - CustomEventSupport payload.
   * @param {ListItem} ev.item - The instance of the clicked ListItem.
   */
  _listManagerItemClickedHandler(ev) {
    this.listSidebar.activate();
    this.listSidebar.infoElement.update(ev.item);
  }

  /* Cleanup.
   * @override
   */
  destroy() {
    this.listManager.unbind('ListManager.ListItem.Click', this._handlers._listManagerItemClickedHandler);
    this._handlers = null;
    super.destroy();
  }
}

window.BranchesIndex = BranchesIndex;
