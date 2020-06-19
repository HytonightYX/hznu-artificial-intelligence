let opt;
let layout;
let cy;
let output;
let input;
let pattern = '\((\\s)*(\\d)+,(\\s)*(\\d)+,(\\s)*(\\d)+\)';
let regex = new RegExp(pattern, 'g');
let tsp;
let undirected;

if (typeof (String.prototype.trim) === "undefined") {
  String.prototype.trim = function () {
    return String(this).replace(/^\s+|\s+$/g, '');
  };
}

function include(arr, obj) {
  let index = -1;
  for (let i = 0; i < arr.length; ++i) {
    if (arr[i].equals(obj)) {
      index = i;
      break;
    }
  }
  return index != -1;
}

function createArray2D(x, y) {
  let tab = new Array(x);
  for (let i = 0; i < x; ++i) {
    tab[i] = new Array(y);
    for (let j = 0; j < y; ++j) {
      tab[i][j] = 0;
    }
  }
  return tab;
}

function exp() {
  let option = {
    full: true
  };
  let img = cy.png(option);
  let win = window.open(img, '_blank');
  win.focus();
  console.log(img);
}

layout = {
  name: 'circle',
  fit: true,
  ready: undefined,
  stop: undefined,
  rStepSize: 10,
  padding: 30,
  startAngle: 1.1 * Math.PI,
  counterclockwise: false
};


opt = {
  minZoom: 0.5,
  maxZoom: 2,
  name: 'circle',
  fit: true,
  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(name)',
        'font-family': 'helvetica',
        'font-size': 14,
        'text-outline-width': 3,
        'text-outline-color': '#888',
        'text-valign': 'center',
        'color': '#fff',
        'width': 'mapData(weight, 30, 80, 20, 50)',
        'height': 'mapData(height, 0, 200, 10, 45)',
        'border-color': '#fff'
      }
    },

    {
      selector: ':selected',
      css: {
        'background-color': '#000',
        'line-color': '#000',
        'target-arrow-color': '#000',
        'text-outline-color': '#000'
      }
    },

    {
      selector: 'edge',
      css: {
        'width': 2,
        'target-arrow-shape': 'triangle'
      }
    }
  ],

  ready: function () { }
};

function Graph() {
  this.nodes = new Array();
  this.edges = new Array();
  this.costs = {};
}

Graph.prototype.updateCosts = function () {
  this.costs = {};
  for (let i = 0; i < this.nodes.length; ++i) {
    let node = this.nodes[i];
    this.costs[node.id] = {};
  }
  for (let i = 0; i < this.edges.length; ++i) {
    let edge = this.edges[i];
    let s = edge.source;
    let d = edge.destination;
    let c = edge.cost;
    this.costs[s][d] = c;
  }

  this.syncHTMLTable();
};

Graph.prototype.clearHTMLCostsTable = function () {
  let table = document.getElementById("costs");
  while (table.rows.length > 0) {
    table.deleteRow(0);
  }
  return table;
};

Graph.prototype.syncHTMLTable = function () {
  this.syncCostTable();
  this.syncPheromoneTable();
};

Graph.prototype.syncPheromoneTable = function () {

};

Graph.prototype.syncCostTable = function () {
  let table = this.clearHTMLCostsTable();
  let n = this.nodes.length;
  let r = table.insertRow(0);
  r.insertCell("#");
  for (let i = 0; i < n; ++i) {
    let c = r.insertCell(r.cells.length);
    c.innerHTML = "<b>" + this.nodes[i].id + "</b";
  }

  for (let i = 1; i <= n; ++i) {
    let r = table.insertRow(table.rows.length);
    let c = r.insertCell(0);
    c.innerHTML = "<b>" + this.nodes[i - 1].id + "</b>";
    for (let j = 1; j <= n; ++j) {
      let c = r.insertCell(r.cells.length);
      let cost = this.costs[i][j];
      if (cost)
        c.innerHTML = cost;
      else
        c.innerHTML = "-";
    }
  }
};

Graph.prototype.getCost = function (s, d) {
  try {
    return this.costs[s][d];
  } catch (err) {
    return null;
  }
};

Graph.prototype.getNode = function (id) {
  for (let i = 0; i < this.nodes.length; ++i) {
    let node = this.nodes[i];
    if (node.id == id) {
      return node;
    }
  }
  return null;
};

Graph.prototype.addNode = function (id, value) {
  let node = new Node(id, value);
  let alreadyPresent = include(this.nodes, node);
  if (!alreadyPresent)
    this.nodes[this.nodes.length] = node;
};

