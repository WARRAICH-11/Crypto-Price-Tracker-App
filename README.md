# 🚀 Crypto Price Tracker Dashboard

A real-time cryptocurrency price tracking dashboard with comprehensive technical analysis, built with React, Vite, and Tailwind CSS.

![Deploy with GitHub Pages](https://github.com/WARRAICH-11/Crypto-Price-Tracker-App/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)

## 🌐 Live Demo

[**View Live App**](https://warraich-11.github.io/Crypto-Price-Tracker-App/)

![Crypto Price Tracker Dashboard](https://github.com/WARRAICH-11/Crypto-Price-Tracker-App/src/assets/dashboard-screenshot.png)

*Real-time BNBUSDC price tracking with technical indicators, Fear & Greed Index, and alert notifications*

## ✨ Features

- **Real-time Price Tracking**: Live price updates via Binance WebSocket API
- **Technical Analysis**: Moving Averages, Bollinger Bands, Stochastic RSI, MACD
- **Multi-timeframe Support**: 1H, 4H, and Daily analysis
- **Interactive Charts**: Built with Recharts for smooth data visualization
- **Fear & Greed Index**: Market sentiment analysis
- **Alert System**: Smart notifications for technical conditions
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Theme**: Modern, professional interface

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **APIs**: Binance API, Fear & Greed Index API
- **Deployment**: GitHub Pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WARRAICH-11/Crypto-Price-Tracker-App.git
   cd Crypto-Price-Tracker-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### API Configuration
The app uses public APIs that don't require API keys:
- **Binance API**: For real-time price data and historical candles
- **Fear & Greed Index**: For market sentiment analysis

### Environment Variables
No environment variables needed - the app works out of the box!

## 📱 Deployment

### GitHub Pages (Automatic)
This project is configured for automatic deployment to GitHub Pages:

1. Push code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your app will be available at `https://warraich-11.github.io/Crypto-Price-Tracker-App/`

### Manual Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🎯 Usage

1. **Select Trading Pair**: Use the dropdown to choose a cryptocurrency pair
2. **View Real-time Data**: Watch live price updates and percentage changes
3. **Analyze Technical Indicators**: Switch between 1H, 4H, and Daily timeframes
4. **Monitor Alerts**: Check the notification panel for technical signals
5. **Explore Charts**: Use interactive charts to analyze price movements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Binance API](https://binance-docs.github.io/apidocs/) for real-time data
- [Alternative.me](https://alternative.me/crypto/fear-and-greed-index/) for Fear & Greed Index
- [Recharts](https://recharts.org/) for beautiful charts
- [Tailwind CSS](https://tailwindcss.com/) for styling
