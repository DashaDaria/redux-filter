let filterFn = Array.prototype.every;
import Fuse from 'fuse.js'
import { createSelector } from 'reselect';

export default function(searchKeys, searchThreshold) {

    function keywordFilter(items, searchText, keys) {

        if (searchText === undefined || searchText === '') return items;

        var f = new Fuse(items, {
            caseSensitive: false,
            includeScore: false,
            shouldSort: false,
            threshold: searchThreshold,
            keys: keys || searchKeys
        });

        return f.search(searchText);

    }


    function filter(appliedFilters, collection, functions) {

        return collection.filter(item => {

            if (!Object.keys(appliedFilters).length) return true;

            return Object.keys(appliedFilters).every(key => {
                return appliedFilters[key].some(value => {
                    const fn = functions[key + '__' + value];
                    return (typeof fn === 'function') ? fn(item) : false;
                });
            });
        });

    }

    const composedSelector = (appliedFilters, keyword, subjectsCollection, functions) => {
        const filteredResults = filter(appliedFilters, subjectsCollection, functions);
        return keywordFilter(filteredResults, keyword);
        // other filters or sorts go here

    };

    const appliedFiltersSelector = state => state.appliedFilters;
    const keywordSelector = state => state.keywordSearch;
    const functions = state => state.filterFns;
    const subjectsCollection = state => state.subjectsCollection;



    return createSelector(
        [appliedFiltersSelector, keywordSelector, subjectsCollection, functions],
        composedSelector
    )
}