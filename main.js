import { createElement, Component, render } from './toy-react';

class MyComponent extends Component {
  constructor() {
    super();
    this.state = {
      name: 'yuzhenliu163'
    }
  }
  render() {
    return (
      <div>
      <span>MyComponent</span>
      <div>{ this.children }</div>
      <span>{this.state.name}</span>
    </div>
    )
  }

}
render(
  <MyComponent id="#root" class="root" key="root">
    <div>yuzhenliu</div>
  </MyComponent>, document.body
);
