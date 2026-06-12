import AbstractView from '../framework/view/abstract-view.js';
import { formatDate } from '../utils.js';
import { MAX_CITIES_TO_SHOW } from '../const.js';
import he from 'he';

function createRouteTitle(points, destinations) {
  const cities = points.map((point) => {
    const foundDestination = destinations.find((destination) => destination.id === point.destination);
    return foundDestination?.name ? he.encode(foundDestination.name) : '';
  });

  if (cities.length <= MAX_CITIES_TO_SHOW) {
    return cities.join(' &mdash; ');
  }

  return `${cities[0]} &mdash; ... &mdash; ${cities[cities.length - 1]}`;
}

function createTripDates(points) {
  if (!points.length) {
    return '';
  }
  const dateStart = formatDate(points[0].dateFrom);
  const dateEnd = formatDate(points[points.length - 1].dateTo);
  return `${dateStart}&nbsp;&mdash;&nbsp;${dateEnd}`;
}

function createTripCost(points, offers) {
  return points.reduce((total, point) => {
    const pointOffers = offers.find((offerGroup) => offerGroup.type === point.type)?.offers ?? [];
    const selectedOffersPrice = point.offers.reduce((sum, offerId) => {
      const offer = pointOffers.find((offerItem) => offerItem.id === offerId);
      return sum + (offer?.price ?? 0);
    }, 0);
    return total + point.basePrice + selectedOffersPrice;
  }, 0);
}

function createTripInfoTemplate(points, destinations, offers) {
  if (!points.length) {
    return '<section class="trip-main__trip-info trip-info"></section>';
  }

  return (
    `<section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${createRouteTitle(points, destinations)}</h1>
        <p class="trip-info__dates">${createTripDates(points)}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${createTripCost(points, offers)}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #points = null;
  #destinations = null;
  #offers = null;

  constructor({ points, destinations, offers }) {
    super();
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#destinations, this.#offers);
  }
}
