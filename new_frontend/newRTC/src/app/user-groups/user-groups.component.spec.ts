import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupsComponent } from './user-groups.component';

describe('UserGroupsComponent', () => {
  let component: UserGroupsComponent;
  let fixture: ComponentFixture<UserGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserGroupsComponent]
    });
    fixture = TestBed.createComponent(UserGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
