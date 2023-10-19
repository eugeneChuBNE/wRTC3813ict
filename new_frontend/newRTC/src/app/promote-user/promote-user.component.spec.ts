import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoteUserComponent } from './promote-user.component';

describe('PromoteUserComponent', () => {
  let component: PromoteUserComponent;
  let fixture: ComponentFixture<PromoteUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PromoteUserComponent]
    });
    fixture = TestBed.createComponent(PromoteUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
