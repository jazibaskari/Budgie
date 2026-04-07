import * as tf from '@tensorflow/tfjs-node';

export const trainForecastModel = async (historicalData: number[]) => {
  const xs = tf.tensor2d(historicalData.map((_, i) => [i]));
  const ys = tf.tensor2d(historicalData.map(v => [v]));

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

  await model.fit(xs, ys, { epochs: 200 });
  
  const prediction = model.predict(tf.tensor2d([[historicalData.length]])) as tf.Tensor;
  return prediction.dataSync()[0];
};