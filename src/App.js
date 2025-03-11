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


function App() {

  const weatherApi= process.env.REACT_APP_weatherApi;
  const geminiApi= process.env.REACT_APP_geminiApi;
  
  const [weatherData, setWeatherData] = useState({});
  const [city, setCity] = useState("");
  const [tips, setTips] = useState("");

  const genAI = new GoogleGenerativeAI(geminiApi);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    if (weatherData.name) {
      getTips();
    }
  }, [weatherData]);

  const getWeather = (event) => {
    if (event.key === "Enter") {
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${weatherApi}`)
        .then(response => response.json())
        .then(data => {
          setWeatherData(data);
          setCity("");
        })
        .catch(error => {
          console.error('Error fetching weather data:', error);
          setWeatherData({ cod: '404' });
        });
    }
  };

  async function getTips() {
    try {
      const input = `If in ${weatherData.name}, temperature is ${Math.round(weatherData.main.temp)}°C ,weather is ${weatherData.weather[0].main} humidity is ${Math.round(weatherData.main.humidity)}%  and pressure is ${Math.round(weatherData.main.pressure)} hPa , forecast the weather and suggest tips in 5 line summary)`;
      const result = await model.generateContent(input);
      const response = await result.response;
      setTips(response.text());
    } catch (error) {
      console.error('Error generating tips:', error);
    }
  }



  return (
    
   <div>
   
    <section className="vh-100" style={{ backgroundColor: "#4B515D" }}>
     
    <input
        className='input'       
        placeholder='Enter your city name here...'
        onChange={e => setCity(e.target.value)}
        value={city}
        onKeyDown={getWeather}
      />
     
     <p className='text'>Welcome to the smart weather app! </p>

     {typeof weatherData.main === 'undefined' ? (
        <div>
          
        </div>
      ) : (
        <MDBContainer className="h-100">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol md="8" lg="6" xl="4">
            <MDBCard style={{ color: "#4B515D", borderRadius: "35px" }}>
              <MDBCardBody className="p-4">
                <div className="d-flex">
                  <MDBTypography tag="h6" className="flex-grow-1">
                    {weatherData.name}
                  </MDBTypography>
                  <MDBTypography tag="h6">UTC+{weatherData.timezone/3600}</MDBTypography>
                </div>

                <div className="d-flex flex-column text-center mt-5 mb-4">
                  <MDBTypography
                    tag="h6"
                    className="display-4 mb-0 font-weight-bold"
                    style={{ color: "#1C2331" }}
                  >
                    {" "}
                    {Math.round(weatherData.main.temp)}°C{" "}
                  </MDBTypography>
                  <span className="small" style={{ color: "#868B94" }}>
                  {weatherData.weather[0].main}
                  </span>
                </div>

                <div className="d-flex align-items-center">
                  <div className="flex-grow-1" style={{fontSize: '1rem'}}>
                    <div>
                      <MDBIcon
                        fas
                        icon="wind fa-fw"
                        style={{ color: "#868B94" }}
                      />{" "}
                      <span className="ms-1"> {Math.round(weatherData.main.pressure)} hPa</span>
                    </div>
                    <div>
                      <MDBIcon
                        fas
                        icon="tint fa-fw"
                        style={{ color: "#868B94" }}
                      />{" "}
                      <span className="ms-1"> {Math.round(weatherData.main.humidity)}% </span>
                    </div>
                    <div>
                      <MDBIcon
                        fas
                        icon="sun fa-fw"
                        style={{ color: "#868B94" }}
                      />{" "}
                      <span className="ms-1"> {weatherData.wind.speed} km/h </span>
                    </div>
                  </div>
                  {(weatherData.weather[0].main === 'Clouds' || weatherData.weather[0].main === 'Rain' || weatherData.weather[0].main === 'storm') ? (
                        <div>
                        <img
                          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-weather/ilu1.webp"
                          width="100px"
                        />
                      </div>
                    ) : (
                      <div>
                      <img
                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-weather/ilu3.webp"
                        width="100px"
                      />
                    </div>
                    )}

                  
                </div>
              </MDBCardBody>
            </MDBCard>
            <div className='box'>
          <p>{tips}</p>
        </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
       )}



      {weatherData.cod === '404' ? (
        <div><p className='warntext'>City not found !</p></div>
      ) : (<></>)}  
    
     
    </section>
    </div>
  );
}

export default App;



