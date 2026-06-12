const TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant'
];

const DATE_FORMAT = 'DD MMM';
const EVENT_DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';
const FULL_DATE_FORMAT = 'DD/MM/YY HH:mm';
const MAX_CITIES_TO_SHOW = 3;
const FLATPICKR_DATE_FORMAT = 'd/m/y H:i';

const UiBlockerTimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

const SortType = {
  DAY: 'sort-day',
  TIME: 'sort-time',
  PRICE: 'sort-price',
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

const Key = {
  ESCAPE: 'Escape',
  ESC: 'Esc',
  ENTER: 'Enter',
};

export { TYPES, DATE_FORMAT, EVENT_DATE_FORMAT, TIME_FORMAT, FULL_DATE_FORMAT, MAX_CITIES_TO_SHOW, UiBlockerTimeLimit, FLATPICKR_DATE_FORMAT, FilterType, SortType, UserAction, UpdateType, Key };
