/**
 * A* 算法解决八数码问题
 * 参考: https://blog.goodaudience.com/solving-8-puzzle-using-a-algorithm-7b509c331288
 * 
 * @author husiyuan
 */

class PuzzleManager {
  constructor(start, end) {
    this.start = start || [
      2, 8, 3,
      1, 6, 4,
      7, 0, 5
    ];

    this.end = end || [
      1, 2, 3,
      8, 0, 4,
      7, 6, 5
    ];

    this.size = 3;
  }

  // h(x) 估价函数
  h(state) {
    let cost = 0;

    for (let index in state) {
      let digit = state[index];
      if (digit != 0) {
        let goalIndex = this.end.indexOf(digit);

        let currentPosition = this.getXY(index);
        let goalPosition = this.getXY(goalIndex);

        // 根据上面得到的当前状态和目标状态,计算曼哈顿距离,作为代价
        cost += Math.abs(currentPosition.x - goalPosition.x) + Math.abs(currentPosition.y - goalPosition.y);
      }
    }

    return cost;
  }

  getXY(index) {
    let x = index % this.size;
    let y = Math.floor(index / this.size);

    return { x: x, y: y };
  }

  // 打印当前棋盘
  print(state) {
    let line = '';
    let count = 0;

    for (let index in state) {
      line += state[index] + ', ';

      if (count++ == this.size - 1) {
        console.log(line);
        line = '';
        count = 0;
      }
    }

    console.log('(' + this.h(state) + ')');
  }

  // 检索出下一步
  fringe(state) {
    let nextStates = [];
    let blankIndex = state.indexOf(0);
    let blankPosition = this.getXY(blankIndex);

    // 右
    if (blankIndex + 1 < this.size * this.size) {
      let tryPosition = this.getXY(blankIndex + 1);
      if (tryPosition.x > blankPosition.x) {
        let nextState = state.slice(0);

        let tmp = nextState[blankIndex];
        nextState[blankIndex] = nextState[blankIndex + 1];
        nextState[blankIndex + 1] = tmp;

        let cost = this.h(nextState);
        nextStates.push({ state: nextState, h: cost, direction: 'L' });
      }
    }

    // 左
    if (blankIndex - 1 > -1) {
      let tryPosition = this.getXY(blankIndex - 1);
      if (tryPosition.x < blankPosition.x) {
        let nextState = state.slice(0);

        let tmp = nextState[blankIndex];
        nextState[blankIndex] = nextState[blankIndex - 1];
        nextState[blankIndex - 1] = tmp;

        let cost = this.h(nextState);
        nextStates.push({ state: nextState, h: cost, direction: 'R' });
      }
    }

    // 下
    if (blankIndex + this.size < this.size * this.size) {
      let tryPosition = this.getXY(blankIndex + this.size);
      if (tryPosition.y > blankPosition.y) {
        let nextState = state.slice(0);

        let tmp = nextState[blankIndex];
        nextState[blankIndex] = nextState[blankIndex + this.size];
        nextState[blankIndex + this.size] = tmp;

        let cost = this.h(nextState);
        nextStates.push({ state: nextState, h: cost, direction: 'U' });
      }
    }

    // 上
    if (blankIndex - this.size > -1) {
      let tryPosition = this.getXY(blankIndex - this.size);
      if (tryPosition.y < blankPosition.y) {
        let nextState = state.slice(0);

        let tmp = nextState[blankIndex];
        nextState[blankIndex] = nextState[blankIndex - this.size];
        nextState[blankIndex - this.size] = tmp;

        let cost = this.h(nextState);
        nextStates.push({ state: nextState, h: cost, direction: 'D' });
      }
    }

    return nextStates;
  }

  // 是否为目标状态 h(x) = 0
  isGoal(state) {
    return (this.h(state) == 0);
  }

  boot(state) {
    let result = null;
    let visited = {};
    let currentState = { state: state, h: this.h(state) + 1, g: 0 };
    let states = [currentState]; // list of discovered states
    let count = 0;

    while (!this.isGoal(currentState.state) && count++ < 99999) {
      // 记录已经走过的状态, 避免下次重复
      visited[JSON.stringify(currentState.state)] = 1;

      currentState.children = this.fringe(currentState.state);

      for (let index in currentState.children) {
        currentState.children[index].parent = currentState;
        currentState.children[index].g = currentState.g + 1;

        if (!visited[JSON.stringify(currentState.children[index].state)]) {
          states.push(currentState.children[index]);
        }
      }

      // 根据代价(cost)排序
      states = states.sort(function (a, b) { return (a.h + a.g) - (b.h + b.g); });

      // 代价最小的走法(上面排过序了,states[0]就是最小的那个)
      currentState = states[0];

      // 从 states 中去掉, 代表已经走过
      states.shift();
    }

    if (this.isGoal(currentState.state)) {
      let moves = 0;
      let path = '';
      result = {};
      result.states = [];

      while (JSON.stringify(currentState.state) != JSON.stringify(state)) {
        result.states.unshift(currentState);
        path = currentState.direction + path;
        currentState = currentState.parent;
        moves++;
      }

      result.states.unshift({ state: state });
      result.moves = moves;
      result.path = path;
    }

    return result;
  }

  // 计算深度
  depthCount(state) {
    let nodes = [state];
    let visited = {};
    let results = {};

    while (nodes.length > 0) {
      let node = nodes.shift();

      // Make sure we haven't already visited this node from another branch.
      if (!visited[JSON.stringify(node.state)]) {
        visited[JSON.stringify(node.state)] = 1;

        if (!results[node.g]) {
          results[node.g] = 0;
        }

        results[node.g]++;

        let children = this.fringe(node.state);
        for (let index in children) {
          // Add this new node to the end of the list.
          let child = children[index];
          child.g = node.g + 1;

          nodes.push(child);
        }
      }
    }

    return results;
  }
};

const puzzleManager = new PuzzleManager();

// 跑一遍八数码
// 会将各个状态都保存下来
let result = puzzleManager.boot(puzzleManager.start);

// 打印每一步的棋盘状态
for (let i in result.states) {
  puzzleManager.print(result.states[i].state);
}

// 输出具体操作步骤
console.log('完成\n共计: ' + result.moves + ' 步');
console.log('操作步骤: ', result.path);