Graph.prototype.addEdge = function (source, destination, value) {
  let sourceAlreadyPresent = include(this.nodes, source);
  let destAlreadyPresent = include(this.nodes, destination);
  if (!sourceAlreadyPresent) {
    this.addNode(source);
  }

  if (!destAlreadyPresent) {
    this.addNode(destination);
  }
  this.edges[this.edges.length] = new Edge(source, destination, value);
};

Graph.prototype.neighborhood = function (id) {
  let n = new Array();
  for (let i = 0; i < this.edges.length; ++i) {
    let edge = this.edges[i];
    if (!edge.visited && edge.source == id) {
      n[n.length] = edge;
    }
  }
  return n;
};

Graph.prototype.print = function () {
  console.log("Nodes(id, value):");
  n = "";
  for (let i = 0; i < this.nodes.length; ++i) {
    n += this.nodes[i].toString() + " ";
  }
  console.log(n + "\nEdges(s, d, value):");
  e = "";
  for (let i = 0; i < this.edges.length; ++i) {
    e += this.edges[i].toString() + " ";
  }
  console.log(e);
};

Graph.prototype.draw = function () {
  opt.elements = {
    nodes: [],
    edges: [],
  };
  for (let i = 0; i < this.nodes.length; ++i) {
    let node = this.nodes[i];
    opt.elements.nodes.push({ data: { id: node.id, name: node.id, weight: 70, height: 180 } });
  }
  for (let i = 0; i < this.edges.length; ++i) {
    let edge = this.edges[i];
    if (undirected)
      ++i;
    opt.elements.edges.push({ data: { source: edge.source, target: edge.destination } });
  }

  cy = cytoscape(options = opt);
  cy.layout(layout);
};

Graph.prototype.visited = function (nodeId) {
  for (let i = 0; i < this.edges.length; ++i) {
    let e = this.edges[i];
    let s = e.source;
    let d = e.destination;
    if (d == nodeId) {
      e.visited = true;
    }
  }
};

Graph.prototype.unvisit = function () {
  for (let i = 0; i < this.nodes.length; ++i) {
    this.nodes[i].visited = false;
  }

  for (let i = 0; i < this.edges.length; ++i) {
    this.edges[i].visited = false;
  }
};

function Node(id, value) {
  this.id = id;
  this.value = value;
  this.visited = false;
}

Node.prototype.equals = function (y) {
  return this.id == y.id && this.value == y.value;
};

Node.prototype.toString = function () {
  return "(" + this.id + ", " + this.value + ")";
};

function Edge(source, destination, cost) {
  this.source = source;
  this.destination = destination;
  this.cost = cost;
  this.pheromone = 1;
  this.visited = false;
}

Edge.prototype.equals = function (y) {
  return (this.source == y.source
    && this.destination == y.destination
    && this.cost == y.cost);
};

Edge.prototype.toString = function () {
  return "(" + this.source + ", " + this.destination + ", " + this.cost + " - " + this.visited + ")";
};

function TSPACS(graph) {
  this.alpha = 1;
  this.beta = 5;
  this.ants = 1;
  this.evaporationRate = 0.5;
  this.graph = graph;
  this.graph.updateCosts();
  this.costs = this.graph.costs;
  let n = this.graph.nodes.length;
  this.pheromones = createArray2D(n, n);
}

TSPACS.prototype.getDrawedEdge = function (source, destination) {
  let edges = cy.edges();
  for (let i = 0; i < edges.length; ++i) {
    let edge = edges[i];
    if (undirected && (edge.source().id() == source && edge.target().id() == destination || edge.source().id() == destination && edge.target().id() == source))
      return edge;
    else if (edge.source().id() == source && edge.target().id() == destination)
      return edge;
  }
  return null;
};

TSPACS.prototype.selectDrawedEdge = function (source, destination) {
  let edge = this.getDrawedEdge(source, destination);
  edge.select();
};

TSPACS.prototype.unselectDrawedEdge = function (source, destination) {
  let edge = this.getDrawedEdge(source, destination);
  edge.unselect();
};

TSPACS.prototype.getDrawedNode = function (id) {
  let nodes = cy.nodes();
  for (let i = 0; i < nodes.length; ++i) {
    let node = nodes[i];
    if (node.id() == id)
      return node;
  }
  return null;
};

