import Widget from '../../../lib/widget/Widget';

export default class editEmailForm extends Widget {
  constructor(config = {}) {
    super(config);
    this.element.setAttribute('action', this.data.url);
    this.element.querySelector('input[name=_csrf]').setAttribute('value', this.data.csrfToken);
    this.element.querySelector('input[name=email]').setAttribute('value', this.data.user.email);
  }

  template() {
    return `
      <form action="" method="POST">
        <input type="hidden" name="_csrf" value="">
        <input type="hidden" name="_method" value="PUT">
        <label for="email">Email</label> <input type="text" name="email" value="">
        <input type="submit" value="Submit">
      </form>`;
  }
}
