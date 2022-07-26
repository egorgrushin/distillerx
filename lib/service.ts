import { Observable } from 'rxjs/Observable';
import * as urlTemplate from 'url-template';

export class DistilleryService {

	constructor(private http, private apiUrl: string) { }

	getList(url, filter): Observable<any> {
		return this.http.get(`${this.apiUrl}/${url}`, { search: filter })
			.take(1)
			.map(this.getBody)
			.map(this.formatIn)
			.catch(res => this.handleError(res));
	}

	get<T>(url, id): Observable<any> {
		return this.http.get(`${this.apiUrl}/${url}/${id}`)
			.take(1)
			.map(this.getBody)
			.map(this.formatIn)
			.catch(res => this.handleError(res));
	}

	getView(template, params): Observable<any> {
		const url = urlTemplate.parse(template).expand(params);
		return this.http.get(`${this.apiUrl}/${url}`)
			.take(1)
			.map(this.getBody)
			.map(this.formatIn)
			.catch(res => this.handleError(res));
	}

	create(url, data): Observable<any> {
		// return Observable.of({...data, id: uuid()});
		const prepared = this.formatOut(data);
		return this.http.post(`${this.apiUrl}/${url}`, prepared)
			.take(1)
			.map(this.getBody)
			.map(this.formatIn)
			.catch(res => this.handleError(res));
	}

	update(url, id, data): Observable<any> {
		const prepared = this.formatOut(data);
		return this.http.put(`${this.apiUrl}/${url}/${id}`, prepared)
			.take(1)
			.map(this.getBody)
			.map(this.formatIn)
			.catch(res => this.handleError(res));
	}

	remove(url, id): Observable<any> {
		return this.http.delete(`${this.apiUrl}/${url}/${id}`)
			.take(1)
			.map(this.getBody)
			.map(this.formatIn)
			.catch(res => this.handleError(res));
	}

	private formatIn(data) {
		return data;
		// return toCamelCase(data);
	}

	private formatOut(data) {
		return data;
		// return toTitleCase(data);
	}

	private getBody(response) {
		try {
			return response.json();
		} catch (e) {
			return null;
		}
	}

	private handleError(response, caught?: Observable<any>): any {
		const body = this.getBody(response);
		throw new Error(body ? body.message : 'Unknown server error');
	}

}
