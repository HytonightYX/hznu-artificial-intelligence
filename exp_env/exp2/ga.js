// 服务器节点(下标代表服务器, 值代表服务器处理任务的速度)
let SERVER_LIST = [1, 2, 3];
// 任务列表(下标代表任务, 值代表任务执行时长)
let TASK_LIST = [2, 4, 8, 13, 5, 2];
// 染色体复制比例
let COPY_RATE = 0.2;

/**
 * 初始化染色体(即可行方案)
 * @returns 生成的染色体数量, 即chromosomeMatrix的长度
 */
function initChromosome(num) {
  let chromosomeMatrix = [];
  let task_len = TASK_LIST.length;
  let server_len = SERVER_LIST.length;
  let copy_servers = [];
  Object.assign(copy_servers, SERVER_LIST);
  // 随机分配任务给任意的服务器
  for (let c = 0; c < num; c++) {
    // 染色体, 下标代表任务编号
    let chromosome = [];

    copy_servers.sort(randomSort);
    for (let i = 0; i < task_len; i++) {
      chromosome.push(randomInt(0, server_len - 1));
    }
    chromosomeMatrix.push(chromosome);
  }
  return chromosomeMatrix;
}


/**
 * 计算每条染色体的适应度(由最终执行的时长决定, 执行的时长越长, 适应度越低)
 * @param chromosomeMatrix 染色体矩阵
 * @returns 适应读度矩阵
 */
function calAdaptability(chromosomeMatrix) {
  let adaptabilityMatrix = [];
  let tasksTotalDuration = sum(TASK_LIST);
  // 遍历矩阵，计算出每条染色体执行任务的最终时长
  for (let i = 0; i < chromosomeMatrix.length; i++) {
    // 下标代表任务编号, 值代表服务器编号
    let chromosome = chromosomeMatrix[i];
    let maxDuration = 0;
    // 建立一个数组, 用来保存每个服务器执行任务的总时长, 因为同个服务器可能会执行多个任务
    let temp = {};
    for (let j = 0; j < chromosome.length; j++) {
      // 当前任务的执行时长
      let taskDuration = TASK_LIST[j];
      // 当前服务器的处理速度
      let dealSpeed = SERVER_LIST[chromosome[j]];
      // 当前服务器处理当前任务需要的总时间
      let curDuration = taskDuration / dealSpeed;
      // 当前服务器执行总时长
      temp[chromosome[j]] = (temp[chromosome[j]] || 0) + curDuration;

      if (temp[chromosome[j]] > maxDuration) {
        maxDuration = temp[chromosome[j]];
      }
    }
    // 适应度标准: 任务总时长 / 当前染色体执行任务的最终时长
    // console.log(maxDuration);
    adaptabilityMatrix.push(tasksTotalDuration / maxDuration);
  }
  return adaptabilityMatrix;
}


/**
 * 计算每条染色体的自然选择概率
 * @param adaptabilityMatrix 适应度矩阵
 */
function calSelectionProbability(adaptabilityMatrix) {
  let probabilityMatrix = [];
  let all = sum(adaptabilityMatrix);
  for (let i = 0; i < adaptabilityMatrix.length; i++) {
    probabilityMatrix.push(adaptabilityMatrix[i] / all);
  }
  return probabilityMatrix;
}


/**
 * 生成下一代染色体
 * @param chromosomeMatrix 染色体矩阵
 * @param adaptabilityMatrix 适应度矩阵
 * @param probabilityMatrix 自然选择概率
 * @param iterNum 迭代次数
 */
function createGeneration(chromosomeMatrix, adaptabilityMatrix, probabilityMatrix, iterNum) {
  let chrMat;
  for (let i = 0; i < iterNum; i++) {
    let chrLen = chromosomeMatrix.length;
    let copyNum = Math.floor(chrLen * COPY_RATE);
    let crossNum = chrLen - copyNum;
    // 复制
    chrMat = copy(chromosomeMatrix, adaptabilityMatrix, copyNum);
    // 交叉
    let crossResults = cross(chromosomeMatrix, probabilityMatrix, crossNum);
    pushAllElem(chrMat, crossResults);
    // 变异
    mutation(chrMat, 1);
    // console.log(`第${i+1}代适应度:`, calAdaptability(chrMat));
  }
  return chrMat;
}


/**
 * 复制N条适应性最好的染色体，让他们成为下一代,(N = 染色体数量 * copyRate)
 * @param chromosomeMatrix 染色体矩阵
 * @param adaptabilityMatrix 适应度矩阵
 * @param copyNum 复制数目
 * @return 新的染色体矩阵
 */
function copy(chromosomeMatrix, adaptabilityMatrix, copyNum) {
  let maxIdxs = getMaxN(adaptabilityMatrix, copyNum);
  let newChrMatrix = [];
  for (let i = 0; i < maxIdxs.length; i++) {
    newChrMatrix.push(chromosomeMatrix[maxIdxs[i]].slice(0));
  }
  return newChrMatrix;
}


/**
 * 染色体交叉
 */
function cross(chromosomeMatrix, probabilityMatrix, crossNum) {
  let matrix = [];
  for (let i = 0; i < crossNum; i++) {
    let mother = chromosomeMatrix[rws(probabilityMatrix)].slice(0);
    let father = chromosomeMatrix[rws(probabilityMatrix)].slice(0);
    let randomIndex = randomInt(0, mother.length - 1);

    mother.splice(randomIndex);
    let crossResult = mother.concat(father.slice(randomIndex));
    matrix.push(crossResult);
  }
  return matrix;
}

/**
 * 变异, 此方法在原有矩阵基础上作修改
 * @param chromosomeMatrix 染色体矩阵
 * @param num 变异次数
 */
function mutation(chromosomeMatrix, num) {

  for (let i = 0; i < num; i++) {
    let randomIndex = randomInt(0, chromosomeMatrix.length - 1);
    let randomTask = randomInt(0, TASK_LIST.length - 1);
    let randomServer = randomInt(0, SERVER_LIST.length - 1);
    let mutationOrigin = chromosomeMatrix[randomIndex];
    // console.log('改变前:', chromosomeMatrix, '改变:', randomIndex, randomTask, randomServer);
    mutationOrigin[randomTask] = randomServer;
    // console.log('改变后:', chromosomeMatrix);
  }
}

/**
 * 轮盘赌算法获取染色体下标
 */
function rws(probabilityMatrix) {
  let rand = Math.random();
  let sum = 0;
  for (let i = 0; i < probabilityMatrix.length; i++) {
    sum += probabilityMatrix[i];
    if (sum >= rand) {
      return i;
    }
  }
}