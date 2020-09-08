const RENDER_TO_DOM = Symbol('render to dom');

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  append(component) {
    this.children.push(component);
  }

  get vdom() {
    return this.render().vdom;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this.render()[RENDER_TO_DOM](range);
  }
  rerender() {
    // 解决新老 range 为空 合并的情况
    let oldRange = this._range;

    let range = document.createRange();
    range.setStart(oldRange.startContainer, oldRange.startOffset);
    range.setEnd(oldRange.startContainer, oldRange.startOffset);
    this[RENDER_TO_DOM](range);

    oldRange.setStart(range.endContainer, range.endOffset);
    oldRange.deleteContents();
  }
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState;
      this.rerender();
      return;
    }

    // 深拷贝
    const merge = (oldState, newState) => {
      for (const key in newState) {
        if (newState.hasOwnProperty(key)) {
          if (oldState[key] === null || typeof oldState[key] !== 'object') {
            oldState[key] = newState[key];
          } else {
            merge(oldState[key], newState[key]);
          }
        }
      }
    }

    merge(this.state, newState);
    this.rerender();
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super();
    this.type = type;
    this.root = document.createElement(type);
  }
  // 必须要调用 Component 里面的 appendChild 和 setAttribute 才会有 children 和 props
  // setAttribute(name, value) {
  //   // 监听事件
  //   if (name.match(/^on([\s\S]+)$/)) {
  //     this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
  //   } else if (name === 'className') {
  //     this.root.setAttribute('class', value);
  //   } else {
  //     this.root.setAttribute(name, value);
  //   }
  // }
  // append(component) {
  //   let range = document.createRange();
  //   range.setStart(this.root, this.root.childNodes.length);
  //   range.setEnd(this.root, this.root.childNodes.length);
  //   range.deleteContents();
  //   component[RENDER_TO_DOM](range);
  // }

  get vdom() {
    return {
      type: this.type,
      props: this.props,
      children: this.children.map(child => child.vdom)
    }
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super();
    this.content = content;
    this.root = document.createTextNode(content);
  }

  get vdom() {
    return {
      type: '#text',
      content: this.content
    }
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export function createElement(type, attributes, ...children) {
  let ele;
  if (typeof type === 'string') {
    // 说明是原生标签
    ele = new ElementWrapper(type);
  } else {
    // 自定义组件
    ele = new type;
  }

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      ele.setAttribute(key, attributes[key]);
    }
  }

  const insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      }
      if (child === null) {
        continue
      }
      if (typeof child === 'object' && (child instanceof Array)) {
        insertChildren(child);
      } else {
        ele.append(child);
      }
    }
  }

  insertChildren(children);

  return ele;
}

export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}
