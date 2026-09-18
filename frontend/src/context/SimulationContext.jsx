import React, { createContext, useContext, useReducer, useCallback } from 'react';

const SimulationContext = createContext(null);

const initialState = {
  totalSteps: 0,
  currentStep: 0,
  simulationData: [],     // Array of step results
  isPlaying: false,
  speed: 1,               // Playback multiplier
  apiStatus: 'checking',  // 'connected' | 'disconnected' | 'checking'
  selectedStation: null,
  loading: false,
  error: null,
  initialized: false,
  latency: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        totalSteps: action.totalSteps,
        currentStep: 0,
        simulationData: [],
        initialized: true,
        error: null,
      };
    case 'ADD_STEP':
      return {
        ...state,
        currentStep: action.step + 1,
        simulationData: [...state.simulationData, { step: action.step, ...action.data }],
        latency: action.data.latency || state.latency,
        loading: false,
      };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.value };
    case 'SET_SPEED':
      return { ...state, speed: action.value };
    case 'SET_API_STATUS':
      return { ...state, apiStatus: action.value };
    case 'SET_STATION':
      return { ...state, selectedStation: action.station };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.message, loading: false, isPlaying: false };
    case 'RESET':
      return {
        ...state,
        currentStep: 0,
        simulationData: [],
        isPlaying: false,
        error: null,
        loading: false,
      };
    default:
      return state;
  }
}

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SimulationContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationState() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulationState must be used within SimulationProvider');
  return ctx;
}

export default SimulationContext;
