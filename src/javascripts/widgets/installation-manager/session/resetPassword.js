import Widget from '../../../lib/widget/Widget';

export default class resetPassword extends Widget {
  constructor(config = {}) {
    super(config);
    this.element.setAttribute('action', this.data.url);
    this.element.querySelector('input[name=_csrf]').setAttribute('value', this.data.csrfToken);
    this.element.querySelector('input[name=token]').setAttribute('value', this.data.token);
  }

  template() {
    return `
      <div>
        <p>Please enter your new password:</p>
        <form action="" method="POST">
          <input type="hidden" name="_csrf" value="">
          <input type="hidden" name="_method" value="PUT">
          <input type="hidden" name="token" value="">
          <input type="password" name="password" value="">
          <input type="submit" value="Submit">
        </form>
      </div>`;
  }
}
