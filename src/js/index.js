// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Like';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
/**Global state of the app
*--Search Object
*--Current recipe object
*--Shopping list object
*--Liked recipies
**/
const state = {};
window.state = state;

/*Search Controller*/
const controlSearch = async() => {
	//1 get query from view
	const query = searchView.getInput();
	
	if (query) {
		//2 new Search object 
		state.search = new Search(query);

		//3 prepare ui for result
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);

		//4 do the search
		await state.search.getResult();

		//5 render result on ui
		clearLoader();
		searchView.renderResults(state.search.result);
	}
};

elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
    controlSearch();
});

/*
window.addEventListener('load', e => {
	e.preventDefault();
    controlSearch();
});
*/

elements.searchResPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	if (btn) {
		const goToPage = parseInt(btn.dataset.goto);
		searchView.clearResults();
		searchView.renderResults(state.search.result, goToPage);
	}
});



/*
Recipe controller
**/
const controlRecipe = async() => {
	const id = window.location.hash.replace('#', '');
	if (id) {

		//create new recipe object
		state.recipe = new Recipe(id);

		//prepare ui for changes
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		//hignlight selected
		if (state.search) searchView.highlightSelected(id);
		try {
			//get recipe data
			await state.recipe.getRecipe();

			//calc time and servings
			state.recipe.calcTime();
			state.recipe.calcServings();

			//render the recipe
			clearLoader();
			state.recipe.parseIngredients();
			recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

		} catch (err) {
			alert('Error when processing recipes');
		}
		
	}
}

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

const controlList = () => {
	//create a new list if there in non yet
	if (!state.list) state.list = new List();

	//add each ingredient into the list and userinterface
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
}

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	//handle the delete event
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    	state.list.deleteItem(id);
    	listView.deleteItem(id);
    	
    	//handle count updates
	} else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value, 10);
		state.list.updateCount(id, val);
	}
});

const controlLike = () => {
	if (!state.likes) {
		state.likes = new Likes();
	}
	const currentId = state.recipe.id;
	
	if (!state.likes.isLiked(currentId)) {
		//Add Like to the data
		const newLike = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img);

		//Toggle the like button
		likesView.toggleLikeBtn(true);

		//add like to ui 
		likesView.renderLike(newLike)
		//console.log(state.likes);

	} else {
		//remove like from the state
		state.likes.deleteLike(currentId);

		//toggle the like button
		likesView.toggleLikeBtn(false);

		likesView.deleteLike(currentId);
	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());
}

//restore liked recipes 
window.addEventListener('load',() => {
	state.likes = new Likes();
	//state.likes.readStorage();
	likesView.toggleLikeMenu(state.likes.getNumLikes());

});


//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
	if(e.target.matches('.btn-decrease, .btn-decrease *')) {
		//decrease btn clicked
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateIngredients(state.recipe);
		}		
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		state.recipe.updateServings('inc');
		recipeView.updateIngredients(state.recipe);
	} else if (e.target.matches('.recipe__btn--add, .recipe_btn--add *')) {
		controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		//Like controller
		controlLike();
	}

});

//const l = new List();
//window.l = l;

//Like Controller




