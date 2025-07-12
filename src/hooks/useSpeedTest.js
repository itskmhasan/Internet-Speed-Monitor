import { useState, useEffect, useCallback, useRef } from 'react';
import SpeedTest from '../utils/speedTest.js';

const useSpeedTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState({
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    status: 'idle' // 'idle', 'testing', 'completed', 'error'
  });
  const [testHistory, setTestHistory] = useState([]);
  const [interval, setInterval] = useState(5); // seconds
  const [settings, setSettings] = useState({
    maxHistorySize: 1000,
    autoCleanup: true
  });

  const speedTestRef = useRef(new SpeedTest());
  const intervalRef = useRef(null);

  // Load test history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('speedtest-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setTestHistory(parsed);
      } catch (error) {
        console.error('Failed to load test history:', error);
      }
    }
  }, []);

  // Save test history to localStorage whenever it changes
  useEffect(() => {
    if (testHistory.length > 0) {
      localStorage.setItem('speedtest-history', JSON.stringify(testHistory));
    }
  }, [testHistory]);

  // Run a single speed test
  const runSingleTest = useCallback(async () => {
    if (speedTestRef.current.isRunning) {
      return;
    }

    setCurrentTest(prev => ({ ...prev, status: 'testing' }));

    try {
      const result = await speedTestRef.current.runSpeedTest();
      
      if (result) {
        const testResult = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          downloadSpeed: result.downloadSpeed,
          uploadSpeed: result.uploadSpeed,
          ping: result.ping
        };

        setCurrentTest({
          downloadSpeed: result.downloadSpeed,
          uploadSpeed: result.uploadSpeed,
          ping: result.ping,
          status: 'completed'
        });

        setTestHistory(prev => {
          const newHistory = [testResult, ...prev];
          // Auto-cleanup if enabled
          if (settings.autoCleanup && newHistory.length > settings.maxHistorySize) {
            return newHistory.slice(0, settings.maxHistorySize);
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error('Speed test failed:', error);
      setCurrentTest(prev => ({ ...prev, status: 'error' }));
    }
  }, [settings.autoCleanup, settings.maxHistorySize]);

  // Start continuous testing
  const startTesting = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    
    // Run first test immediately
    runSingleTest();

    // Set up interval for continuous testing
    intervalRef.current = setInterval(() => {
      runSingleTest();
    }, interval * 1000);
  }, [isRunning, interval, runSingleTest]);

  // Stop continuous testing
  const stopTesting = useCallback(() => {
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Toggle testing state
  const toggleTesting = useCallback(() => {
    if (isRunning) {
      stopTesting();
    } else {
      startTesting();
    }
  }, [isRunning, startTesting, stopTesting]);

  // Clear test history
  const clearHistory = useCallback(() => {
    setTestHistory([]);
    localStorage.removeItem('speedtest-history');
  }, []);

  // Export test history as JSON
  const exportHistory = useCallback(() => {
    return testHistory;
  }, [testHistory]);

  // Get test statistics
  const getStatistics = useCallback(() => {
    if (testHistory.length === 0) {
      return {
        avgDownload: 0,
        avgUpload: 0,
        avgPing: 0,
        maxDownload: 0,
        maxUpload: 0,
        minPing: 0,
        totalTests: 0
      };
    }

    const downloads = testHistory.map(t => t.downloadSpeed);
    const uploads = testHistory.map(t => t.uploadSpeed);
    const pings = testHistory.map(t => t.ping);

    return {
      avgDownload: downloads.reduce((a, b) => a + b, 0) / downloads.length,
      avgUpload: uploads.reduce((a, b) => a + b, 0) / uploads.length,
      avgPing: pings.reduce((a, b) => a + b, 0) / pings.length,
      maxDownload: Math.max(...downloads),
      maxUpload: Math.max(...uploads),
      minPing: Math.min(...pings),
      totalTests: testHistory.length
    };
  }, [testHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update interval when changed
  useEffect(() => {
    if (isRunning && intervalRef.current) {
      // Restart with new interval
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        runSingleTest();
      }, interval * 1000);
    }
  }, [interval, isRunning, runSingleTest]);

  return {
    // State
    isRunning,
    currentTest,
    testHistory,
    interval,
    settings,
    
    // Actions
    startTesting,
    stopTesting,
    toggleTesting,
    runSingleTest,
    clearHistory,
    exportHistory,
    setInterval,
    setSettings,
    
    // Computed
    statistics: getStatistics()
  };
};

export default useSpeedTest;

