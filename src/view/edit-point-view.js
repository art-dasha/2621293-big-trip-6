import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { capitalizeFirstLetter, getOffersByType, getDestinationById } from '../utils.js';
import { TYPES, FULL_DATE_FORMAT, FLATPICKR_DATE_FORMAT, Key } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';
import he from 'he';

const formatDateForInput = (date) => dayjs(date).format(FULL_DATE_FORMAT);

const createEventTypeItemTemplate = (type, currentType) => {
  const capitalizedType = capitalizeFirstLetter(type);
  const isChecked = type === currentType ? 'checked' : '';
  return `
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${isChecked}>
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">${capitalizedType}</label>
    </div>`;
};

const createOfferTemplate = (offer, selectedOffersIds) => {
  const { id, title, price } = offer;
  const isChecked = selectedOffersIds.includes(id) ? 'checked' : '';
  return `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="event-offer-${id}" type="checkbox" name="event-offer-${id}" ${isChecked}>
      <label class="event__offer-label" for="event-offer-${id}">
        <span class="event__offer-title">${he.encode(title)}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>`;
};

const createOffersSection = (offers, selectedOffersIds) => {
  if (!offers.length) {
    return '';
  }
  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offers.map((offer) => createOfferTemplate(offer, selectedOffersIds)).join('')}
      </div>
    </section>`;
};

const createDestinationSection = (destination) => {
  if (!destination || (!destination.description && !destination.pictures?.length)) {
    return '';
  }
  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${he.encode(destination.description)}</p>
      ${destination.pictures?.length ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map((pic) => `<img class="event__photo" src="${he.encode(pic.src)}" alt="${he.encode(pic.description)}">`).join('')}
          </div>
        </div>` : ''}
    </section>`;
};

const createDestinationDatalist = (destinations) => `
  <datalist id="destination-list-1">
    ${destinations.map((destination) => `<option value="${he.encode(destination.name)}"></option>`).join('')}
  </datalist>
`;

const getResetBtnText = (isNewPoint, isDeleting) => {
  if (isNewPoint) {
    return 'Cancel';
  }
  return isDeleting ? 'Deleting...' : 'Delete';
};

function createEditPointTemplate(state, destination, offers, destinations) {
  const { type, offers: selectedOffersIds, dateFrom, dateTo, basePrice, isSaving, isDeleting } = state;
  const destinationName = destination?.name ? he.encode(destination.name) : '';

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox" ${isSaving || isDeleting ? 'disabled' : ''}>
            <div class="event__type-list">
              <fieldset class="event__type-group">
                ${TYPES.map((eventType) => createEventTypeItemTemplate(eventType, type)).join('')}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${type}</label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1" ${isSaving || isDeleting ? 'disabled' : ''}>
            ${createDestinationDatalist(destinations)}
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom ? formatDateForInput(dateFrom) : ''}" ${isSaving || isDeleting ? 'disabled' : ''}>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo ? formatDateForInput(dateTo) : ''}" ${isSaving || isDeleting ? 'disabled' : ''}>
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input event__input--price" id="event-price-1" type="number" min="0" name="event-price" value="${basePrice}" ${isSaving || isDeleting ? 'disabled' : ''}>
          </div>
          <button class="event__save-btn btn btn--blue" type="submit" ${isSaving || isDeleting ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
          <button class="event__reset-btn" type="${state.isNewPoint ? 'button' : 'reset'}">${getResetBtnText(state.isNewPoint, isDeleting)}</button>
          <button class="event__rollup-btn" type="button">
  <span class="visually-hidden">Open event</span>
</button>
        </header>
        <section class="event__details">
          ${createOffersSection(offers, selectedOffersIds)}
          ${createDestinationSection(destination)}
        </section>
      </form>
    </li>`
  );
}

export default class EditPointView extends AbstractStatefulView {
  #allOffers = null;
  #allDestinations = null;
  #handleFormSubmit = null;
  #handleDeleteClick = null;
  #handleCloseClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #isNextClickBlocked = false;

