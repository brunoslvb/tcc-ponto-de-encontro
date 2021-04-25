import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDDD } from 'src/app/interfaces/DDD';
import DDD from 'src/app/config/DDD.js';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  ddd: IDDD[] = DDD;

  constructor(
    private builder: FormBuilder
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      ddd: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]{9}$")]],
    });
  }

  register(){
    console.log(this.registerForm.value);
  }

}
