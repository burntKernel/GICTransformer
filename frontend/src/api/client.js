import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Accept': 'application/json' },
});

/**
 * Initialize a new simulation.
 * @returns {{ total_steps: number }}
 */
export async function startSimulation() {
  const { data } = await client.get('/api/simulation/start');
  return data;
}

/**
 * Fetch inference results for a specific simulation step.
 * @param {number} step
 * @returns {object} - normalized step data
 */
export async function getSimulationStep(step) {
  const start = performance.now();
  const { data } = await client.get(`/api/simulation/step/${step}`);
  const latency = Math.round(performance.now() - start);

  // Handle expanded format (Ex, Ey, Emag)
  if ('true_ex' in data) {
    return {
      timestamp: data.timestamp,
      trueEx: data.true_ex,
      predEx: data.pred_ex,
      trueEy: data.true_ey,
      predEy: data.pred_ey,
      trueEmag: data.true_emag,
      predEmag: data.pred_emag,
      hasAllChannels: true,
      latency,
    };
  }

  // Legacy single-channel format
  return {
    timestamp: data.timestamp,
    trueEx: data.true_ykcx ?? null,
    predEx: data.pred_ykcx ?? null,
    trueEy: null,
    predEy: null,
    trueEmag: null,
    predEmag: null,
    hasAllChannels: false,
    latency,
  };
}

/**
 * Quick health check — hit the start endpoint.
 * @returns {boolean}
 */
export async function checkConnection() {
  try {
    await client.get('/api/simulation/start');
    return true;
  } catch {
    return false;
  }
}

export default client;
