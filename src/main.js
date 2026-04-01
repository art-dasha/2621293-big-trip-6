import { render, RenderPosition } from './render.js';
import FilterView from './view/filter-view.js';
import TripInfoView from './view/trip-info-view.js';
import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';

const siteHeaderElement = document.querySelector('.trip-main');
const siteFiltersElement = document.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');

const pointsModel = new PointsModel();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  pointsModel,
});

render(new TripInfoView(), siteHeaderElement, RenderPosition.AFTERBEGIN);

render(new FilterView(), siteFiltersElement);

boardPresenter.init();
