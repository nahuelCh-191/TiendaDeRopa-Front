import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrendaEspecifica } from './prenda-especifica';

describe('PrendaEspecifica', () => {
  let component: PrendaEspecifica;
  let fixture: ComponentFixture<PrendaEspecifica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrendaEspecifica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrendaEspecifica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
