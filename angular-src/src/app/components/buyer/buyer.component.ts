import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { BuyerService } from '../../services/buyer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'app-buyer',
  templateUrl: './buyer.component.html',
  styleUrls: ['./buyer.component.css']
})
export class BuyerComponent implements OnInit {
  buyer: Object;
  buyerProfile: Object;
  requestList: Object;
  loaded: Promise<boolean>;
  loading: Boolean;
  panelOpenState = false;
  offerList: Object;
  offerTitleAddToCart: String;
  pushItemToNavbar = 0;
  offerCart: [String] = [''];

  constructor(private registerService: RegisterService,
    private buyerService: BuyerService,
    private router: Router,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private dialog: MatDialog) { }

  // showing buyer info when buyer portal page loads - Bryan Vu

  ngOnInit() {
    this.buyer = this.route.snapshot.data['buyer'];
    this.getBuyer();
    this.buyerService.getBuyerRequests().subscribe((requests: any) => {
      this.requestList = requests;
    });
  }

  getBuyer() {
    this.buyerService.getBuyerProfile().subscribe((buyerdata: any) => {
      this.buyerProfile = buyerdata;
      // console.log(this.buyerProfile);
    });
  }

  // tslint:disable-next-line:member-ordering

  refreshBuyer() {
    this.buyer = JSON.parse(localStorage.getItem('buyer'));
    if (this.buyer == null) {
      window.location.reload();
    } else {
      // console.log(this.buyer);
    }
  }

  expanded(id: any) {
    let requestId = id;
    this.getBuyer();
    // (<HTMLButtonElement>document.getElementById('acceptOfferButton')).disabled = true;
    // Make a call to retrieve request information with all offers to that request
    this.requestService.getRequest(requestId).subscribe((data: any) => {
      if (data.success) {
        this.offerList = data.offers;
        this.offerCart = this.buyerProfile['data']['offerCart'];
        // console.log(this.offerCart);

        // used to distinguish between if buyer is viewing the request or a seller
        // to limit access
        if (data.status === 0) {
          //this.status = true; // Buyer
        } else if (data.status === 1) {
          // this.status = false; // Seller
        }
        else {
          // this.notifier.notify('success', data.msg);
          // this.router.navigate(['/']);
        }
      } else {
        // this.notifier.notify('error', data.msg);
        // this.router.navigate(['/']);
      }
    });
    this.getBuyer();
  }

  deleteRequestFunction(request_id_todelete) {
    //debugger;
    var request_delete;
    request_delete = {
      request_id: request_id_todelete
    };

    this.buyerService.deleteBuyerRequest(request_delete).subscribe((data: any) => {
      console.log(data);
      debugger;
      window.location.reload();
    });

  }

  acceptOffer(element, offer_id) {
    // const offer_id = document.getElementById('offerId').innerHTML;
    const offerAccepted = {
      offer_ID: offer_id,
      offer_accepted: true
    }

    this.buyerService.offerAccepted(offerAccepted).subscribe((data: any) => {
      if (data.success) {
        // console.log("Offer Accepted Successful.");
        (<HTMLButtonElement>document.getElementById('acceptOfferButton')).disabled = true;
      }
      else {
        // console.log("Offer Accepted NOT Successful.");
      }
    });

    const offerToCart = {
      offerID: offer_id
    }
    this.buyerService.addOfferToBuyerCart(offerToCart).subscribe((data: any) => {
      if (data.success) {
        var prevItems = localStorage.getItem('buyerCart');
        var newItem = 1;
        var newTotalItems = parseInt(prevItems, 10) + newItem;
        localStorage.setItem('buyerCart', newTotalItems.toString());
        this.pushItemToNavbar = 1;
        element.textContent = 'Offer Accepted';
        element.disabled = true;
        this.getBuyer();
      }
      // (<HTMLButtonElement>document.getElementById("acceptOfferButton")).disabled = true;
    });
    /*
    const dialogRef = this.dialog.open(AcceptOfferDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
      //console.log(this.buyer);
      const offer_id = document.getElementById('offerId').innerHTML;
      const offerToCart = {
        offerID: offer_id
      }
      this.buyerService.addOfferToBuyerCart(offerToCart).subscribe((data: any) => {
        if (data.success)
          var prevItems = localStorage.getItem('buyerCart');
          var newItem = 1;
          var newTotalItems = parseInt(prevItems, 10) + newItem;
          localStorage.setItem('buyerCart', newTotalItems.toString());
          this.pushItemToNavbar = 1;
          (<HTMLButtonElement>document.getElementById("acceptOfferButton")).disabled = true;
       });
    });
    */
  }
}
