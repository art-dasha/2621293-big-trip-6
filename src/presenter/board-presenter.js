import { render, remove } from '../framework/render.js';
import EventListView from '../view/event-list-view.js';
import NoPointsView from '../view/no-points-view.js';
import LoadingView from '../view/loading-view.js';
import SortView from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import { SortType, UpdateType, UserAction, FilterType, UiBlockerTimeLimit } from '../const.js';
import { sortPoints, filter } from '../utils.js';
import ErrorView from '../view/error-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;
  #filterModel = null;

  #eventListComponent = new EventListView();
  #loadingComponent = new LoadingView();
  #errorComponent = null;
  #noPointsComponent = null;
  #sortComponent = null;

  #currentSortType = SortType.DAY;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: UiBlockerTimeLimit.LOWER_LIMIT,
    upperLimit: UiBlockerTimeLimit.UPPER_LIMIT
  });

  #isSubmitting = false;

  constructor({ boardContainer, pointsModel, filterModel, onNewPointDestroy }) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: () => {
        onNewPointDestroy();
        if (this.points.length === 0) {
          this.#renderNoPoints();
        }
      },
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filtered = filter[filterType](points);
    return sortPoints(filtered, this.#currentSortType);
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    if (this.#noPointsComponent) {
      remove(this.#noPointsComponent);
      this.#noPointsComponent = null;
    }
    this.#newPointPresenter.init(
      this.#pointsModel.offers,
      this.#pointsModel.destinations,
    );
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#boardContainer);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });
    render(this.#sortComponent, this.#boardContainer);
  }

  #renderNoPoints() {
    this.#noPointsComponent = new NoPointsView({
      filterType: this.#filterModel.filter,
    });
    render(this.#noPointsComponent, this.#boardContainer);
  }

  #renderPoint(point) {
    const destination = this.#pointsModel.getDestinationById(point.destination);
    const offers = this.#pointsModel.getOffersByType(point.type);

    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(
      point,
      destination,
      offers,
      this.#pointsModel.offers,
      this.#pointsModel.destinations,
    );
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderError() {
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#boardContainer);
  }

  #clearBoard({ resetSortType = false } = {}) {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    if (this.#noPointsComponent) {
      remove(this.#noPointsComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    const points = this.points;

    if (points.length === 0) {
      render(this.#eventListComponent, this.#boardContainer);
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    render(this.#eventListComponent, this.#boardContainer);
    points.forEach((point) => this.#renderPoint(point));
  }

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id)?.init(
          data,
          this.#pointsModel.getDestinationById(data.destination),
          this.#pointsModel.getOffersByType(data.type),
          this.#pointsModel.offers,
          this.#pointsModel.destinations,
        );
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        if (data?.hasError) {
          this.#renderError();
          return;
        }
        this.#renderBoard();
        break;
    }
  };

  #handleModeChange = () => {
    if (this.#isSubmitting) {
      return false;
    }
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    this.#isSubmitting = true;
    try {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          this.#pointPresenters.get(update.id)?.setSaving();
          try {
            await this.#pointsModel.updatePoint(updateType, update);
          } catch (err) {
            this.#pointPresenters.get(update.id)?.setAborting();
          }
          break;
        case UserAction.ADD_POINT:
          this.#newPointPresenter.setSaving();
          try {
            await this.#pointsModel.addPoint(updateType, update);
            this.#newPointPresenter.destroy();
          } catch (err) {
            this.#newPointPresenter.setAborting();
          }
          break;
        case UserAction.DELETE_POINT:
          this.#pointPresenters.get(update.id)?.setDeleting();
          try {
            await this.#pointsModel.deletePoint(updateType, update);
          } catch (err) {
            this.#pointPresenters.get(update.id)?.setAborting();
          }
          break;
      }
    } finally {
      this.#isSubmitting = false;
      this.#uiBlocker.unblock();
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };
}

