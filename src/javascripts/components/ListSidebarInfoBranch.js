import Widget from '../lib/widget';
import Dropdown from './Dropdown';

export default class ListSidebarInfoBranch extends Widget {
  constructor(config) {
    super(config);
    this._setup();
  }

  _setup() {
    this.appendChild(new Dropdown({
      name: 'dropdownDeactivate',
      element: this.element.querySelector('.Dropdown')
    }));
  }

  template() {
    return `
      <div class="ListSidebar__info">
        <div class="ListSidebar__info-header border-bottom px3 py2">
          <div class="flex items-center">
            <div class="ListSidebar__info-header-title flex-auto -font-light -ttc">{{Default}}</div>
            <div class="Dropdown -right">
              <button class="Dropdown__head" aria-haspopup="true">
                <svg class="-s16 align-top">
                  <use xlink:href="#svg-nav-more-vert"></use>
                </svg>
              </button>
              <ul class="Dropdown__body" aria-hidden="true" aria-label="submenu">
                <li class="Dropdown__item--button">
                  <button>Deactivate</button>
                </li>
              </ul>
            </div>
          </div>
          <div class="-font-light -gray">{{http://new-york.empathia-academy.patos.com}}</div>
        </div>
        <div class="ListSidebar__info-body px3">
          <div class="flex py3">
            <div>
              <img width="60" height="60" class="align-top rounded" src="/images/temporal/useravatar.png"/>
            </div>
            <div class="flex-auto pl2">
              <div class="-font-light -gray">Managed by</div>
              <div class="-font-17">{{John Doe}}</div>
              <div class="-font-light">{{john-doe@empathia.academy}}</div>
            </div>
          </div>
          <div class="-ttu -ls1 -gray">Generated income in the last 30 days:</div>
          <div class="-font-26 -font-light mb2">{{$2,873.5}}</div>
          <div class="-ttu -ls1 -gray">Total generated income since dec 2014:</div>
          <div class="-font-26 -font-light mb2">{{$33,645.70}}</div>
          <canvas class="ListSidebar__info-canvas mb2"></canvas>
          <div class="ListSidebar__info-footer flex pt2 pb3 border-top">
            <a class="js-btn-login Button -md --primary -font-medium -ttu flex-auto mx1">Log into branch</a>
            <a class="js-btn-edit Button -md --default -font-medium -ttu flex-auto mx1">Edit branch info</a>
          </div>
        </div>
      </div>`;
  }

  update(widget) {
    if (this.active === false) {
      this.activate();
    }

    this.element.querySelector('.ListSidebar__info-header-title').textContent = widget.data.name;
    this.element.querySelector('.js-btn-login').setAttribute('href', widget.element.dataset.loginUrl);
    this.element.querySelector('.js-btn-edit').setAttribute('href', widget.element.dataset.editUrl);

    this._updateCanvas();
  }

  _updateCanvas() {
    function getRandomIntInclusive(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function normalize(value, minx, maxx, min, max) {
      var a = (maxx-minx)/(max-min);
      var b = maxx - a * max;
      return a * value + b;
    }

    const ctx = this.element.querySelector('.ListSidebar__info-canvas').getContext('2d');
    const W = ctx.canvas.width = ctx.canvas.offsetWidth;
    const H = ctx.canvas.height = ctx.canvas.offsetHeight;
    const total_points = getRandomIntInclusive(4, 40);
    const spread = (W / (total_points - 1));
    let points = [];
    let normalized_points = [];

    for (let i = 0; i < total_points; i++) {
      points.push(getRandomIntInclusive(10, 300));
    }

    const MAX = Math.max.apply(null, points);
    const MIN = Math.min.apply(null, points);

    points.forEach(function(point) {
      normalized_points.push(normalize(point, 0, H, MIN, MAX));
    });

    ctx.beginPath();
    normalized_points.forEach((p, index) => {
      if (index === 0) {
        ctx.moveTo(spread * index, p);
      }
      ctx.lineTo(spread * index, p);
    });
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d4e3fc';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
  }
}
