import React, { useState, useEffect, useCallback } from 'react';
import PriceCard from './components/PriceCard';
import HourlyPerformance from './components/HourlyPerformance';
import PriceDashboard from './components/PriceDashboard';
import AlertNotifications from './components/AlertNotifications';
import NavigationBar from './components/NavigationBar';
import MovingAveragesSection from './components/MovingAveragesSection';
import BollingerBandsSection from './components/BollingerBandsSection';

import ChangeNotifications from './components/ChangeNotifications';
import { 
  getTradingPairs, 
  createPriceWebSocket, 
  fetchHistoricalData,
  fetchExtendedHistoricalData,
  fetchHourlyPerformance,
  getCurrentHourProgress
} from './utils/binanceAPI';
import {
  calculateSMA,
  calculateAllMAs,
  calculateBollingerBands,
  findClosestMA,
  findClosestBB,
  detectCrosses,
  prepareMAChartData,
  prepareBBChartData,
  prepareCrossChartData,
  calculateStochasticRSI,
  calculateMACD,
  generateTechnicalAlerts
} from './utils/technicalIndicators';
import { fetchFearGreedIndex } from './utils/fearGreedAPI';

function App() {
  // State for trading pairs and selected symbol
  const [tradingPairs, setTradingPairs] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for price data
  const [priceData, setPriceData] = useState({
    price: 0,
    priceChangePercent: 0,
    priceChange: 0,
    lastUpdate: null
  });
  
  // State for technical indicators
  const [maData, setMAData] = useState({
    '1h': {},
    '4h': {},
    'daily': {}
  });
  
  const [bbData, setBBData] = useState({
    '1h': [],
    '4h': [],
    'daily': []
  });
  
  // State for closest levels
  const [closestMALevels, setClosestMALevels] = useState({
    '1h': null,
    '4h': null,
    'daily': null
  });
  
  const [closestBBLevels, setClosestBBLevels] = useState({
    '1h': null,
    '4h': null,
    'daily': null
  });
  
  // State for crosses
  const [maaCrosses, setMAACrosses] = useState({
    '1h': null,
    '4h': null,
    'daily': null
  });
  
  // State for chart data
  const [chartData, setChartData] = useState({
    ma1h: [],
    ma4h: [],
    maDaily: [],
    bb1h: [],
    bb4h: [],
    bbDaily: [],
    cross1h: [],
    cross4h: [],
    crossDaily: [],
    stochRSI1h: [],
    stochRSI4h: [],
    stochRSIDaily: [],
    macd1h: [],
    macd4h: [],
    macdDaily: []
  });
  
  // State for hourly performance
  const [hourlyPerformance, setHourlyPerformance] = useState([]);
  const [currentHourData, setCurrentHourData] = useState(null);
  
  // State for candle data
  const [candleData, setCandleData] = useState({
    '1h': [],
    '4h': [],
    'daily': []
  });
  
  // State for alerts and Fear & Greed Index
  const [alerts, setAlerts] = useState([]);
  const [fearGreedIndex, setFearGreedIndex] = useState(null);

  // Load initial trading pairs
  useEffect(() => {
    const loadTradingPairs = async () => {
      setIsLoading(true);
      try {
        const pairs = await getTradingPairs();
        setTradingPairs(pairs);
        
        // Select first pair by default
        if (pairs.length > 0) {
          setSelectedSymbol(pairs[0]);
        }
      } catch (error) {
        console.error('Error loading trading pairs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTradingPairs();
  }, []);

  // Handle WebSocket connection for price updates
  useEffect(() => {
    if (!selectedSymbol) return;
    
    let priceWs = null;
    
    const connectWebSocket = () => {
      // Close existing connection if any
      if (priceWs) {
        priceWs.close();
      }
      
      // Create new connection
      priceWs = createPriceWebSocket(selectedSymbol, (data) => {
        const newPriceData = {
          price: parseFloat(data.c),
          priceChangePercent: parseFloat(data.P),
          priceChange: parseFloat(data.p),
          lastUpdate: Date.now()
        };
        
        setPriceData(newPriceData);
        
        // Update browser tab title with price and percentage
        const priceFormatted = newPriceData.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8
        }).replace(/\.?0+$/, '');
        const changeSign = newPriceData.priceChangePercent >= 0 ? '+' : '';
        const changeFormatted = newPriceData.priceChangePercent.toFixed(2);
        
        document.title = `${selectedSymbol} $${priceFormatted} (${changeSign}${changeFormatted}%) - Crypto Dashboard`;
      });
    };
    
    connectWebSocket();
    
    // Clean up on unmount or symbol change
    return () => {
      if (priceWs) {
        priceWs.close();
      }
    };
  }, [selectedSymbol]);

  // Calculate closest MA and BB levels when price or technical data changes
  useEffect(() => {
    if (priceData.price <= 0) return;
    
    // Find closest MA for each timeframe
    const newClosestMA = {};
    Object.entries(maData).forEach(([timeframe, data]) => {
      newClosestMA[timeframe] = findClosestMA(priceData.price, data);
    });
    setClosestMALevels(newClosestMA);
    
    // Find closest BB for each timeframe
    const newClosestBB = {};
    Object.entries(bbData).forEach(([timeframe, data]) => {
      newClosestBB[timeframe] = findClosestBB(priceData.price, data);
    });
    setClosestBBLevels(newClosestBB);
    
  }, [priceData.price, maData, bbData]);

  // Load technical indicators data
  const loadTechnicalData = useCallback(async () => {
    if (!selectedSymbol) return;
    
    try {
      // Fetch extended historical data for all timeframes
      const data1h = await fetchExtendedHistoricalData(selectedSymbol, '1h');
      const data4h = await fetchExtendedHistoricalData(selectedSymbol, '4h');
      const dataDaily = await fetchExtendedHistoricalData(selectedSymbol, '1d');
      
      // Store candle data
      setCandleData({
        '1h': data1h,
        '4h': data4h,
        'daily': dataDaily
      });
      
      // Calculate all required MAs for each timeframe
      const mas1h = calculateAllMAs(data1h);
      const mas4h = calculateAllMAs(data4h);
      const masDaily = calculateAllMAs(dataDaily);
      
      // Set MA data
      setMAData({
        '1h': mas1h,
        '4h': mas4h,
        'daily': masDaily
      });
      
      // Calculate Bollinger Bands for each timeframe
      const bb1h = calculateBollingerBands(data1h);
      const bb4h = calculateBollingerBands(data4h);
      const bbDaily = calculateBollingerBands(dataDaily);
      
      // Set BB data
      setBBData({
        '1h': bb1h,
        '4h': bb4h,
        'daily': bbDaily
      });
      
      // Detect crosses between MA55 and MA200 for golden/death cross
      const newCrosses = {};
      
      if (mas1h[55] && mas1h[200]) {
        newCrosses['1h'] = detectCrosses(mas1h[55], mas1h[200]);
      }
      
      if (mas4h[55] && mas4h[200]) {
        newCrosses['4h'] = detectCrosses(mas4h[55], mas4h[200]);
      }
      
      if (masDaily[55] && masDaily[200]) {
        newCrosses['daily'] = detectCrosses(masDaily[55], masDaily[200]);
      }
      
      setMAACrosses(newCrosses);
      
      // Calculate Stochastic RSI for all timeframes
      const stochRSI1h = calculateStochasticRSI(data1h);
      const stochRSI4h = calculateStochasticRSI(data4h);
      const stochRSIDaily = calculateStochasticRSI(dataDaily);
      
      // Calculate MACD for all timeframes
      const macd1h = calculateMACD(data1h);
      const macd4h = calculateMACD(data4h);
      const macdDaily = calculateMACD(dataDaily);

      // Prepare chart data
      setChartData({
        ma1h: prepareMAChartData(data1h, mas1h),
        ma4h: prepareMAChartData(data4h, mas4h),
        maDaily: prepareMAChartData(dataDaily, masDaily),
        bb1h: prepareBBChartData(data1h, bb1h),
        bb4h: prepareBBChartData(data4h, bb4h),
        bbDaily: prepareBBChartData(dataDaily, bbDaily),
        cross1h: prepareCrossChartData(data1h, mas1h[55] || [], mas1h[200] || [], newCrosses['1h']),
        cross4h: prepareCrossChartData(data4h, mas4h[55] || [], mas4h[200] || [], newCrosses['4h']),
        crossDaily: prepareCrossChartData(dataDaily, masDaily[55] || [], masDaily[200] || [], newCrosses['daily']),
        stochRSI1h: stochRSI1h,
        stochRSI4h: stochRSI4h,
        stochRSIDaily: stochRSIDaily,
        macd1h: macd1h,
        macd4h: macd4h,
        macdDaily: macdDaily
      });
      
      // Load hourly performance data
      const hourlyData = await fetchHourlyPerformance(selectedSymbol);
      setHourlyPerformance(hourlyData);
      
      // Load current hour progress
      const currentHour = await getCurrentHourProgress(selectedSymbol);
      setCurrentHourData(currentHour);
      
      // Load Fear & Greed Index
      let fearGreedValue = null; // No default value - only use real data
      try {
        const fearGreed = await fetchFearGreedIndex();
        if (fearGreed && fearGreed.value !== null && fearGreed.value !== undefined) {
          fearGreedValue = fearGreed.value;
          setFearGreedIndex(fearGreedValue);
        } else {
          setFearGreedIndex(null); // No dummy data
        }
      } catch (error) {
        console.error('Error loading Fear & Greed Index:', error);
        setFearGreedIndex(null); // No dummy data on error
      }
      
      // Generate alerts for the selected symbol
      const technicalAlerts = generateTechnicalAlerts({
        symbol: selectedSymbol,
        stochRSIData: {
          '1h': stochRSI1h,
          '4h': stochRSI4h,
          'daily': stochRSIDaily
        },
        macdData: {
          '1h': macd1h,
          '4h': macd4h,
          'daily': macdDaily
        },
        fearGreedIndex: fearGreedValue,
        crossData: newCrosses,
        timeframes: ['1h', '4h', 'daily']
      });
      
      setAlerts(technicalAlerts);
      
    } catch (error) {
      console.error('Error loading technical data:', error);
    }
  }, [selectedSymbol]);

  // Load technical data when symbol changes
  useEffect(() => {
    if (selectedSymbol) {
      loadTechnicalData();
      
      // Refresh technical data every 5 minutes
      const interval = setInterval(loadTechnicalData, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [selectedSymbol, loadTechnicalData]);

  // Handle symbol change
  const handleSymbolChange = (newSymbol) => {
    setSelectedSymbol(newSymbol);
    // Reset data states
    setPriceData({
      price: 0,
      priceChangePercent: 0,
      priceChange: 0,
      lastUpdate: null
    });
    setMAData({
      '1h': {},
      '4h': {},
      'daily': {}
    });
    setBBData({
      '1h': [],
      '4h': [],
      'daily': []
    });
    setClosestMALevels({
      '1h': null,
      '4h': null,
      'daily': null
    });
    setClosestBBLevels({
      '1h': null,
      '4h': null,
      'daily': null
    });
    setMAACrosses({
      '1h': null,
      '4h': null,
      'daily': null
    });
    setChartData({
      ma1h: [],
      ma4h: [],
      maDaily: [],
      bb1h: [],
      bb4h: [],
      bbDaily: [],
      cross1h: [],
      cross4h: [],
      crossDaily: [],
      stochRSI1h: [],
      stochRSI4h: [],
      stochRSIDaily: [],
      macd1h: [],
      macd4h: [],
      macdDaily: []
    });
    setHourlyPerformance([]);
    setCurrentHourData(null);
    setCandleData({
      '1h': [],
      '4h': [],
      'daily': []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Alert Notifications */}
      <AlertNotifications alerts={alerts} />
      
      {/* Change Notifications */}
      <ChangeNotifications 
        selectedSymbol={selectedSymbol}
        alerts={alerts}
      />
      
      {/* Navigation Bar */}
      <NavigationBar 
        tradingPairs={tradingPairs}
        selectedSymbol={selectedSymbol}
        onSymbolChange={handleSymbolChange}
        isLoading={isLoading}
      />
      
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {selectedSymbol ? (
          <div className="space-y-8 fade-in-up">
            {/* Integrated Price Dashboard */}
            <PriceDashboard 
              priceData={priceData}
              selectedSymbol={selectedSymbol}
              candleData={candleData}
              binanceMACDData={null}
            />

            {/* Moving Averages Section */}
            <MovingAveragesSection 
              maData={maData}
              priceData={priceData}
              closestMALevels={closestMALevels}
              maaCrosses={maaCrosses}
              selectedSymbol={selectedSymbol}
              chartData={chartData}
            />
            
            {/* Bollinger Bands Section */}
            <BollingerBandsSection 
              bbData={bbData}
              priceData={priceData}
              closestBBLevels={closestBBLevels}
              selectedSymbol={selectedSymbol}
              chartData={chartData}
            />
            

            
            {/* Hourly Performance Row */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-red-600 rounded"></div>
                <h2 className="text-2xl font-bold text-white">Hourly Performance</h2>
              </div>
              
              <HourlyPerformance 
                hourlyData={hourlyPerformance}
                currentHourData={currentHourData}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animation-delay-75"></div>
                  </div>
                  <span className="text-gray-300 text-lg">Loading trading pairs...</span>
                </div>
              ) : (
                <div className="text-gray-400 text-lg">Select a trading pair to view data</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;