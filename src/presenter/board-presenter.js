import { render, remove } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import NoPointsView from '../view/no-points-view.js';
import SortView from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import { SortType } from '../const.js';
import { sortPoints } from '../utils.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;

  #eventListComponent = new EventListView();
  #noPointsComponent = new NoPointsView();
  #sortComponent = null;

  #boardPoints = [];
  #currentSortType = SortType.DAY;
  #pointPresenters = new Map();

  constructor({ boardContainer, pointsModel }) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#boardPoints = [...this.#pointsModel.points];
    this.#renderBoard();
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });
    render(this.#sortComponent, this.#boardContainer);
  }

  #renderPoint(point) {
  const destination = this.#pointsModel.getDestinationById(point.destination);
  const offers = this.#pointsModel.getOffersByType(point.type);

  const pointPresenter = new PointPresenter({
    pointListContainer: this.#eventListComponent.element,
    onDataChange: this.#handleDataChange,
    onModeChange: this.#handleModeChange,
  });

  pointPresenter.init(
    point,
    destination,
    offers,
    this.#pointsModel.offers,       // allOffers
    this.#pointsModel.destinations, // allDestinations
  );
  this.#pointPresenters.set(point.id, pointPresenter);
}

  #clearPointList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderPointList() {
    const sorted = sortPoints(this.#boardPoints, this.#currentSortType);
    sorted.forEach((point) => this.#renderPoint(point));
  }

  #renderBoard() {
    if (this.#boardPoints.length === 0) {
      render(this.#noPointsComponent, this.#boardContainer);
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#boardContainer);
    this.#renderPointList();
  }

  #resetAllViews() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }

  #handleModeChange = () => {
    this.#resetAllViews();
  };

  #handleDataChange = (updatedPoint) => {
  this.#boardPoints = this.#boardPoints.map((point) =>
    point.id === updatedPoint.id ? updatedPoint : point
  );

  const destination = this.#pointsModel.getDestinationById(updatedPoint.destination);
  const offers = this.#pointsModel.getOffersByType(updatedPoint.type);
  this.#pointPresenters.get(updatedPoint.id).init(
    updatedPoint,
    destination,
    offers,
    this.#pointsModel.offers,
    this.#pointsModel.destinations,
  );
};
  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPointList();
    this.#renderPointList();
  };
}
