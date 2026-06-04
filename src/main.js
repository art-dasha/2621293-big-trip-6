import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import BigTripApiService from './big-trip-api-service.js';

const END_POINT = 'https://23.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = 'Basic abc123xyz456';

const siteHeaderElement = document.querySelector('.trip-main');
const siteFiltersElement = document.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');
const newEventButtonElement = document.querySelector('.trip-main__event-add-btn');

const apiService = new BigTripApiService(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel({ apiService });
const filterModel = new FilterModel();

const tripInfoPresenter = new TripInfoPresenter({
  tripInfoContainer: siteHeaderElement,
  pointsModel,
});

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  pointsModel,
  filterModel,
  onNewPointDestroy: () => {
    newEventButtonElement.disabled = false;
  },
});

const filterPresenter = new FilterPresenter({
  filterContainer: siteFiltersElement,
  filterModel,
  pointsModel,
});

filterPresenter.init();
boardPresenter.init();
tripInfoPresenter.init();
pointsModel.init();

newEventButtonElement.addEventListener('click', () => {
  boardPresenter.createPoint();
  newEventButtonElement.disabled = true;
});
