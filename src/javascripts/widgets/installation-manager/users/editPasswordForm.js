import Widget from '../../../lib/widget/Widget';

export default class editPasswordForm extends Widget {
  constructor(config = {}) {
    super(config);
    this.element.setAttribute('action', this.data.url);
    this.element.querySelector('input[name=_csrf]').setAttribute('value', this.data.csrfToken);
  }

  template() {
    return `
      <form action="" method="POST">
        <input type="hidden" name="_csrf" value="">
        <input type="hidden" name="_method" value="PUT">
        <label for="password">Password</label> <input type="password" name="password" value="">
        <input type="submit" value="Submit">
      </form>`;
  }
}
