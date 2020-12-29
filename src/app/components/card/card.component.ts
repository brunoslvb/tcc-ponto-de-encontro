import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {

  @Input() href: string;
  @Input() map: string;
  @Input() title: string;
  @Input() address: string;
  @Input() time: string;
  @Input() date: string;

  constructor() { }

  ngOnInit() {}

}
