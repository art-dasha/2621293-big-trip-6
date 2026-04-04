import { isPointFuture, isPointPresent, isPointPast } from '../utils.js';

const filter = {
  everything: (points) => points,
  future: (points) => points.filter((point) => isPointFuture(point.dateFrom)),
  present: (points) => points.filter((point) => isPointPresent(point.dateFrom, point.dateTo)),
  past: (points) => points.filter((point) => isPointPast(point.dateTo)),
};

export function generateFilter(points) {
  return Object.entries(filter).map(
    ([filterType, filterPoints]) => ({
      type: filterType,
      count: filterPoints(points).length,
    }),
  );
}