  constructor({ point, allOffers, allDestinations, onFormSubmit, onDeleteClick, onCloseClick }) {
    super();
    this._state = {
      ...structuredClone(point),
      isSaving: false,
      isDeleting: false,
      isNewPoint: !point.id,
    };
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleDeleteClick = onDeleteClick;
    this.#handleCloseClick = onCloseClick;

    this._restoreHandlers();
  }

  get template() {
    const currentOffers = getOffersByType(this.#allOffers, this._state.type);
    const currentDestination = getDestinationById(this.#allDestinations, this._state.destination);
    return createEditPointTemplate(this._state, currentDestination, currentOffers, this.#allDestinations);
  }

  updateElement(update) {
    this.#destroyDatepickers();
    super.updateElement(update);
  }

  _restoreHandlers() {
    this.#isNextClickBlocked = false;
    const rollupButtonElement = this.element.querySelector('.event__rollup-btn');
    const resetButtonElement = this.element.querySelector('.event__reset-btn');

    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
    rollupButtonElement.addEventListener('click', this.#closeClickHandler);
    rollupButtonElement.addEventListener('keydown', this.#rollupKeydownHandler);
    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);
    resetButtonElement.addEventListener('keydown', this.#resetBtnKeydownHandler);
    resetButtonElement.addEventListener('click', this.#deleteClickHandler);
    this.element.querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);

    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#offerChangeHandler);
    }

    this.#setDatepickers();
  }

  getState() {
    const state = structuredClone(this._state);
    delete state.isSaving;
    delete state.isDeleting;
    delete state.isNewPoint;
    return state;
  }

  reset(point) {
    this.updateElement({
      ...point,
      isSaving: false,
      isDeleting: false,
    });
  }

  #setDatepickers() {
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        enableTime: true,
        dateFormat: FLATPICKR_DATE_FORMAT,
        defaultDate: this._state.dateFrom ?? '',
        onChange: ([userDate]) => {
          this._setState({ dateFrom: userDate.toISOString() });
          this.#datepickerTo.set('minDate', userDate);
        },
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        enableTime: true,
        dateFormat: FLATPICKR_DATE_FORMAT,
        defaultDate: this._state.dateTo ?? '',
        minDate: this._state.dateFrom ?? '',
        onChange: ([userDate]) => {
          this._setState({ dateTo: userDate.toISOString() });
        },
      }
    );
  }

  #destroyDatepickers() {
    this.#datepickerFrom?.destroy();
    this.#datepickerTo?.destroy();
    this.#datepickerFrom = null;
    this.#datepickerTo = null;
  }

  #offerChangeHandler = (evt) => {
    const offerId = evt.target.id.replace('event-offer-', '');
    const selectedOffers = this._state.offers.includes(offerId)
      ? this._state.offers.filter((offer) => offer !== offerId)
      : [...this._state.offers, offerId];
    this._setState({ offers: selectedOffers });
  };

  #rollupKeydownHandler = (evt) => {
    if (evt.key === Key.ENTER) {
      evt.preventDefault();
      if (this._state.isSaving || this._state.isDeleting) {
        return;
      }
      this.#handleCloseClick();
    }
  };

  #typeChangeHandler = (evt) => {
    const newType = evt.target.value;
    this.updateElement({
      type: newType,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    const newDestinationName = evt.target.value;
    const newDestination = this.#allDestinations.find((destination) => destination.name === newDestinationName);
    if (!newDestination) {
      return;
    }
    this.updateElement({
      destination: newDestination.id,
    });
  };

  #priceChangeHandler = (evt) => {
    this._setState({ basePrice: parseInt(evt.target.value, 10) });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    if (this._state.isSaving || this._state.isDeleting) {
      return;
    }
    this.#handleCloseClick();
  };

  #resetBtnKeydownHandler = (evt) => {
    if (evt.key === Key.ENTER) {
      if (this._state.isSaving || this._state.isDeleting) {
        this.#isNextClickBlocked = true;
      } else {
        evt.preventDefault();
        this.#handleDeleteClick();
      }
    }
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#isNextClickBlocked) {
      this.#isNextClickBlocked = false;
      return;
    }
    this.#handleDeleteClick();
  };
}
