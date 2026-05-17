import { render, replace, remove, RenderPosition } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';
import { UpdateType } from '../const.js';

export default class TripInfoPresenter {
  #tripInfoContainer = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor({ tripInfoContainer, pointsModel }) {
    this.#tripInfoContainer = tripInfoContainer;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const prevTripInfoComponent = this.#tripInfoComponent;

    const sortedPoints = [...this.#pointsModel.points]
      .sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    this.#tripInfoComponent = new TripInfoView({
      points: sortedPoints,
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
    });

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #handleModelEvent = (updateType) => {
    if (updateType === UpdateType.INIT ||
        updateType === UpdateType.MINOR ||
        updateType === UpdateType.MAJOR) {
      this.init();
    }
  };
}