TSPACS.prototype.selectDrawedNode = function (id) {
  let node = this.getDrawedNode(id);
  node.select();
};

TSPACS.prototype.unSelectDrawedNode = function (id) {
  let node = this.getDrawedNode(id);
  node.unselect();
};

TSPACS.prototype.actionChoiceRule = function (source) {

};

TSPACS.prototype.updatePheromones = function () {

};

TSPACS.prototype.printTab = function (tab) {
  let s = "  ";
  for (let i = 0; i < tab.length; ++i) {
    s += this.graph.nodes[i].id + " ";
  }
  s += "\n";
  for (let i = 0; i < tab.length; ++i) {
    s += this.graph.nodes[i].id + " ";
    for (let j = 0; j < tab[0].length; ++j) {
      s += tab[i][j] + " ";
    }
    s += "\n";
  }
  console.log(s);
};

TSPACS.prototype.printCosts = function () {
  this.printTab(this.costs);
};

TSPACS.prototype.printPheromones = function () {
  this.printTab(this.pheromones);
};

TSPACS.prototype.getPij = function (neighborhood) {
  let pijs = new Array(neighborhood.length);
  let denom = 0;
  for (let i = 0; i < neighborhood.length; ++i) {
    let edge = neighborhood[i];
    let a = Math.pow(edge.pheromone, this.alpha);
    let b = Math.pow((1 / edge.cost), this.beta);
    denom += (a * b);
  }

  for (let i = 0; i < neighborhood.length; ++i) {
    let edge = neighborhood[i];
    let num = (Math.pow(edge.pheromone, this.beta) * Math.pow((1 / edge.cost), this.beta));
    pijs[i] = num / denom;
  }

  return pijs;
};

TSPACS.prototype.unselect = function () {
  let nodes = cy.nodes();
  let edges = cy.edges();

  for (let i = 0; i < nodes.length; ++i) {
    nodes[i].unselect();
  }

  for (let i = 0; i < edges.length; ++i) {
    edges[i].unselect();
  }
};

TSPACS.prototype.step = function () {
  this.unselect();
  let iteration = 0;
  let startNodeId = Math.floor(Math.random() * this.graph.nodes.length);
  let startNode = this.graph.nodes[startNodeId];
  this.graph.visited(startNode.id);
  let path = new Array();
  path.push(startNode.id);
  this.selectDrawedNode(startNode.id);
  let neighborhood = this.graph.neighborhood(startNode.id);
  while (iteration < this.graph.nodes.length && neighborhood.length != 0) {
    let pijs = this.getPij(neighborhood);
    let rand = Math.random();
    let nextId = pijs.length - 1;
    for (let i = 0; i < pijs.length; ++i) {
      if (pijs[i] > rand) {
        nextId = i;
        break;
      }
    }
    let next = neighborhood[nextId].destination;
    path.push(next);
    this.selectDrawedNode(next);
    this.selectDrawedEdge(neighborhood[nextId].source, neighborhood[nextId].destination);
    neighborhood = this.graph.neighborhood(next);
    this.graph.visited(next);
    iteration++;
  }
  this.selectDrawedEdge(path[0], path[path.length - 1]);
  this.graph.unvisit();
  console.log(path);
};

function init() {
  output = document.getElementById("out");
  input = document.getElementById("in");
  document.getElementById("undirected").checked = true;
  undirected = document.getElementById("undirected").checked;
  input.value = "(1,2,7)(1,3,8)(1,4,10)(1,5,8)(2,3,10)(2,4,14)(2,5,13)(3,4,9)(3,5,15)(4,5,7)";
  opt.container = document.getElementById('cy');
  tsp = new TSPACS(new Graph());
  validate();
}

function validate() {
  undirected = document.getElementById("undirected").checked;
  if (undirected)
    opt.style[2].css['target-arrow-shape'] = "";
  else
    opt.style[2].css['target-arrow-shape'] = "triangle";
  let graph = parse(input.value);
  graph.draw();
  tsp = new TSPACS(graph);
}

function next() {
  tsp.step();
}

function parse(text) {
  let graph = new Graph();
  let item;
  while ((item = regex.exec(text)) != null) {
    let numbers = item[0].split(',');
    if (numbers.length == 3) {
      let s = numbers[0].trim();
      let d = numbers[1].trim();
      let v = numbers[2].trim();
      graph.addEdge(s, d, v);
      if (undirected)
        graph.addEdge(d, s, v);
    }
  }
  graph.updateCosts();
  return graph;
}

window.onload = init;
