import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MeetingsPage } from './meetings.page';

describe('MeetingsPage', () => {
  let component: MeetingsPage;
  let fixture: ComponentFixture<MeetingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
