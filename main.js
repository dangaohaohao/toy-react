import { createElement, Component, render } from './toy-react';

class MyComponent extends Component {
  render() {
    return <div>
      <span>MyComponent</span>
      <div>{ this.children }</div>
    </div>
  }

}
render(
  <MyComponent id="#root" class="root" key="root">
    <div>yuzhenliu</div>
    <span></span>
  </MyComponent>, document.body
);
