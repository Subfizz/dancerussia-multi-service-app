const WEATHER_API_KEY = 'a1010b1ef1414b8f9fb152349253007';
const OPENWEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a';
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
      const cities = data.features.map(city => city.properties.city || city.properties.formatted).filter(Boolean);
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
      });
      citiesList.appendChild(li);
    });
    citiesList.style.display = 'block';
    adjustCitiesListPosition();
  } else {
    citiesList.style.display = 'none';
  }
};

// Получение координат города с GeoAPI
const fetchCityCoordinates = async (city) => {
  const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${GEOAPI_KEY}`);
  const data = await response.json();
  if (data.features.length > 0) {
    return data.features[0].geometry.coordinates;
  } else {
    throw new Error('Город не найден');
  }
};

// Получение прогноза на неделю для выбранного города с WeatherAPI
const fetchWeatherData = async (city) => {
  try {
    // Получаем координаты города через GeoAPI
    const [lon, lat] = await fetchCityCoordinates(city);

    // Получаем данные с OpenWeather для актуальной погоды
    const openWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ru`);
    const openWeatherData = await openWeatherResponse.json();

    if (openWeatherData.cod !== 200) {
      alert('Ошибка при получении актуальной погоды');
      return;
    }

    // Получаем прогноз на неделю с WeatherAPI
    const weatherApiResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=7&lang=ru`);
    const weatherApiData = await weatherApiResponse.json();

    if (weatherApiData.error) {
      alert('Ошибка при получении прогноза на неделю с WeatherAPI');
      return;
    }

    // Отображение данных погоды
    displayWeatherData(openWeatherData, weatherApiData);
  } catch (error) {
    console.error('Ошибка при получении данных о погоде:', error);
  }
};

// Отображение данных о текущей погоде и прогнозе на неделю
const displayWeatherData = (openWeatherData, weatherApiData) => {
  const resultDiv = document.getElementById('weatherResult');
  const dailyForecast = weatherApiData.forecast.forecastday;
  let forecastHTML = '';

  // Отображаем текущую погоду (OpenWeather)
  const currentWeather = openWeatherData.weather[0].description;
  const temp = Math.round(openWeatherData.main.temp);
  resultDiv.innerHTML = `
    <h2>Текущая погода: ${currentWeather}</h2>
    <p>Температура: ${temp}°C</p>
    <p>Влажность: ${openWeatherData.main.humidity}%</p>
  `;

  // Прогноз на неделю (WeatherAPI)
  dailyForecast.forEach(day => {
    const date = new Date(day.date);
    forecastHTML += `
      <div class="card">
        <h3>${date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <p>Температура: ${day.day.avgtemp_c}°C</p>
        <p>Погода: ${day.day.condition.text}</p>
        <p>Ветер: ${day.day.maxwind_kph} км/ч</p>
        <img src="${day.day.condition.icon}" alt="Иконка погоды" />
      </div>
    `;
  });

  resultDiv.innerHTML += `
    <h2>Прогноз на неделю:</h2>
    ${forecastHTML}
  `;
};

// Функция для корректного позиционирования выпадающего списка
const adjustCitiesListPosition = () => {
  const inputRect = weatherCityInput.getBoundingClientRect();
  citiesList.style.left = `${inputRect.left}px`;
  citiesList.style.width = `${inputRect.width}px`;
  citiesList.style.top = `${inputRect.bottom}px`;
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
