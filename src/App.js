import React, { useState, useEffect } from 'react';
import './App.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
  MDBTypography,
} from "mdb-react-ui-kit";

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Weather icon mapping using Font Awesome icons
const weatherIcons = {
  Clear: {
    day: "sun",
    night: "moon"
  },
  Clouds: {
    day: "cloud-sun",
    night: "cloud-moon"
  },
  Rain: {
    day: "cloud-rain",
    night: "cloud-rain"
  },
  Drizzle: {
    day: "cloud-showers-heavy",
    night: "cloud-showers-heavy"
  },
  Thunderstorm: {
    day: "bolt",
    night: "bolt"
  },
  Snow: {
    day: "snowflake",
    night: "snowflake"
  },
  Mist: {
    day: "smog",
    night: "smog"
  },
  Smoke: {
    day: "smog",
    night: "smog"
  },
  Haze: {
    day: "smog",
    night: "smog"
  },
  Dust: {
    day: "smog",
    night: "smog"
  },
  Fog: {
    day: "smog",
    night: "smog"
  }
};

const defaultIcon = "cloud";

function App() {
  const weatherApi = process.env.REACT_APP_weatherApi;
  const geminiApi = process.env.REACT_APP_geminiApi;
  
  const [weatherData, setWeatherData] = useState({});
  const [city, setCity] = useState("");
  const [tips, setTips] = useState("");
  const [isDaytime, setIsDaytime] = useState(true);
  const [bgClass, setBgClass] = useState("bg-night");
  const [isLoading, setIsLoading] = useState(false);

  const genAI = new GoogleGenerativeAI(geminiApi);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    if (weatherData.sys) {
      const now = Date.now() / 1000; 
      const isDay = now > weatherData.sys.sunrise && now < weatherData.sys.sunset;
      setIsDaytime(isDay);
      
      const weatherMain = weatherData.weather[0].main;
      if (isDay) {
        switch (weatherMain) {
          case 'Clear':
            setBgClass('bg-clear-day');
            break;
          case 'Clouds':
            setBgClass('bg-clouds-day');
            break;
          case 'Rain':
          case 'Drizzle':
          case 'Thunderstorm':
            setBgClass('bg-rain-day');
            break;
          case 'Snow':
            setBgClass('bg-snow-day');
            break;
          case 'Mist':
          case 'Fog':
          case 'Haze':
            setBgClass('bg-mist-day');
            break;
          default:
            setBgClass('bg-clouds-day');
        }
      } else {
        setBgClass('bg-night');
      }
    }
  }, [weatherData]);

  useEffect(() => {
    if (weatherData.name) {
      getWeatherInsights();
    }
  }, [weatherData, getWeatherInsights]);

  const getWeather = (event) => {
    if (event.key === "Enter") {
      setIsLoading(true);
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${weatherApi}`)
        .then(response => response.json())
        .then(data => {
          setWeatherData(data);
          setCity("");
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching weather data:', error);
          setWeatherData({ cod: '404' });
          setIsLoading(false);
        });
    }
  };

  async function getWeatherInsights() {
    try {
      setTips("Generating weather insights...");
      const input = `Given the current weather in ${weatherData.name} — temperature: ${Math.round(weatherData.main.temp)}°C, condition: ${weatherData.weather[0].main}, humidity: ${Math.round(weatherData.main.humidity)}%, and pressure: ${Math.round(weatherData.main.pressure)} hPa — provide a weather forecast and practical tips in a concise 5-line summary.`;
      const result = await model.generateContent(input);
      const response = await result.response;
      setTips(response.text());
    } catch (error) {
      console.error('Error generating tips:', error);
      setTips("Unable to generate weather tips at this time.");
    }
  }

  const getWeatherIcon = () => {
    if (!weatherData.weather) return defaultIcon;
    
    const condition = weatherData.weather[0].main;
    const timeOfDay = isDaytime ? 'day' : 'night';
    
    if (weatherIcons[condition] && weatherIcons[condition][timeOfDay]) {
      return weatherIcons[condition][timeOfDay];
    }
    
    return defaultIcon;
  };

  return (
    <div className={`weather-container ${bgClass}`}>
      <div className="search-box">
        <MDBIcon fas icon="search" className="search-icon" />
        <input
          className="input"
          placeholder="Search any city..."
          onChange={e => setCity(e.target.value)}
          value={city}
          onKeyDown={getWeather}
        />
      </div>
      
      <h1 className="text">Smart WeatherApp</h1>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}

      {!isLoading && typeof weatherData.main === 'undefined' && !weatherData.cod && (
        <div className="welcome-container">
          <MDBIcon fas icon="cloud-sun" size="4x" className="welcome-icon" />
          <h2>Welcome to Smart WeatherApp</h2>
          <p>Enter a city name to get started</p>
        </div>
      )}

      {!isLoading && typeof weatherData.main !== 'undefined' && (
        <MDBContainer>
          <MDBRow className="justify-content-center">
            <MDBCol md="10" lg="8" xl="6">
              <MDBCard className="weather-card">
                <MDBCardBody className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <MDBTypography tag="h4" className="city-name">
                      {weatherData.name}, {weatherData.sys.country}
                    </MDBTypography>
                    <div className="d-flex flex-column align-items-end">
                      <small className="text-white-50">
                        {new Date().toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </small>
                      <small className="text-white-50">
                        {isDaytime ? 'Day' : 'Night'} · UTC{weatherData.timezone > 0 ? '+' : ''}{Math.round(weatherData.timezone / 3600)}
                      </small>
                    </div>
                  </div>

                  <div className="weather-icon-container">
                    <MDBIcon 
                      fas 
                      icon={getWeatherIcon()} 
                      size="6x" 
                      className="weather-icon"
                    />
                  </div>

                  <div className="text-center">
                    <MDBTypography tag="h2" className="temp-display">
                      {Math.round(weatherData.main.temp)}°C
                    </MDBTypography>
                    <p className="weather-condition">
                      {weatherData.weather[0].main} - {weatherData.weather[0].description}
                    </p>
                    
                    <div className="d-flex justify-content-between text-center mt-4">
                      <div>
                        <p className="small text-white-50 mb-0">Feels like</p>
                        <h5 className="mb-0">{Math.round(weatherData.main.feels_like)}°C</h5>
                      </div>
                      <div>
                        <p className="small text-white-50 mb-0">Min</p>
                        <h5 className="mb-0">{Math.round(weatherData.main.temp_min)}°C</h5>
                      </div>
                      <div>
                        <p className="small text-white-50 mb-0">Max</p>
                        <h5 className="mb-0">{Math.round(weatherData.main.temp_max)}°C</h5>
                      </div>
                    </div>
                  </div>

                  <div className="weather-metrics">
                    <div className="metric">
                      <MDBIcon fas icon="tint" className="metric-icon" />
                      <span className="metric-value">{Math.round(weatherData.main.humidity)}%</span>
                      <span className="metric-label">Humidity</span>
                    </div>
                    <div className="metric">
                      <MDBIcon fas icon="wind" className="metric-icon" />
                      <span className="metric-value">{weatherData.wind.speed} m/s</span>
                      <span className="metric-label">Wind</span>
                    </div>
                    <div className="metric">
                      <MDBIcon fas icon="compress-alt" className="metric-icon" />
                      <span className="metric-value">{Math.round(weatherData.main.pressure)} hPa</span>
                      <span className="metric-label">Pressure</span>
                    </div>
                  </div>
                </MDBCardBody>
              </MDBCard>

              {tips && (
                <div className="tips-box">
                  <h4 className="tips-heading">
                    <MDBIcon fas icon="lightbulb" className="tips-icon" /> 
                    Weather Insights
                  </h4>
                  <p>{tips}</p>
                </div>
              )}
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      )}

      {weatherData.cod === '404' && (
        <div className="warntext">
          <MDBIcon fas icon="exclamation-circle" className="mr-2" /> 
          City not found! Please try again.
        </div>
      )}

      
    </div>
  );
}

export default App;