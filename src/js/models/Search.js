import axios from 'axios';
import {key, proxy} from '../config';

export default class Search {
	constructor(query) {
		this.query = query;
	}

	async getResult() {			
		try {
			//incase the key was invalid and http get fail
			const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
    		this.result = res.data.recipes;
		} catch(err) {
			alert(err);
		} 
	}
}
