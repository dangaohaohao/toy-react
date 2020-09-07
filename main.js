import { createElement, Component, render } from './toy-react';

class MyComponent extends Component {
  constructor() {
    super();
    this.state = {
      name: 'yuzhenliu163',
      num: 1,
      num1: 3,
    }
  }
  render() {
    return (
      <div>
      <span>MyComponent</span>
      {/* <div>{ this.children }</div> */}
      <div>{this.state.num.toString()}</div>
      <div>{this.state.num1.toString()}</div>
      <button onClick={() => {this.setState({
        num: this.state.num + 1
      })}}>add</button>
    </div>
    )
  }

}
render(
  <MyComponent id="#root" class="root" key="root">
    <div>yuzhenliu</div>
  </MyComponent>, document.body
);
