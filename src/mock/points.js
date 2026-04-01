import { getRandomArrayElement } from '../utils.js';
import { TYPES, DESCRIPTIONS } from '../const.js';

const getRandomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const mockDestinations = [
  {
    id: 'dest-1',
    description: getRandomArrayElement(DESCRIPTIONS),
    name: 'Chamonix',
    pictures: [
      { src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 100)}`, description: 'Chamonix park' },
      { src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 100)}`, description: 'Chamonix mountain' }
    ]
  },
  {
    id: 'dest-2',
    description: getRandomArrayElement(DESCRIPTIONS),
    name: 'Geneva',
    pictures: []
  },
  {
    id: 'dest-3',
    description: getRandomArrayElement(DESCRIPTIONS),
    name: 'Amsterdam',
    pictures: [{ src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 100)}`, description: 'Amsterdam canals' }]
  }
];

const mockOffers = TYPES.map((type) => ({
  type,
  offers: [
    { id: `off-${type}-1`, title: `Upgrade to ${type} plus`, price: getRandomInteger(10, 150) },
    { id: `off-${type}-2`, title: `Extra ${type} service`, price: getRandomInteger(10, 150) }
  ]
}));

const mockPoints = [
  {
    id: 'pt-1',
    basePrice: 1100,
    dateFrom: '2019-07-10T22:55:56.845Z',
    dateTo: '2019-07-11T11:22:13.375Z',
    destination: 'dest-1',
    isFavorite: false,
    offers: ['off-taxi-1'],
    type: 'taxi'
  },
  {
    id: 'pt-2',
    basePrice: 500,
    dateFrom: '2019-07-12T12:55:56.845Z',
    dateTo: '2019-07-12T14:22:13.375Z',
    destination: 'dest-2',
    isFavorite: true,
    offers: [],
    type: 'flight'
  },
  {
    id: 'pt-3',
    basePrice: 800,
    dateFrom: '2019-07-14T09:00:56.845Z',
    dateTo: '2019-07-14T12:00:13.375Z',
    destination: 'dest-3',
    isFavorite: false,
    offers: ['off-drive-1', 'off-drive-2'],
    type: 'drive'
  }
];

function getRandomPoint() {
  return getRandomArrayElement(mockPoints);
}

export { getRandomPoint, mockDestinations, mockOffers };
