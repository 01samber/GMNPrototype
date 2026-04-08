import type { CleanRow } from "@/lib/excel/types";
import { buildFeatureMatrix, standardizeFeatures, trainTestSplit, type TargetKey } from "./features";
import { evaluateRegression, mean } from "./metrics";
import { fitRidgeRegression, predictLinear } from "./linear";
import { knnPredict } from "./knn";
import { fitDecisionTree, predictTree } from "./tree";
import { fitRandomForest, predictForest } from "./forest";

export interface TrainPipelineOptions {
  target: TargetKey;
  testRatio: number;
  seed: number;
  knnK: number;
  ridgeLambda: number;
}

export interface ModelResult {
  name: string;
  train: ReturnType<typeof evaluateRegression>;
  test: ReturnType<typeof evaluateRegression>;
  yTestPred: number[];
  importances?: { name: string; value: number }[];
}

export interface PipelineResult {
  yTestTrue: number[];
  models: ModelResult[];
  featureNames: string[];
  baselineTest: ReturnType<typeof evaluateRegression>;
}

export function runTrainingPipeline(rows: CleanRow[], opts: TrainPipelineOptions): PipelineResult {
  const { X, y, featureNames } = buildFeatureMatrix(rows, { target: opts.target });
  const { XTrain, yTrain, XTest, yTest } = trainTestSplit(X, y, opts.testRatio, opts.seed);

  const { XTrain: XTrS, XTest: XTeS } = standardizeFeatures(XTrain, XTest);
  const XTestSafe = XTeS ?? [];

  const yTrainPredBaseline = yTrain.map(() => mean(yTrain));
  const yTestPredBaseline = yTest.map(() => mean(yTrain));

  const baselineTest = evaluateRegression(yTest, yTestPredBaseline);

  const beta = fitRidgeRegression(XTrS, yTrain, opts.ridgeLambda);
  const predTrainLin = predictLinear(XTrS, beta);
  const predTestLin = predictLinear(XTestSafe, beta);

  const predTrainKnn = knnPredict(XTrS, yTrain, XTrS, opts.knnK);
  const predTestKnn = knnPredict(XTrS, yTrain, XTestSafe, opts.knnK);

  const tree = fitDecisionTree(XTrS, yTrain, { maxDepth: 9, minLeaf: 32, seed: opts.seed });
  const predTrainTree = predictTree(tree, XTrS);
  const predTestTree = predictTree(tree, XTestSafe);

  const forest = fitRandomForest(XTrS, yTrain, { trees: 22, sampleRatio: 0.72, seed: opts.seed });
  const predTrainForest = predictForest(forest, XTrS);
  const predTestForest = predictForest(forest, XTestSafe);

  const linImportance = featureNames.map((name, j) => ({
    name,
    value: Math.abs(beta[j] ?? 0),
  }));

  const models: ModelResult[] = [
    {
      name: "Baseline (train mean)",
      train: evaluateRegression(yTrain, yTrainPredBaseline),
      test: evaluateRegression(yTest, yTestPredBaseline),
      yTestPred: yTestPredBaseline,
    },
    {
      name: "Ridge linear regression",
      train: evaluateRegression(yTrain, predTrainLin, beta.length),
      test: evaluateRegression(yTest, predTestLin, beta.length),
      yTestPred: predTestLin,
      importances: linImportance.filter((x) => x.name !== "bias").sort((a, b) => b.value - a.value),
    },
    {
      name: "k-NN regression",
      train: evaluateRegression(yTrain, predTrainKnn),
      test: evaluateRegression(yTest, predTestKnn),
      yTestPred: predTestKnn,
    },
    {
      name: "Decision tree regression",
      train: evaluateRegression(yTrain, predTrainTree),
      test: evaluateRegression(yTest, predTestTree),
      yTestPred: predTestTree,
    },
    {
      name: "Random forest regression",
      train: evaluateRegression(yTrain, predTrainForest),
      test: evaluateRegression(yTest, predTestForest),
      yTestPred: predTestForest,
    },
  ];

  return {
    yTestTrue: yTest,
    models,
    featureNames,
    baselineTest,
  };
}
