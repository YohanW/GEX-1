// By Roni
// Seller Registration
import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../../services/validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { RegisterService } from '../../../services/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './SellerRegister.component.html',
  styleUrls: ['./SellerRegister.component.css']
})
export class SellerRegisterComponent implements OnInit {
  first_name: String;
  last_name: String;
  entity_name: String;
  position: String;
  phone_number: String;
  email: String;
  password: String;
  confirmPassword: String;

  constructor( private validateService: ValidateService,
              private flashMessage: FlashMessagesService,
              private router: Router,
              private registerService: RegisterService) { }

  ngOnInit() {
  }

  OnSellerRegisterSubmit() {
    console.log('On Seller Register Submit Called.');
    // JSON with the inputted fields
    const seller = {
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      entity_name: this.entity_name,
      position: this.position,
      phone_number: this.phone_number,
      password: this.password,
      confirmPassword: this.confirmPassword,
    };

    // RequiredFields
    if (!this.validateService.ValidateSellerRegister(seller)) {
      this.flashMessage.show('Please fill in all fields', {cssClass: 'alert-danger', timeout: 10000});
      return false;
    }

    // Password Confirmation
    // tslint:disable-next-line:triple-equals
    if (seller.password != this.confirmPassword) {
      this.flashMessage.show('Passwords do not match', {cssClass: 'alert-danger', timeout: 10000});
      return false;
    }

    // ValidateEmail
    if (!this.validateService.validateEmail(seller.email)) {
      this.flashMessage.show('Invalid Email', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    // Register Seller
    this.registerService.RegisterSeller(seller).subscribe((data: any) => {
      if (data.success) { // must know if its a successful register **
        this.router.navigate(['/preactivation']); // Tell buyer to checkemail
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 10000});
        this.router.navigate(['/seller-register']);
      }
    });

  }
}
