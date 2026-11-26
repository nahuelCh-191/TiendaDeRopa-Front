import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasPorMes } from './ventas-por-mes';

describe('VentasPorMes', () => {
  let component: VentasPorMes;
  let fixture: ComponentFixture<VentasPorMes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasPorMes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasPorMes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
