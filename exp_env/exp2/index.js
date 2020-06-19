console.log('TASK_LIST:', TASK_LIST);
console.log('SERVER_LIST:', SERVER_LIST);

const chromosomeMatrix = initChromosome(10);
console.log('初始chromosomeMatrix:', chromosomeMatrix);

const adaptabilityMatrix = calAdaptability(chromosomeMatrix);
console.log('初代适应度:', adaptabilityMatrix);

const probabilityMatrix = calSelectionProbability(adaptabilityMatrix);
console.log('初始probabilityMatrix:', probabilityMatrix);

const newChromosomeMatrix = createGeneration(
  chromosomeMatrix,
  adaptabilityMatrix,
  probabilityMatrix,
  10000
);

console.log('最后一代染色体:', newChromosomeMatrix);
console.log('最后一代适应度:', calAdaptability(newChromosomeMatrix));