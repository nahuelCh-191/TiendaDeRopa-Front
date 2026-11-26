import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConjuntoPrendas } from './conjunto-prendas';

describe('ConjuntoPrendas', () => {
  let component: ConjuntoPrendas;
  let fixture: ComponentFixture<ConjuntoPrendas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConjuntoPrendas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConjuntoPrendas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
