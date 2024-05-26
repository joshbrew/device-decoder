// Define the Haar wavelet filter coefficients
const h0 = 0.7071067811865476;
const h1 = 0.7071067811865476;
const g0 = -0.7071067811865476;
const g1 = 0.7071067811865476;

// Define the wavelet transform function
function waveletTransform(signal) {
  const length = signal.length;
  const coefficients = new Array(length);
  
  // Apply the wavelet transform recursively
  if (length === 1) {
    coefficients[0] = signal[0];
    return coefficients;
  }
  
  const halfLength = length / 2;
  const smoothed = new Array(halfLength);
  const detailed = new Array(halfLength);
  
  for (let i = 0; i < halfLength; i++) {
    smoothed[i] = (signal[2*i] + signal[2*i+1]) / Math.sqrt(2);
    detailed[i] = (signal[2*i] - signal[2*i+1]) / Math.sqrt(2);
  }
  
  const smoothedCoeffs = waveletTransform(smoothed);
  
  for (let i = 0; i < halfLength; i++) {
    coefficients[i] = smoothedCoeffs[i];
    coefficients[i+halfLength] = detailed[i];
  }
  
  return coefficients;
}

// Define the inverse wavelet transform function
function inverseWaveletTransform(coefficients) {
  const length = coefficients.length;
  const signal = new Array(length);
  
  // Apply the inverse wavelet transform recursively
  if (length === 1) {
    signal[0] = coefficients[0];
    return signal;
  }
  
  const halfLength = length / 2;
  const smoothed = new Array(halfLength);
  const detailed = new Array(halfLength);
  
  for (let i = 0; i < halfLength; i++) {
    smoothed[i] = (coefficients[i] + coefficients[i+halfLength]) / Math.sqrt(2);
    detailed[i] = (coefficients[i] - coefficients[i+halfLength]) / Math.sqrt(2);
  }
  
  const smoothedSignal = inverseWaveletTransform(smoothed);
  
  for (let i = 0; i < halfLength; i++) {
    signal[2*i] = smoothedSignal[i] - detailed[i];
    signal[2*i+1] = smoothedSignal[i] + detailed[i];
  }
  
  return signal;
}

// Define the motion artifact removal function
function removeMotionArtifacts(signal) {
  const length = signal.length;
  const paddedLength = 2 ** Math.ceil(Math.log2(length));
  const paddedSignal = new Array(paddedLength).fill(0);
  for (let i = 0; i < length; i++) {
    paddedSignal[i] = signal[i];
  }
  
  const waveletCoeffs = waveletTransform(paddedSignal);
  const detailCoeffs = waveletCoeffs.slice(paddedLength/2);
  const threshold = 3 * Math.sqrt(2 * Math.log2(paddedLength / 2));
  
  for (let i = 0; i < detailCoeffs.length; i++) {
    if (Math.abs(detailCoeffs[i]) < threshold) {
      waveletCoeffs[i+paddedLength/2] = 0;
    }
  }
  
  const filteredSignal = inverseWaveletTransform(waveletCoeffs);
  return filteredSignal.slice(0, length);
}