import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent implements OnInit {

  @Input() type: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Input() icon: string;

  constructor() { }

  ngOnInit() {}

}
