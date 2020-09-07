const RENDER_TO_DOM = Symbol('render to dom');
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  append(component) {
      let range = document.createRange();
      range.setStart(this.root, this.root.childNodes.length);
      range.setEnd(this.root, this.root.childNodes.length);
      range.deleteContents();
      component[RENDER_TO_DOM](range);
    }
    [RENDER_TO_DOM](range) {
      range.deleteContents();
      range.insertNode(this.root);
    }
}

class TextWrapper {
  constructor(content) {
      this.root = document.createTextNode(content);
    }
    [RENDER_TO_DOM](range) {
      range.deleteContents();
      range.insertNode(this.root);
    }
}

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  append(component) {
      this.children.push(component);
    }
    [RENDER_TO_DOM](range) {
      this.render()[RENDER_TO_DOM](range);
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
