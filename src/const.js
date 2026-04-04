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

const CITIES = [
  'Chamonix',
  'Geneva',
  'Amsterdam',
  'Helsinki',
  'Oslo',
  'Kopehagen'
];

const DESCRIPTIONS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus viverra. Nullam nunc ex, convallis sed finibus eget.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.'
];

const DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';
const FULL_DATE_FORMAT = 'DD/MM/YY HH:mm';

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export { TYPES, DESCRIPTIONS, CITIES, DATE_FORMAT, TIME_FORMAT, FULL_DATE_FORMAT, FilterType };