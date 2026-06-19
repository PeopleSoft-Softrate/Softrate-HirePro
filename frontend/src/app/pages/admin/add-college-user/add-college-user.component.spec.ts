import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollegeUserComponent } from './add-college-user.component';

describe('AddCollegeUserComponent', () => {
  let component: AddCollegeUserComponent;
  let fixture: ComponentFixture<AddCollegeUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollegeUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCollegeUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
