import AbstractView from '../framework/view/abstract-view.js';
import { capitalizeFirstLetter } from '../utils.js';

function createFilterItemTemplate(filter, isChecked) {
  const { type, count } = filter;

  return `
    <div class="trip-filters__filter">
      <input 
        id="filter-${type}" 
        class="trip-filters__filter-input visually-hidden" 
        type="radio" 
        name="trip-filter" 
        value="${type}" 
        ${isChecked ? 'checked' : ''}
        ${count === 0 ? 'disabled' : ''}
      >
      <label class="trip-filters__filter-label" for="filter-${type}">${capitalizeFirstLetter(type)}</label>
    </div>
  `;
}

function createFilterTemplate(filterItems) {
  const filterItemsTemplate = filterItems
    .map((filter, index) => createFilterItemTemplate(filter, index === 0))
    .join('');

  return `
    <form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FilterView extends AbstractView {
  #filters = null;

  constructor({ filters }) {
    super();
    this.#filters = filters;
  }

  get template() {
    return createFilterTemplate(this.#filters);
  }
}
