import { useCallback, useEffect, useRef } from 'react';
import { useSimulationState } from '../context/SimulationContext';
import { startSimulation, getSimulationStep, checkConnection } from '../api/client';

export function useSimulation() {
  const { state, dispatch } = useSimulationState();
  const intervalRef = useRef(null);
  const fetchingRef = useRef(false);

  // Check backend connectivity
  const checkApi = useCallback(async () => {
    dispatch({ type: 'SET_API_STATUS', value: 'checking' });
    const ok = await checkConnection();
    dispatch({ type: 'SET_API_STATUS', value: ok ? 'connected' : 'disconnected' });
    return ok;
  }, [dispatch]);

  // Initialize simulation
  const init = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      const data = await startSimulation();
      dispatch({ type: 'INIT', totalSteps: data.total_steps });
      dispatch({ type: 'SET_API_STATUS', value: 'connected' });
      return data.total_steps;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: 'Failed to initialize simulation. Is the backend running?' });
      dispatch({ type: 'SET_API_STATUS', value: 'disconnected' });
      return 0;
    }
  }, [dispatch]);

  // Fetch a single step
  const fetchStep = useCallback(async (step) => {
    if (fetchingRef.current) return false;
    if (step >= state.totalSteps) {
      dispatch({ type: 'SET_PLAYING', value: false });
      return false;
    }
    fetchingRef.current = true;
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      const data = await getSimulationStep(step);
      dispatch({ type: 'ADD_STEP', step, data });
      fetchingRef.current = false;
      return true;
    } catch (err) {
      fetchingRef.current = false;
      if (err.response?.status === 400) {
        dispatch({ type: 'SET_PLAYING', value: false });
      } else {
        dispatch({ type: 'SET_ERROR', message: `Step ${step} failed: ${err.message}` });
      }
      return false;
    }
  }, [state.totalSteps, dispatch]);

  // Start simulation & fetch first step
  const start = useCallback(async () => {
    const total = await init();
    if (total > 0) {
      await fetchStep(0);
    }
  }, [init, fetchStep]);

  // Next single step
  const nextStep = useCallback(async () => {
    if (state.currentStep < state.totalSteps) {
      await fetchStep(state.currentStep);
    }
  }, [state.currentStep, state.totalSteps, fetchStep]);

  // Toggle auto-play
  const play = useCallback(() => dispatch({ type: 'SET_PLAYING', value: true }), [dispatch]);
  const pause = useCallback(() => dispatch({ type: 'SET_PLAYING', value: false }), [dispatch]);

  // Reset
  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  // Set speed
  const setSpeed = useCallback((s) => dispatch({ type: 'SET_SPEED', value: s }), [dispatch]);

  // Select station
  const selectStation = useCallback((s) => dispatch({ type: 'SET_STATION', station: s }), [dispatch]);

  // Auto-play effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state.isPlaying && state.initialized) {
      const delay = Math.max(200, 1000 / state.speed);
      intervalRef.current = setInterval(async () => {
        if (fetchingRef.current) return;
        const step = state.currentStep;
        if (step >= state.totalSteps) {
          dispatch({ type: 'SET_PLAYING', value: false });
          return;
        }
        await fetchStep(step);
      }, delay);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isPlaying, state.speed, state.currentStep, state.totalSteps, state.initialized, dispatch, fetchStep]);

  // Connection check on mount
  useEffect(() => {
    checkApi();
  }, [checkApi]);

  return {
    ...state,
    start,
    nextStep,
    play,
    pause,
    reset,
    setSpeed,
    selectStation,
    checkApi,
  };
}
