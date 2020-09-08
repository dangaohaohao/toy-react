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
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }

  update() {

    const isSameNode = (oldNode, newNode) => {

      // 新旧节点 type 不一致
      if (oldNode.type !== newNode.type) return false;

      // 新旧节点 props 值不一致
      for (const key in newNode.props) {
        if (newNode.props.hasOwnProperty(key)) {
          if (oldNode.props[key] !== newNode.props[key]) {
            return false;
          }
        }
      }

      // 旧节点属性比新节点多
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) return false;

      // 文本节点对比 content
      if (newNode.type === '#text') {
        if (newNode.content !== oldNode.content) {
          return false
        }
      }

      return true;
    }

    // 对比新旧 vdom 树, 递归遍历
    const update = (oldNode, newNode) => {
      // types, props(props 是可以通过打patch方式，但是这里简化操作), children
      // #text content(也可以通过打patch, 这里简化)

      // 节点不一致，全部替换
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return
      }

      newNode._range = oldNode._range;

      const oldChildren = oldNode.vchildren;
      const newChildren = newNode.vchildren;

      if (!newChildren || !newChildren.length) {
        return
      }

      let tailRange = oldChildren[oldChildren.length - 1]._range;

      for (let i = 0, len = newChildren.length; i < len; i++) {
        let oldChild = oldChildren[i];
        let newChild = newChildren[i];
        // newNode 的 vchildren.length 可能 大于/小于 oldNode 的 vchildren.length
        if (i < oldChildren.length) {
          update(oldChild, newChild);
        } else {
          const range = document.createRange();

          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);

          newChild[RENDER_TO_DOM](range);

          tailRange = range;
        }
      }

    }
    let vdom = this.vdom
    update(this._vdom, vdom);
    this._vdom = vdom;
  }
  // 不再是重新渲染，而是更新
  // rerender() {
  //   // 解决新老 range 为空 合并的情况
  //   let oldRange = this._range;

  //   let range = document.createRange();
  //   range.setStart(oldRange.startContainer, oldRange.startOffset);
  //   range.setEnd(oldRange.startContainer, oldRange.startOffset);
  //   this[RENDER_TO_DOM](range);

  //   oldRange.setStart(range.endContainer, range.endOffset);
  //   oldRange.deleteContents();
  // }
  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState;
      this.rerender();
      // this.update();
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
    // this.rerender();
    this.update();
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type);
    this.type = type;
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
    this.vchildren = this.children.map(child => child.vdom);
    return this;
    // return {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map(child => child.vdom)
    // }
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

    let root = document.createElement(this.type);

    for (const key in this.props) {
      const value = this.props[key];
      if (key.match(/^on([\s\S]+)$/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
      } else if (key === 'className') {
        root.setAttribute('class', value);
      } else {
        root.setAttribute(key, value);
      }
    }

    // 防止上来就 [RENDER_TO_DOM]，没有取过 vdom
    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom);
    }

    for (const child of this.vchildren) {
      const childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      childRange.deleteContents();
      child[RENDER_TO_DOM](childRange);
    }

    replaceContent(range, root);
  }

}

class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.type = '#text';
    this.content = content;
  }

  get vdom() {
    return this;
    // return {
    //   type: '#text',
    //   content: this.content
    // }
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    const root = document.createTextNode(this.content);
    replaceContent(range, root);
  }
}

// 防止多删
function replaceContent(range, node) {
  // 插入 node
  range.insertNode(node);

  // 移到 node 之后删除内容
  range.setStartAfter(node);
  range.deleteContents();

  // 纠正 range 范围
  range.setStartBefore(node);
  range.setEndAfter(node);
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
