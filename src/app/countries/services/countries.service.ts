import { Injectable } from '@angular/core';
import { CountryInterface, Region, SmallCountryInterface } from '../interfaces';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private regions : Region[] = [Region.Africa, Region.America, Region.Asia, Region.Europe, Region.Oceania];
  private baseUrl : string   = 'https://restcountries.com/v3.1';
  
  constructor(private http : HttpClient) { }

  get regionsGetter() {
    return [...this.regions];
  }

  public getCountryByRegion(region : Region) : Observable<SmallCountryInterface[]> {
    if(!region) {
      of([]);
    }

    const url = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<CountryInterface[]>(url)
      .pipe(
        tap((resp) => console.log('resp: ', resp)),
        map((countries) => countries.map(country => ({
          name: country.name.common,
          borders: country.borders,
          cca3: country.cca3
        })))
      );
  }

  public getCountryAlphaCode(alphaCode : string) : Observable<SmallCountryInterface> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;

    return this.http.get<CountryInterface>(url)
      .pipe(
        tap((resp) => console.log('resp: ', resp)),
        map((country) => ({
          name: country.name.common,
          borders: country.borders,
          cca3: country.cca3
        }))
      );
  }

  public getBordersFullName(bordersCode : string[]) : Observable<SmallCountryInterface[]> {
    if(!bordersCode || bordersCode.length === 0) {
      return of([]);
    }

    const countriesRequest : Observable<SmallCountryInterface>[] = [];

    bordersCode.forEach((code) => {
      const request = this.getCountryAlphaCode(code);

      countriesRequest.push(request);
    });

    return combineLatest(countriesRequest);
  }
}
