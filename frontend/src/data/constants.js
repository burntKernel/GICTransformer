/**
 * Ground station coordinates from the project config.
 * Stations listed in ml/configs/config.yaml: SIT, BOU, FRD
 * OTT added as a commonly referenced Canadian magnetometer station.
 * Coordinates are real geomagnetic observatory positions.
 */
export const STATIONS = [
  { id: 'OTT', name: 'Ottawa',          lat: 45.403,  lon: -75.720, country: 'Canada' },
  { id: 'SIT', name: 'Sitka',           lat: 57.058,  lon: -135.327, country: 'USA (AK)' },
  { id: 'BOU', name: 'Boulder',         lat: 40.137,  lon: -105.237, country: 'USA (CO)' },
  { id: 'FRD', name: 'Fredericksburg',  lat: 38.205,  lon: -77.373, country: 'USA (VA)' },
];

/**
 * Storm phase definitions for the December 6, 2015 event.
 * These are approximate visualization phases based on the simulation window
 * (storm_start = Dec 5 20:00 UTC, storm_end = Dec 6 12:00 UTC).
 * They are NOT official NOAA/SWPC classifications.
 */
export const STORM_PHASES = [
  { id: 'quiet',    label: 'QUIET',         color: '#0080ff', pctStart: 0,    pctEnd: 0.12 },
  { id: 'onset',    label: 'STORM ONSET',   color: '#ffd000', pctStart: 0.12, pctEnd: 0.25 },
  { id: 'active',   label: 'ACTIVE',        color: '#ff6600', pctStart: 0.25, pctEnd: 0.45 },
  { id: 'peak',     label: 'PEAK',          color: '#ff003c', pctStart: 0.45, pctEnd: 0.65 },
  { id: 'recovery', label: 'RECOVERY',      color: '#00ff88', pctStart: 0.65, pctEnd: 1.0 },
];

/**
 * Returns the storm phase for a given progress (0-1).
 */
export function getStormPhase(progress) {
  for (const phase of STORM_PHASES) {
    if (progress >= phase.pctStart && progress < phase.pctEnd) return phase;
  }
  return STORM_PHASES[STORM_PHASES.length - 1];
}

/**
 * GIC risk thresholds for station status.
 * These are configurable visualization thresholds, NOT official safety limits.
 */
export const RISK_THRESHOLDS = {
  normal:   { max: 0.5,  label: 'NORMAL',   color: '#00ff88' },
  elevated: { max: 1.0,  label: 'ELEVATED', color: '#ffd000' },
  warning:  { max: 2.0,  label: 'WARNING',  color: '#ff6600' },
  critical: { max: Infinity, label: 'CRITICAL', color: '#ff003c' },
};

export function getRiskLevel(value) {
  const abs = Math.abs(value);
  if (abs < RISK_THRESHOLDS.normal.max)   return RISK_THRESHOLDS.normal;
  if (abs < RISK_THRESHOLDS.elevated.max) return RISK_THRESHOLDS.elevated;
  if (abs < RISK_THRESHOLDS.warning.max)  return RISK_THRESHOLDS.warning;
  return RISK_THRESHOLDS.critical;
}

/** Model configuration from ml/configs/config.yaml */
export const MODEL_CONFIG = {
  type: 'Transformer Encoder',
  d_model: 64,
  nhead: 4,
  num_encoder_layers: 3,
  dim_feedforward: 256,
  dropout: 0.1,
  history_len_mins: 120,
  pred_lead_mins: 30,
  output_dim: 3,
  outputs: ['Ex', 'Ey', 'Emag'],
  outputUnits: ['V/km', 'V/km', 'V/km'],
};

/** Architecture pipeline nodes */
export const ARCHITECTURE_NODES = [
  { id: 'input',     label: 'Solar Wind + IMF\nTime Series',       desc: 'Raw solar wind speed, density, and interplanetary magnetic field (Bx, By, Bz) sampled at 1-minute cadence over a 120-minute sliding window.' },
  { id: 'proj',      label: 'Input Projection',                     desc: 'A linear layer that projects raw input features into the Transformer latent space of dimension d_model = 64.' },
  { id: 'meta',      label: 'Metadata Fusion\n(GRN Gating)',        desc: 'Station metadata (latitude, longitude) is embedded and fused with the sequence via a Gated Residual Network, conditioning temporal features on location.' },
  { id: 'pos',       label: 'Positional Encoding',                  desc: 'Standard sinusoidal positional encoding is added to retain the sequential ordering of the time-series data.' },
  { id: 'encoder',   label: 'Transformer Encoder\n(3 layers × 4 heads)', desc: 'Three TransformerEncoderLayer blocks with multi-head self-attention capture long-range temporal dependencies across the 120-minute input window.' },
  { id: 'cls',       label: '[CLS] Token\nExtraction',              desc: 'A learnable [CLS] token is prepended to the sequence. After encoding, its hidden state serves as the aggregate sequence representation for regression.' },
  { id: 'mlp',       label: 'MLP Regression Head',                  desc: 'A two-layer MLP (Linear → ReLU → Dropout → Linear) maps the [CLS] representation to the 3-dimensional output prediction.' },
  { id: 'output',    label: 'Ex / Ey / Emag\nPrediction',           desc: 'The final output: predicted geoelectric field components Ex, Ey and magnitude Emag at the target station, 30 minutes ahead.' },
];

/** Data pipeline nodes */
export const PIPELINE_NODES = [
  { id: 'raw',        label: 'Raw Data',           desc: 'OMNI solar wind / IMF data and SuperMAG ground magnetometer data downloaded from public archives.' },
  { id: 'preprocess', label: 'Preprocessing',      desc: 'Timestamp alignment, gap filling, outlier removal, and feature engineering across both data sources.' },
  { id: 'standard',   label: 'Standardization',    desc: 'Features and targets are standard-scaled. Scaler is fit ONLY on the training set to prevent data leakage.' },
  { id: 'window',     label: 'Sliding Window',     desc: '120-minute input windows with 30-minute prediction lead time, stride of 15 minutes for training.' },
  { id: 'model',      label: 'GICTransformer',     desc: 'The Transformer Encoder model processes the windowed input and station metadata to produce predictions.' },
  { id: 'inverse',    label: 'Inverse Scaling',     desc: 'Predicted values are unscaled using the training set statistics to recover physical units (V/km).' },
  { id: 'physical',   label: 'Physical Output',    desc: 'Final Ex, Ey, Emag predictions in V/km ready for downstream risk assessment and visualization.' },
];

/** Convert lat/lon to 3D position on a sphere */
export function latLonToVec3(lat, lon, radius = 1.02) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

/** Simulation speed options */
export const SPEED_OPTIONS = [0.5, 1, 2, 5, 10];

/** Navigation links */
export const NAV_LINKS = [
  { id: 'overview',      label: 'Overview' },
  { id: 'earth',         label: 'Storm Simulation' },
  { id: 'forecast',      label: 'Forecast' },
  { id: 'stations',      label: 'Ground Stations' },
  { id: 'architecture',  label: 'Transformer' },
  { id: 'pipeline',      label: 'Data Pipeline' },
];
