class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  append(component) {
    this.root.appendChild(component.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
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
  get root() {
    if (!this._root) {
      this._root = this.render().root;
    }
    return this._root;
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

export function render(component, parentNode) {
  parentNode.appendChild(component.root);
}
