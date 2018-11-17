const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Seller = require('../models/seller');
const Request = require('../models/request');
const Offer = require('../models/offer');

//Register
router.post('/register',(req,res,next) => {

    //create seller object
    let newSeller = new Seller({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        codes: req.body.codes
    });
    //code for detecting seller with same email by John
    Seller.findOne({email: req.body.email}, (err, foundSeller) => {
      if (err) return handleError(err);
      if(foundSeller != null){
        console.log ('Found seller with email %s', foundSeller.email);
        res.json({success: false, msg:"Failed to register Seller! Email already used for another account."})
      }
      else{//end of seller email detection
        console.log('New email used, %s',req.body.email);
        //email format checking
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email))
        {
          console.log('New email address %s passed format checking.', req.body.email);
          Seller.addSeller(newSeller, (err, seller) => {
              if(err){
                  res.json({success: false, msg:"Failed to register Seller!"})
              }
              else {
                  res.json({success: true, msg:"Seller Registered!"})
              }
          });
        }
        else{
          console.log('New email address %s failed format checking.', req.body.email);
          res.json({success: false, msg:"Failed to register Seller! Email is not valid format."})
        }
      }
    });
});

//Authenticate
router.post('/login', (req, res, next) => {

    //get email and password from request
    const email = req.body.email;
    const password = req.body.password;

    //search for seller in database
    Seller.getSellerbyEmail(email, (err, seller) => {
      if(err) throw err;

      if(!seller){
        return res.json({success: false, msg: 'Seller not found'});
      }
    //check password
      Seller.comparePassword(password, seller.password, (err, isMatch) => {
        if(err) throw err;

        //provide token in response is login is valid
        if(isMatch){
          const token = jwt.sign({data: seller}, config.secret, {
            expiresIn: 604800 // 1 week
          });

          res.json({
            success: true,
            token: `${token}`,
            seller: {
              id: seller._id,
              first_name: seller.first_name,
              last_name: seller.last_name,
              email: seller.email,
            }
          });
        } else {
          return res.json({success: false, msg: 'Wrong password'});
        }
      });
    });
  });

// Profile
router.get('/profile', (req, res) => {
  //to view profile, user must have a JWT-token in the request header
  var token = req.headers['x-access-token'];

  //if they don't have a token
  if (!token) return res.status(401).send({ success: false, message:'No token provided.' });

  //otherwise verify the token and return user data in a response
  jwt.verify(token, config.secret, function(err, decoded) {
      if (err) return res.status(500).send({ success: false, message: 'Failed to authenticate token.' });
      delete decoded.data.password;
      res.status(200).send(decoded);
     });
  });
// View request
router.get('/view', (req, res) => {
  var token = req.headers['x-access-token'];

  if (!token) return res.status(401).send({ success: false, message:'Must login to view requests.' });

  jwt.verify(token, config.secret, (err, decoded) => {
      if (err) return res.status(500).send({ success: false, message: 'Failed to authenticate token.' });

      Request.findOne( {'code':decoded.data.codes}, (err, requests) => {
        if (err) return res.status(500).send({ success: false, message: 'Found no posts matching that code.' });
        res.status(200).send(requests);
      })

     });
  });

  router.post('/makeOffer', (req,res) =>{
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ success: false, message:'Must login to create and offer.' })

    let newOffer = new Offer({
      seller_first_name:req.body.seller_first_name,
      seller_last_name:req.body.seller_last_name,
      seller_ID:req.body.seller_ID,
      code:req.body.code,
      request_ID:req.body.request_ID
    });

    Seller.findById(req.body.seller_ID, (err, seller_making_offer) => {
      if (err) return handleError(err);
      newOffer.save( (err,post) => {
          if (err) { return next(err); }
          seller_making_offer.seller_offers_byID.push(post._id);
          seller_making_offer.save((err) =>{
            if (err) { return next(err); }
            console.log('New Offer made tied to Seller %s', req.body.seller_ID);
            Request.findById(req.body.request_ID, (err, request_with_offer) => {
              if (err) return handleError(err);
              request_with_offer.request_offers_byID.push(post._id);
              request_with_offer.save((err) =>{
                if (err){return next(err);}
                console.log('New Offer made tied to Request %s ', request_with_offer._id);
              });
            });
          });
          res.status(201).json(post);
      });
    });

    /*newOffer.save( (err,post) => {
        if (err) { return next(err); }
        res.status(201).json(post);
    });*/

  });

module.exports = router;
