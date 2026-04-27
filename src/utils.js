import dayjs from 'dayjs';
import { SortType } from './const.js';

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

const sortByDay = (pointA, pointB) =>
  dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

const sortByTime = (pointA, pointB) => {
  const durationA = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));
  const durationB = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom));
  return durationB - durationA;
};

const sortByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

const sortPoints = (points, sortType) => {
  switch (sortType) {
    case SortType.DAY:
      return [...points].sort(sortByDay);
    case SortType.TIME:
      return [...points].sort(sortByTime);
    case SortType.PRICE:
      return [...points].sort(sortByPrice);
  }
  return points;
};

export { 
  getRandomArrayElement, 
  capitalizeFirstLetter, 
  isPointFuture, 
  isPointPresent, 
  isPointPast,
  sortPoints,
};
