import { render, RenderPosition } from './framework/render.js';
import TripInfoView from './view/trip-info-view.js';
import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';

const siteHeaderElement = document.querySelector('.trip-main');
const siteFiltersElement = document.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');
const newEventButtonElement = document.querySelector('.trip-main__event-add-btn');

const pointsModel = new PointsModel();
const filterModel = new FilterModel();

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

render(new TripInfoView(), siteHeaderElement, RenderPosition.AFTERBEGIN);

filterPresenter.init();
boardPresenter.init();

newEventButtonElement.addEventListener('click', () => {
  boardPresenter.createPoint();
  newEventButtonElement.disabled = true;
});
