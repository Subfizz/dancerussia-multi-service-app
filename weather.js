const WEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a';
const GEOAPI_KEY = '2dafe698b1ab4005a67ee6434983cd0b'; 

const weatherCityInput = document.getElementById('weatherCity');
const citiesList = document.getElementById('citiesList');

// Функция для получения городов через GeoAPI
const fetchCities = async (query) => {
  try {
    console.log(`Отправка запроса для города: ${query}`); 
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&apiKey=${GEOAPI_KEY}&lang=ru`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('GeoAPI Response:', data); 

    if (data && data.features && data.features.length > 0) {

      const cities = data.features.map(city => city.properties.city || city.properties.formatted).filter(Boolean); // Только города
      console.log('Извлеченные города:', cities); 
      updateCitiesList(cities);
    } else {
      console.log('Нет данных о городах');
      citiesList.style.display = 'none';  
    }
  } catch (error) {
    console.error('Ошибка при запросе данных:', error); 
  }
};

// Обновление кастомного выпадающего списка с городами
const updateCitiesList = (cities) => {
  citiesList.innerHTML = ''; 
  
  if (cities.length > 0) {
    cities.forEach(city => {
      const li = document.createElement('li');
      li.textContent = city; 
      li.addEventListener('click', () => {
        weatherCityInput.value = city; 
        citiesList.style.display = 'none'; 
        fetchWeatherData(city); 
        fetchWeatherForecast(city); 
      });
      citiesList.appendChild(li);
    });
    citiesList.style.display = 'block'; 
  } else {
    citiesList.style.display = 'none'; 
  }
};

// Получение погоды для выбранного города
const fetchWeatherData = async (city) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${WEATHER_API_KEY}`);
    const data = await response.json();

    if (data.cod !== 200) {
      alert('Ошибка при получении погоды');
      return;
    }

    displayWeatherData(data);
  } catch (error) {
    console.error('Ошибка при получении данных о погоде:', error);
  }
};

// Отображение данных о погоде
const displayWeatherData = (data) => {
  const resultDiv = document.getElementById('weatherResult');
  resultDiv.innerHTML = `
    <div class="card">
      <h3>${data.name}, ${data.sys.country}</h3>
      <p>Температура: ${data.main.temp}°C</p>
      <p>Погода: ${data.weather[0].description}</p>
      <p>Ветер: ${data.wind.speed} м/с</p>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Иконка погоды" />
    </div>
  `;
};

// Автозаполнение при вводе текста
weatherCityInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length >= 2) {
    fetchCities(query); 
  } else {
    citiesList.style.display = 'none'; 
  }
});
