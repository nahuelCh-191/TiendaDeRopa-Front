import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendedorEspecifico } from './vendedor-especifico';

describe('VendedorEspecifico', () => {
  let component: VendedorEspecifico;
  let fixture: ComponentFixture<VendedorEspecifico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendedorEspecifico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendedorEspecifico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
