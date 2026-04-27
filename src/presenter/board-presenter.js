import { render } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import NoPointsView from '../view/no-points-view.js';
import SortView from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;

  #eventListComponent = new EventListView();
  #sortComponent = new SortView();
  #noPointsComponent = new NoPointsView();

  #boardPoints = [];

  // Хранилище презентеров: id точки -> экземпляр PointPresenter
  #pointPresenters = new Map();

  constructor({ boardContainer, pointsModel }) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#boardPoints = [...this.#pointsModel.points];
    this.#renderBoard();
  }

  #renderPoint(point) {
    const destination = this.#pointsModel.getDestinationById(point.destination);
    const offers = this.#pointsModel.getOffersByType(point.type);

    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onDataChange: this.#handleDataChange,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point, destination, offers);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderBoard() {
    if (this.#boardPoints.length === 0) {
      render(this.#noPointsComponent, this.#boardContainer);
      return;
    }

    render(this.#sortComponent, this.#boardContainer);
    render(this.#eventListComponent, this.#boardContainer);

    this.#boardPoints.forEach((point) => this.#renderPoint(point));
  }

  // Сбрасывает ВСЕ точки в режим просмотра
  #resetAllViews() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }

  // Вызывается из PointPresenter когда открывается форма редактирования
  #handleModeChange = () => {
    this.#resetAllViews();
  };

  // Обновляет данные точки и перерисовывает её
  #handleDataChange = (updatedPoint) => {
    this.#boardPoints = this.#boardPoints.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );

    const destination = this.#pointsModel.getDestinationById(updatedPoint.destination);
    const offers = this.#pointsModel.getOffersByType(updatedPoint.type);

    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint, destination, offers);
  };
}
