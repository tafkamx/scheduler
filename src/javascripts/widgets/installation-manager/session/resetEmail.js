import Widget from '../../../lib/widget/Widget';

export default class resetEmail extends Widget {
  constructor(config = {}) {
    super(config);
    this.element.setAttribute('action', this.data.url);
    this.element.querySelector('input[name=_csrf]').setAttribute('value', this.data.csrfToken);
  }

  template() {
    return `
      <div>
        <p>Please enter your new email:</p>
        <form action="" method="POST">
          <input type="hidden" name="_csrf" value="">
          <input type="text" name="email" value="">
          <input type="submit" value="Submit">
        </form>
      </div>`;
  }
}
