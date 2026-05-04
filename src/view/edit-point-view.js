import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { capitalizeFirstLetter, formatTime } from '../utils.js';
import { TYPES, FULL_DATE_FORMAT } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

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
        <span class="event__offer-title">${title}</span>
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
        ${offers.map((o) => createOfferTemplate(o, selectedOffersIds)).join('')}
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
      <p class="event__destination-description">${destination.description}</p>
    </section>`;
};

function createEditPointTemplate(state, destination, offers) {
  const { type, offers: selectedOffersIds, dateFrom, dateTo } = state;
  const destinationName = destination?.name ?? '';

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                ${TYPES.map((t) => createEventTypeItemTemplate(t, type)).join('')}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${type}</label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom ? formatDateForInput(dateFrom) : ''}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo ? formatDateForInput(dateTo) : ''}">
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Cancel</button>
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
  #handleCloseClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({ point, destination, offers, allOffers, allDestinations, onFormSubmit, onCloseClick }) {
    super();
    this._state = structuredClone(point);
    this.#allOffers = allOffers;
    this.#allDestinations = allDestinations;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleCloseClick = onCloseClick;

    this._restoreHandlers();
  }

  get template() {
    const currentOffers = this.#getOffersByType(this._state.type);
    const currentDestination = this.#getDestinationById(this._state.destination);
    return createEditPointTemplate(this._state, currentDestination, currentOffers);
  }

  updateElement(update) {
    this.#destroyDatepickers();
    super.updateElement(update);
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#closeClickHandler);
    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.#setDatepickers();
  }

  #getOffersByType(type) {
    return this.#allOffers.find((o) => o.type === type)?.offers ?? [];
  }

  #getDestinationById(id) {
    return this.#allDestinations.find((d) => d.id === id);
  }

  #setDatepickers() {
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
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
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
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

  #typeChangeHandler = (evt) => {
    const newType = evt.target.value;
    this.updateElement({
      type: newType,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    const newDestinationName = evt.target.value;
    const newDestination = this.#allDestinations.find((d) => d.name === newDestinationName);
    if (!newDestination) {
      return;
    }
    this.updateElement({
      destination: newDestination.id,
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };
}
