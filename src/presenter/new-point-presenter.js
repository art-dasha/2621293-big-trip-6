import { render, remove, RenderPosition } from '../framework/render.js';
import EditPointView from '../view/edit-point-view.js';
import { UserAction, UpdateType } from '../const.js';

const BLANK_POINT = {
  basePrice: 1,
  dateFrom: new Date().toISOString(),
  dateTo: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
  destination: null,
  isFavorite: false,
  offers: [],
  type: 'flight',
};

export default class NewPointPresenter {
  #pointListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;
  #pointEditComponent = null;
  #allOffers = null;
  #allDestinations = null;

  constructor({ pointListContainer, onDataChange, onDestroy }) {
    this.#pointListContainer = pointListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init(allOffers, allDestinations) {
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;

    if (this.#pointEditComponent !== null) {
      return;
    }

    const firstDestination = allDestinations[0] ?? null;
    const point = {
      ...BLANK_POINT,
      id: crypto.randomUUID(),
      destination: firstDestination?.id ?? null,
    };

    this.#pointEditComponent = new EditPointView({
      point,
      destination: firstDestination,
      offers: [],
      allOffers,
      allDestinations,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleCloseClick,
      onCloseClick: this.#handleCloseClick,
    });

    render(this.#pointEditComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#handleDestroy();
  }

  setSaving() {
    this.#pointEditComponent.updateElement({ isSaving: true });
  }

  setAborting() {
    this.#pointEditComponent.shake(() => {
      this.#pointEditComponent.updateElement({ isSaving: false });
    });
  }

  #handleFormSubmit = () => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      this.#pointEditComponent.getState(),
    );
  };

  #handleCloseClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
