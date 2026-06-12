import { render, replace, remove, RenderPosition } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';
import { UpdateType, SortType } from '../const.js';
import { sortPoints } from '../utils.js';

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

    const sortedPoints = sortPoints([...this.#pointsModel.points], SortType.DAY);

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
