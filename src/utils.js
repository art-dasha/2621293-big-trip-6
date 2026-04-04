import dayjs from 'dayjs';

const capitalizeFirstLetter = (string) => {
  if (!string) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getRandomArrayElement = (items) => items[Math.floor(Math.random() * items.length)];

const isPointFuture = (dateFrom) => dateFrom && dayjs().isBefore(dayjs(dateFrom), 'D');
const isPointPresent = (dateFrom, dateTo) => {
  const now = dayjs();
  return now.isAfter(dayjs(dateFrom).subtract(1, 'day')) && now.isBefore(dayjs(dateTo).add(1, 'day'));
};
const isPointPast = (dateTo) => dateTo && dayjs().isAfter(dayjs(dateTo), 'D');

export { 
  getRandomArrayElement, 
  capitalizeFirstLetter, 
  isPointFuture, 
  isPointPresent, 
  isPointPast 
};
