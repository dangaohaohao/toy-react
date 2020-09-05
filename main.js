for (let i of [1, 2, 3]) {
  console.log(i);
}

function createElement(tagName, attributes, ...children) {
  let ele = document.createElement(tagName);
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      ele.setAttribute(key, attributes[key]);
    }
  }
  for (let child of children) {
    if (typeof child === 'string') {
      child = document.createTextNode(child);
    }
    ele.append(child);
  }
  return ele;
}

document.body.append(
  <div id="#root" class="root" key="root">
    <div>yuzhenliu</div>
    <span></span>
  </div>
);
