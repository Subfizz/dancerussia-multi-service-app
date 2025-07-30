const WEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a';
const GEOAPI_KEY = '2dafe698b1ab4005a67ee6434983cd0b'; 

const weatherCityInput = document.getElementById('weatherCity');
const citiesList = document.getElementById('citiesList');

// Функция для получения городов через GeoAPI
const fetchCities = async (query) => {
  try {
    console.log(`Отправка запроса для города: ${query}`); // Логируем запрос
    // Запрос к GeoAPI для автозаполнения города с параметром lang=ru для русского языка
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&apiKey=${GEOAPI_KEY}&lang=ru`);
    
    // Проверка успешности ответа
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    // Получаем и обрабатываем данные
    const data = await response.json();
    console.log('GeoAPI Response:', data); // Выводим ответ в консоль

    // Если данные корректны, продолжаем обновлять citiesList
    if (data && data.features && data.features.length > 0) {
      // Извлекаем города из ответа
      const cities = data.features.map(city => city.properties.city || city.properties.formatted).filter(Boolean); // Только города
      console.log('Извлеченные города:', cities); // Логируем извлеченные города
      updateCitiesList(cities);
    } else {
      console.log('Нет данных о городах');
      citiesList.style.display = 'none';  // Скрываем список, если нет данных
    }
  } catch (error) {
    console.error('Ошибка при запросе данных:', error); // Логируем ошибки
  }
};

// Обновление кастомного выпадающего списка с городами
const updateCitiesList = (cities) => {
  citiesList.innerHTML = ''; // Очищаем старые данные
  
  if (cities.length > 0) {
    cities.forEach(city => {
      const li = document.createElement('li');
      li.textContent = city; // Название города
      li.addEventListener('click', () => {
        weatherCityInput.value = city; // Заполняем поле с городом
        citiesList.style.display = 'none'; // Скрываем список после выбора
        fetchWeatherData(city); // Получаем погоду для выбранного города
      });
      citiesList.appendChild(li);
    });
    citiesList.style.display = 'block';  // Показываем список
  } else {
    citiesList.style.display = 'none';  // Скрываем список, если нет городов
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
  if (query.length >= 3) {
    fetchCities(query); // Запрос к GeoAPI
  } else {
    citiesList.style.display = 'none';  // Скрываем список, если запрос короткий
  }
});
