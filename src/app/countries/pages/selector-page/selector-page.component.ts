import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountryInterface } from '../../interfaces';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'countries-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countries : SmallCountryInterface[] = [];
  public borders   : SmallCountryInterface[] = [];
  public myForm    : FormGroup               = this.fb.group({
    region : ['', Validators.required],
    country: ['', Validators.required],
    border : ['', Validators.required]
  });

  constructor(
    private fb : FormBuilder,
    private countriesService : CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onBorderChanged();
  }

  get regions() : Region[] {
    return this.countriesService.regionsGetter;
  }

  public onRegionChanged() : void {
    this.myForm.get('region')?.valueChanges
      .pipe(
        switchMap(region => this.countriesService.getCountryByRegion(region))
      )
      .subscribe( (response) => {
        this.myForm.get('country')!.setValue('');
        this.myForm.get('border')!.setValue('');
        this.countries = response;
        this.borders = [];
      })
  }

  public onBorderChanged() : void {
    this.myForm.get('country')?.valueChanges
      .pipe(
        filter((code : string) => code.length > 0),
        switchMap(code => this.countriesService.getCountryAlphaCode(code)),
        switchMap((country) => this.countriesService.getBordersFullName(country.borders ?? []))
      )
      .subscribe( (response) => {
        this.myForm.get('border')!.setValue('');
        this.borders = response;
      })
  }
}
