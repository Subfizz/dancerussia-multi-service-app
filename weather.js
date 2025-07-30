const WEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a';
const GEOAPI_KEY = '2dafe698b1ab4005a67ee6434983cd0b'; 

// Функция для получения городов через GeoAPI
const fetchCities = async (query) => {
  try {
    console.log(`Отправка запроса для города: ${query}`); // Логируем запрос
    // Запрос к GeoAPI для автозаполнения города
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&apiKey=${GEOAPI_KEY}`);
    
    // Проверка успешности ответа
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    // Получаем и обрабатываем данные
    const data = await response.json();
    console.log('GeoAPI Response:', data); // Выводим ответ в консоль

    // Если данные корректны, продолжаем обновлять datalist
    if (data && data.features && data.features.length > 0) {
      // Извлекаем города из ответа
      const cities = data.features.map(city => city.properties.city);
      console.log('Извлеченные города:', cities); // Логируем извлеченные города
      updateCityDatalist(cities);
    } else {
      console.log('Нет данных о городах');
    }
  } catch (error) {
    console.error('Ошибка при запросе данных:', error); // Логируем ошибки
  }
};

// Обновление списка городов для автозаполнения
const updateCityDatalist = (cities) => {
  const input = document.getElementById('weatherCity');
  input.setAttribute('list', 'cities');
  let datalist = document.getElementById('cities');
  
  // Проверяем, существует ли datalist
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'cities';
    input.parentNode.appendChild(datalist);
  }

  datalist.innerHTML = ''; // Очищаем старые данные
  
  // Если есть города, добавляем их в datalist
  if (cities.length > 0) {
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      datalist.appendChild(option);
    });
  } else {
    console.log('Нет городов для отображения');
  }
};

// Автозаполнение при вводе текста
document.getElementById('weatherCity').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length >= 3) {
    fetchCities(query); // Запрос к GeoAPI
  }
});
