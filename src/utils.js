import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { SortType, DATE_FORMAT, EVENT_DATE_FORMAT, TIME_FORMAT, FilterType } from './const.js';

const capitalizeFirstLetter = (string) => {
  if (!string) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const isPointFuture = (dateFrom) => dateFrom && dayjs().isBefore(dayjs(dateFrom), 'D');
const isPointPresent = (dateFrom, dateTo) => {
  const now = dayjs();
  return now.isAfter(dayjs(dateFrom).subtract(1, 'day')) && now.isBefore(dayjs(dateTo).add(1, 'day'));
};
const isPointPast = (dateTo) => dateTo && dayjs().isAfter(dayjs(dateTo), 'D');

const formatDate = (date) => dayjs(date).format(DATE_FORMAT);
const formatEventDate = (date) => dayjs(date).format(EVENT_DATE_FORMAT);
const formatTime = (date) => dayjs(date).format(TIME_FORMAT);

const formatDuration = (dateFrom, dateTo) => {
  const diff = dayjs.duration(dayjs(dateTo).diff(dayjs(dateFrom)));
  const days = Math.floor(diff.asDays());
  const hours = diff.hours();
  const minutes = diff.minutes();

  if (days > 0) {
    return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }
  return `${String(minutes).padStart(2, '0')}M`;
};

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

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point.dateFrom, point.dateTo)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point.dateTo)),
};

const generateFilter = (points) => Object.entries(filter).map(([filterType, filterFn]) => ({
  type: filterType,
  count: filterFn(points).length,
}));

const getOffersByType = (offers, type) => offers.find((offer) => offer.type === type)?.offers ?? [];

const getDestinationById = (destinations, id) => destinations.find((destination) => destination.id === id);

dayjs.extend(duration);

export {
  capitalizeFirstLetter,
  isPointFuture,
  isPointPresent,
  isPointPast,
  sortPoints,
  formatDate,
  formatEventDate,
  formatTime,
  formatDuration,
  generateFilter,
  getOffersByType,
  getDestinationById,
  filter,
};
