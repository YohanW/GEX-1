import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ConditionFunc } from 'rxjs/internal/observable/generate';
import { Config } from 'protractor';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: String;
  password: String;

  constructor(private registerService:RegisterService,
              private router:Router,
              private flashMessage:FlashMessagesService) { }

  ngOnInit() {
  }

  onLoginSubmit() {
    const buyer = {
      email: this.email,
      password: this.password
    }

    var userType = "Buyer";

    this.registerService.AuthenticateBuyer(buyer).subscribe((data:any) => {
      if (data.success) {
        this.registerService.storeBuyerData(data.token, data.buyer);
        this.flashMessage.show('You are now logged in.', {cssClass: 'alert-success', timeout: 5000});
        this.router.navigate(['/buyer']);
        document.getElementById("userType").innerHTML = userType;
      } 
      else {
        this.flashMessage.show('User not found', {cssClass: 'alert-danger', timeout: 5000});
        this.router.navigate(['/login']);
      }
    });
  }
}
